import { Bell, TrendingUp, TrendingDown, Newspaper, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { news, topStocks } from "@/lib/market-data";
import { getLiveNews, type LiveNews } from "@/lib/news.functions";

type Notif = {
  id: string;
  kind: "news" | "alert";
  tag: string;
  title: string;
  meta: string;
  hot?: boolean;
  neg?: boolean;
  to: string;
  ticker?: string;
};

function buildNotifs(liveItems: LiveNews[] = []): Notif[] {
  const sourceNews = liveItems.length
    ? liveItems.slice(0, 6).map((n) => ({ tag: n.tag, title: n.title, source: n.source, time: n.publishedAt ? new Date(n.publishedAt).toLocaleDateString("pt-BR") : "Atualizado hoje", hot: false }))
    : news;
  const newsItems: Notif[] = sourceNews.map((n, i) => ({
    id: `n-${i}-${n.title.slice(0, 20)}`,
    kind: "news",
    tag: n.tag,
    title: n.title,
    meta: `${n.source} | ${n.time}`,
    hot: n.hot,
    to: "/noticias",
  }));
  const alertItems: Notif[] = topStocks
    .filter((s) => Math.abs(s.delta) >= 2)
    .slice(0, 4)
    .map((s) => ({
      id: `a-${s.ticker}`,
      kind: "alert",
      tag: "Mercado",
      title: `${s.ticker} ${s.delta > 0 ? "subiu" : "recuou"} ${Math.abs(s.delta).toFixed(2)}% hoje na B3`,
      meta: `${s.name} | R$ ${s.price.toFixed(2)} | movimento do mercado`,
      neg: s.delta < 0,
      to: "/noticias",
      ticker: s.ticker,
    }));
  return [...alertItems, ...newsItems];
}

const SEEN_KEY = "quantara_notif_seen";
const readSeen = (): string[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"); } catch { return []; }
};
const writeSeen = (ids: string[]) => {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(ids)); } catch { /* noop */ }
};

export function NotificationsBell() {
  const fetchNews = useServerFn(getLiveNews);
  const [open, setOpen] = useState(false);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const { data: liveNews } = useQuery({
    queryKey: ["live-news"],
    queryFn: () => fetchNews(),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchInterval: 5 * 60_000,
  });
  useEffect(() => { setSeenIds(readSeen()); }, []);
  const seen = useMemo(() => new Set(seenIds), [seenIds]);
  const notifs = useMemo(() => buildNotifs(liveNews?.items ?? []), [liveNews?.items]);
  const unread = notifs.filter((n) => !seen.has(n.id)).length;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const markAllRead = () => {
    const all = notifs.map((n) => n.id);
    setSeenIds(all);
    writeSeen(all);
  };
  const markOneRead = (id: string) => {
    setSeenIds((cur) => {
      if (cur.includes(id)) return cur;
      const next = [...cur, id];
      writeSeen(next);
      return next;
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative size-9 grid place-items-center rounded-md border border-border bg-card hover:bg-accent/40 transition"
        aria-label="Notificações"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-mono grid place-items-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[380px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card shadow-2xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <div className="text-sm font-medium text-foreground">Notificações</div>
              <div className="text-[11px] text-muted-foreground">{unread} não lidas</div>
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-[11px] text-primary hover:underline">
                  Marcar todas
                </button>
              )}
              <button onClick={() => setOpen(false)} className="size-7 grid place-items-center rounded hover:bg-accent/40">
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          <ul className="max-h-[60vh] overflow-y-auto divide-y divide-border">
            {notifs.map((n) => {
              const isUnread = !seen.has(n.id);
              const Icon = n.kind === "alert" ? (n.neg ? TrendingDown : TrendingUp) : Newspaper;
              return (
                <li key={n.id} className={`hover:bg-accent/20 transition ${isUnread ? "bg-primary/[0.04]" : ""}`}>
                  <Link
                    to={n.to}
                    onClick={() => { markOneRead(n.id); setOpen(false); }}
                    className="flex gap-3 px-4 py-3 cursor-pointer"
                  >
                    <div
                      className={`size-8 shrink-0 grid place-items-center rounded-md ${
                        n.kind === "alert"
                          ? n.neg
                            ? "bg-destructive/15 text-destructive"
                            : "bg-[oklch(0.72_0.16_155)]/15 text-[oklch(0.72_0.16_155)]"
                          : "bg-accent/40 text-accent-foreground"
                      }`}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{n.tag}</span>
                        {n.hot && <span className="text-[10px] uppercase tracking-[0.18em] text-destructive">Destaque</span>}
                        {isUnread && <span className="size-1.5 rounded-full bg-primary" />}
                      </div>
                      <p className="text-sm text-foreground leading-snug">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{n.meta}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="px-4 py-3 border-t border-border">
            <Link to="/noticias" onClick={() => setOpen(false)} className="text-xs text-primary hover:underline">
              Ver todas as notícias
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}