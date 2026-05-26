import { createFileRoute } from "@tanstack/react-router";
import { useState, useDeferredValue, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLiveNews } from "@/lib/news.functions";
import { news as fallbackNews } from "@/lib/market-data";
import { Loader2, RefreshCw } from "lucide-react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/noticias")({
  component: Noticias,
  head: () => ({
    meta: [
      { title: "Atualidades · Quantara" },
      { name: "description", content: "Acompanhe o contexto macroeconômico e os movimentos do mercado que impactam patrimônios relevantes. Inteligência de mercado consolidada pela Quantara." },
      { property: "og:title", content: "Atualidades · Quantara" },
      { property: "og:description", content: "Acompanhe o contexto macroeconômico e os movimentos do mercado que impactam patrimônios relevantes." },
      { property: "og:url", content: "/noticias" },
    ],
    links: [{ rel: "canonical", href: "/noticias" }],
  }),
});

const TAB_KEYS = [
  { id: "Tudo", k: "news.tabs.all" },
  { id: "Brasil", k: "news.tabs.brazil" },
  { id: "Economia", k: "news.tabs.economy" },
  { id: "Mercado", k: "news.tabs.market" },
  { id: "Câmbio", k: "news.tabs.fx" },
  { id: "Mundo", k: "news.tabs.world" },
] as const;

function Noticias() {
  const t = useT();
  const [tab, setTab] = useState("Tudo");
  const deferredTab = useDeferredValue(tab);
  const fetchNews = useServerFn(getLiveNews);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["live-news"],
    queryFn: () => fetchNews(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const items = useMemo(
    () =>
      data?.items?.length
        ? data.items
        : fallbackNews.map((n) => ({ tag: n.tag, title: n.title, source: n.source, url: "#", description: undefined as string | undefined, publishedAt: undefined as string | undefined })),
    [data?.items]
  );
  const filtered = useMemo(
    () => (deferredTab === "Tudo" ? items : items.filter((n) => n.tag === deferredTab)),
    [items, deferredTab]
  );
  const updated = data?.fetchedAt ? new Date(data.fetchedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : null;

  // Virtualização incremental: 2 colunas por linha em md+, 1 em mobile
  const isWide = typeof window !== "undefined" && window.matchMedia?.("(min-width: 768px)").matches;
  const cols = isWide ? 2 : 1;
  const rows = useMemo(() => {
    const out: typeof filtered[] = [];
    for (let i = 0; i < filtered.length; i += cols) out.push(filtered.slice(i, i + cols));
    return out;
  }, [filtered, cols]);

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 220,
    overscan: 4,
  });

  return (
    <div className="space-y-8">
      <header className="max-w-3xl flex items-start justify-between gap-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">{t("news.eyebrow")}</div>
          <h1 className="text-4xl font-medium text-foreground leading-tight">
            {t("news.titleA")} <span className="italic text-primary">{t("news.titleB")}</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {updated ? `${t("news.updatedAt")} ${updated} · ${t("news.live")}` : t("news.searching")}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="shrink-0 size-9 grid place-items-center rounded-md border border-border bg-card hover:bg-accent/40 transition disabled:opacity-50"
          aria-label={t("news.refresh")}
        >
          {isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
        </button>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {TAB_KEYS.map((x) => (
          <button
            key={x.id}
            onClick={() => setTab(x.id)}
            className={`px-3.5 py-1.5 rounded-md text-sm transition ${
              tab === x.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
            }`}
          >
            {t(x.k as never)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {t("news.loading")}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("news.empty")} “{tab}”.</p>
      ) : (
        <div
          ref={parentRef}
          className="overflow-auto"
          style={{ height: "min(75vh, 900px)", contain: "strict" }}
        >
          <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
            {virtualizer.getVirtualItems().map((vRow) => {
              const row = rows[vRow.index];
              return (
                <div
                  key={vRow.key}
                  data-index={vRow.index}
                  ref={virtualizer.measureElement}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${vRow.start}px)` }}
                >
                  <div className="grid md:grid-cols-2 gap-5 pb-5">
                    {row.map((n, i) => {
                      const validUrl = n.url && n.url !== "#" && /^https?:\/\//i.test(n.url);
                      const href = validUrl
                        ? n.url
                        : `https://www.google.com/search?q=${encodeURIComponent(`${n.title} ${n.source}`)}`;
                      return (
                      <a
                        key={`${n.url}-${i}`}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-2xl border border-border bg-card/60 p-6 hover:border-primary/40 transition"
                        style={{ contentVisibility: "auto" }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded bg-accent/40 text-accent-foreground">{n.tag}</span>
                          <span className="text-[11px] text-muted-foreground">{n.source}</span>
                        </div>
                        <h2 className="text-lg text-foreground leading-snug">{n.title}</h2>
                        {n.description && (
                          <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{n.description}</p>
                        )}
                        <div className="mt-4 flex items-center justify-end">
                          <span className="text-xs text-primary">
                            {validUrl ? t("news.readSource") : "Buscar no Google"}
                          </span>
                        </div>
                      </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}