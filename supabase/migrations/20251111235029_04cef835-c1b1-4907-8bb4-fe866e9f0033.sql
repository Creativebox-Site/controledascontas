-- Criar bucket de storage para relatórios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para relatórios
CREATE POLICY "Users can upload own reports"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'reports' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own reports"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'reports' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own reports"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'reports' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que a service role faça upload
CREATE POLICY "Service role can manage all reports"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'reports' AND
  auth.role() = 'service_role'
);
