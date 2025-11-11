
-- Primeiro, vamos criar perfis para todos os usuários que não têm
INSERT INTO public.profiles (id, full_name)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email)
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- Recriar o trigger para garantir que funciona
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
