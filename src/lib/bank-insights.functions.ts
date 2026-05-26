import { createServerFn } from "@tanstack/react-start";
import Firecrawl from "@mendable/firecrawl-js";
import { z } from "zod";

export type BankInsight = {
  title: string;
  url: string;
  source: string;
  description?: string;
  publishedAt?: string;
};

const BANK_QUERIES: Record<string, string> = {
  "equity-xp": "XP Investimentos carteira recomendada ações Brasil research",
  "equity-btg": "BTG Pactual top picks ações Brasil research recomendada",
  "dividendos-inter": "Inter Invest carteira dividendos recomendada",
  "dividendos-bb-private": "BB Investimentos BB Private dividendos carteira recomendada",
  "multimercado-itau": "Itaú Private Bank multimercado fundos recomendados research",
  "multimercado-btg": "BTG Pactual multimercado fundos recomendados research",
  "previdencia-safra": "Safra Private previdência VGBL PGBL recomendação",
  "previdencia-bradesco-private": "Bradesco Private Bank previdência VGBL PGBL recomendação",
  "offshore-julius-baer": "Julius Baer wealth research offshore Brasil recomendação",
  "offshore-jpmorgan": "J.P. Morgan Private Bank Brasil offshore recomendação research",
  "global-ubs": "UBS Brasil wealth alocação global recomendação research",
  "global-santander": "Santander Private alocação global recomendação carteira",
  "global-goldman": "Goldman Sachs Private Wealth Management global allocation outlook",
  "long-biased-hg": "Credit Suisse Hedging-Griffo long biased recomendação fundo",
  "long-biased-btg": "BTG Pactual long biased fundos recomendados",
  "esg-bnp": "BNP Paribas Wealth ESG Europa research recomendação",
  "esg-julius-baer": "Julius Baer ESG sustainable Europa recomendação",
  "alt-blackstone": "Blackstone BREIT BCRED private credit real estate insights outlook",
  "alt-kkr": "KKR private equity infrastructure direct lending outlook insights",
};

function hostToSource(url: string): string {
  try {
    const h = new URL(url).hostname.replace(/^www\./, "");
    return h.split(".")[0].replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return "Fonte";
  }
}

const cleanText = (v?: string) => v?.replace(/[—–]/g, ",").trim();

export const getBankInsights = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string().min(1).max(64) }).parse)
  .handler(async ({ data }): Promise<{ items: BankInsight[]; error: string | null; fetchedAt: string }> => {
    const q = BANK_QUERIES[data.slug];
    const fcKey = process.env.FIRECRAWL_API_KEY;
    if (!q) return { items: [], error: "Casa não monitorada", fetchedAt: new Date().toISOString() };
    if (!fcKey) return { items: [], error: "Fonte de dados não configurada", fetchedAt: new Date().toISOString() };

    try {
      const fc = new Firecrawl({ apiKey: fcKey });
      const r = await fc.search(q, { limit: 8, location: "br", tbs: "qdr:w" });
      const list = ((r as { web?: { results?: unknown[] } }).web?.results ??
        (r as { results?: unknown[] }).results ??
        (r as { data?: unknown[] }).data ??
        []) as Array<{ url?: string; title?: string; description?: string; publishedDate?: string }>;
      const items: BankInsight[] = [];
      for (const it of list) {
        if (!it?.url || !it?.title) continue;
        items.push({
          title: cleanText(it.title) ?? it.title,
          url: it.url,
          source: hostToSource(it.url),
          description: cleanText(it.description),
          publishedAt: it.publishedDate,
        });
      }
      items.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
      return { items: items.slice(0, 6), error: null, fetchedAt: new Date().toISOString() };
    } catch (e) {
      console.error("getBankInsights error", e);
      return { items: [], error: e instanceof Error ? e.message : "Falha ao buscar insights", fetchedAt: new Date().toISOString() };
    }
  });
