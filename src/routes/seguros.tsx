import { createFileRoute } from "@tanstack/react-router";
import { insurance } from "@/lib/market-data";
import { ShieldCheck, Star } from "lucide-react";
import { useState } from "react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/seguros")({
  component: Seguros,
  head: () => ({
    meta: [
      { title: "Seguros · Quantara" },
      { name: "description", content: "Vida, residencial, auto, D&O, Kidnap e patrimoniais: cobertura sob ótica de proteção patrimonial." },
      { property: "og:title", content: "Seguros · Quantara" },
      { property: "og:description", content: "Proteção patrimonial estruturada." },
      { property: "og:url", content: "/seguros" },
    ],
    links: [{ rel: "canonical", href: "/seguros" }],
  }),
});

const TIPO_KEYS = [
  { id: "Todos", k: "ins.tab.all" },
  { id: "Vida", k: "ins.tab.life" },
  { id: "Residencial", k: "ins.tab.home" },
  { id: "Auto", k: "ins.tab.auto" },
  { id: "Saúde", k: "ins.tab.health" },
  { id: "Viagem", k: "ins.tab.travel" },
  { id: "Patrimonial", k: "ins.tab.wealth" },
  { id: "Cyber", k: "ins.tab.cyber" },
  { id: "D&O", k: "ins.tab.do" },
  { id: "Kidnap", k: "ins.tab.kidnap" },
] as const;

function Seguros() {
  const tr = useT();
  const [t, setT] = useState("Todos");
  const list = t === "Todos" ? insurance : insurance.filter((i) => i.tipo === t);
  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3 flex items-center gap-2"><ShieldCheck className="size-3.5" /> {tr("insurance.eyebrow")}</div>
        <h1 className="text-4xl font-medium text-foreground leading-tight">
          {tr("insurance.titleA")} <span className="italic text-primary">{tr("insurance.titleB")}</span> {tr("insurance.titleC")}
        </h1>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {TIPO_KEYS.map((x) => (
          <button key={x.id} onClick={() => setT(x.id)} className={`px-3.5 py-1.5 rounded-md text-sm transition ${t === x.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/30"}`}>{tr(x.k as never)}</button>
        ))}
      </div>

      <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {list.map((s) => (
          <article key={s.produto} className="rounded-2xl border border-border bg-card/60 p-6 hover:border-primary/40 transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{s.tipo}</div>
                <h3 className="text-lg text-foreground mt-1">{s.produto}</h3>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <Star className="size-4 fill-current" />
                <span className="font-mono text-sm">{s.score}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{s.destaque}</p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">{tr("ins.coverage")}</dt><dd className="font-mono text-foreground">{s.cobertura}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">{tr("ins.premium")}</dt><dd className="font-mono text-primary">{s.premio}</dd></div>
            </dl>
            <button className="mt-5 w-full rounded-md border border-border bg-muted/30 hover:bg-accent/40 py-2 text-sm transition">{tr("ins.requestQuote")}</button>
          </article>
        ))}
      </section>
    </div>
  );
}
