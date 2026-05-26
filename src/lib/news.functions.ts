import { createServerFn } from "@tanstack/react-start";
import Firecrawl from "@mendable/firecrawl-js";

export type LiveNews = {
  tag: string;
  title: string;
  source: string;
  url: string;
  description?: string;
  publishedAt?: string;
};

const QUERIES: { tag: string; q: string }[] = [
  { tag: "Brasil", q: "economia Brasil Congresso agenda fiscal" },
  { tag: "Economia", q: "Copom Selic inflação IPCA Brasil" },
  { tag: "Mercado", q: "Ibovespa B3 ações bolsa Brasil hoje" },
  { tag: "Câmbio", q: "dólar real câmbio Brasil hoje" },
  { tag: "Mundo", q: "Fed mercado americano Wall Street hoje" },
];

function cleanText(value?: string): string | undefined {
  return value?.replace(/[—–]/g, ",").replace(/\s+-\s+/g, ", ").trim();
}

function hostToSource(url: string): string {
  try {
    const h = new URL(url).hostname.replace(/^www\./, "");
    return h.split(".")[0].replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return "Fonte";
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function pick(xml: string, tag: string): string | undefined {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`));
  if (!m) return undefined;
  return decodeEntities(m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim());
}

async function fetchFromGoogleNews(): Promise<LiveNews[]> {
  const all: LiveNews[] = [];
  const results = await Promise.all(
    QUERIES.map(async ({ tag, q }) => {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; QuantaraBot/1.0; +https://quantarainvest.lovable.app)",
          Accept: "application/rss+xml,application/xml,text/xml",
        },
      });
      if (!res.ok) return { tag, items: [] as LiveNews[] };
      const xml = await res.text();
      const items: LiveNews[] = [];
      const itemRe = /<item>([\s\S]*?)<\/item>/g;
      let m: RegExpExecArray | null;
      while ((m = itemRe.exec(xml)) && items.length < 6) {
        const block = m[1];
        const rawTitle = pick(block, "title") ?? "";
        const link = pick(block, "link") ?? "";
        const pubDate = pick(block, "pubDate");
        const sourceTag = pick(block, "source");
        if (!rawTitle || !link) continue;
        // Google appends " - Source" to titles; strip it
        const dash = rawTitle.lastIndexOf(" - ");
        const title = dash > 0 ? rawTitle.slice(0, dash).trim() : rawTitle;
        const source = sourceTag || (dash > 0 ? rawTitle.slice(dash + 3).trim() : hostToSource(link));
        items.push({
          tag,
          title: cleanText(title) ?? title,
          url: link,
          source,
          publishedAt: pubDate ? new Date(pubDate).toISOString() : undefined,
        });
      }
      return { tag, items };
    })
  );
  for (const { items } of results) all.push(...items);
  return all;
}

async function fetchFromNewsAPI(apiKey: string): Promise<LiveNews[]> {
  const all: LiveNews[] = [];
  const results = await Promise.all(
    QUERIES.map(async ({ tag, q }) => {
      const url = new URL("https://newsapi.org/v2/everything");
      url.searchParams.set("q", q);
      url.searchParams.set("language", "pt");
      url.searchParams.set("sortBy", "publishedAt");
      url.searchParams.set("pageSize", "6");
      const res = await fetch(url.toString(), {
        headers: {
          "X-Api-Key": apiKey,
          "User-Agent": "QuantaraInvest/1.0 (+https://quantarainvest.lovable.app)",
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`NewsAPI ${res.status}: ${body.slice(0, 200)}`);
      }
      const json = (await res.json()) as {
        articles?: Array<{ title?: string; url?: string; description?: string; publishedAt?: string; source?: { name?: string } }>;
      };
      return { tag, articles: json.articles ?? [] };
    })
  );
  for (const { tag, articles } of results) {
    for (const a of articles) {
      if (!a.url || !a.title || a.title === "[Removed]") continue;
      all.push({
        tag,
        title: cleanText(a.title) ?? a.title,
        url: a.url,
        source: a.source?.name || hostToSource(a.url),
        description: cleanText(a.description),
        publishedAt: a.publishedAt,
      });
    }
  }
  return all;
}

async function fetchFromFirecrawl(apiKey: string): Promise<LiveNews[]> {
  const fc = new Firecrawl({ apiKey });
  const all: LiveNews[] = [];
  const results = await Promise.all(
    QUERIES.map((q) =>
      fc
        .search(q.q, { limit: 5, location: "br", tbs: "qdr:d" })
        .then((r) => ({ tag: q.tag, r }))
        .catch(() => ({ tag: q.tag, r: null as unknown }))
    )
  );
  for (const { tag, r } of results) {
    const list = ((r as { web?: { results?: unknown[] } } | null)?.web?.results ??
      (r as { results?: unknown[] } | null)?.results ??
      (r as { data?: unknown[] } | null)?.data ??
      []) as Array<{ url?: string; title?: string; description?: string; publishedDate?: string }>;
    for (const it of list) {
      if (!it?.url || !it?.title) continue;
      all.push({
        tag,
        title: cleanText(it.title) ?? it.title,
        url: it.url,
        source: hostToSource(it.url),
        description: cleanText(it.description),
        publishedAt: it.publishedDate,
      });
    }
  }
  return all;
}

export const getLiveNews = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ items: LiveNews[]; error: string | null; fetchedAt: string; source: string }> => {
    const newsKey = process.env.NEWSAPI_KEY;
    const fcKey = process.env.FIRECRAWL_API_KEY;
    let items: LiveNews[] = [];
    let source = "none";
    let error: string | null = null;

    // Primary: Google News RSS (no key, works from Workers/edge)
    try {
      items = await fetchFromGoogleNews();
      if (items.length > 0) source = "google-news";
    } catch (e) {
      console.error("Google News error", e);
      error = e instanceof Error ? e.message : "Google News falhou";
    }

    if (items.length === 0 && newsKey) {
      try {
        items = await fetchFromNewsAPI(newsKey);
        if (items.length > 0) {
          source = "newsapi";
          error = null;
        }
      } catch (e) {
        console.error("NewsAPI error", e);
        error = e instanceof Error ? e.message : "NewsAPI falhou";
      }
    }
    if (items.length === 0 && fcKey) {
      try {
        items = await fetchFromFirecrawl(fcKey);
        if (items.length > 0) {
          source = "firecrawl";
          error = null;
        }
      } catch (e) {
        console.error("Firecrawl error", e);
        error = e instanceof Error ? e.message : "Firecrawl falhou";
      }
    }
    const seen = new Set<string>();
    const unique = items.filter((n) => (seen.has(n.url) ? false : (seen.add(n.url), true)));
    unique.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
    return { items: unique, error, fetchedAt: new Date().toISOString(), source };
  }
);