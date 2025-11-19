-- Tabela para armazenar OTPs
CREATE TABLE IF NOT EXISTS public.email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  request_id TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  device_fingerprint TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_email_otps_email ON public.email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_request_id ON public.email_otps(request_id);
CREATE INDEX IF NOT EXISTS idx_email_otps_expires_at ON public.email_otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_otps_verified ON public.email_otps(verified);

-- Tabela para rate limiting
CREATE TABLE IF NOT EXISTS public.otp_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- pode ser email ou IP
  type TEXT NOT NULL, -- 'email' ou 'ip'
  action TEXT NOT NULL, -- 'send' ou 'verify'
  count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para rate limiting
CREATE INDEX IF NOT EXISTS idx_otp_rate_limits_identifier ON public.otp_rate_limits(identifier, type, action);
CREATE INDEX IF NOT EXISTS idx_otp_rate_limits_window ON public.otp_rate_limits(window_start);

-- Tabela para auditoria de eventos de segurança
CREATE TABLE IF NOT EXISTS public.auth_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'otp_sent', 'otp_verified', 'otp_failed', 'rate_limit', 'disposable_email', etc
  email TEXT,
  request_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  device_fingerprint TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para auditoria
CREATE INDEX IF NOT EXISTS idx_auth_security_events_email ON public.auth_security_events(email);
CREATE INDEX IF NOT EXISTS idx_auth_security_events_type ON public.auth_security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_security_events_created ON public.auth_security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_security_events_ip ON public.auth_security_events(ip_address);

-- Tabela para dispositivos confiáveis
CREATE TABLE IF NOT EXISTS public.trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  device_name TEXT,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, device_fingerprint)
);

-- Índices para dispositivos
CREATE INDEX IF NOT EXISTS idx_trusted_devices_user ON public.trusted_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_fingerprint ON public.trusted_devices(device_fingerprint);

-- RLS Policies
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;

-- Políticas: apenas service role pode acessar (edge functions)
CREATE POLICY "Service role only" ON public.email_otps FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role only" ON public.otp_rate_limits FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role only" ON public.auth_security_events FOR ALL USING (auth.role() = 'service_role');

-- Política para trusted_devices: usuários podem ver seus próprios dispositivos
CREATE POLICY "Users can view their own devices" ON public.trusted_devices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all devices" ON public.trusted_devices
  FOR ALL USING (auth.role() = 'service_role');

-- Função para limpar OTPs expirados (executar periodicamente)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.email_otps 
  WHERE expires_at < NOW() - INTERVAL '1 day';
  
  DELETE FROM public.otp_rate_limits
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$;

-- Comentários
COMMENT ON TABLE public.email_otps IS 'Armazena códigos OTP hasheados para verificação de email';
COMMENT ON TABLE public.otp_rate_limits IS 'Rate limiting para envio e verificação de OTPs';
COMMENT ON TABLE public.auth_security_events IS 'Log de eventos de segurança relacionados à autenticação';
COMMENT ON TABLE public.trusted_devices IS 'Dispositivos confiáveis dos usuários';