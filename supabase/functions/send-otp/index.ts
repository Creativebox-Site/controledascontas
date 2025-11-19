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
        from: 'App Contas <noreply@appcontas.creativebox.com.br>',
        to: email,
        subject: 'Seu código de verificação - App Contas',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
                      <!-- Header com Logo -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #4FC3DC 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
                          <img src="https://cd8343ae-9767-42cb-917a-70fd17803bd0.lovableproject.com/pwa-512x512.png" alt="App Contas" style="width: 80px; height: 80px; margin-bottom: 16px;" />
                          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">App Contas</h1>
                          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Creative Box</p>
                        </td>
                      </tr>
                      
                      <!-- Conteúdo -->
                      <tr>
                        <td style="padding: 40px 30px;">
                          <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 22px; font-weight: 600;">Seu código de verificação</h2>
                          <p style="color: #4b5563; margin: 0 0 24px 0; font-size: 16px; line-height: 1.5;">Use o código abaixo para fazer login no App Contas:</p>
                          
                          <!-- Código OTP -->
                          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #4FC3DC; padding: 24px; border-radius: 12px; text-align: center; margin: 0 0 24px 0;">
                            <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #0369a1; display: inline-block;">${code}</span>
                          </div>
                          
                          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 0 0 24px 0;">
                            <p style="color: #92400e; margin: 0; font-size: 14px;">
                              ⏱️ <strong>Este código expira em 10 minutos.</strong>
                            </p>
                          </div>
                          
                          <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.5;">Se você não solicitou este código, ignore este email e seu acesso permanecerá seguro.</p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb;">
                          <p style="color: #9ca3af; margin: 0; font-size: 12px; text-align: center; line-height: 1.5;">
                            © ${new Date().getFullYear()} App Contas | Creative Box<br/>
                            Controle financeiro inteligente e seguro
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Error sending email:', JSON.stringify(errorData));
      
      // Se for erro de validação do Resend (modo teste)
      if (errorData.name === 'validation_error') {
        return new Response(
          JSON.stringify({ 
            error: 'Serviço de email em modo de teste. Verifique seu domínio no Resend.',
            details: errorData.message 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
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
