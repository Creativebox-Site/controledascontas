import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendOtpRequest {
  email: string;
  requestId: string;
  deviceFingerprint?: string;
  userAgent?: string;
  ipAddress?: string;
}

// Gerar código OTP de 6 dígitos
function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash do código com salt
async function hashCode(code: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verificar rate limiting
async function checkRateLimit(supabase: any, identifier: string, type: string): Promise<boolean> {
  const { data } = await supabase
    .from('otp_rate_limits')
    .select('count, window_start')
    .eq('identifier', identifier)
    .eq('type', type)
    .eq('action', 'send_otp')
    .single();

  if (!data) return true;

  const windowStart = new Date(data.window_start);
  const now = new Date();
  const hoursDiff = (now.getTime() - windowStart.getTime()) / (1000 * 60 * 60);

  // Limite: 5 tentativas por hora
  if (hoursDiff < 1 && data.count >= 5) {
    console.log(`Rate limit exceeded for ${type}: ${identifier}`);
    return false;
  }

  // Resetar janela se passou mais de 1 hora
  if (hoursDiff >= 1) {
    await supabase
      .from('otp_rate_limits')
      .delete()
      .eq('identifier', identifier)
      .eq('type', type)
      .eq('action', 'send_otp');
  }

  return true;
}

// Atualizar rate limiting
async function updateRateLimit(supabase: any, identifier: string, type: string) {
  const { data } = await supabase
    .from('otp_rate_limits')
    .select('id, count')
    .eq('identifier', identifier)
    .eq('type', type)
    .eq('action', 'send_otp')
    .single();

  if (data) {
    await supabase
      .from('otp_rate_limits')
      .update({ count: data.count + 1 })
      .eq('id', data.id);
  } else {
    await supabase
      .from('otp_rate_limits')
      .insert({
        identifier,
        type,
        action: 'send_otp',
        count: 1,
      });
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, requestId, deviceFingerprint, userAgent, ipAddress }: SendOtpRequest = await req.json();

    if (!email || !requestId) {
      return new Response(
        JSON.stringify({ error: 'Email e requestId são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar rate limiting por email e IP
    const emailRateLimitOk = await checkRateLimit(supabase, email, 'email');
    if (!emailRateLimitOk) {
      return new Response(
        JSON.stringify({ error: 'Muitas tentativas. Tente novamente em 1 hora.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (ipAddress) {
      const ipRateLimitOk = await checkRateLimit(supabase, ipAddress, 'ip');
      if (!ipRateLimitOk) {
        return new Response(
          JSON.stringify({ error: 'Muitas tentativas. Tente novamente em 1 hora.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Invalidar OTPs anteriores não verificados
    await supabase
      .from('email_otps')
      .delete()
      .eq('email', email)
      .eq('verified', false);

    // Gerar código OTP
    const code = generateOtpCode();
    const salt = crypto.randomUUID();
    const codeHash = await hashCode(code, salt);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Registrar evento de segurança
    await supabase.from('auth_security_events').insert({
      email,
      event_type: 'otp_requested',
      request_id: requestId,
      device_fingerprint: deviceFingerprint,
      user_agent: userAgent,
      ip_address: ipAddress,
      metadata: { expires_at: expiresAt.toISOString() },
    });

    // Salvar OTP no banco
    const { error: otpError } = await supabase.from('email_otps').insert({
      email,
      code_hash: codeHash,
      salt,
      expires_at: expiresAt.toISOString(),
      request_id: requestId,
      device_fingerprint: deviceFingerprint,
      user_agent: userAgent,
      ip_address: ipAddress,
    });

    if (otpError) {
      console.error('Error saving OTP:', otpError);
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar código' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Atualizar rate limits
    await updateRateLimit(supabase, email, 'email');
    if (ipAddress) {
      await updateRateLimit(supabase, ipAddress, 'ip');
    }

    // Enviar email com Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Serviço de email não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Financia <onboarding@resend.dev>',
        to: email,
        subject: 'Seu código de verificação',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Seu código de verificação</h2>
            <p>Use o código abaixo para fazer login:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${code}</span>
            </div>
            <p style="color: #6b7280;">Este código expira em 10 minutos.</p>
            <p style="color: #6b7280; font-size: 14px;">Se você não solicitou este código, ignore este email.</p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      console.error('Error sending email:', await emailResponse.text());
      return new Response(
        JSON.stringify({ error: 'Erro ao enviar email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`OTP sent successfully to ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Código enviado com sucesso',
        expiresAt: expiresAt.toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-otp:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
