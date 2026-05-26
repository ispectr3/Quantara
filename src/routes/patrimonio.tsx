import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { ResponsiveContainer, Tooltip, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis } from "recharts";
import { Landmark, Wallet } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { listAssets, listSnapshots, ensureMonthlySnapshot } from "@/lib/wealth.functions";
import { KIND_META, fmtBRL, type AssetKind } from "@/lib/wealth";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/patrimonio")({
  component: Patrimonio,
  head: () => ({ meta: [{ title: "Patrimônio , Quantara" }] }),
});

function Patrimonio() {
  const { user } = useAuth();
  const t = useT();
  const loadA = useServerFn(listAssets);
  const loadS = useServerFn(listSnapshots);
  const snap = useServerFn(ensureMonthlySnapshot);

  const { data: assets = [] } = useQuery({ queryKey: ["wallet-assets"], queryFn: () => loadA(), enabled: !!user });
  const { data: snaps = [], refetch: refetchSnaps } = useQuery({ queryKey: ["patrimony", "snaps"], queryFn: () => loadS(), enabled: !!user });

  useEffect(() => {
    if (!user || assets.length === 0) return;
    snap({}).then((r) => { if (r.ok) refetchSnaps(); }).catch(() => {});
  }, [user, assets.length, snap, refetchSnaps]);

  const total = useMemo(() => assets.reduce((s, a) => s + Number(a.value || 0), 0), [assets]);
  const byKind = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of assets) map[a.kind] = (map[a.kind] || 0) + Number(a.value || 0);
    return (Object.entries(map) as [AssetKind, number][])
      .map(([k, v]) => ({ kind: k, label: KIND_META[k].label, value: v, color: KIND_META[k].color }))
      .sort((a, b) => b.value - a.value);
  }, [assets]);

  const series = useMemo(
    () => snaps.map((s) => ({ t: (s.period_month as string).slice(0, 7), v: Number(s.total) })),
    [snaps],
  );

  if (!user) {
    const items = [t("wealth.preview1"), t("wealth.preview2"), t("wealth.preview3")];
    return (
      <div className="max-w-2xl mx-auto py-16">
        <div className="text-center">
          <Landmark className="size-12 mx-auto text-primary mb-4" />
          <h1 className="text-3xl text-foreground font-medium">{t("wealth.gateTitle")}</h1>
          <p className="mt-3 text-muted-foreground">{t("wealth.gateLead")}</p>
          <Link to="/login" className="mt-6 inline-block rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90">{t("wallet.gateCta")}</Link>
        </div>
        <div className="mt-10 rounded-2xl border border-border bg-card/60 p-6">
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">{t("wallet.previewTitle")}</div>
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it} className="flex items-start gap-3 text-sm text-foreground">
                <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="space-y-6">
        <header className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3 flex items-center gap-2"><Landmark className="size-3.5" /> Wealth Overview</div>
          <h1 className="text-4xl font-medium text-foreground leading-tight">Seu patrimônio consolidado.</h1>
        </header>
        <section className="rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center">
          <Wallet className="size-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl text-foreground">Nenhum dado de patrimônio ainda</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">Faça o <Link to="/onboarding" className="text-primary hover:underline">onboarding</Link> ou cadastre seus ativos em <Link to="/meu-patrimonio" className="text-primary hover:underline">Minha Carteira</Link>.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3 flex items-center gap-2"><Landmark className="size-3.5" /> Wealth Overview</div>
        <h1 className="text-4xl font-medium text-foreground leading-tight">Seu patrimônio consolidado.</h1>
      </header>

      <section className="grid md:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-border bg-card/60 p-6 md:col-span-2">
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Patrimônio total</div>
          <div className="mt-2 font-mono text-5xl text-foreground">{fmtBRL(total)}</div>
          <div className="mt-2 text-xs text-muted-foreground">{assets.length} ativo{assets.length === 1 ? "" : "s"} cadastrado{assets.length === 1 ? "" : "s"}</div>
          <ul className="mt-6 space-y-2.5">
            {byKind.map((c) => {
              const pct = total > 0 ? (c.value / total) * 100 : 0;
              return (
                <li key={c.kind}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{c.label}</span>
                    <span className="font-mono text-muted-foreground">{fmtBRL(c.value)} | {pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full" style={{ width: `${pct}%`, background: c.color }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-6">
            <Link to="/meu-patrimonio" className="text-xs text-primary hover:underline">Gerenciar ativos</Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="text-xl text-foreground">Composição</h2>
          <div className="h-48 mt-2">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byKind} dataKey="value" nameKey="label" innerRadius={48} outerRadius={80} paddingAngle={2}>
                  {byKind.map((d, i) => <Cell key={i} fill={d.color} stroke="transparent" />)}
                </Pie>
                <Tooltip formatter={(v: number) => fmtBRL(v)} contentStyle={{ background: "oklch(0.22 0.02 230)", border: "1px solid oklch(0.32 0.02 230)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2 mt-3 text-sm">
            {byKind.map((d) => (
              <li key={d.kind} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2 rounded-sm" style={{ background: d.color }} />{d.label}
                </span>
                <span className="font-mono text-foreground">{fmtBRL(d.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {series.length > 0 && (
        <section className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-xl text-foreground">Evolução mensal</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Snapshot automático do patrimônio total ao final de cada mês.</p>
            </div>
            <div className="font-mono text-sm text-muted-foreground">{series.length} mês{series.length === 1 ? "" : "es"} registrado{series.length === 1 ? "" : "s"}</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="patg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.02 220)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.78 0.02 220)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" stroke="oklch(0.55 0.02 220)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.55 0.02 220)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => fmtBRL(v)} width={90} />
                <Tooltip formatter={(v: number) => fmtBRL(v)} contentStyle={{ background: "oklch(0.22 0.02 230)", border: "1px solid oklch(0.32 0.02 230)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.78 0.02 220)" strokeWidth={2} fill="url(#patg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
}