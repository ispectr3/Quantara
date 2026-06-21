import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import { cryptoAssets, cryptoAllocation, btcSeries } from "@/lib/market-data";
import { Bitcoin, Wifi } from "lucide-react";
import { getLiveCrypto } from "@/lib/crypto.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/cripto")({
  component: Cripto,
  head: () => ({
    meta: [
      { title: "Cripto Ativos" },
      { name: "description", content: "Bitcoin, Ethereum e principais criptoativos em tempo real, com leitura institucional." },
      { property: "og:title", content: "Cripto Ativos" },
      { property: "og:description", content: "Mercado cripto com leitura private banking." },
      { property: "og:url", content: "/cripto" },
    ],
    links: [{ rel: "canonical", href: "/cripto" }],
  }),
});

function Cripto() {
  const t = useT();
  const fetchLive = useServerFn(getLiveCrypto);
  const { data: live } = useQuery({
    queryKey: ["coingecko-live"],
    queryFn: () => fetchLive(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const liveOk = !!live?.ok;
  const assets = liveOk && live!.assets.length
    ? live!.assets.map((a) => ({ ...a }))
    : cryptoAssets.map((a) => ({ ...a, mcap: 0 }));
  const series = liveOk && live!.btcSeries.length ? live!.btcSeries : btcSeries;
  const btcPrice = liveOk && live!.btc ? live!.btc.price : 71420;
  const btcDelta = liveOk && live!.btc ? live!.btc.delta24h : 2.18;
  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3 flex items-center gap-2"><Bitcoin className="size-3.5" /> {t("crypto.eyebrow")}</div>
        <h1 className="text-4xl font-medium text-foreground leading-tight">
          {t("crypto.titleA")} <span className="italic text-primary">{t("crypto.titleB")}</span>
        </h1>
        {liveOk && (
          <div className="mt-3 inline-flex items-center gap-2 text-[11px] text-primary/80">
            <Wifi className="size-3" /> CoinGecko · live · {new Date(live!.fetchedAt).toLocaleTimeString()}
          </div>
        )}
      </header>

      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl text-foreground">{t("crypto.btc12m")}</h2>
              <p className="text-xs text-muted-foreground">{t("crypto.btcSub")}</p>
            </div>
            <div className="font-mono text-2xl text-foreground">
              US$ {btcPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              <span className={`text-sm ml-2 ${btcDelta < 0 ? "text-destructive" : "text-[oklch(0.72_0.16_155)]"}`}>
                {btcDelta >= 0 ? "+" : ""}{btcDelta.toFixed(2)}% 24h
              </span>
            </div>
          </div>
          <div className="h-72" style={{ contentVisibility: "auto", containIntrinsicSize: "288px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="btc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.75 0.16 60)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.75 0.16 60)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" stroke="oklch(0.55 0.02 220)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.55 0.02 220)" fontSize={11} tickLine={false} axisLine={false} domain={["dataMin - 5000", "dataMax + 5000"]} />
                <Tooltip contentStyle={{ background: "oklch(0.22 0.02 230)", border: "1px solid oklch(0.32 0.02 230)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.75 0.16 60)" strokeWidth={2} fill="url(#btc)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="text-xl text-foreground">{t("crypto.allocTitle")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t("crypto.allocSub")}</p>
          <div className="h-48 mt-2" style={{ contentVisibility: "auto", containIntrinsicSize: "192px" }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={cryptoAllocation} dataKey="value" innerRadius={48} outerRadius={80} paddingAngle={2}>
                  {cryptoAllocation.map((d, i) => <Cell key={i} fill={d.color} stroke="transparent" />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-1.5 mt-2">
            {cryptoAllocation.map((d) => (
              <li key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2 rounded-sm" style={{ background: d.color }} />{d.name}
                </span>
                <span className="font-mono text-foreground">{d.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card/60 p-6">
        <h2 className="text-xl text-foreground mb-4">{t("crypto.topTitle")}</h2>
        <div className="divide-y divide-border">
          {assets.map((c) => (
            <div key={c.ticker} className="grid grid-cols-12 items-center py-3 text-sm">
              <div className="col-span-2 font-mono text-foreground">{c.ticker}</div>
              <div className="col-span-3 text-muted-foreground">{c.name}</div>
              <div className="col-span-3 font-mono text-foreground">US$ {c.price < 5 ? c.price.toFixed(4) : c.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
              <div className={`col-span-2 font-mono ${c.delta < 0 ? "text-destructive" : "text-[oklch(0.72_0.16_155)]"}`}>{c.delta > 0 ? "+" : ""}{c.delta}%</div>
              <div className="col-span-1 text-xs text-muted-foreground">{c.dominance}</div>
              <div className="col-span-1 text-right font-mono text-primary">{c.score}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
