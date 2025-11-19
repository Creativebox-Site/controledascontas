import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyOtpRequest {
  email: string;
  code: string;
  requestId: string;
  deviceFingerprint?: string;
}

// Hash do código com salt
async function hashCode(code: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, requestId, deviceFingerprint }: VerifyOtpRequest = await req.json();

    if (!email || !code || !requestId) {
      return new Response(
        JSON.stringify({ error: 'Email, código e requestId são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar OTP mais recente não verificado
    const { data: otpData, error: otpError } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', email)
      .eq('request_id', requestId)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpData) {
      console.log('OTP not found or already verified');
      
      await supabase.from('auth_security_events').insert({
        email,
        event_type: 'otp_verification_failed',
        request_id: requestId,
        device_fingerprint: deviceFingerprint,
        metadata: { reason: 'otp_not_found' },
      });

      return new Response(
        JSON.stringify({ error: 'Código inválido ou expirado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se expirou
    const expiresAt = new Date(otpData.expires_at);
    const now = new Date();
    if (now > expiresAt) {
      console.log('OTP expired');

      await supabase.from('auth_security_events').insert({
        email,
        event_type: 'otp_verification_failed',
        request_id: requestId,
        device_fingerprint: deviceFingerprint,
        metadata: { reason: 'expired' },
      });

      return new Response(
        JSON.stringify({ error: 'Código expirado. Solicite um novo código.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar número de tentativas
    if (otpData.attempts >= 5) {
      console.log('Too many attempts');

      await supabase.from('auth_security_events').insert({
        email,
        event_type: 'otp_verification_failed',
        request_id: requestId,
        device_fingerprint: deviceFingerprint,
        metadata: { reason: 'too_many_attempts' },
      });

      return new Response(
        JSON.stringify({ error: 'Muitas tentativas. Solicite um novo código.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar hash do código
    const codeHash = await hashCode(code, otpData.salt);
    if (codeHash !== otpData.code_hash) {
      console.log('Invalid code');

      // Incrementar tentativas
      await supabase
        .from('email_otps')
        .update({ attempts: otpData.attempts + 1 })
        .eq('id', otpData.id);

      await supabase.from('auth_security_events').insert({
        email,
        event_type: 'otp_verification_failed',
        request_id: requestId,
        device_fingerprint: deviceFingerprint,
        metadata: { 
          reason: 'invalid_code',
          attempts: otpData.attempts + 1,
        },
      });

      return new Response(
        JSON.stringify({ 
          error: 'Código incorreto',
          attemptsRemaining: 5 - (otpData.attempts + 1),
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Código válido! Marcar como verificado
    await supabase
      .from('email_otps')
      .update({ 
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('id', otpData.id);

    // Registrar evento de sucesso
    await supabase.from('auth_security_events').insert({
      email,
      event_type: 'otp_verified',
      request_id: requestId,
      device_fingerprint: deviceFingerprint,
      metadata: { verified_at: new Date().toISOString() },
    });

    console.log(`OTP verified successfully for ${email}`);

    // Buscar usuário por email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    let existingUser = users?.find(u => u.email === email);
    let userId = existingUser?.id;

    if (!existingUser) {
      // Criar novo usuário
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      });

      if (createError) {
        console.error('Error creating user:', createError);
        return new Response(
          JSON.stringify({ error: 'Erro ao criar usuário' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userId = newUser.user?.id;
    }

    // Registrar dispositivo confiável se fornecido
    if (deviceFingerprint && userId) {
      const { data: existingDevice } = await supabase
        .from('trusted_devices')
        .select('id')
        .eq('device_fingerprint', deviceFingerprint)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingDevice) {
        await supabase
          .from('trusted_devices')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', existingDevice.id);
      }
    }

    // Gerar session token
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (sessionError) {
      console.error('Error generating session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar sessão' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Código verificado com sucesso',
        userId,
        sessionUrl: sessionData.properties?.action_link,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
