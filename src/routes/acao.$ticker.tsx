import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, ArrowLeft, TrendingUp, ShieldAlert, Sparkles } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { topStocks, bankPortfolios } from "@/lib/market-data";
import { useT } from "@/lib/i18n";
import { AlertsPanel } from "@/components/AlertsPanel";

export const Route = createFileRoute("/acao/$ticker")({
  component: AcaoDetail,
  head: ({ params }) => ({
    meta: [
      { title: `${params.ticker}` },
      { name: "description", content: `Análise institucional de ${params.ticker}: score Quantara, tese, consenso das casas e riscos.` },
      { property: "og:title", content: `${params.ticker}` },
      { property: "og:description", content: `Tese, fundamentos e consenso institucional para ${params.ticker}.` },
      { property: "og:url", content: `/acao/${params.ticker}` },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: `/acao/${params.ticker}` }],
  }),
});

// Deterministic mini-series per ticker
function buildSeries(ticker: string, price: number) {
  const seed = ticker.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const out: { t: string; v: number }[] = [];
  let v = price * 0.95;
  for (let i = 0; i < 30; i++) {
    const noise = (Math.sin(seed * 17 + i * 5) + Math.cos(seed + i * 3.1)) * (price * 0.012);
    v = Math.max(price * 0.85, v + noise + (price - v) * 0.05);
    out.push({ t: `D-${30 - i}`, v: Number(v.toFixed(2)) });
  }
  out[out.length - 1].v = price;
  return out;
}

function AcaoDetail() {
  const t = useT();
  const { ticker } = useParams({ from: "/acao/$ticker" });
  const stock = topStocks.find((s) => s.ticker.toUpperCase() === ticker.toUpperCase());

  if (!stock) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <h1 className="text-2xl text-foreground">{t("stock.notFound")}</h1>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="size-4" /> {t("stock.back")}
        </Link>
      </div>
    );
  }

  const series = buildSeries(stock.ticker, stock.price);
  const negative = stock.delta < 0;
  const housesHolding = bankPortfolios.filter((p) => p.picks.includes(stock.ticker));

  // Deterministic fundamentals from score
  const pe = (8 + (100 - stock.score) * 0.18).toFixed(1);
  const dy = (1.5 + (100 - stock.score) * 0.06).toFixed(2);
  const roe = (8 + stock.score * 0.18).toFixed(1);
  const margin = (5 + stock.score * 0.22).toFixed(1);

  const thesis = stock.score >= 80
    ? "Posicionamento defensivo de alta qualidade. Geração consistente de caixa, governança madura e múltiplo atraente versus pares globais. Recomendado como core position em carteiras moderadas e arrojadas."
    : stock.score >= 65
    ? "Tese de crescimento com riscos balanceados. Boa execução operacional, mas exposição cíclica relevante. Indicado como satélite tático em carteiras com maior tolerância à volatilidade."
    : "Perfil de turnaround com elevada volatilidade. Múltiplos comprimidos refletem incertezas de execução e ciclo. Apenas para alocações táticas pequenas, com horizonte longo.";

  const risks = stock.score >= 80
    ? ["Compressão de múltiplos em ciclo de alta de juros", "Mudança regulatória relevante no setor", "Câmbio adverso em receitas dolarizadas"]
    : stock.score >= 65
    ? ["Volatilidade de commodities", "Desaceleração da demanda global", "Risco fiscal Brasil pressionando curva longa"]
    : ["Geração de caixa pressionada", "Alavancagem elevada vs pares", "Concorrência ganhando share"];

  return (
    <div className="space-y-8">
      <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> {t("stock.back")}
      </Link>

      {/* Header */}
      <header className="rounded-2xl border border-border p-8" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}>
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{t("stock.eyebrow")}</div>
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <h1 className="text-5xl font-medium text-foreground font-mono tracking-tight">{stock.ticker}</h1>
            <p className="mt-2 text-muted-foreground">{stock.name}</p>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t("stock.price")}</div>
              <div className="font-mono text-3xl text-foreground">R$ {stock.price.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t("stock.dayChange")}</div>
              <div className={`font-mono text-2xl inline-flex items-center gap-1 ${negative ? "text-destructive" : "text-[oklch(0.72_0.16_155)]"}`}>
                {negative ? <ArrowDownRight className="size-5" /> : <ArrowUpRight className="size-5" />}
                {stock.delta > 0 ? "+" : ""}{stock.delta}%
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t("stock.score")}</div>
              <div className="font-mono text-3xl text-primary">{stock.score}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Chart */}
      <section className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="gAcao" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.02 220)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.78 0.02 220)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" stroke="oklch(0.55 0.02 220)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.55 0.02 220)" fontSize={11} tickLine={false} axisLine={false} domain={["dataMin - 1", "dataMax + 1"]} />
              <Tooltip contentStyle={{ background: "oklch(0.22 0.02 230)", border: "1px solid oklch(0.32 0.02 230)", borderRadius: 8, color: "oklch(0.92 0.005 220)" }} labelStyle={{ color: "oklch(0.68 0.015 220)" }} />
              <Area type="monotone" dataKey="v" stroke="oklch(0.78 0.02 220)" strokeWidth={2} fill="url(#gAcao)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Thesis + Fundamentals */}
      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-xl text-foreground">{t("stock.thesis")}</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">{thesis}</p>

          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="size-4 text-destructive" />
              <h3 className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{t("stock.risks")}</h3>
            </div>
            <ul className="space-y-1.5">
              {risks.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mt-1.5 size-1.5 rounded-full bg-destructive shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-4 text-primary" />
            <h2 className="text-xl text-foreground">{t("stock.fundamentals")}</h2>
          </div>
          <dl className="space-y-3 text-sm">
            <Metric k="P/L" v={pe} />
            <Metric k="Dividend Yield" v={`${dy}%`} />
            <Metric k="ROE" v={`${roe}%`} />
            <Metric k="Margem líquida" v={`${margin}%`} />
          </dl>
        </div>
      </section>

      {/* Houses consensus */}
      <section className="rounded-2xl border border-border bg-card/60 p-6">
        <h2 className="text-xl text-foreground mb-4">{t("stock.consensus")}</h2>
        {housesHolding.length === 0 ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : (
          <ul className="grid md:grid-cols-2 gap-3">
            {housesHolding.map((h) => (
              <li key={h.slug}>
                <Link to="/carteiras/$slug" params={{ slug: h.slug }} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4 hover:border-primary/40 transition">
                  <div>
                    <div className="text-sm text-foreground">{h.bank}</div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">{h.focus}</div>
                  </div>
                  <span className="font-mono text-primary">{h.score}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Alerts */}
      <AlertsPanel ticker={stock.ticker} currentPrice={stock.price} />
    </div>
  );
}

function Metric({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-mono text-foreground">{v}</dd>
    </div>
  );
}