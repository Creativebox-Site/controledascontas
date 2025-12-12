-- Fix cleanup_expired_otps function to include search_path protection
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.email_otps 
  WHERE expires_at < NOW() - INTERVAL '1 day';
  
  DELETE FROM public.otp_rate_limits
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$;