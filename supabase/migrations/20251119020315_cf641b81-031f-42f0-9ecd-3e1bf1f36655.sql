-- Adicionar política RLS para permitir que usuários deletem seus próprios dispositivos
CREATE POLICY "Users can delete own devices"
ON public.trusted_devices
FOR DELETE
USING (auth.uid() = user_id);
