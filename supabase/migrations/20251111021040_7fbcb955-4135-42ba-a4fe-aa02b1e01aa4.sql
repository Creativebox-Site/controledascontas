-- Atualizar a função create_default_categories com categorias completas
DROP FUNCTION IF EXISTS public.create_default_categories(uuid);

CREATE OR REPLACE FUNCTION public.create_default_categories(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- ===== CATEGORIAS DE RECEITA =====
  
  -- Receitas Principais
  INSERT INTO public.categories (user_id, name, type, color) VALUES
  (p_user_id, 'Salário', 'income', '#10b981'),
  (p_user_id, 'Salário do Cônjuge', 'income', '#059669'),
  (p_user_id, 'Pensão Alimentícia', 'income', '#047857'),
  (p_user_id, 'Aposentadoria', 'income', '#34d399');
  
  -- Receitas Complementares
  INSERT INTO public.categories (user_id, name, type, color) VALUES
  (p_user_id, 'Bico/Freelance', 'income', '#6ee7b7'),
  (p_user_id, 'Hora Extra', 'income', '#a7f3d0'),
  (p_user_id, 'Comissão', 'income', '#5eead4'),
  (p_user_id, 'Venda de Produtos', 'income', '#2dd4bf');
  
  -- Benefícios e Auxílios
  INSERT INTO public.categories (user_id, name, type, color) VALUES
  (p_user_id, 'Vale Alimentação', 'income', '#14b8a6'),
  (p_user_id, 'Vale Refeição', 'income', '#0d9488'),
  (p_user_id, 'Vale Transporte', 'income', '#0f766e'),
  (p_user_id, 'Bolsa Família', 'income', '#115e59'),
  (p_user_id, 'Auxílio Gás', 'income', '#134e4a'),
  (p_user_id, 'BPC/LOAS', 'income', '#042f2e');
  
  -- Outras Receitas
  INSERT INTO public.categories (user_id, name, type, color) VALUES
  (p_user_id, '13º Salário', 'income', '#22c55e'),
  (p_user_id, 'Férias', 'income', '#16a34a'),
  (p_user_id, 'Restituição IR', 'income', '#15803d'),
  (p_user_id, 'Doação/Ajuda Familiar', 'income', '#166534');

  -- ===== DESPESAS ESSENCIAIS (PRIORIDADE ALTA) =====
  
  -- Moradia
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Aluguel', 'expense', true, '#ef4444'),
  (p_user_id, 'Prestação da Casa', 'expense', true, '#dc2626'),
  (p_user_id, 'Condomínio', 'expense', true, '#b91c1c'),
  (p_user_id, 'IPTU', 'expense', true, '#991b1b');
  
  -- Serviços Básicos
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Água', 'expense', true, '#1e40af'),
  (p_user_id, 'Luz', 'expense', true, '#fbbf24'),
  (p_user_id, 'Gás de Cozinha', 'expense', true, '#f59e0b'),
  (p_user_id, 'Internet', 'expense', true, '#3b82f6'),
  (p_user_id, 'Celular (Recarga)', 'expense', true, '#60a5fa');
  
  -- Alimentação
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Mercado', 'expense', true, '#22c55e'),
  (p_user_id, 'Feira', 'expense', true, '#16a34a'),
  (p_user_id, 'Açougue/Padaria', 'expense', true, '#15803d'),
  (p_user_id, 'Gás de Água (Compra)', 'expense', true, '#14532d');
  
  -- Transporte
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Ônibus/Metrô', 'expense', true, '#0ea5e9'),
  (p_user_id, 'Combustível', 'expense', true, '#0284c7'),
  (p_user_id, 'Moto/Bicicleta', 'expense', true, '#0369a1'),
  (p_user_id, 'Uber/99 (Trabalho)', 'expense', true, '#075985');
  
  -- Saúde
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Medicamentos', 'expense', true, '#f472b6'),
  (p_user_id, 'Consulta Médica', 'expense', true, '#ec4899'),
  (p_user_id, 'Exames', 'expense', true, '#db2777'),
  (p_user_id, 'Farmácia Popular', 'expense', true, '#be185d');
  
  -- Educação
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Material Escolar', 'expense', true, '#8b5cf6'),
  (p_user_id, 'Uniforme Escolar', 'expense', true, '#7c3aed'),
  (p_user_id, 'Transporte Escolar', 'expense', true, '#6d28d9'),
  (p_user_id, 'Curso Profissionalizante', 'expense', true, '#5b21b6');
  
  -- Obrigações Financeiras
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Cartão de Crédito', 'expense', true, '#fb923c'),
  (p_user_id, 'Empréstimo Pessoal', 'expense', true, '#f97316'),
  (p_user_id, 'Carnê/Crediário', 'expense', true, '#ea580c'),
  (p_user_id, 'Pensão Alimentícia', 'expense', true, '#c2410c');
  
  -- Cuidados Básicos
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Produtos de Limpeza', 'expense', true, '#06b6d4'),
  (p_user_id, 'Higiene Pessoal', 'expense', true, '#0891b2'),
  (p_user_id, 'Fralda/Bebê', 'expense', true, '#0e7490');

  -- ===== DESPESAS NÃO ESSENCIAIS (PODEM SER CORTADAS) =====
  
  -- Lazer e Entretenimento
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Lanche/Pastel', 'expense', false, '#fcd34d'),
  (p_user_id, 'Sorvete/Açaí', 'expense', false, '#fbbf24'),
  (p_user_id, 'Cinema/Parque', 'expense', false, '#f59e0b'),
  (p_user_id, 'Churrasco/Festa', 'expense', false, '#d97706');
  
  -- Alimentação Extra
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Lanche no Trabalho', 'expense', false, '#84cc16'),
  (p_user_id, 'Delivery', 'expense', false, '#65a30d'),
  (p_user_id, 'Padaria (Café)', 'expense', false, '#4d7c0f'),
  (p_user_id, 'Restaurante', 'expense', false, '#3f6212');
  
  -- Vícios e Hábitos
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Cigarro', 'expense', false, '#78716c'),
  (p_user_id, 'Bebida Alcoólica', 'expense', false, '#57534e'),
  (p_user_id, 'Raspadinha/Loteria', 'expense', false, '#44403c');
  
  -- Aparência
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Salão/Barbeiro', 'expense', false, '#a78bfa'),
  (p_user_id, 'Roupa Nova', 'expense', false, '#8b5cf6'),
  (p_user_id, 'Sapato/Tênis', 'expense', false, '#7c3aed'),
  (p_user_id, 'Maquiagem/Perfume', 'expense', false, '#6d28d9');
  
  -- Tecnologia e Comunicação
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Recarga Extra', 'expense', false, '#38bdf8'),
  (p_user_id, 'Streaming (Netflix)', 'expense', false, '#0ea5e9'),
  (p_user_id, 'Aplicativos', 'expense', false, '#0284c7');
  
  -- Outros
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Presente', 'expense', false, '#f9a8d4'),
  (p_user_id, 'Pet (Ração)', 'expense', false, '#f472b6'),
  (p_user_id, 'Conserto/Reparo', 'expense', false, '#e879f9'),
  (p_user_id, 'Contribuição Igreja', 'expense', false, '#d946ef');
  
  -- Poupança/Investimento
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Poupança', 'expense', false, '#10b981'),
  (p_user_id, 'Reserva de Emergência', 'expense', false, '#059669');
END;
$function$;