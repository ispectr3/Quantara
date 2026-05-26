CREATE TABLE public.access_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip text,
  country text,
  country_code text,
  region text,
  city text,
  isp text,
  org text,
  lat double precision,
  lon double precision,
  user_agent text,
  event text NOT NULL DEFAULT 'login',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX access_logs_user_id_created_at_idx ON public.access_logs (user_id, created_at DESC);

ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own access logs"
  ON public.access_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own access logs"
  ON public.access_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);