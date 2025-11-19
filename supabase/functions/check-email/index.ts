import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckEmailRequest {
  email: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: CheckEmailRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar se o email existe no sistema
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', email)
      .single();

    if (error) {
      console.log('Email não encontrado no profiles, verificando auth.users');
    }

    // Verificar na tabela de usuários do auth
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    const userExists = users?.some(user => user.email === email);

    console.log(`Email verification for ${email}: ${userExists ? 'exists' : 'not found'}`);

    return new Response(
      JSON.stringify({ exists: userExists }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking email:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao verificar email' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
