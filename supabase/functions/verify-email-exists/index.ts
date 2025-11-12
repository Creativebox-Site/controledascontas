import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyEmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: VerifyEmailRequest = await req.json();

    console.log("Received email verification request for:", email);

    if (!email || !email.trim()) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Criar cliente Supabase com service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verificar se o usuário existe consultando a lista de usuários
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      return new Response(
        JSON.stringify({ error: "Erro ao verificar email" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // ===== CORREÇÃO: PREVENIR ENUMERAÇÃO DE EMAIL =====
    // SEMPRE enviar email de reset, mesmo que o usuário não exista
    // Isso previne que atacantes descubram quais emails estão cadastrados
    
    const userExists = users.some(user => user.email?.toLowerCase() === email.toLowerCase());

    // Enviar email de recuperação apenas se o usuário realmente existir
    if (userExists) {
      console.log("User found, sending password reset email");
      
      const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${req.headers.get("origin")}/`,
        }
      );

      if (resetError) {
        console.error("Error sending reset email:", resetError);
        // Não revelar o erro específico ao cliente
      }
    } else {
      console.log("User not found, but returning success message to prevent enumeration");
    }

    // SEMPRE retornar a mesma mensagem, independente de o email existir ou não
    // Isso impede que atacantes descubram quais emails estão cadastrados
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Se o email estiver cadastrado, você receberá um link de recuperação. Verifique sua caixa de entrada e spam." 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-email-exists function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro desconhecido" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
