
-- user_goals
CREATE TABLE public.user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  target_value numeric NOT NULL DEFAULT 0,
  horizon_years integer NOT NULL DEFAULT 5,
  priority integer NOT NULL DEFAULT 1,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own goals select" ON public.user_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own goals insert" ON public.user_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own goals update" ON public.user_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own goals delete" ON public.user_goals FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER user_goals_updated BEFORE UPDATE ON public.user_goals FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- wallet_assets
CREATE TABLE public.wallet_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  name text NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own assets select" ON public.wallet_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own assets insert" ON public.wallet_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own assets update" ON public.wallet_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own assets delete" ON public.wallet_assets FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER wallet_assets_updated BEFORE UPDATE ON public.wallet_assets FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX wallet_assets_user_idx ON public.wallet_assets(user_id);

-- patrimony_snapshots
CREATE TABLE public.patrimony_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  period_month date NOT NULL,
  total numeric NOT NULL DEFAULT 0,
  breakdown jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_month)
);
ALTER TABLE public.patrimony_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own snap select" ON public.patrimony_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own snap insert" ON public.patrimony_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own snap update" ON public.patrimony_snapshots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own snap delete" ON public.patrimony_snapshots FOR DELETE USING (auth.uid() = user_id);
