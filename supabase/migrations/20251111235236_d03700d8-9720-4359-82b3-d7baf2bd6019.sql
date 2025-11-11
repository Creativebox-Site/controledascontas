-- Adicionar política DELETE para a tabela profiles
-- Permite que usuários deletem seus próprios perfis
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);

-- Adicionar política DELETE para a tabela reports_sent
-- Permite que usuários deletem seu próprio histórico de relatórios
CREATE POLICY "Users can delete own reports"
ON public.reports_sent
FOR DELETE
USING (auth.uid() = user_id);

-- Melhorar a política SELECT do profiles para garantir validação adequada
-- Substituir a política existente por uma mais segura
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id AND 
  auth.uid() IS NOT NULL
);

-- Melhorar a política UPDATE do profiles para garantir validação adequada
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id AND 
  auth.uid() IS NOT NULL
)
WITH CHECK (
  auth.uid() = id AND 
  auth.uid() IS NOT NULL
);

-- Melhorar a política INSERT do profiles para garantir validação adequada
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() = id AND 
  auth.uid() IS NOT NULL
);

-- Adicionar comentários explicativos nas tabelas sensíveis
COMMENT ON TABLE public.profiles IS 'User profile information - contains PII (Personal Identifiable Information). Protected by RLS policies that ensure users can only access their own data.';

COMMENT ON COLUMN public.profiles.phone IS 'User phone number - sensitive personal data';
COMMENT ON COLUMN public.profiles.birth_date IS 'User birth date - sensitive personal data';
COMMENT ON COLUMN public.profiles.zip_code IS 'User zip code - part of address information';
COMMENT ON COLUMN public.profiles.street IS 'User street address - sensitive personal data';
COMMENT ON COLUMN public.profiles.number IS 'User address number - sensitive personal data';
COMMENT ON COLUMN public.profiles.complement IS 'User address complement - sensitive personal data';
COMMENT ON COLUMN public.profiles.neighborhood IS 'User neighborhood - sensitive personal data';
COMMENT ON COLUMN public.profiles.city IS 'User city - sensitive personal data';
COMMENT ON COLUMN public.profiles.state IS 'User state - sensitive personal data';