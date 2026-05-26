import { createServerFn } from "@tanstack/react-start";

const BASE = "https://api.massive.com";

async function mv(path: string) {
  const token = process.env.MASSIVE_API_KEY;
  if (!token) throw new Error("MASSIVE_API_KEY não configurado");
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE}${path}${sep}apiKey=${token}`);
  if (!res.ok) throw new Error(`massive ${res.status}`);
  return res.json();
}

export const getUsSnapshot = createServerFn({ method: "GET" }).handler(async () => {
  const tickers = [
    "AAPL","MSFT","NVDA","GOOGL","AMZN","META","TSLA","BRK.B",
    "JPM","V","UNH","XOM",
  ];
  const indices = ["I:SPX", "I:NDX", "I:DJI"];

  try {
    const [stocksRes, idxRes] = await Promise.all([
      mv(`/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${tickers.join(",")}`),
      mv(`/v3/snapshot/indices?ticker.any_of=${indices.join(",")}`),
    ]);

    const stocks = (stocksRes.tickers ?? []).map((t: any) => ({
      ticker: t.ticker,
      price: Number(t.day?.c ?? t.lastTrade?.p ?? t.prevDay?.c ?? 0),
      delta: Number(t.todaysChangePerc ?? 0),
    }));

    const idxMap: Record<string, { value: number; delta: number }> = {};
    for (const r of idxRes.results ?? []) {
      const value = Number(r.value ?? r.session?.close ?? 0);
      const change = Number(r.session?.change_percent ?? 0);
      idxMap[r.ticker] = { value, delta: change };
    }

    return {
      ok: true as const,
      updatedAt: new Date().toISOString(),
      stocks,
      indices: {
        spx: idxMap["I:SPX"] ?? null,
        ndx: idxMap["I:NDX"] ?? null,
        dji: idxMap["I:DJI"] ?? null,
      },
    };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
});