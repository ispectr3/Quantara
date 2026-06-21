import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Wallet, Plus, Pencil, Trash2, Link2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { listAssets, upsertAsset, deleteAsset } from "@/lib/wealth.functions";
import { KIND_META, fmtBRL, type AssetKind } from "@/lib/wealth";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/meu-patrimonio")({
  component: MeuPatrimonio,
  head: () => ({ meta: [{ title: "Minha Carteira" }] }),
});

function MeuPatrimonio() {
  const { user } = useAuth();
  const t = useT();
  const qc = useQueryClient();
  const load = useServerFn(listAssets);
  const save = useServerFn(upsertAsset);
  const del = useServerFn(deleteAsset);

  const { data: assets = [] } = useQuery({
    queryKey: ["wallet-assets"],
    queryFn: () => load(),
    enabled: !!user,
  });

  const [form, setForm] = useState<{ kind: AssetKind; name: string; value: string; note: string }>({
    kind: "investimento", name: "", value: "", note: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openFinanceMsg, setOpenFinanceMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const total = useMemo(() => assets.reduce((s, a) => s + Number(a.value || 0), 0), [assets]);
  const byKind = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of assets) map[a.kind] = (map[a.kind] || 0) + Number(a.value || 0);
    return (Object.entries(map) as [AssetKind, number][])
      .map(([k, v]) => ({ kind: k, label: KIND_META[k].label, value: v, color: KIND_META[k].color }))
      .sort((a, b) => b.value - a.value);
  }, [assets]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["wallet-assets"] });
    qc.invalidateQueries({ queryKey: ["user-context"] });
    qc.invalidateQueries({ queryKey: ["patrimony"] });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const value = Number(form.value.replace(/\./g, "").replace(",", "."));
    if (!name || !Number.isFinite(value) || value <= 0) return;
    setBusy(true);
    try {
      await save({ data: { id: editingId ?? undefined, kind: form.kind, name, value, note: form.note.trim() || undefined } });
      setForm({ kind: form.kind, name: "", value: "", note: "" });
      setEditingId(null);
      invalidate();
    } finally { setBusy(false); }
  };

  const edit = (a: typeof assets[number]) => {
    setEditingId(a.id);
    setForm({ kind: a.kind as AssetKind, name: a.name, value: String(a.value), note: a.note ?? "" });
  };
  const remove = async (id: string) => {
    if (!confirm("Remover este ativo?")) return;
    await del({ data: { id } });
    if (editingId === id) { setEditingId(null); setForm({ kind: "investimento", name: "", value: "", note: "" }); }
    invalidate();
  };

  const connectOpenFinance = () => {
    setOpenFinanceMsg("Em breve , integração com Open Finance via parceiro homologado (Pluggy/Belvo). Por enquanto, preencha manualmente.");
    setTimeout(() => setOpenFinanceMsg(null), 6000);
  };

  if (!user) {
    const items = [t("wallet.preview1"), t("wallet.preview2"), t("wallet.preview3")];
    return (
      <div className="max-w-2xl mx-auto py-16">
        <div className="text-center">
          <Wallet className="size-12 mx-auto text-primary mb-4" />
          <h1 className="text-3xl text-foreground font-medium">{t("wallet.gateTitle")}</h1>
          <p className="mt-3 text-muted-foreground">{t("wallet.gateLead")}</p>
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

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3 flex items-center gap-2"><Wallet className="size-3.5" /> Seu raio-x</div>
        <h1 className="text-4xl font-medium text-foreground leading-tight">
          Seu patrimônio, <span className="italic text-primary">de verdade</span>.
        </h1>
        <p className="mt-3 text-muted-foreground">Cadastre cada ativo manualmente ou conecte via Open Finance. Os dados ficam salvos na sua conta Quantara.</p>
      </header>

      <section className="rounded-2xl border border-dashed border-primary/40 bg-primary/[0.04] p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-md bg-primary/15 text-primary grid place-items-center"><Link2 className="size-5" /></div>
          <div>
            <div className="text-sm font-medium text-foreground">Conectar via Open Finance</div>
            <div className="text-xs text-muted-foreground mt-0.5">Importe saldos, investimentos e cartões dos seus bancos.</div>
          </div>
        </div>
        <button onClick={connectOpenFinance} className="self-start md:self-auto rounded-md border border-primary/60 bg-card px-4 py-2 text-sm text-primary hover:bg-primary/10 transition">
          Conectar banco (em breve)
        </button>
      </section>
      {openFinanceMsg && (
        <div className="rounded-md border border-border bg-card/60 p-3 text-xs text-muted-foreground">{openFinanceMsg}</div>
      )}

      {assets.length > 0 && (
        <section className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 rounded-2xl border border-border bg-card/60 p-6">
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
          </div>
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <h2 className="text-lg text-foreground mb-2">Composição</h2>
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byKind} dataKey="value" nameKey="label" innerRadius={48} outerRadius={84} paddingAngle={2}>
                    {byKind.map((d, i) => <Cell key={i} fill={d.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtBRL(v)} contentStyle={{ background: "oklch(0.22 0.02 230)", border: "1px solid oklch(0.32 0.02 230)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card/60 p-6">
        <h2 className="text-xl text-foreground mb-1">{editingId ? "Editar ativo" : "Adicionar ativo"}</h2>
        <p className="text-xs text-muted-foreground mb-5">Apartamento, carteira XP, conta corrente, Bitcoin… o que você considera patrimônio.</p>
        <form onSubmit={submit} className="grid md:grid-cols-12 gap-3">
          <select
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value as AssetKind })}
            className="md:col-span-3 bg-muted/40 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {(Object.keys(KIND_META) as AssetKind[]).map((k) => (
              <option key={k} value={k}>{KIND_META[k].label}</option>
            ))}
          </select>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nome do ativo (ex: Apto Jardins)"
            maxLength={80}
            className="md:col-span-4 bg-muted/40 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            placeholder="Valor (R$)"
            inputMode="decimal"
            className="md:col-span-2 bg-muted/40 border border-border rounded-md px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Nota (opcional)"
            maxLength={120}
            className="md:col-span-3 bg-muted/40 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button type="submit" disabled={busy} className="md:col-span-12 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
            <Plus className="size-4" /> {editingId ? "Salvar alterações" : "Adicionar ativo"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ kind: "investimento", name: "", value: "", note: "" }); }} className="md:col-span-12 text-xs text-muted-foreground hover:text-foreground">
              cancelar edição
            </button>
          )}
        </form>
      </section>

      {assets.length > 0 ? (
        <section className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="text-xl text-foreground mb-4">Ativos cadastrados</h2>
          <ul className="divide-y divide-border">
            {assets.map((a) => {
              const meta = KIND_META[a.kind as AssetKind];
              const Icon = meta.icon;
              return (
                <li key={a.id} className="py-3 flex items-center gap-3">
                  <div className="size-9 rounded-md grid place-items-center" style={{ background: `color-mix(in oklab, ${meta.color} 20%, transparent)`, color: meta.color }}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground truncate">{a.name}</span>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{meta.label}</span>
                    </div>
                    {a.note && <div className="text-xs text-muted-foreground truncate">{a.note}</div>}
                  </div>
                  <div className="font-mono text-sm text-foreground">{fmtBRL(Number(a.value))}</div>
                  <button onClick={() => edit(a)} aria-label="Editar" className="size-8 grid place-items-center rounded hover:bg-accent/40 text-muted-foreground hover:text-foreground"><Pencil className="size-3.5" /></button>
                  <button onClick={() => remove(a.id)} aria-label="Remover" className="size-8 grid place-items-center rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
          <Wallet className="size-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum ativo cadastrado ainda. Faça o <Link to="/onboarding" className="text-primary hover:underline">onboarding</Link> ou adicione um ativo acima.</p>
        </section>
      )}
    </div>
  );
}