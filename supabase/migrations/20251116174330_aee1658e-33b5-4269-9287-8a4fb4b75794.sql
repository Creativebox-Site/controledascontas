-- Substituir função de categorias padrão com novo conjunto simplificado
CREATE OR REPLACE FUNCTION public.create_default_categories(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- ===== RECEITAS (5 CATEGORIAS) =====
  INSERT INTO public.categories (user_id, name, type, color) VALUES
  (p_user_id, 'Salário ou renda principal', 'income', '#10b981'),
  (p_user_id, 'Renda extra (freelance, bicos, vendas)', 'income', '#059669'),
  (p_user_id, 'Benefícios sociais (auxílios, bolsas, aposentadorias)', 'income', '#34d399'),
  (p_user_id, 'Rendimentos/juros (investimentos, poupança)', 'income', '#6ee7b7'),
  (p_user_id, 'Outros (presentes, doações, etc.)', 'income', '#22c55e');

  -- ===== DESPESAS ESSENCIAIS (5 CATEGORIAS) =====
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Moradia (aluguel, condomínio, prestação)', 'expense', true, '#ef4444'),
  (p_user_id, 'Alimentação (supermercado, itens básicos)', 'expense', true, '#22c55e'),
  (p_user_id, 'Contas básicas e utilidades (água, luz, gás, internet)', 'expense', true, '#1e40af'),
  (p_user_id, 'Transporte (transporte público, combustível)', 'expense', true, '#0ea5e9'),
  (p_user_id, 'Saúde (plano de saúde, medicamentos)', 'expense', true, '#f472b6');

  -- ===== DESPESAS NÃO ESSENCIAIS (5 CATEGORIAS) =====
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Lazer e entretenimento (cinema, restaurantes, viagens)', 'expense', false, '#fbbf24'),
  (p_user_id, 'Vestuário e cuidados pessoais (roupas, salões)', 'expense', false, '#a78bfa'),
  (p_user_id, 'Assinaturas e serviços digitais (streaming, TV a cabo)', 'expense', false, '#38bdf8'),
  (p_user_id, 'Educação e cursos extras', 'expense', false, '#8b5cf6'),
  (p_user_id, 'Compras supérfluas e hobbies (eletrônicos, jogos, bares)', 'expense', false, '#f9a8d4');

  -- ===== INVESTIMENTOS (5 CATEGORIAS) =====
  INSERT INTO public.categories (user_id, name, type, color) VALUES
  (p_user_id, 'Poupança', 'investment', '#10b981'),
  (p_user_id, 'Fundos de investimento', 'investment', '#3b82f6'),
  (p_user_id, 'Ações e renda variável', 'investment', '#8b5cf6'),
  (p_user_id, 'Previdência privada', 'investment', '#f59e0b'),
  (p_user_id, 'Outros investimentos (imóveis, negócios)', 'investment', '#d97706');
END;
$function$;