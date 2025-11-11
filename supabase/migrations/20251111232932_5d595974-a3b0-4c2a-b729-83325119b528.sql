-- Criar tabela para histórico de relatórios enviados
CREATE TABLE public.reports_sent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sections_included TEXT[] NOT NULL,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'whatsapp', 'print', 'download')),
  recipient TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.reports_sent ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view own reports"
  ON public.reports_sent
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports"
  ON public.reports_sent
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Índice para melhor performance
CREATE INDEX idx_reports_sent_user_id ON public.reports_sent(user_id);
CREATE INDEX idx_reports_sent_created_at ON public.reports_sent(created_at DESC);