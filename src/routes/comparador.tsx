import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { bankPortfolios } from "@/lib/market-data";
import { useT } from "@/lib/i18n";
import { X, Plus, GitCompare } from "lucide-react";

export const Route = createFileRoute("/comparador")({
  component: Comparador,
  head: () => ({
    meta: [
      { title: "Comparador de Carteiras" },
      { name: "description", content: "Compare carteiras de bancos privados lado a lado: score, ticket mínimo, horizonte e alocação." },
      { property: "og:title", content: "Comparador de Carteiras" },
      { property: "og:description", content: "Carteiras das principais casas lado a lado." },
      { property: "og:url", content: "/comparador" },
    ],
    links: [{ rel: "canonical", href: "/comparador" }],
  }),
});

const MAX = 3;

function Comparador() {
  const t = useT();
  const [selected, setSelected] = useState<string[]>(["equity-xp"]);
  const items = selected.map((s) => bankPortfolios.find((p) => p.slug === s)).filter(Boolean) as typeof bankPortfolios;
  const available = bankPortfolios.filter((p) => !selected.includes(p.slug));

  const add = (slug: string) => {
    if (selected.length >= MAX) return;
    setSelected([...selected, slug]);
  };
  const remove = (slug: string) => setSelected(selected.filter((s) => s !== slug));

  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">{t("compare.eyebrow")}</div>
        <h1 className="text-4xl font-medium text-foreground leading-tight">
          {t("compare.titleA")} <span className="italic text-primary">{t("compare.titleB")}</span>
        </h1>
        <p className="mt-4 text-muted-foreground">{t("compare.lead")}</p>
      </header>

      {/* Slots */}
      <section className="grid md:grid-cols-3 gap-4">
        {Array.from({ length: MAX }).map((_, i) => {
          const p = items[i];
          if (p) {
            return (
              <div key={p.slug} className="rounded-2xl border border-primary/30 bg-card/60 p-5 relative">
                <button onClick={() => remove(p.slug)} className="absolute top-3 right-3 size-7 grid place-items-center rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive">
                  <X className="size-3.5" />
                </button>
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{p.focus}</div>
                <h3 className="text-lg text-foreground mt-1">{p.bank}</h3>
                <div className="mt-3 font-mono text-primary text-2xl">{p.score}</div>
              </div>
            );
          }
          return (
            <div key={i} className="rounded-2xl border border-dashed border-border bg-card/30 p-5 min-h-[140px] flex items-center justify-center text-muted-foreground text-sm">
              <Plus className="size-4 mr-2" /> {t("common.compare")}
            </div>
          );
        })}
      </section>

      {/* Add picker */}
      {selected.length < MAX && (
        <section>
          <div className="text-xs text-muted-foreground mb-3">{t("compare.pickHint")}</div>
          <div className="flex flex-wrap gap-2">
            {available.slice(0, 18).map((p) => (
              <button
                key={p.slug}
                onClick={() => add(p.slug)}
                className="px-3 py-1.5 rounded-full text-xs border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
              >
                + {p.bank} · {p.focus}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Comparison table */}
      {items.length >= 2 && (
        <section className="rounded-2xl border border-border bg-card/60 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground border-b border-border">
                <th className="px-5 py-3 w-40">—</th>
                {items.map((p) => (
                  <th key={p.slug} className="px-5 py-3 text-foreground">
                    {p.bank}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <Row label={t("compare.fieldFocus")} values={items.map((p) => p.focus)} />
              <Row label={t("compare.fieldScore")} values={items.map((p) => String(p.score))} mono accent />
              <Row label={t("compare.fieldMin")} values={items.map((p) => p.minTicket)} mono />
              <Row label={t("compare.fieldHorizon")} values={items.map((p) => p.horizon)} />
              <Row label={t("compare.fieldReturn")} values={items.map((p) => p.expectedReturn)} mono />
              <Row label={t("compare.fieldRisk")} values={items.map((p) => p.riskLevel)} />
              <Row label={t("compare.fieldPicks")} values={items.map((p) => p.picks.join(" · "))} />
            </tbody>
          </table>
        </section>
      )}

      {/* Allocation bars */}
      {items.length >= 2 && (
        <section className="grid md:grid-cols-3 gap-4">
          {items.map((p) => (
            <div key={p.slug} className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="flex items-center gap-2 mb-4 text-foreground">
                <GitCompare className="size-4 text-primary" />
                <span className="text-sm">{p.bank}</span>
              </div>
              <ul className="space-y-2.5">
                {p.allocation.map((a) => (
                  <li key={a.asset}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground truncate">{a.asset}</span>
                      <span className="font-mono text-primary">{a.weight}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${a.weight}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
              <Link to="/carteiras/$slug" params={{ slug: p.slug }} className="mt-4 inline-block text-xs text-primary hover:underline">
                {t("common.viewPortfolio")} →
              </Link>
            </div>
          ))}
        </section>
      )}

      <button onClick={() => setSelected([])} className="text-xs text-muted-foreground hover:text-foreground">
        {t("compare.clear")}
      </button>
    </div>
  );
}

function Row({ label, values, mono, accent }: { label: string; values: string[]; mono?: boolean; accent?: boolean }) {
  return (
    <tr className="hover:bg-accent/10 transition">
      <td className="px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`px-5 py-3 ${mono ? "font-mono" : ""} ${accent ? "text-primary" : "text-foreground"}`}>{v}</td>
      ))}
    </tr>
  );
}