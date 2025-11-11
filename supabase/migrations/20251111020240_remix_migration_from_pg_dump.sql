--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: create_default_categories(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_default_categories(p_user_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Income categories
  INSERT INTO public.categories (user_id, name, type, color) VALUES
  (p_user_id, 'Salário', 'income', '#10b981'),
  (p_user_id, 'Vale Alimentação', 'income', '#059669'),
  (p_user_id, 'Vale Refeição', 'income', '#047857'),
  (p_user_id, 'Freelance/Extras', 'income', '#34d399'),
  (p_user_id, '13º Salário', 'income', '#6ee7b7');

  -- Essential expense categories
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Aluguel', 'expense', true, '#ef4444'),
  (p_user_id, 'Financiamento Imóvel', 'expense', true, '#dc2626'),
  (p_user_id, 'Financiamento Veículo', 'expense', true, '#b91c1c'),
  (p_user_id, 'Condomínio', 'expense', true, '#991b1b'),
  (p_user_id, 'Supermercado', 'expense', true, '#f87171'),
  (p_user_id, 'Água', 'expense', true, '#fca5a5'),
  (p_user_id, 'Luz', 'expense', true, '#fecaca'),
  (p_user_id, 'Gás', 'expense', true, '#fee2e2'),
  (p_user_id, 'Internet', 'expense', true, '#fb923c'),
  (p_user_id, 'Celular', 'expense', true, '#fdba74'),
  (p_user_id, 'Transporte', 'expense', true, '#fed7aa'),
  (p_user_id, 'Combustível', 'expense', true, '#fb923c'),
  (p_user_id, 'Plano de Saúde', 'expense', true, '#c084fc'),
  (p_user_id, 'Medicamentos', 'expense', true, '#d8b4fe'),
  (p_user_id, 'Educação/Escola', 'expense', true, '#3b82f6'),
  (p_user_id, 'Investimentos', 'expense', true, '#10b981');

  -- Non-essential expense categories
  INSERT INTO public.categories (user_id, name, type, is_essential, color) VALUES
  (p_user_id, 'Cartão de Crédito', 'expense', false, '#fbbf24'),
  (p_user_id, 'Lazer', 'expense', false, '#f59e0b'),
  (p_user_id, 'Delivery/Restaurante', 'expense', false, '#d97706'),
  (p_user_id, 'Assinaturas', 'expense', false, '#b45309'),
  (p_user_id, 'Streaming', 'expense', false, '#92400e'),
  (p_user_id, 'Roupas', 'expense', false, '#ec4899'),
  (p_user_id, 'Beleza/Estética', 'expense', false, '#f472b6'),
  (p_user_id, 'Presentes', 'expense', false, '#f9a8d4'),
  (p_user_id, 'Pet', 'expense', false, '#a78bfa'),
  (p_user_id, 'Academia', 'expense', false, '#c4b5fd');
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Criar perfil do usuário
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  
  -- Criar categorias padrão
  PERFORM public.create_default_categories(new.id);
  
  RETURN new;
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    is_essential boolean DEFAULT false,
    color text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT categories_type_check CHECK ((type = ANY (ARRAY['income'::text, 'expense'::text, 'investment'::text])))
);


--
-- Name: goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    target_amount numeric NOT NULL,
    current_amount numeric DEFAULT 0,
    target_date date NOT NULL,
    goal_type text NOT NULL,
    icon text DEFAULT '🎯'::text,
    is_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    preferred_currency text DEFAULT 'BRL'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    document text,
    avatar_url text DEFAULT '🐷'::text,
    cover_image text DEFAULT 'gradient-1'::text
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    category_id uuid,
    description text NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency text DEFAULT 'BRL'::text,
    type text NOT NULL,
    date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    series_id uuid,
    CONSTRAINT transactions_type_check CHECK ((type = ANY (ARRAY['income'::text, 'expense'::text, 'investment'::text])))
);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: idx_categories_user_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_user_type ON public.categories USING btree (user_id, type);


--
-- Name: idx_goals_is_completed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_goals_is_completed ON public.goals USING btree (is_completed);


--
-- Name: idx_goals_user_completed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_goals_user_completed ON public.goals USING btree (user_id, is_completed);


--
-- Name: idx_goals_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_goals_user_id ON public.goals USING btree (user_id);


--
-- Name: idx_transactions_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_user_date ON public.transactions USING btree (user_id, date DESC);


--
-- Name: profiles set_updated_at_profiles; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: transactions set_updated_at_transactions; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at_transactions BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: goals update_goals_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: categories categories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: goals goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: categories Users can create own categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own categories" ON public.categories FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: goals Users can create own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own goals" ON public.goals FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: transactions Users can create own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own transactions" ON public.transactions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: categories Users can delete own categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: goals Users can delete own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: transactions Users can delete own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: categories Users can update own categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: goals Users can update own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: transactions Users can update own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: categories Users can view own categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own categories" ON public.categories FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: goals Users can view own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: transactions Users can view own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: goals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


