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

// ===== INPUT VALIDATION HELPERS =====
function validateEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: VerifyEmailRequest = await req.json();

    // ===== INPUT VALIDATION =====
    if (!email || !email.trim()) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!validateEmail(email.trim())) {
      return new Response(
        JSON.stringify({ error: "Formato de email inválido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Received email verification request for:", sanitizeForLog(email));

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

    // ===== DATABASE-BACKED RATE LIMITING CHECK =====
    // Limit to 5 requests per hour per IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
               req.headers.get("x-real-ip") || 
               "unknown";
    
    const isAllowed = await checkDatabaseRateLimit(
      supabaseAdmin,
      ip,
      'verify_email_exists',
      5,
      3600000 // 1 hour
    );

    if (!isAllowed) {
      console.log(`Rate limit exceeded for IP: ${sanitizeForLog(ip)}`);
      return new Response(
        JSON.stringify({ 
          error: "Muitas tentativas. Por favor, tente novamente mais tarde.",
          retryAfter: "1 hour"
        }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json",
            "Retry-After": "3600",
            ...corsHeaders 
          },
        }
      );
    }

    // ===== SECURITY: PREVENT EMAIL ENUMERATION =====
    // Always attempt to send reset email - Supabase handles non-existent emails silently
    // This prevents timing attacks and information disclosure
    console.log("Processing password reset request");
    
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
      email.trim(),
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
      JSON.stringify({ error: "Erro ao processar solicitação" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);