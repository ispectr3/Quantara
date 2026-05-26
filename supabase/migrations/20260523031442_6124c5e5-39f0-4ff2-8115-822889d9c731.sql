
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT,
  lang TEXT DEFAULT 'pt',
  confirmed BOOLEAN NOT NULL DEFAULT false,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX newsletter_subscribers_email_uniq ON public.newsletter_subscribers (lower(email));
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DO $$ BEGIN
  CREATE TYPE public.alert_kind AS ENUM ('price', 'news');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.alert_direction AS ENUM ('above', 'below', 'any');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kind public.alert_kind NOT NULL DEFAULT 'price',
  ticker TEXT NOT NULL,
  direction public.alert_direction NOT NULL DEFAULT 'above',
  target NUMERIC,
  note TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX price_alerts_user_idx ON public.price_alerts (user_id, active);
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their alerts"
  ON public.price_alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert their alerts"
  ON public.price_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update their alerts"
  ON public.price_alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete their alerts"
  ON public.price_alerts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_price_alerts_updated_at
BEFORE UPDATE ON public.price_alerts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
