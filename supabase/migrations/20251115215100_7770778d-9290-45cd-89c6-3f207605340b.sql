-- Criar tabela de contas a pagar
CREATE TABLE public.payment_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  value NUMERIC NOT NULL CHECK (value > 0),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  recurrence TEXT CHECK (recurrence IN ('never', 'daily', 'weekly', 'monthly', 'custom')),
  recurrence_config JSONB,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  payee TEXT,
  notes TEXT,
  attachments JSONB,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  notification_channel TEXT NOT NULL DEFAULT 'pwa' CHECK (notification_channel IN ('pwa', 'email', 'sms')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de lembretes
CREATE TABLE public.payment_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_item_id UUID NOT NULL REFERENCES public.payment_items(id) ON DELETE CASCADE,
  offset_days INTEGER NOT NULL DEFAULT 0,
  offset_hours INTEGER NOT NULL DEFAULT 0,
  offset_minutes INTEGER NOT NULL DEFAULT 0,
  send_time TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de notificações agendadas
CREATE TABLE public.scheduled_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  payment_item_id UUID NOT NULL REFERENCES public.payment_items(id) ON DELETE CASCADE,
  reminder_id UUID REFERENCES public.payment_reminders(id) ON DELETE CASCADE,
  scheduled_time_utc TIMESTAMP WITH TIME ZONE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('pwa', 'email', 'sms')),
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed', 'cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  device_id TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de preferências de notificação
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  default_channel TEXT NOT NULL DEFAULT 'pwa' CHECK (default_channel IN ('pwa', 'email', 'sms')),
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  pwa_enabled BOOLEAN NOT NULL DEFAULT true,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de subscriptions de push
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_id TEXT NOT NULL,
  subscription_data JSONB NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_id)
);

-- Habilitar RLS
ALTER TABLE public.payment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para payment_items
CREATE POLICY "Users can view own payment items"
  ON public.payment_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payment items"
  ON public.payment_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment items"
  ON public.payment_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment items"
  ON public.payment_items FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para payment_reminders
CREATE POLICY "Users can view own reminders"
  ON public.payment_reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.payment_items
      WHERE payment_items.id = payment_reminders.payment_item_id
      AND payment_items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own reminders"
  ON public.payment_reminders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.payment_items
      WHERE payment_items.id = payment_reminders.payment_item_id
      AND payment_items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own reminders"
  ON public.payment_reminders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.payment_items
      WHERE payment_items.id = payment_reminders.payment_item_id
      AND payment_items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own reminders"
  ON public.payment_reminders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.payment_items
      WHERE payment_items.id = payment_reminders.payment_item_id
      AND payment_items.user_id = auth.uid()
    )
  );

-- Políticas RLS para scheduled_notifications
CREATE POLICY "Users can view own notifications"
  ON public.scheduled_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notifications"
  ON public.scheduled_notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.scheduled_notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.scheduled_notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para notification_preferences
CREATE POLICY "Users can view own preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas RLS para push_subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_payment_items_updated_at
  BEFORE UPDATE ON public.payment_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Índices para performance
CREATE INDEX idx_payment_items_user_due_date ON public.payment_items(user_id, due_date);
CREATE INDEX idx_payment_items_status ON public.payment_items(status);
CREATE INDEX idx_scheduled_notifications_scheduled_time ON public.scheduled_notifications(scheduled_time_utc, status);
CREATE INDEX idx_payment_reminders_payment_item ON public.payment_reminders(payment_item_id);