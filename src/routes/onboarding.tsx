import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Wallet, Target, RefreshCw } from "lucide-react";
import { questionPool, type Question } from "@/lib/market-data";
import { setSuitability } from "@/lib/chat.functions";
import { upsertGoal, upsertAsset, getUserContext } from "@/lib/wealth.functions";
import { KIND_META, GOAL_KINDS, fmtBRL, type AssetKind, type Suitability } from "@/lib/wealth";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
  head: () => ({ meta: [{ title: "Onboarding" }] }),
});

const N = 6;
function pickQs(seed: number): Question[] {
  const arr = [...questionPool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(((Math.sin(seed * 9301 + i * 49297) + 1) / 2) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, N);
}

function computeSuitability(scores: number[]): Suitability {
  const ratio = scores.reduce((a, b) => a + b, 0) / (N * 4);
  if (ratio <= 0.42) return "Conservador";
  if (ratio <= 0.7) return "Moderado";
  return "Arrojado";
}

type HorizonUnit = "dias" | "meses" | "anos";
type GoalDraft = { kind: string; target_value: string; horizon_years: string; horizon_unit: HorizonUnit };
const UNIT_TO_YEARS: Record<HorizonUnit, number> = { dias: 1 / 365, meses: 1 / 12, anos: 1 };
type AssetDraft = { kind: AssetKind; value: string };

type Currency = "BRL" | "USD" | "EUR" | "GBP";
const CURRENCIES: { code: Currency; symbol: string; locale: string; rateToBRL: number; label: string }[] = [
  { code: "BRL", symbol: "R$", locale: "pt-BR", rateToBRL: 1,    label: "Real" },
  { code: "USD", symbol: "US$", locale: "en-US", rateToBRL: 5.2,  label: "Dólar" },
  { code: "EUR", symbol: "€",   locale: "de-DE", rateToBRL: 5.6,  label: "Euro" },
  { code: "GBP", symbol: "£",   locale: "en-GB", rateToBRL: 6.5,  label: "Libra" },
];
const CUR_BY: Record<Currency, (typeof CURRENCIES)[number]> = Object.fromEntries(CURRENCIES.map((c) => [c.code, c])) as never;

function parseAmount(raw: string, cur: Currency): number {
  if (!raw) return NaN;
  let s = raw.replace(/[^\d.,-]/g, "");
  // pt-BR / de-DE use comma decimal; en-US / en-GB use dot decimal
  if (cur === "BRL" || cur === "EUR") s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(/,/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}
function formatAmount(n: number, cur: Currency): string {
  const c = CUR_BY[cur];
  return new Intl.NumberFormat(c.locale, { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);
}
function toBRL(n: number, cur: Currency): number {
  return n * CUR_BY[cur].rateToBRL;
}

const ASSET_BUCKETS: AssetKind[] = ["investimento", "conta", "imovel", "previdencia", "cripto", "alternativo"];

function Onboarding() {
  const { user, loading } = useAuth();
  const t = useT();
  const nav = useNavigate();
  const saveSuit = useServerFn(setSuitability);
  const saveGoal = useServerFn(upsertGoal);
  const saveAsset = useServerFn(upsertAsset);
  const loadCtx = useServerFn(getUserContext);

  const [step, setStep] = useState(0);
  const [attempt, setAttempt] = useState(() => Date.now());
  const questions = useMemo(() => pickQs(attempt), [attempt]);
  const [qStep, setQStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [suit, setSuit] = useState<Suitability | null>(null);

  const [goals, setGoals] = useState<(GoalDraft & { currency: Currency })[]>([
    { kind: "aposentadoria", target_value: "", horizon_years: "20", horizon_unit: "anos", currency: "BRL" },
  ]);
  const [assets, setAssets] = useState<Record<AssetKind, string>>({
    investimento: "", conta: "", imovel: "", previdencia: "", cripto: "", alternativo: "",
    veiculo: "", seguro: "",
  });
  const [assetCur, setAssetCur] = useState<Record<AssetKind, Currency>>({
    investimento: "BRL", conta: "BRL", imovel: "BRL", previdencia: "BRL", cripto: "USD", alternativo: "BRL",
    veiculo: "BRL", seguro: "BRL",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Already onboarded? short-circuit to home.
  useEffect(() => {
    if (!user) return;
    loadCtx().then((ctx) => {
      if (ctx.profile.suitability && ctx.wallet.count > 0) {
        // already has profile + wallet, no need to redo
      }
    }).catch(() => {});
  }, [user, loadCtx]);

  if (loading) return <div className="p-8 text-muted-foreground text-sm">{t("common.loading")}</div>;
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h1 className="text-3xl text-foreground">{t("onb.gateTitle")}</h1>
        <p className="mt-3 text-muted-foreground">{t("onb.gateLead")}</p>
        <Link to="/login" className="mt-6 inline-block rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm">{t("onb.gateCta")}</Link>
      </div>
    );
  }

  const finish = async () => {
    setSaving(true); setErr(null);
    try {
      if (suit) await saveSuit({ data: { suitability: suit } });
      for (const [i, g] of goals.entries()) {
        const parsed = parseAmount(g.target_value, g.currency);
        const tv = Number.isFinite(parsed) ? toBRL(parsed, g.currency) : NaN;
        const hyRaw = Number(g.horizon_years);
        const hy = Number.isFinite(hyRaw) ? hyRaw * UNIT_TO_YEARS[g.horizon_unit] : NaN;
        if (!g.kind || !Number.isFinite(tv) || tv <= 0) continue;
        const note = g.currency !== "BRL" ? `Original: ${formatAmount(parsed, g.currency)}` : undefined;
        await saveGoal({ data: { kind: g.kind, target_value: tv, horizon_years: Number.isFinite(hy) ? hy : 5, priority: i + 1, note } });
      }
      for (const k of ASSET_BUCKETS) {
        const raw = assets[k];
        if (!raw) continue;
        const cur = assetCur[k];
        const parsed = parseAmount(raw, cur);
        if (!Number.isFinite(parsed) || parsed <= 0) continue;
        const v = toBRL(parsed, cur);
        const note = cur !== "BRL"
          ? `Cadastrado no onboarding | ${formatAmount(parsed, cur)} (convertido a R$ ${CUR_BY[cur].rateToBRL})`
          : "Cadastrado no onboarding";
        await saveAsset({ data: { kind: k, name: KIND_META[k].label, value: v, note } });
      }
      nav({ to: "/" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao salvar");
    } finally { setSaving(false); }
  };

  const Steps = [t("onb.step.profile"), t("onb.step.goals"), t("onb.step.wealth")];

  return (
    <div className="max-w-3xl mx-auto py-6">
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">{t("onb.eyebrow")}</div>
        <h1 className="text-4xl font-medium text-foreground leading-tight">
          {t("onb.heroA")} <span className="italic text-primary">{t("onb.heroB")}</span> {t("onb.heroC")}
        </h1>
        <div className="mt-6 flex items-center gap-3">
          {Steps.map((label, i) => (
            <div key={label} className="flex items-center gap-3 flex-1">
              <div className={`size-7 rounded-full grid place-items-center text-xs font-mono ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
              <span className={`text-xs ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
              {i < Steps.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>
      </header>

      <div className="rounded-2xl border border-border bg-card/60 p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
        {/* Step 0 , perfil */}
        {step === 0 && !suit && (
          <div>
            <div className="flex items-center gap-2 mb-1"><Sparkles className="size-4 text-primary" /><span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("onb.suitability")}</span></div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-muted-foreground">{t("onb.question")} {qStep + 1} {t("onb.of")} {questions.length}</span>
              <div className="flex gap-1.5">
                {questions.map((_, i) => (
                  <span key={i} className={`h-1 w-8 rounded-full ${i <= qStep ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>
            </div>
            <h2 className="text-2xl text-foreground mb-6">{questions[qStep].q}</h2>
            <div className="space-y-2">
              {questions[qStep].opts.map((o) => (
                <button
                  key={o.label}
                  onClick={() => {
                    const ns = [...scores, o.score];
                    if (qStep + 1 >= questions.length) { setScores(ns); setSuit(computeSuitability(ns)); }
                    else { setScores(ns); setQStep(qStep + 1); }
                  }}
                  className="w-full text-left px-5 py-4 rounded-lg border border-border bg-muted/30 hover:bg-accent/40 hover:border-primary/50 transition text-foreground"
                >
                  {o.label}
                </button>
              ))}
            </div>
            <button onClick={() => { setAttempt(Date.now()); setQStep(0); setScores([]); }} className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
              <RefreshCw className="size-3" /> {t("onb.shuffle")}
            </button>
          </div>
        )}
        {step === 0 && suit && (
          <div>
            <CheckCircle2 className="size-10 text-primary mb-4" />
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{t("onb.yourProfile")}</div>
            <h2 className="text-4xl text-foreground mt-1">{suit}</h2>
            <p className="mt-3 text-muted-foreground">{t("onb.profileSaved")}</p>
            <div className="mt-8 flex gap-3">
              <button onClick={() => { setSuit(null); setQStep(0); setScores([]); }} className="rounded-md border border-border px-5 py-3 text-sm hover:bg-accent/40 inline-flex items-center gap-2"><RefreshCw className="size-3.5" /> {t("onb.redo")}</button>
              <button onClick={() => setStep(1)} className="rounded-md bg-primary text-primary-foreground px-5 py-3 text-sm font-medium inline-flex items-center gap-2">{t("common.next")} <ArrowRight className="size-4" /></button>
            </div>
          </div>
        )}

        {/* Step 1 , goals */}
        {step === 1 && (
          <div>
            <div className="flex items-center gap-2 mb-1"><Target className="size-4 text-primary" /><span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("onb.step.goals")}</span></div>
            <h2 className="text-2xl text-foreground mb-1">{t("onb.goalsTitle")}</h2>
            <p className="text-sm text-muted-foreground mb-6">{t("onb.goalsLead")}</p>

            <div className="space-y-3">
              {goals.map((g, i) => (
                <div key={i} className="relative rounded-lg border border-border bg-muted/20 p-4 pr-10">
                  <button
                    type="button"
                    onClick={() => setGoals((cur) => cur.filter((_, k) => k !== i))}
                    aria-label={t("onb.removeGoal")}
                    className="absolute top-2 right-2 size-7 rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive grid place-items-center"
                  >×</button>
                  <div className="grid md:grid-cols-12 gap-3">
                    <label className="md:col-span-5 flex flex-col gap-1">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("onb.goal")}</span>
                      <select
                        value={g.kind}
                        onChange={(e) => setGoals((cur) => cur.map((x, k) => k === i ? { ...x, kind: e.target.value } : x))}
                        className="bg-background border border-border rounded-md px-3 py-2.5 text-sm"
                      >
                        {GOAL_KINDS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                      </select>
                    </label>
                    <label className="md:col-span-3 flex flex-col gap-1">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("onb.currency")}</span>
                      <select
                        value={g.currency}
                        onChange={(e) => setGoals((cur) => cur.map((x, k) => k === i ? { ...x, currency: e.target.value as Currency } : x))}
                        className="bg-background border border-border rounded-md px-3 py-2.5 text-sm font-mono"
                      >
                        {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
                      </select>
                    </label>
                    <label className="md:col-span-4 flex flex-col gap-1">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("onb.targetValue")}</span>
                      <div className="flex items-center gap-2 bg-background border border-border rounded-md px-3 py-2.5">
                        <span className="text-xs text-muted-foreground font-mono">{CUR_BY[g.currency].symbol}</span>
                        <input
                          value={g.target_value}
                          onChange={(e) => setGoals((cur) => cur.map((x, k) => k === i ? { ...x, target_value: e.target.value } : x))}
                          onBlur={(e) => {
                            const n = parseAmount(e.target.value, g.currency);
                            if (Number.isFinite(n) && n > 0) {
                              const formatted = formatAmount(n, g.currency);
                              setGoals((cur) => cur.map((x, k) => k === i ? { ...x, target_value: formatted } : x));
                            }
                          }}
                          placeholder="0,00"
                          inputMode="decimal"
                          className="w-full min-w-0 bg-transparent outline-none text-sm font-mono"
                        />
                      </div>
                    </label>
                    <label className="md:col-span-12 flex flex-col gap-1">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("onb.horizon")}</span>
                      <div className="flex items-stretch gap-2">
                        <input
                          value={g.horizon_years}
                          onChange={(e) => setGoals((cur) => cur.map((x, k) => k === i ? { ...x, horizon_years: e.target.value } : x))}
                          placeholder="Ex.: 20"
                          inputMode="numeric"
                          className="w-28 bg-background border border-border rounded-md px-3 py-2.5 text-sm font-mono"
                        />
                        <select
                          value={g.horizon_unit}
                          onChange={(e) => setGoals((cur) => cur.map((x, k) => k === i ? { ...x, horizon_unit: e.target.value as HorizonUnit } : x))}
                          className="bg-background border border-border rounded-md px-3 py-2.5 text-sm"
                        >
                          <option value="dias">{t("onb.days")}</option>
                          <option value="meses">{t("onb.months")}</option>
                          <option value="anos">{t("onb.years")}</option>
                        </select>
                        <span className="text-xs text-muted-foreground self-center">{t("onb.fromNow")}</span>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
              <button onClick={() => setGoals((cur) => [...cur, { kind: "reserva", target_value: "", horizon_years: "5", horizon_unit: "anos", currency: "BRL" }])} className="text-xs text-primary hover:underline">{t("onb.addGoal")}</button>
            </div>

            <div className="mt-8 flex gap-3 justify-between">
              <button onClick={() => setStep(0)} className="rounded-md border border-border px-5 py-3 text-sm inline-flex items-center gap-2"><ArrowLeft className="size-4" /> {t("common.back")}</button>
              <button onClick={() => setStep(2)} className="rounded-md bg-primary text-primary-foreground px-5 py-3 text-sm font-medium inline-flex items-center gap-2">{t("common.next")} <ArrowRight className="size-4" /></button>
            </div>
          </div>
        )}

        {/* Step 2 , patrimony snapshot */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-2 mb-1"><Wallet className="size-4 text-primary" /><span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("onb.step.wealth")}</span></div>
            <h2 className="text-2xl text-foreground mb-1">{t("onb.wealthTitle")}</h2>
            <p className="text-sm text-muted-foreground mb-6">{t("onb.wealthLead")} <span className="text-foreground">{t("onb.myWalletShort")}</span>.</p>

            <div className="grid md:grid-cols-2 gap-3">
              {ASSET_BUCKETS.map((k) => {
                const Icon = KIND_META[k].icon;
                const cur = assetCur[k];
                return (
                  <div key={k} className="rounded-lg border border-border bg-muted/20 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="size-9 rounded-md grid place-items-center shrink-0" style={{ background: `color-mix(in oklab, ${KIND_META[k].color} 20%, transparent)`, color: KIND_META[k].color }}>
                        <Icon className="size-4" />
                      </div>
                      <div className="text-sm text-foreground truncate">{KIND_META[k].label}</div>
                    </div>
                    <div className="flex items-stretch gap-2">
                      <select
                        value={cur}
                        onChange={(e) => setAssetCur((s) => ({ ...s, [k]: e.target.value as Currency }))}
                        className="bg-background border border-border rounded-md px-2 text-xs font-mono shrink-0"
                        aria-label="Moeda"
                      >
                        {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
                      </select>
                      <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-md px-3 py-2 min-w-0">
                        <span className="text-xs text-muted-foreground font-mono shrink-0">{CUR_BY[cur].symbol}</span>
                        <input
                          value={assets[k]}
                          onChange={(e) => setAssets((s) => ({ ...s, [k]: e.target.value }))}
                          onBlur={(e) => {
                            const n = parseAmount(e.target.value, cur);
                            if (Number.isFinite(n) && n > 0) {
                              setAssets((s) => ({ ...s, [k]: formatAmount(n, cur) }));
                            }
                          }}
                          placeholder="0,00"
                          inputMode="decimal"
                          className="w-full min-w-0 bg-transparent outline-none text-sm font-mono text-right"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {(() => {
              const total = ASSET_BUCKETS.reduce((s, k) => {
                const n = parseAmount(assets[k] || "", assetCur[k]);
                return s + (Number.isFinite(n) ? toBRL(n, assetCur[k]) : 0);
              }, 0);
              return <div className="mt-6 text-sm text-muted-foreground">{t("onb.totalEstimated")} <span className="font-mono text-foreground">{fmtBRL(total)}</span></div>;
            })()}

            {err && <div className="mt-4 text-xs text-destructive">{err}</div>}

            <div className="mt-8 flex gap-3 justify-between">
              <button onClick={() => setStep(1)} className="rounded-md border border-border px-5 py-3 text-sm inline-flex items-center gap-2"><ArrowLeft className="size-4" /> {t("common.back")}</button>
              <button onClick={finish} disabled={saving} className="rounded-md bg-primary text-primary-foreground px-5 py-3 text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60">
                {saving ? t("onb.saving") : <>{t("onb.finish")} <CheckCircle2 className="size-4" /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}