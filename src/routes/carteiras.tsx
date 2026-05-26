import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { bankPortfolios, rendaFixa, focusCategories, type BankCategory } from "@/lib/market-data";
import { Star, ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/carteiras")({
  component: Carteiras,
  head: () => ({
    meta: [
      { title: "Portfolios · Quantara" },
      { name: "description", content: "Carteiras recomendadas pelos maiores private banks: BTG, XP, J.P. Morgan, UBS, Julius Baer e mais." },
      { property: "og:title", content: "Portfolios · Quantara" },
      { property: "og:description", content: "Wealth architecture por tese de investimento." },
      { property: "og:url", content: "/carteiras" },
    ],
    links: [{ rel: "canonical", href: "/carteiras" }],
  }),
});

const FOREIGN_BANKS = new Set([
  "Julius Baer",
  "J.P. Morgan Private Bank",
  "UBS Brasil",
  "Goldman Sachs PWM",
  "Blackstone",
  "KKR",
  "BNP Paribas Wealth",
  "Credit Suisse Hedging-Griffo",
]);

function interleaveByOrigin<T extends { bank: string; score: number }>(items: T[]): T[] {
  const foreign = items.filter((i) => FOREIGN_BANKS.has(i.bank)).sort((a, b) => b.score - a.score);
  const local = items.filter((i) => !FOREIGN_BANKS.has(i.bank)).sort((a, b) => b.score - a.score);
  const out: T[] = [];
  const max = Math.max(foreign.length, local.length);
  for (let i = 0; i < max; i++) {
    if (foreign[i]) out.push(foreign[i]);
    if (local[i]) out.push(local[i]);
  }
  return out;
}

function Carteiras() {
  const t = useT();
  const ALL = "__all__" as const;
  const categories: (typeof ALL | BankCategory)[] = [ALL, ...focusCategories];
  const [filter, setFilter] = useState<(typeof categories)[number]>(ALL);
  const visible = bankPortfolios.filter((p) => filter === ALL || p.category === filter);
  const ordered = interleaveByOrigin(visible);

  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">{t("portfolios.eyebrow")}</div>
        <h1 className="text-4xl font-medium text-foreground leading-tight">
          {t("portfolios.titleA")} <span className="italic text-primary">{t("portfolios.titleB")}</span>
        </h1>
        <p className="mt-4 text-muted-foreground">{t("portfolios.lead")}</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const active = filter === c;
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-1.5 rounded-full text-sm border transition ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              {c === ALL ? t("portfolios.all") : c}
            </button>
          );
        })}
      </div>

      <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {ordered.map((p) => (
            <Link
              key={p.slug}
              to="/carteiras/$slug"
              params={{ slug: p.slug }}
              className="group rounded-2xl border border-border bg-card/60 p-6 hover:border-primary/40 hover:bg-card/80 transition block"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{p.focus}</div>
                  <h3 className="text-xl text-foreground mt-1">{p.bank}</h3>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <Star className="size-4 fill-current" />
                  <span className="font-mono">{p.score}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{p.note}</p>
              <ul className="space-y-1.5">
                {p.picks.map((x) => (
                  <li key={x} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="size-1.5 rounded-full bg-primary" />{x}
                  </li>
                ))}
              </ul>
              <div className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition pointer-events-none">
                {t("common.viewPortfolio")} <ArrowRight className="size-3.5" />
              </div>
            </Link>
          ))}
      </section>

      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-2xl text-foreground">{t("portfolios.fixedIncome")}</h2>
            <p className="text-sm text-muted-foreground">{t("portfolios.fixedIncomeSub")}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground border-b border-border">
                <th className="px-5 py-3">{t("portfolios.thIssuer")}</th>
                <th className="px-5 py-3">{t("portfolios.thIndex")}</th>
                <th className="px-5 py-3">{t("portfolios.thTerm")}</th>
                <th className="px-5 py-3">{t("portfolios.thLiquidity")}</th>
                <th className="px-5 py-3">{t("portfolios.thMin")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rendaFixa.map((r) => (
                <tr key={r.emissor} className="hover:bg-accent/20 transition">
                  <td className="px-5 py-3 text-foreground">{r.emissor}</td>
                  <td className="px-5 py-3 font-mono text-primary">{r.indexador}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.prazo}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.liquidez}</td>
                  <td className="px-5 py-3 font-mono text-foreground">{r.aporte}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}