import { createServerFn } from "@tanstack/react-start";

const BRAPI_BASE = "https://brapi.dev/api";

async function brapi(path: string) {
  const token = process.env.BRAPI_TOKEN;
  if (!token) throw new Error("BRAPI_TOKEN não configurado");
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BRAPI_BASE}${path}${sep}token=${token}`);
  if (!res.ok) throw new Error(`brapi ${res.status}`);
  return res.json();
}

export const getLiveQuotes = createServerFn({ method: "GET" }).handler(async () => {
  const tickers = [
    "PETR4","VALE3","ITUB4","BBAS3","WEGE3","MGLU3","BBDC4","B3SA3",
    "RENT3","EQTL3","SUZB3","ELET3","PRIO3","RADL3","HAPV3","TAEE11",
  ];
  try {
    const [quotesRes, ibovRes, usdRes] = await Promise.all([
      brapi(`/quote/${tickers.join(",")}?range=1d&interval=15m&fundamental=false`),
      brapi(`/quote/%5EBVSP?range=1d&interval=15m&fundamental=false`).catch(() => ({ results: [] })),
      brapi(`/v2/currency?currency=USD-BRL`),
    ]);

    const results = (quotesRes.results ?? []) as any[];
    const ibov = (ibovRes.results ?? [])[0];
    const stocks = results.map((r) => ({
        ticker: r.symbol,
        name: r.longName ?? r.shortName ?? r.symbol,
        price: Number(r.regularMarketPrice ?? 0),
        delta: Number(r.regularMarketChangePercent ?? 0),
      }));

    const ibovSeries =
      (ibov?.historicalDataPrice ?? []).map((h: any) => ({
        t: new Date(h.date * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        v: Math.round(h.close),
      })) ?? [];

    const usd = (usdRes.currency ?? [])[0];

    return {
      ok: true as const,
      updatedAt: new Date().toISOString(),
      ibov: ibov
        ? {
            value: Number(ibov.regularMarketPrice ?? 0),
            delta: Number(ibov.regularMarketChangePercent ?? 0),
          }
        : null,
      usd: usd
        ? {
            value: Number(usd.bidPrice ?? 0),
            delta: Number(usd.percentageChange ?? 0),
          }
        : null,
      stocks,
      ibovSeries,
    };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
});