-- Adicionar coluna parent_id para suportar subcategorias
ALTER TABLE public.categories 
ADD COLUMN parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE;

-- Adicionar índice para melhor performance nas consultas hierárquicas
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- Atualizar função para criar categorias padrão com a nova estrutura
CREATE OR REPLACE FUNCTION public.create_default_categories(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_contas_casa uuid;
  v_alimentacao uuid;
  v_transporte uuid;
  v_compras uuid;
  v_assinaturas uuid;
  v_saude uuid;
  v_lazer uuid;
  v_financeiro uuid;
  v_ajustes uuid;
BEGIN
  -- ===== 1. CONTAS DE CASA E MORADIA =====
  INSERT INTO public.categories (user_id, name, type, is_essential, color)
  VALUES (p_user_id, 'Contas de Casa e Moradia', 'expense', true, '#ef4444')
  RETURNING id INTO v_contas_casa;
  
  INSERT INTO public.categories (user_id, name, type, is_essential, color, parent_id) VALUES
  (p_user_id, 'Eletricidade', 'expense', true, '#dc2626', v_contas_casa),
  (p_user_id, 'Água e Saneamento', 'expense', true, '#0ea5e9', v_contas_casa),
  (p_user_id, 'Gás', 'expense', true, '#f97316', v_contas_casa),
  (p_user_id, 'Telefonia e Internet', 'expense', true, '#8b5cf6', v_contas_casa),
  (p_user_id, 'Aluguel e Condomínio', 'expense', true, '#b91c1c', v_contas_casa),
  (p_user_id, 'Serviços de Manutenção', 'expense', true, '#78716c', v_contas_casa);

  -- ===== 2. ALIMENTAÇÃO =====
  INSERT INTO public.categories (user_id, name, type, is_essential, color)
  VALUES (p_user_id, 'Alimentação', 'expense', true, '#22c55e')
  RETURNING id INTO v_alimentacao;
  
  INSERT INTO public.categories (user_id, name, type, is_essential, color, parent_id) VALUES
  (p_user_id, 'Supermercado', 'expense', true, '#16a34a', v_alimentacao),
  (p_user_id, 'Feira e Hortifrúti', 'expense', true, '#84cc16', v_alimentacao),
  (p_user_id, 'Restaurantes e Bares', 'expense', false, '#fbbf24', v_alimentacao),
  (p_user_id, 'Lanches e Fast Food', 'expense', false, '#f59e0b', v_alimentacao),
  (p_user_id, 'Delivery', 'expense', false, '#fb923c', v_alimentacao),
  (p_user_id, 'Padaria e Confeitaria', 'expense', false, '#fde047', v_alimentacao),
  (p_user_id, 'Cafeteria', 'expense', false, '#92400e', v_alimentacao),
  (p_user_id, 'Benefício (Vale Refeição/Alimentação)', 'expense', true, '#059669', v_alimentacao);

  -- ===== 3. TRANSPORTE =====
  INSERT INTO public.categories (user_id, name, type, is_essential, color)
  VALUES (p_user_id, 'Transporte', 'expense', true, '#0ea5e9')
  RETURNING id INTO v_transporte;
  
  INSERT INTO public.categories (user_id, name, type, is_essential, color, parent_id) VALUES
  (p_user_id, 'Combustível', 'expense', true, '#0284c7', v_transporte),
  (p_user_id, 'Aplicativos (Uber, 99)', 'expense', true, '#06b6d4', v_transporte),
  (p_user_id, 'Passagens (Aéreas, Rodoviárias)', 'expense', false, '#7dd3fc', v_transporte),
  (p_user_id, 'Estacionamento e Pedágio', 'expense', true, '#0369a1', v_transporte),
  (p_user_id, 'Manutenção e Peças', 'expense', true, '#475569', v_transporte);

  -- ===== 4. COMPRAS E VESTUÁRIO =====
  INSERT INTO public.categories (user_id, name, type, is_essential, color)
  VALUES (p_user_id, 'Compras e Vestuário', 'expense', false, '#a78bfa')
  RETURNING id INTO v_compras;
  
  INSERT INTO public.categories (user_id, name, type, is_essential, color, parent_id) VALUES
  (p_user_id, 'Geral e Diversos', 'expense', false, '#9333ea', v_compras),
  (p_user_id, 'Vestuário e Calçados', 'expense', false, '#c084fc', v_compras),
  (p_user_id, 'Eletrônicos', 'expense', false, '#3b82f6', v_compras),
  (p_user_id, 'Casa e Decoração', 'expense', false, '#f472b6', v_compras),
  (p_user_id, 'Cosméticos e Higiene', 'expense', false, '#ec4899', v_compras),
  (p_user_id, 'Materiais Diversos', 'expense', false, '#64748b', v_compras);

  -- ===== 5. ASSINATURAS E SERVIÇOS ONLINE =====
  INSERT INTO public.categories (user_id, name, type, is_essential, color)
  VALUES (p_user_id, 'Assinaturas e Serviços Online', 'expense', false, '#38bdf8')
  RETURNING id INTO v_assinaturas;
  
  INSERT INTO public.categories (user_id, name, type, is_essential, color, parent_id) VALUES
  (p_user_id, 'Streaming de Vídeo', 'expense', false, '#0ea5e9', v_assinaturas),
  (p_user_id, 'Música e Áudio', 'expense', false, '#10b981', v_assinaturas),
  (p_user_id, 'Cloud e Software', 'expense', false, '#6366f1', v_assinaturas),
  (p_user_id, 'E-books e Revistas', 'expense', false, '#f59e0b', v_assinaturas),
  (p_user_id, 'Marketplace (Membros Prime, etc.)', 'expense', false, '#fb923c', v_assinaturas),
  (p_user_id, 'Apps e Jogos', 'expense', false, '#8b5cf6', v_assinaturas),
  (p_user_id, 'Hospedagem e Domínios', 'expense', false, '#14b8a6', v_assinaturas);

  -- ===== 6. SAÚDE E BEM-ESTAR =====
  INSERT INTO public.categories (user_id, name, type, is_essential, color)
  VALUES (p_user_id, 'Saúde e Bem-Estar', 'expense', true, '#f472b6')
  RETURNING id INTO v_saude;
  
  INSERT INTO public.categories (user_id, name, type, is_essential, color, parent_id) VALUES
  (p_user_id, 'Farmácia', 'expense', true, '#ec4899', v_saude),
  (p_user_id, 'Consultas e Exames', 'expense', true, '#db2777', v_saude),
  (p_user_id, 'Mensalidades (Convênios, Planos)', 'expense', true, '#be185d', v_saude);

  -- ===== 7. LAZER E EDUCAÇÃO =====
  INSERT INTO public.categories (user_id, name, type, is_essential, color)
  VALUES (p_user_id, 'Lazer e Educação', 'expense', false, '#fbbf24')
  RETURNING id INTO v_lazer;
  
  INSERT INTO public.categories (user_id, name, type, is_essential, color, parent_id) VALUES
  (p_user_id, 'Entretenimento e Cultura', 'expense', false, '#f59e0b', v_lazer),
  (p_user_id, 'Viagens', 'expense', false, '#14b8a6', v_lazer),
  (p_user_id, 'Esportes e Academia', 'expense', false, '#10b981', v_lazer),
  (p_user_id, 'Educação/Cursos e Treinamentos', 'expense', true, '#3b82f6', v_lazer);

  -- ===== 8. FINANCEIRO E OUTROS =====
  INSERT INTO public.categories (user_id, name, type, is_essential, color)
  VALUES (p_user_id, 'Financeiro e Outros', 'expense', true, '#64748b')
  RETURNING id INTO v_financeiro;
  
  INSERT INTO public.categories (user_id, name, type, is_essential, color, parent_id) VALUES
  (p_user_id, 'Juros e Taxas', 'expense', true, '#475569', v_financeiro),
  (p_user_id, 'Seguros', 'expense', true, '#1e293b', v_financeiro),
  (p_user_id, 'Impostos e Taxas Públicas', 'expense', true, '#334155', v_financeiro),
  (p_user_id, 'Doações', 'expense', false, '#10b981', v_financeiro),
  (p_user_id, 'Empréstimos e Dívidas', 'expense', true, '#dc2626', v_financeiro),
  (p_user_id, 'Investimentos e Aportes', 'expense', false, '#3b82f6', v_financeiro);

  -- ===== 9. AJUSTES E PESSOAL =====
  INSERT INTO public.categories (user_id, name, type, is_essential, color)
  VALUES (p_user_id, 'Ajustes e Pessoal', 'expense', false, '#94a3b8')
  RETURNING id INTO v_ajustes;
  
  INSERT INTO public.categories (user_id, name, type, is_essential, color, parent_id) VALUES
  (p_user_id, 'Créditos e Reembolsos', 'expense', false, '#10b981', v_ajustes),
  (p_user_id, 'Transferências e Pagamentos', 'expense', false, '#6366f1', v_ajustes),
  (p_user_id, 'Serviços/Estética e Pessoal', 'expense', false, '#ec4899', v_ajustes),
  (p_user_id, 'Serviços/Logística e Frete', 'expense', false, '#f59e0b', v_ajustes);

  -- ===== CATEGORIAS DE RECEITA =====
  INSERT INTO public.categories (user_id, name, type, color) VALUES
  (p_user_id, 'Salário ou renda principal', 'income', '#10b981'),
  (p_user_id, 'Renda extra (freelance, bicos, vendas)', 'income', '#059669'),
  (p_user_id, 'Benefícios sociais (auxílios, bolsas, aposentadorias)', 'income', '#34d399'),
  (p_user_id, 'Rendimentos/juros (investimentos, poupança)', 'income', '#6ee7b7'),
  (p_user_id, 'Outros (presentes, doações, etc.)', 'income', '#22c55e');

  -- ===== CATEGORIAS DE INVESTIMENTO =====
  INSERT INTO public.categories (user_id, name, type, color) VALUES
  (p_user_id, 'Poupança', 'investment', '#10b981'),
  (p_user_id, 'Fundos de investimento', 'investment', '#3b82f6'),
  (p_user_id, 'Ações e renda variável', 'investment', '#8b5cf6'),
  (p_user_id, 'Previdência privada', 'investment', '#f59e0b'),
  (p_user_id, 'Outros investimentos (imóveis, negócios)', 'investment', '#d97706');
END;
$function$;