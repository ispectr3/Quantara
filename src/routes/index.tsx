import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MemoAreaChart } from "@/components/charts/MemoAreaChart";
import { useMemo, useDeferredValue } from "react";
import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";
import { indices, ibovSeries, topStocks, consolidatedPortfolio, news } from "@/lib/market-data";
import { Link } from "@tanstack/react-router";
import { getLiveQuotes } from "@/lib/brapi.functions";
import { getLiveNews } from "@/lib/news.functions";
import { DiagnosticCard } from "@/components/DiagnosticCard";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { getUserContext } from "@/lib/wealth.functions";
import { allocationForSuitability, allocSubtitleFor } from "@/lib/portfolio-by-suit";
import type { Suitability } from "@/lib/wealth";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Quantara · Wealth Intelligence" },
      { name: "description", content: "Quantara consolida as carteiras das principais casas de wealth management do Brasil em uma plataforma de inteligência para o segmento private." },
      { name: "author", content: "Quantara" },
      { property: "og:title", content: "Quantara · Wealth Intelligence" },
      { property: "og:description", content: "Inteligência de mercado consolidada para investidores private. XP, BTG, J.P. Morgan e mais, em uma visão unificada." },
      { property: "og:url", content: "/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@quantarainvest" },
      { name: "twitter:title", content: "Quantara · Wealth Intelligence" },
      { name: "twitter:description", content: "Inteligência de mercado consolidada para investidores private. XP, BTG, J.P. Morgan e mais, em uma visão unificada." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function Index() {
  const t = useT();
  const fetchLive = useServerFn(getLiveQuotes);
  const fetchNews = useServerFn(getLiveNews);
  const { user } = useAuth();
  const fetchCtx = useServerFn(getUserContext);
  const { data: ctx } = useQuery({
    queryKey: ["user-context"],
    queryFn: () => fetchCtx(),
    enabled: !!user,
  });
  const { data: live } = useQuery({
    queryKey: ["brapi-live"],
    queryFn: () => fetchLive(),
    refetchInterval: 60_000,
    staleTime: 5 * 60_000,
    gcTime: 20 * 60_000,
    refetchOnMount: false,
  });
  const { data: liveNews } = useQuery({
    queryKey: ["live-news"],
    queryFn: () => fetchNews(),
    refetchInterval: 5 * 60_000,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnMount: false,
  });

  const liveOk = live && live.ok;
  const liveIndices = liveOk
    ? [
        {
          name: "IBOVESPA",
          value: live.ibov ? live.ibov.value.toLocaleString("pt-BR", { maximumFractionDigits: 0 }) : indices[0].value,
          delta: live.ibov ? Number(live.ibov.delta.toFixed(2)) : indices[0].delta,
          neg: live.ibov ? live.ibov.delta < 0 : indices[0].neg,
        },
        indices[1],
        {
          name: "DÓLAR",
          value: live.usd ? `R$ ${live.usd.value.toFixed(2).replace(".", ",")}` : indices[2].value,
          delta: live.usd ? Number(live.usd.delta.toFixed(2)) : indices[2].delta,
          neg: live.usd ? live.usd.delta < 0 : indices[2].neg,
        },
        indices[3],
        indices[4],
      ]
    : indices;

  const liveStocks = liveOk && live.stocks.length
    ? topStocks.map((s) => {
        const m = live.stocks.find((x) => x.ticker === s.ticker);
        return m ? { ...s, price: m.price, delta: Number(m.delta.toFixed(2)) } : s;
      })
    : topStocks;

  const liveSeries = liveOk && live.ibovSeries.length ? live.ibovSeries : ibovSeries;
  const series = useMemo(() => liveSeries, [liveSeries]);
  const deferredSeries = useDeferredValue(series);
  const ibovLast = liveSeries[liveSeries.length - 1];
  const ibovDelta = liveOk && live.ibov ? live.ibov.delta : 1.42;
  const marketNews = liveNews?.items?.length
    ? liveNews.items.slice(0, 4).map((n) => ({ ...n, time: n.publishedAt ? new Date(n.publishedAt).toLocaleDateString("pt-BR") : "—" }))
    : news.slice(0, 4);

  const suit = (ctx?.profile?.suitability as Suitability | null) ?? null;
  const personalizedAlloc = suit ? allocationForSuitability(suit) : consolidatedPortfolio;
  const allocSubtitle = suit ? allocSubtitleFor(suit) : t("home.allocSub");

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-2xl border border-border p-8 lg:p-10"
        style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-4">
              <Sparkles className="size-3.5" /> {t("home.eyebrow")}
            </div>
            <h1 className="text-4xl lg:text-5xl font-medium text-foreground leading-[1.05]">
              {t("home.heroA")}{" "}
              <span className="italic text-primary">{t("home.heroB")}</span>
            </h1>
            <p className="mt-4 text-muted-foreground max-w-xl">
              {t("home.heroLead")}
            </p>
          </div>
          <div className="flex">
            <a href="/advisor" className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:opacity-90 transition">
              {t("home.discoverProfile")}
            </a>
          </div>
        </div>
      </section>

      {/* Diagnóstico personalizado */}
      <DiagnosticCard />

      {/* Indices ticker */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {liveIndices.map((i) => (
          <div key={i.name} className="rounded-xl border border-border bg-card/60 backdrop-blur p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{i.name}</div>
            <div className="mt-1 text-lg font-mono text-foreground">{i.value}</div>
            <div className={`mt-1 inline-flex items-center gap-1 text-xs ${i.neg ? "text-destructive" : "text-[oklch(0.72_0.16_155)]"}`}>
              {i.neg ? <ArrowDownRight className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
              {i.delta > 0 ? "+" : ""}{i.delta}%
            </div>
          </div>
        ))}
      </section>

      {/* Chart + Allocation */}
      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl text-foreground">{t("home.intraday")}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{t("home.intradaySub")}</p>
            </div>
            <div className="font-mono text-2xl text-foreground">
              {ibovLast ? ibovLast.v.toLocaleString("pt-BR") : "131.240"}
              <span className={`text-sm ml-2 ${ibovDelta < 0 ? "text-destructive" : "text-[oklch(0.72_0.16_155)]"}`}>
                {ibovDelta > 0 ? "+" : ""}{ibovDelta.toFixed(2)}%
              </span>
            </div>
          </div>
          <MemoAreaChart data={deferredSeries} gradientId="ibov" color="oklch(0.78 0.02 220)" yPadding={200} height={288} />
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="text-xl text-foreground">{t("home.allocSuggested")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{allocSubtitle}</p>
          <div className="h-48 mt-2" style={{ contentVisibility: "auto", containIntrinsicSize: "192px" }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={personalizedAlloc} dataKey="value" innerRadius={48} outerRadius={80} paddingAngle={2}>
                  {personalizedAlloc.map((d, i) => (
                    <Cell key={i} fill={d.color} stroke="transparent" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-1.5 mt-2">
            {personalizedAlloc.map((d) => (
              <li key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2 rounded-sm" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-mono text-foreground">{d.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Top stocks + News */}
      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-foreground">{t("home.topStocks")}</h2>
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t("home.scoreQ")}</span>
          </div>
          <div className="divide-y divide-border">
            {liveStocks.map((s) => (
              <Link key={s.ticker} to="/acao/$ticker" params={{ ticker: s.ticker }} className="grid grid-cols-12 items-center py-3 text-sm gap-2 hover:bg-accent/20 -mx-2 px-2 rounded transition">
                <div className="col-span-3 font-mono font-medium text-foreground">{s.ticker}</div>
                <div className="col-span-4 text-muted-foreground truncate">{s.name}</div>
                <div className="col-span-2 font-mono text-foreground">R$ {s.price.toFixed(2)}</div>
                <div className={`col-span-2 font-mono ${s.delta < 0 ? "text-destructive" : "text-[oklch(0.72_0.16_155)]"}`}>
                  {s.delta > 0 ? "+" : ""}{s.delta}%
                </div>
                <div className="col-span-1 flex justify-end">
                  <span
                    className="inline-grid place-items-center size-8 rounded-md text-[11px] font-medium"
                    style={{
                      background: `oklch(${0.25 + (s.score / 100) * 0.5} 0.04 ${s.score > 70 ? 155 : 22})`,
                      color: "oklch(0.96 0.005 220)",
                    }}
                  >
                    {s.score}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-foreground">{t("home.radar")}</h2>
            <a href="/noticias" className="text-xs text-primary hover:underline">{t("common.viewAll")}</a>
          </div>
          <ul className="space-y-4">
            {marketNews.map((n, i) => (
              <li key={i} className="group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded bg-accent/40 text-accent-foreground">{n.tag}</span>
                </div>
                <p className="text-sm text-foreground leading-snug group-hover:text-primary transition">{n.title}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{n.source} | {n.time}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Social proof */}
      <section className="rounded-2xl border border-border bg-card/40 px-6 py-8">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-5">{t("home.proof.eyebrow")}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="font-mono text-3xl text-foreground">+1.200</div>
            <div className="text-xs text-muted-foreground mt-1">{t("home.proof.usersLabel")}</div>
          </div>
          <div>
            <div className="font-mono text-3xl text-foreground">R$ 4,8 bi</div>
            <div className="text-xs text-muted-foreground mt-1">{t("home.proof.aumLabel")}</div>
          </div>
          <div>
            <div className="font-mono text-3xl text-foreground">12</div>
            <div className="text-xs text-muted-foreground mt-1">{t("home.proof.housesLabel")}</div>
          </div>
        </div>
      </section>

      {/* Sobre a Quantara */}
      <section
        className="relative overflow-hidden rounded-2xl border border-border p-8 lg:p-10"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
            {t("home.about.eyebrow")}
          </div>
          <h2 className="text-2xl lg:text-3xl font-medium text-foreground leading-tight">
            {t("home.about.title")}
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {t("home.about.body")}
          </p>
          <div className="mt-6">
            <a href="/advisor" className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:opacity-90 transition">
              {t("home.discoverProfile")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
