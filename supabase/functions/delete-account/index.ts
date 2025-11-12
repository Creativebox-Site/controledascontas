import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ===== RATE LIMITING =====
// In-memory rate limiting to prevent abuse and DoS attacks
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxAttempts = 3, windowMs = 3600000): boolean {
  const now = Date.now();
  const record = attempts.get(ip);
  
  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= maxAttempts) {
    return false;
  }
  
  record.count++;
  return true;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ===== RATE LIMITING CHECK =====
    // Limit to 3 requests per hour per IP (stricter for account deletion)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    if (!checkRateLimit(ip, 3, 3600000)) {
      console.log(`Rate limit exceeded for IP: ${ip}`);
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

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Não autorizado')
    }

    // Get the user from the auth header
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Usuário não encontrado')
    }

    console.log(`Iniciando exclusão da conta do usuário: ${user.id}`)

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

    console.log(`Conta do usuário ${user.id} deletada com sucesso`)

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