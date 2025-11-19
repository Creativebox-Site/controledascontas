-- Atualizar função create_default_categories para remover duplicação da categoria "Reserva de emergência"
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
  v_salario_renda uuid;
  v_renda_extra uuid;
  v_beneficios uuid;
  v_rendimentos uuid;
  v_outros_receita uuid;
  v_investimentos uuid;
BEGIN
  -- ===== CATEGORIAS DE DESPESA =====
  
  -- 1. CONTAS DE CASA E MORADIA
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

  -- 2. ALIMENTAÇÃO
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

  -- 3. TRANSPORTE
  INSERT INTO public.categories (user_id, name, type, is_essential, color)
  VALUES (p_user_id, 'Transporte', 'expense', true, '#0ea5e9')
  RETURNING id INTO v_transporte;
  
  INSERT INTO public.categories (user_id, name, type, is_essential, color, parent_id) VALUES
  (p_user_id, 'Combustível', 'expense', true, '#0284c7', v_transporte),
  (p_user_id, 'Aplicativos (Uber, 99)', 'expense', true, '#06b6d4', v_transporte),
  (p_user_id, 'Passagens (Aéreas, Rodoviárias)', 'expense', false, '#7dd3fc', v_transporte),
  (p_user_id, 'Estacionamento e Pedágio', 'expense', true, '#0369a1', v_transporte),
  (p_user_id, 'Manutenção e Peças', 'expense', true, '#475569', v_transporte);

  -- 4. COMPRAS E VESTUÁRIO
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

  -- 5. ASSINATURAS E SERVIÇOS ONLINE
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

  -- 6. SAÚDE E BEM-ESTAR
  INSERT INTO public.categories (user_id, name, type, is_essential, color)
  VALUES (p_user_id, 'Saúde e Bem-Estar', 'expense', true, '#f472b6')
  RETURNING id INTO v_saude;
  
  INSERT INTO public.categories (user_id, name, type, is_essential, color, parent_id) VALUES
  (p_user_id, 'Farmácia', 'expense', true, '#ec4899', v_saude),
  (p_user_id, 'Consultas e Exames', 'expense', true, '#db2777', v_saude),
  (p_user_id, 'Mensalidades (Convênios, Planos)', 'expense', true, '#be185d', v_saude);

  -- 7. LAZER E EDUCAÇÃO
  INSERT INTO public.categories (user_id, name, type, is_essential, color)
  VALUES (p_user_id, 'Lazer e Educação', 'expense', false, '#fbbf24')
  RETURNING id INTO v_lazer;
  
  INSERT INTO public.categories (user_id, name, type, is_essential, color, parent_id) VALUES
  (p_user_id, 'Entretenimento e Cultura', 'expense', false, '#f59e0b', v_lazer),
  (p_user_id, 'Viagens', 'expense', false, '#14b8a6', v_lazer),
  (p_user_id, 'Esportes e Academia', 'expense', false, '#10b981', v_lazer),
  (p_user_id, 'Educação/Cursos e Treinamentos', 'expense', true, '#3b82f6', v_lazer);

  -- 8. FINANCEIRO E OUTROS
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
  -- REMOVIDO: 'Reserva de Emergência' daqui pois será criada como investimento

  -- 9. AJUSTES E PESSOAL
  INSERT INTO public.categories (user_id, name, type, is_essential, color)
  VALUES (p_user_id, 'Ajustes e Pessoal', 'expense', false, '#94a3b8')
  RETURNING id INTO v_ajustes;
  
  INSERT INTO public.categories (user_id, name, type, is_essential, color, parent_id) VALUES
  (p_user_id, 'Créditos e Reembolsos', 'expense', false, '#10b981', v_ajustes),
  (p_user_id, 'Transferências e Pagamentos', 'expense', false, '#6366f1', v_ajustes),
  (p_user_id, 'Serviços/Estética e Pessoal', 'expense', false, '#ec4899', v_ajustes),
  (p_user_id, 'Serviços/Logística e Frete', 'expense', false, '#f59e0b', v_ajustes);

  -- ===== CATEGORIAS DE RECEITA COM HIERARQUIA =====
  
  -- 1. Salário ou renda principal
  INSERT INTO public.categories (user_id, name, type, color)
  VALUES (p_user_id, 'Salário e Renda Principal', 'income', '#10b981')
  RETURNING id INTO v_salario_renda;
  
  INSERT INTO public.categories (user_id, name, type, color, parent_id) VALUES
  (p_user_id, 'Salário CLT', 'income', '#059669', v_salario_renda),
  (p_user_id, 'Salário PJ', 'income', '#047857', v_salario_renda),
  (p_user_id, 'Pró-labore', 'income', '#065f46', v_salario_renda),
  (p_user_id, 'Honorários Profissionais', 'income', '#064e3b', v_salario_renda);

  -- 2. Renda extra
  INSERT INTO public.categories (user_id, name, type, color)
  VALUES (p_user_id, 'Renda Extra', 'income', '#34d399')
  RETURNING id INTO v_renda_extra;
  
  INSERT INTO public.categories (user_id, name, type, color, parent_id) VALUES
  (p_user_id, 'Freelance', 'income', '#6ee7b7', v_renda_extra),
  (p_user_id, 'Bicos e Trabalhos Temporários', 'income', '#a7f3d0', v_renda_extra),
  (p_user_id, 'Vendas e Comércio', 'income', '#d1fae5', v_renda_extra),
  (p_user_id, 'Aluguéis Recebidos', 'income', '#10b981', v_renda_extra);

  -- 3. Benefícios sociais
  INSERT INTO public.categories (user_id, name, type, color)
  VALUES (p_user_id, 'Benefícios Sociais', 'income', '#22c55e')
  RETURNING id INTO v_beneficios;
  
  INSERT INTO public.categories (user_id, name, type, color, parent_id) VALUES
  (p_user_id, 'Auxílios Governamentais', 'income', '#16a34a', v_beneficios),
  (p_user_id, 'Bolsas de Estudo', 'income', '#15803d', v_beneficios),
  (p_user_id, 'Aposentadoria', 'income', '#166534', v_beneficios),
  (p_user_id, 'Pensões', 'income', '#14532d', v_beneficios);

  -- 4. Rendimentos/juros
  INSERT INTO public.categories (user_id, name, type, color)
  VALUES (p_user_id, 'Rendimentos e Investimentos', 'income', '#84cc16')
  RETURNING id INTO v_rendimentos;
  
  INSERT INTO public.categories (user_id, name, type, color, parent_id) VALUES
  (p_user_id, 'Juros de Investimentos', 'income', '#65a30d', v_rendimentos),
  (p_user_id, 'Dividendos', 'income', '#4d7c0f', v_rendimentos),
  (p_user_id, 'Rendimento de Poupança', 'income', '#3f6212', v_rendimentos),
  (p_user_id, 'Lucros de Negócios', 'income', '#365314', v_rendimentos);

  -- 5. Outros
  INSERT INTO public.categories (user_id, name, type, color)
  VALUES (p_user_id, 'Outros Recebimentos', 'income', '#a3e635')
  RETURNING id INTO v_outros_receita;
  
  INSERT INTO public.categories (user_id, name, type, color, parent_id) VALUES
  (p_user_id, 'Presentes em Dinheiro', 'income', '#d9f99d', v_outros_receita),
  (p_user_id, 'Doações Recebidas', 'income', '#ecfccb', v_outros_receita),
  (p_user_id, 'Reembolsos', 'income', '#bef264', v_outros_receita),
  (p_user_id, 'Prêmios e Sorteios', 'income', '#84cc16', v_outros_receita);

  -- ===== CATEGORIAS DE INVESTIMENTO =====
  -- Criar categoria pai de Investimentos e Aportes
  INSERT INTO public.categories (user_id, name, type, color)
  VALUES (p_user_id, 'Investimentos e Aportes', 'investment', '#3b82f6')
  RETURNING id INTO v_investimentos;
  
  -- Criar subcategorias de investimento
  INSERT INTO public.categories (user_id, name, type, color, parent_id) VALUES
  (p_user_id, 'Poupança', 'investment', '#10b981', v_investimentos),
  (p_user_id, 'Fundos de investimento', 'investment', '#3b82f6', v_investimentos),
  (p_user_id, 'Ações e renda variável', 'investment', '#8b5cf6', v_investimentos),
  (p_user_id, 'Previdência privada', 'investment', '#f59e0b', v_investimentos),
  (p_user_id, 'Reserva de emergência', 'investment', '#22c55e', v_investimentos),
  (p_user_id, 'Outros investimentos (imóveis, negócios)', 'investment', '#d97706', v_investimentos);
END;
$function$;