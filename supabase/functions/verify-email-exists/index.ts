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

    // ===== SECURITY: PREVENT EMAIL ENUMERATION =====
    // Always attempt to send reset email - Supabase handles non-existent emails silently
    // This prevents timing attacks and information disclosure
    console.log("Processing password reset request");
    
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${req.headers.get("origin")}/`,
      }
    );

    // Never reveal if email exists or not - log errors internally only
    if (resetError) {
      console.error("Password reset error:", resetError);
    }

    // Add constant delay to prevent timing attacks (even if email doesn't exist)
    await new Promise(resolve => setTimeout(resolve, 150));

    // ALWAYS return identical response regardless of email existence
    const message = "Se este email estiver cadastrado, você receberá um link de recuperação. Verifique sua caixa de entrada e spam.";
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message 
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
