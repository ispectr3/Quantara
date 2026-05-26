import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const assetKindEnum = z.enum([
  "investimento", "imovel", "veiculo", "conta", "previdencia", "cripto", "seguro", "alternativo",
]);

/* ---------- Wallet assets ---------- */

export const listAssets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("wallet_assets")
      .select("id,kind,name,value,note,created_at")
      .eq("user_id", userId)
      .order("value", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid().optional(),
      kind: assetKindEnum,
      name: z.string().min(1).max(120),
      value: z.number().min(0).max(1e12),
      note: z.string().max(200).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.id) {
      const { error } = await supabase.from("wallet_assets")
        .update({ kind: data.kind, name: data.name, value: data.value, note: data.note ?? null })
        .eq("id", data.id).eq("user_id", userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase.from("wallet_assets")
      .insert({ user_id: userId, kind: data.kind, name: data.name, value: data.value, note: data.note ?? null })
      .select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("wallet_assets").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- Goals ---------- */

export const listGoals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_goals")
      .select("id,kind,target_value,horizon_years,priority,note")
      .eq("user_id", userId)
      .order("priority", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid().optional(),
      kind: z.string().min(1).max(40),
      target_value: z.number().min(0).max(1e12),
      horizon_years: z.number().min(0).max(80),
      priority: z.number().int().min(1).max(10).default(1),
      note: z.string().max(200).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.id) {
      const { error } = await supabase.from("user_goals")
        .update({ kind: data.kind, target_value: data.target_value, horizon_years: data.horizon_years, priority: data.priority, note: data.note ?? null })
        .eq("id", data.id).eq("user_id", userId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase.from("user_goals")
      .insert({ user_id: userId, kind: data.kind, target_value: data.target_value, horizon_years: data.horizon_years, priority: data.priority, note: data.note ?? null })
      .select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("user_goals").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- Snapshots ---------- */

export const listSnapshots = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("patrimony_snapshots")
      .select("period_month,total")
      .eq("user_id", userId)
      .order("period_month", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const ensureMonthlySnapshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: assets } = await supabase.from("wallet_assets").select("kind,value").eq("user_id", userId);
    if (!assets || assets.length === 0) return { ok: false, reason: "no-assets" };
    const total = assets.reduce((s, a) => s + Number(a.value || 0), 0);
    const breakdown: Record<string, number> = {};
    for (const a of assets) breakdown[a.kind] = (breakdown[a.kind] || 0) + Number(a.value || 0);
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const { error } = await supabase.from("patrimony_snapshots")
      .upsert({ user_id: userId, period_month: period, total, breakdown }, { onConflict: "user_id,period_month" });
    if (error) throw new Error(error.message);
    return { ok: true, total };
  });

/* ---------- Full user context (for IA + diagnóstico) ---------- */

export const getUserContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profileRes, goalsRes, assetsRes] = await Promise.all([
      supabase.from("profiles").select("display_name,suitability").eq("user_id", userId).maybeSingle(),
      supabase.from("user_goals").select("kind,target_value,horizon_years,priority,note").eq("user_id", userId).order("priority", { ascending: true }),
      supabase.from("wallet_assets").select("kind,name,value").eq("user_id", userId),
    ]);
    const assets = assetsRes.data ?? [];
    const total = assets.reduce((s, a) => s + Number(a.value || 0), 0);
    const byKind: Record<string, number> = {};
    for (const a of assets) byKind[a.kind] = (byKind[a.kind] || 0) + Number(a.value || 0);
    return {
      profile: profileRes.data ?? { display_name: null, suitability: null },
      goals: goalsRes.data ?? [],
      wallet: { total, byKind, count: assets.length },
    };
  });