import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ===== INPUT VALIDATION HELPERS =====
function sanitizeForLog(input: string): string {
  return input.replace(/[\r\n]/g, '').substring(0, 100);
}

// ===== DATABASE-BACKED RATE LIMITING =====
async function checkDatabaseRateLimit(
  supabase: any,
  identifier: string,
  action: string,
  maxAttempts: number,
  windowMs: number
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMs).toISOString();
  
  // Get current rate limit record
  const { data: existing, error: selectError } = await supabase
    .from('otp_rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .eq('type', 'ip')
    .eq('action', action)
    .gte('window_start', windowStart)
    .maybeSingle();

  if (selectError) {
    console.error('Rate limit check error:', selectError);
    return true; // Allow on error to not block legitimate users
  }

  if (!existing) {
    // No record or expired, create new one
    await supabase
      .from('otp_rate_limits')
      .upsert({
        identifier,
        type: 'ip',
        action,
        count: 1,
        window_start: new Date().toISOString()
      }, {
        onConflict: 'identifier,type,action'
      });
    return true;
  }

  if (existing.count >= maxAttempts) {
    return false; // Rate limited
  }

  // Increment counter
  await supabase
    .from('otp_rate_limits')
    .update({ count: existing.count + 1 })
    .eq('id', existing.id);

  return true;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Não autorizado')
    }

    // Create a client with the user's token to validate authentication
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Validate the user
    const { data: { user }, error: userError } = await userClient.auth.getUser()

    if (userError || !user) {
      console.error('Erro ao validar usuário:', userError)
      throw new Error('Usuário não encontrado')
    }

    // Create admin client for deletion operations and rate limiting
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // ===== DATABASE-BACKED RATE LIMITING CHECK =====
    // Limit to 3 requests per hour per user (stricter for account deletion)
    const isAllowed = await checkDatabaseRateLimit(
      supabaseClient,
      user.id,
      'delete_account',
      3,
      3600000 // 1 hour
    );

    if (!isAllowed) {
      console.log(`Rate limit exceeded for user: ${sanitizeForLog(user.id)}`);
      return new Response(
        JSON.stringify({ 
          error: 'Muitas tentativas. Por favor, tente novamente mais tarde.',
          retryAfter: '1 hour'
        }),
        {
          status: 429,
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': '3600',
            ...corsHeaders 
          },
        }
      );
    }

    console.log(`Iniciando exclusão da conta do usuário: ${sanitizeForLog(user.id)}`)

    // Delete all user data in order (respecting foreign key constraints)
    // 1. Delete transactions
    const { error: transactionsError } = await supabaseClient
      .from('transactions')
      .delete()
      .eq('user_id', user.id)

    if (transactionsError) {
      console.error('Erro ao deletar transações:', transactionsError)
      throw new Error('Erro ao deletar transações')
    }

    // 2. Delete categories
    const { error: categoriesError } = await supabaseClient
      .from('categories')
      .delete()
      .eq('user_id', user.id)

    if (categoriesError) {
      console.error('Erro ao deletar categorias:', categoriesError)
      throw new Error('Erro ao deletar categorias')
    }

    // 3. Delete goals
    const { error: goalsError } = await supabaseClient
      .from('goals')
      .delete()
      .eq('user_id', user.id)

    if (goalsError) {
      console.error('Erro ao deletar metas:', goalsError)
      throw new Error('Erro ao deletar metas')
    }

    // 4. Delete profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.error('Erro ao deletar perfil:', profileError)
      throw new Error('Erro ao deletar perfil')
    }

    // 5. Finally, delete the auth user
    const { error: deleteUserError } = await supabaseClient.auth.admin.deleteUser(user.id)

    if (deleteUserError) {
      console.error('Erro ao deletar usuário:', deleteUserError)
      throw new Error('Erro ao deletar usuário')
    }

    console.log(`Conta do usuário ${sanitizeForLog(user.id)} deletada com sucesso`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Conta deletada com sucesso' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro ao deletar conta:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})