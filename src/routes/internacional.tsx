import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { usStocks, usEtfs, sp500Series } from "@/lib/market-data";
import { Globe2, Wifi } from "lucide-react";
import { getUsSnapshot } from "@/lib/massive.functions";
import { getYahooSnapshot } from "@/lib/yahoo.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/internacional")({
  component: Mundo,
  head: () => ({
    meta: [
      { title: "Bolsa Americana" },
      { name: "description", content: "S&P 500, Wall Street e teses globais consolidadas das principais casas internacionais." },
      { property: "og:title", content: "Bolsa Americana" },
      { property: "og:description", content: "Mercado dos EUA com leitura institucional." },
      { property: "og:url", content: "/internacional" },
    ],
    links: [{ rel: "canonical", href: "/internacional" }],
  }),
});

function Mundo() {
  const t = useT();
  const fetchUs = useServerFn(getUsSnapshot);
  const { data: live } = useQuery({
    queryKey: ["massive-us"],
    queryFn: () => fetchUs(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const fetchYahoo = useServerFn(getYahooSnapshot);
  const { data: yahoo } = useQuery({
    queryKey: ["yahoo-snapshot"],
    queryFn: () => fetchYahoo(),
    refetchInterval: 5 * 60_000,
    staleTime: 2 * 60_000,
  });
  const spSeries = yahoo?.ok && yahoo.sp500?.series.length ? yahoo.sp500.series : sp500Series;
  const spLast = yahoo?.ok && yahoo.sp500 ? yahoo.sp500.last : 5892;
  const spPct = yahoo?.ok && yahoo.sp500 ? yahoo.sp500.pct : 23.2;

  const liveOk = live && live.ok;
  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const idx = liveOk
    ? [
        {
          name: "S&P 500",
          v: live.indices.spx ? fmt(live.indices.spx.value) : "5.892",
          d: live.indices.spx ? `${live.indices.spx.delta >= 0 ? "+" : ""}${live.indices.spx.delta.toFixed(2)}%` : "+0,38%",
          neg: live.indices.spx ? live.indices.spx.delta < 0 : false,
        },
        {
          name: "NASDAQ 100",
          v: live.indices.ndx ? fmt(live.indices.ndx.value) : "20.812",
          d: live.indices.ndx ? `${live.indices.ndx.delta >= 0 ? "+" : ""}${live.indices.ndx.delta.toFixed(2)}%` : "+0,84%",
          neg: live.indices.ndx ? live.indices.ndx.delta < 0 : false,
        },
        {
          name: "DOW JONES",
          v: live.indices.dji ? fmt(live.indices.dji.value) : "42.108",
          d: live.indices.dji ? `${live.indices.dji.delta >= 0 ? "+" : ""}${live.indices.dji.delta.toFixed(2)}%` : "-0,12%",
          neg: live.indices.dji ? live.indices.dji.delta < 0 : true,
        },
        { name: "US 10Y", v: "4,28%", d: "-0,04%", neg: true },
      ]
    : [
        { name: "S&P 500", v: "5.892", d: "+0,38%", neg: false },
        { name: "NASDAQ 100", v: "20.812", d: "+0,84%", neg: false },
        { name: "DOW JONES", v: "42.108", d: "-0,12%", neg: true },
        { name: "US 10Y", v: "4,28%", d: "-0,04%", neg: true },
      ];

  const liveStocks = liveOk && live.stocks.length
    ? usStocks.map((s) => {
        const m = live.stocks.find((x: { ticker: string; price: number; delta: number }) => x.ticker === s.ticker);
        return m && m.price > 0 ? { ...s, price: m.price, delta: Number(m.delta.toFixed(2)) } : s;
      })
    : usStocks;

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3 flex items-center gap-2"><Globe2 className="size-3.5" /> {t("us.eyebrow")}</div>
        <h1 className="text-4xl font-medium text-foreground leading-tight">
          {t("us.titleA")} <span className="italic text-primary">{t("us.titleB")}</span>
        </h1>
        <p className="mt-4 text-muted-foreground">{t("us.lead")}</p>
      </header>

      <section className="grid md:grid-cols-4 gap-3">
        {idx.map((i) => (
          <div key={i.name} className="rounded-xl border border-border bg-card/60 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{i.name}</div>
            <div className="mt-1 text-lg font-mono text-foreground">{i.v}</div>
            <div className={`text-xs mt-1 ${i.neg ? "text-destructive" : "text-[oklch(0.72_0.16_155)]"}`}>{i.d}</div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl text-foreground">{t("us.sp500_12m")}</h2>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-2">
              {t("us.sp500Sub")}
              {yahoo?.ok && <span className="inline-flex items-center gap-1 text-primary/80"><Wifi className="size-3" /> Yahoo Finance</span>}
            </p>
          </div>
          <div className="font-mono text-2xl text-foreground">
            {spLast.toLocaleString("en-US")}
            <span className={`text-sm ml-2 ${spPct < 0 ? "text-destructive" : "text-[oklch(0.72_0.16_155)]"}`}>
              {spPct >= 0 ? "+" : ""}{spPct.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="h-72" style={{ contentVisibility: "auto", containIntrinsicSize: "288px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spSeries}>
              <defs>
                <linearGradient id="sp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.02 220)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.78 0.02 220)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" stroke="oklch(0.55 0.02 220)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.55 0.02 220)" fontSize={11} tickLine={false} axisLine={false} domain={["dataMin - 100", "dataMax + 100"]} />
              <Tooltip contentStyle={{ background: "oklch(0.22 0.02 230)", border: "1px solid oklch(0.32 0.02 230)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="v" stroke="oklch(0.78 0.02 220)" strokeWidth={2} fill="url(#sp)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="text-xl text-foreground mb-4">{t("us.topStocks")}</h2>
          <div className="divide-y divide-border">
            {liveStocks.map((s) => (
              <div key={s.ticker} className="grid grid-cols-12 items-center py-2.5 text-sm">
                <div className="col-span-3 font-mono text-foreground">{s.ticker}</div>
                <div className="col-span-4 text-muted-foreground truncate">{s.name}</div>
                <div className="col-span-2 font-mono text-foreground">${s.price.toFixed(2)}</div>
                <div className={`col-span-2 font-mono ${s.delta < 0 ? "text-destructive" : "text-[oklch(0.72_0.16_155)]"}`}>{s.delta > 0 ? "+" : ""}{s.delta}%</div>
                <div className="col-span-1 text-right text-xs text-primary font-mono">{s.score}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="text-xl text-foreground mb-4">{t("us.recommendedEtfs")}</h2>
          <div className="space-y-3">
            {usEtfs.map((e) => (
              <div key={e.ticker} className="rounded-lg border border-border p-4 hover:border-primary/40 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-foreground">{e.ticker}</div>
                    <div className="text-xs text-muted-foreground">{e.name}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-muted-foreground">{t("us.aum")} <span className="text-foreground font-mono">{e.aum}</span></div>
                    <div className="text-muted-foreground">{t("us.yield")} <span className="text-primary font-mono">{e.yield}</span></div>
                    <div className="text-muted-foreground">{t("us.fee")} <span className="text-foreground font-mono">{e.expense}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
