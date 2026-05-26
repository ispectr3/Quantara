import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Brain, TrendingUp, ChevronDown } from "lucide-react";
import { useT, useI18n } from "@/lib/i18n";

type NavChild = { to: string; key: Parameters<ReturnType<typeof useT>>[0] };
type NavGroup = {
  id: string;
  labelKey: Parameters<ReturnType<typeof useT>>[0];
  to?: string;
  children?: NavChild[];
};

const groups: NavGroup[] = [
  {
    id: "market",
    labelKey: "nav.group.market",
    children: [
      { to: "/", key: "nav.market.overview" },
      { to: "/internacional", key: "nav.us" },
      { to: "/cripto", key: "nav.crypto" },
      { to: "/comparador", key: "nav.compare" },
    ],
  },
  {
    id: "portfolios",
    labelKey: "nav.group.portfolios",
    children: [
      { to: "/carteiras", key: "nav.portfolios.recommended" },
      { to: "/noticias", key: "nav.news" },
    ],
  },
  { id: "advisor", labelKey: "nav.advisor", to: "/advisor" },
  { id: "myWallet", labelKey: "nav.myWallet", to: "/meu-patrimonio" },
  {
    id: "wealth",
    labelKey: "nav.group.wealth",
    children: [
      { to: "/patrimonio", key: "nav.wealth.consolidated" },
      { to: "/seguros", key: "nav.wealth.protection" },
    ],
  },
  {
    id: "profile",
    labelKey: "nav.group.profile",
    children: [
      { to: "/perfil", key: "nav.profile" },
      { to: "/login", key: "nav.profile.account" },
    ],
  },
];

export function Sidebar({ mobile = false }: { mobile?: boolean } = {}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const t = useT();
  const { lang } = useI18n();
  // Renderizar somente no client — getMarketStatus depende de Date.now()
  // e causava hydration mismatch entre SSR e client.
  const [status, setStatus] = useState<ReturnType<typeof getMarketStatus> | null>(null);
  useEffect(() => {
    const tt = t as (k: string) => string;
    setStatus(getMarketStatus(tt));
    const id = setInterval(() => setStatus(getMarketStatus(tt)), 30000);
    return () => clearInterval(id);
  }, [lang]);

  const initiallyOpen = useMemo(() => {
    const open: Record<string, boolean> = {};
    for (const g of groups) {
      if (g.children) open[g.id] = true;
    }
    return open;
  }, [pathname]);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(initiallyOpen);
  useEffect(() => {
    setOpenMap((prev) => ({ ...initiallyOpen, ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <aside className={`${mobile ? "flex w-72 h-screen" : "hidden lg:flex w-72 sticky top-0 h-screen"} shrink-0 flex-col border-r border-border bg-sidebar/60 backdrop-blur-xl`}>
      <div className="px-6 py-7 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="size-9 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <TrendingUp className="size-5" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-semibold tracking-tight text-foreground">Quantara</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{t("brand.tagline")}</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
        {groups.map((g) => {
          if (!g.children) {
            const active = pathname === g.to;
            return (
              <Link
                key={g.id}
                to={g.to!}
                className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_0_var(--color-primary)]"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                {g.id === "advisor" && <Brain className="size-4 opacity-80" />}
                <span className="tracking-tight">{t(g.labelKey)}</span>
              </Link>
            );
          }
          const isOpen = openMap[g.id] ?? false;
          const hasActiveChild = g.children.some((c) => c.to === pathname);
          return (
            <div key={g.id} className="py-0.5">
              <button
                type="button"
                onClick={() => setOpenMap((m) => ({ ...m, [g.id]: !isOpen }))}
                aria-expanded={isOpen}
                className={`w-full flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm transition-all ${
                  hasActiveChild
                    ? "text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground"
                }`}
              >
                <span className="tracking-tight">{t(g.labelKey)}</span>
                <ChevronDown className={`size-3.5 opacity-70 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="mt-1 ml-3 pl-3 border-l border-sidebar-border/70 space-y-0.5">
                  {g.children.map((c) => {
                    const active = pathname === c.to;
                    return (
                      <Link
                        key={c.to}
                        to={c.to}
                        className={`block rounded-md px-3 py-2 text-[13px] transition-all ${
                          active
                            ? "text-sidebar-accent-foreground bg-sidebar-accent/70 shadow-[inset_2px_0_0_0_var(--color-primary)]"
                            : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/30"
                        }`}
                      >
                        {t(c.key)}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="m-3 rounded-lg border border-sidebar-border bg-card/40 p-4">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{t("market.status")}</div>
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${status?.open ? "bg-primary animate-pulse" : "bg-muted"}`} />
          <span className="text-sm text-foreground">{status?.label ?? "—"}</span>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground" suppressHydrationWarning>
          {status?.sub ?? "\u00a0"}
        </div>
      </div>
    </aside>
  );
}

function getMarketStatus(t: (k: string) => string) {
  const now = new Date();
  const brt = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const day = brt.getDay();
  const minutes = brt.getHours() * 60 + brt.getMinutes();
  const isWeekday = day >= 1 && day <= 5;
  const open = isWeekday && minutes >= 600 && minutes < 1020;
  const afterMarket = isWeekday && minutes >= 1020 && minutes < 1095;
  const hh = String(brt.getHours()).padStart(2, "0");
  const mm = String(brt.getMinutes()).padStart(2, "0");
  const sub = `${t("market.subHours")} ${hh}:${mm} BRT`;
  if (open) return { open: true, label: t("market.openNow"), sub };
  if (afterMarket) return { open: false, label: t("market.after"), sub };
  if (!isWeekday) return { open: false, label: t("market.closedToday"), sub: `${t("market.subWeekend")} ${hh}:${mm} BRT` };
  if (minutes < 600) return { open: false, label: t("market.opensAt"), sub };
  return { open: false, label: t("market.reopens"), sub };
}
