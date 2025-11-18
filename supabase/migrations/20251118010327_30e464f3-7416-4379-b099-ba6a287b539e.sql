-- Adicionar campo is_essential na tabela transactions
ALTER TABLE public.transactions 
ADD COLUMN is_essential boolean DEFAULT false;

-- Criar índice para melhorar performance em queries de análise
CREATE INDEX idx_transactions_is_essential ON public.transactions(is_essential) WHERE is_essential = true;