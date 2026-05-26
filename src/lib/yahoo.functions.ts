import { createServerFn } from "@tanstack/react-start";

// Yahoo Finance public chart endpoint. No auth required.
const YH = "https://query1.finance.yahoo.com/v8/finance/chart";

type ChartResp = {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: { quote?: Array<{ close?: (number | null)[] }> };
      meta?: { regularMarketPrice?: number; chartPreviousClose?: number };
    }>;
  };
};

async function fetchSeries(symbol: string, range = "1y", interval = "1mo") {
  const url = `${YH}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 Quantara" } });
  if (!res.ok) throw new Error(`yahoo ${symbol} ${res.status}`);
  const json = (await res.json()) as ChartResp;
  const r = json.chart?.result?.[0];
  const ts = r?.timestamp ?? [];
  const close = r?.indicators?.quote?.[0]?.close ?? [];
  const series = ts
    .map((t, i) => ({ t, v: close[i] }))
    .filter((p): p is { t: number; v: number } => typeof p.v === "number" && Number.isFinite(p.v))
    .map((p) => ({
      t: new Date(p.t * 1000).toLocaleDateString("en-US", { month: "short" }),
      v: Math.round(p.v),
    }));
  const last = r?.meta?.regularMarketPrice ?? series.at(-1)?.v ?? 0;
  const first = series[0]?.v ?? last;
  const pct = first ? Number((((last - first) / first) * 100).toFixed(2)) : 0;
  return { series, last, pct };
}

export type LiveYahoo = {
  ok: boolean;
  fetchedAt: string;
  error?: string;
  sp500: { series: { t: string; v: number }[]; last: number; pct: number } | null;
};

export const getYahooSnapshot = createServerFn({ method: "GET" }).handler(async (): Promise<LiveYahoo> => {
  try {
    const sp500 = await fetchSeries("%5EGSPC", "1y", "1mo");
    return { ok: true, fetchedAt: new Date().toISOString(), sp500 };
  } catch (e) {
    return { ok: false, fetchedAt: new Date().toISOString(), sp500: null, error: e instanceof Error ? e.message : "Yahoo failed" };
  }
});