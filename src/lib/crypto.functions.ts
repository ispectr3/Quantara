import { createServerFn } from "@tanstack/react-start";

// CoinGecko public API. No key required; rate-limited but fine for our refresh cadence.
const CG = "https://api.coingecko.com/api/v3";

const TOP: { id: string; ticker: string; name: string; score: number }[] = [
  { id: "bitcoin",     ticker: "BTC",  name: "Bitcoin",   score: 94 },
  { id: "ethereum",    ticker: "ETH",  name: "Ethereum",  score: 90 },
  { id: "solana",      ticker: "SOL",  name: "Solana",    score: 87 },
  { id: "binancecoin", ticker: "BNB",  name: "BNB",       score: 81 },
  { id: "ripple",      ticker: "XRP",  name: "Ripple",    score: 68 },
  { id: "cardano",     ticker: "ADA",  name: "Cardano",   score: 65 },
  { id: "avalanche-2", ticker: "AVAX", name: "Avalanche", score: 78 },
  { id: "chainlink",   ticker: "LINK", name: "Chainlink", score: 82 },
];

export type LiveCrypto = {
  ok: boolean;
  fetchedAt: string;
  error?: string;
  btc: { price: number; delta24h: number; mcap: number } | null;
  totalMcap: number | null;
  assets: { ticker: string; name: string; price: number; delta: number; dominance: string; score: number; mcap: number }[];
  btcSeries: { t: string; v: number }[];
};

export const getLiveCrypto = createServerFn({ method: "GET" }).handler(async (): Promise<LiveCrypto> => {
  const empty: LiveCrypto = {
    ok: false,
    fetchedAt: new Date().toISOString(),
    btc: null,
    totalMcap: null,
    assets: [],
    btcSeries: [],
  };
  try {
    const ids = TOP.map((t) => t.id).join(",");
    const [marketsRes, btcChartRes, globalRes] = await Promise.all([
      fetch(`${CG}/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=24h`),
      fetch(`${CG}/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily`),
      fetch(`${CG}/global`),
    ]);
    if (!marketsRes.ok) return { ...empty, error: `coingecko markets ${marketsRes.status}` };
    const markets = (await marketsRes.json()) as Array<{
      id: string; symbol: string; current_price: number; price_change_percentage_24h: number; market_cap: number;
    }>;
    const byId = new Map(markets.map((m) => [m.id, m] as const));
    const totalMcap = markets.reduce((a, m) => a + (m.market_cap || 0), 0);

    const assets = TOP.map((t) => {
      const m = byId.get(t.id);
      const price = m?.current_price ?? 0;
      const delta = Number((m?.price_change_percentage_24h ?? 0).toFixed(2));
      const mcap = m?.market_cap ?? 0;
      return {
        ticker: t.ticker,
        name: t.name,
        price,
        delta,
        score: t.score,
        mcap,
        dominance: totalMcap > 0 ? `${((mcap / totalMcap) * 100).toFixed(1)}%` : "—",
      };
    });

    const btcM = byId.get("bitcoin");
    const btc = btcM ? { price: btcM.current_price, delta24h: Number(btcM.price_change_percentage_24h.toFixed(2)), mcap: btcM.market_cap } : null;

    let btcSeries: { t: string; v: number }[] = [];
    if (btcChartRes.ok) {
      const chart = (await btcChartRes.json()) as { prices?: [number, number][] };
      const prices = chart.prices ?? [];
      // Sample ~26 points (every ~2 weeks) for a clean monthly-looking series
      const step = Math.max(1, Math.floor(prices.length / 26));
      btcSeries = prices.filter((_, i) => i % step === 0).map(([ts, v]) => ({
        t: new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        v: Math.round(v),
      }));
    }

    // Optional global figure
    let totalMcapUSD = totalMcap;
    if (globalRes.ok) {
      const g = (await globalRes.json()) as { data?: { total_market_cap?: { usd?: number } } };
      if (g.data?.total_market_cap?.usd) totalMcapUSD = g.data.total_market_cap.usd;
    }

    return { ok: true, fetchedAt: new Date().toISOString(), btc, totalMcap: totalMcapUSD, assets, btcSeries };
  } catch (e) {
    return { ...empty, error: e instanceof Error ? e.message : "CoinGecko failed" };
  }
});