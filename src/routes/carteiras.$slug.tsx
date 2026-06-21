import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { bankPortfolios, type BankPortfolio, type BankAllocation } from "@/lib/market-data";
import { ArrowLeft, Star, Target, Clock, Wallet, ShieldCheck, Radio, ExternalLink, Users, CalendarClock, Info } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getBankInsights } from "@/lib/bank-insights.functions";

export const Route = createFileRoute("/carteiras/$slug")({
  component: BankDetail,
  loader: ({ params }) => {
    const p = bankPortfolios.find((b) => b.slug === params.slug);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.bank ?? "Carteira"}` },
      { name: "description", content: `Carteira recomendada por ${loaderData?.bank ?? "private bank"}: alocação, tese e ativos principais.` },
      { property: "og:title", content: `${loaderData?.bank ?? "Carteira"}` },
      { property: "og:description", content: `Alocação institucional e tese da carteira ${loaderData?.bank ?? ""}.` },
      { property: "og:url", content: `/carteiras/${loaderData?.slug ?? ""}` },
      { property: "og:type", content: "article" },
    ],
    links: loaderData?.slug
      ? [{ rel: "canonical", href: `/carteiras/${loaderData.slug}` }]
      : [],
  }),
  notFoundComponent: () => (
    <div className="text-center py-20">
      <h1 className="text-2xl text-foreground mb-3">Carteira não encontrada</h1>
      <Link to="/carteiras" className="text-primary underline">Voltar para Private Banking</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="text-center py-20 text-muted-foreground">{String(error)}</div>
  ),
});

const CLASS_COLORS: Record<string, string> = {
  "Ações": "var(--color-chart-1)",
  "Renda Fixa": "var(--color-chart-2)",
  "Multimercado": "var(--color-chart-3)",
  "Mundo": "var(--color-chart-4)",
  "Alternativos": "var(--color-chart-5)",
  "Previdência": "var(--color-accent)",
};

function BankDetail() {
  const p = Route.useLoaderData() as BankPortfolio;
  const fetchInsights = useServerFn(getBankInsights);
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ["bank-insights", p.slug],
    queryFn: () => fetchInsights({ data: { slug: p.slug } }),
    staleTime: 60 * 60_000,
    refetchInterval: 6 * 60 * 60_000,
  });
  const grouped: Record<string, { name: string; value: number }> = {};
  p.allocation.forEach((a: BankAllocation) => {
    grouped[a.class] = grouped[a.class] ?? { name: a.class, value: 0 };
    grouped[a.class].value += a.weight;
  });
  const byClass = Object.values(grouped);

  const termLabel = /10\+/.test(p.horizon)
    ? "Longo prazo"
    : /5\+/.test(p.horizon)
    ? "Médio a longo prazo"
    : /3 a 5/.test(p.horizon)
    ? "Médio prazo"
    : "Curto a médio prazo";

  const profileBlurb: Record<BankPortfolio["riskLevel"], string> = {
    Conservador: "Investidor que prioriza preservação de capital, aceita retorno próximo ao CDI e baixa volatilidade no caminho.",
    Moderado: "Investidor que busca crescimento real do patrimônio aceitando oscilações controladas e horizonte de alguns anos.",
    Arrojado: "Investidor experiente, com tolerância a drawdowns relevantes em troca de retornos acima de benchmarks.",
    Agressivo: "Investidor sofisticado, com reserva líquida sólida e disposição para volatilidade elevada em busca de alpha.",
  };

  const focusBlurb: Record<string, string> = {
    "Equity Brasil": "Quem quer concentrar parte do portfólio em ações brasileiras com viés direcional e gestão ativa.",
    "Dividendos": "Quem busca renda recorrente em reais, com pagamentos previsíveis e menor giro.",
    "Multimercados": "Quem quer diversificação macro e exposição a múltiplas classes via gestores ativos.",
    "Previdência": "Quem está construindo aposentadoria ou planejando sucessão, com horizonte de 10+ anos.",
    "Patrimônio Offshore": "Quem deseja proteger patrimônio fora do Brasil, em dólar, com governança internacional.",
    "Alocação Global": "Quem quer um núcleo balanceado multi-moeda combinando equities, renda fixa e ouro.",
    "Long Biased": "Quem aceita ficar predominantemente comprado em ações com book tático de hedge.",
    "ESG Europa": "Quem prefere alocação europeia com critérios ESG e foco em transição energética.",
    "Alternativos": "Quem busca prêmio de iliquidez via private equity, private credit, real estate e infraestrutura global.",
  };

  return (
    <div className="space-y-10">
      <div>
        <Link to="/carteiras" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="size-4" /> Voltar para Portfolios
        </Link>
      </div>

      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="max-w-2xl">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">{p.focus} | {p.category}</div>
          <h1 className="text-4xl font-medium text-foreground leading-tight">
            Carteira recomendada <span className="italic text-primary">{p.bank}</span>
          </h1>
          <p className="mt-4 text-muted-foreground">{p.note}</p>
        </div>
        <div className="flex items-center gap-2 text-primary">
          <Star className="size-5 fill-current" />
          <span className="font-mono text-2xl">{p.score}</span>
          <span className="text-xs text-muted-foreground ml-1">score Quantara</span>
        </div>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Wallet, label: "Aporte mínimo", v: p.minTicket },
          { icon: Clock, label: "Horizonte sugerido", v: p.horizon },
          { icon: Target, label: "Retorno esperado", v: p.expectedReturn },
          { icon: ShieldCheck, label: "Perfil de risco", v: p.riskLevel },
        ].map(({ icon: Icon, label, v }) => (
          <div key={label} className="rounded-2xl border border-border bg-card/60 p-5">
            <Icon className="size-4 text-primary mb-2" />
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
            <div className="mt-1 text-lg text-foreground">{v}</div>
          </div>
        ))}
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2 flex items-center gap-2">
            <Users className="size-3" /> Para quem é esta carteira
          </div>
          <h2 className="text-lg text-foreground mb-2">Perfil do investidor</h2>
          <p className="text-sm text-muted-foreground">{profileBlurb[p.riskLevel]}</p>
          <p className="text-sm text-muted-foreground mt-3">{focusBlurb[p.category] ?? "Investidor alinhado com a tese específica desta casa."}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2 flex items-center gap-2">
            <CalendarClock className="size-3" /> Prazo recomendado
          </div>
          <h2 className="text-lg text-foreground mb-2">{termLabel}</h2>
          <p className="text-sm text-muted-foreground">
            Horizonte de {p.horizon.toLowerCase()}. Movimentar a carteira antes deste período tende a reduzir o retorno esperado e aumentar o impacto de janelas ruins de mercado.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
            {[
              { k: "Curto", on: termLabel.includes("Curto") },
              { k: "Médio", on: termLabel.includes("Médio") },
              { k: "Longo", on: termLabel.includes("Longo") },
            ].map((s) => (
              <div key={s.k} className={`rounded-md border px-2 py-2 text-center ${s.on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{s.k}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="text-lg text-foreground mb-1">Alocação por classe</h2>
          <p className="text-xs text-muted-foreground mb-4">Distribuição da carteira pré-definida.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byClass} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {byClass.map((s) => (
                    <Cell key={s.name} fill={CLASS_COLORS[s.name] ?? "var(--color-chart-1)"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }}
                  formatter={(v: number) => `${v}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 space-y-2">
            {byClass.map((s) => (
              <li key={s.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <span className="size-2.5 rounded-full" style={{ background: CLASS_COLORS[s.name] }} />
                  {s.name}
                </span>
                <span className="font-mono text-muted-foreground">{s.value}%</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="text-lg text-foreground">Composição detalhada</h2>
            <p className="text-xs text-muted-foreground mt-1">Ativo, peso sugerido e tese.</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground border-b border-border">
                <th className="px-6 py-3">Ativo</th>
                <th className="px-6 py-3">Classe</th>
                <th className="px-6 py-3 text-right">Peso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {p.allocation.map((a: BankAllocation) => (
                <tr key={a.asset} className="align-top hover:bg-accent/20 transition">
                  <td className="px-6 py-4">
                    <div className="text-foreground">{a.asset}</div>
                    <div className="text-xs text-muted-foreground mt-1 max-w-md">{a.thesis}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="size-2 rounded-full" style={{ background: CLASS_COLORS[a.class] }} />
                      {a.class}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-primary">{a.weight}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card/40 p-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2 flex items-center gap-2">
          <Info className="size-3" /> Sobre as opções listadas
        </div>
        <h2 className="text-lg text-foreground mb-3">O que cada escolha significa na prática</h2>
        <ul className="space-y-3">
          {p.picks.map((pick) => {
            const match = p.allocation.find((a) => a.asset.toLowerCase().includes(pick.toLowerCase().split(",")[0].trim()));
            return (
              <li key={pick} className="flex items-start gap-3">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <div className="text-sm text-foreground">{pick}</div>
                  <div className="text-xs text-muted-foreground">
                    {match?.thesis ?? "Posição sugerida pela casa dentro desta tese."}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1 flex items-center gap-2">
              <Radio className="size-3" /> Sinais públicos | atualização diária
            </div>
            <h2 className="text-lg text-foreground">O que {p.bank} está publicando agora</h2>
            <p className="text-xs text-muted-foreground mt-1">Recomendações, research e podcasts públicos do banco, filtrados para o perfil private.</p>
          </div>
          {insights?.fetchedAt && (
            <div className="text-[10px] text-muted-foreground font-mono hidden sm:block">
              {new Date(insights.fetchedAt).toLocaleString("pt-BR")}
            </div>
          )}
        </div>
        {insightsLoading && (
          <div className="text-sm text-muted-foreground py-6 text-center">Buscando sinais públicos…</div>
        )}
        {!insightsLoading && insights?.error && (insights.items?.length ?? 0) === 0 && (
          <div className="text-sm text-muted-foreground py-6 text-center">Sem sinais disponíveis no momento. {insights.error}</div>
        )}
        {!insightsLoading && (insights?.items?.length ?? 0) > 0 && (
          <ul className="divide-y divide-border">
            {insights!.items.map((it) => (
              <li key={it.url} className="py-3">
                <a href={it.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3">
                  <span className="size-7 shrink-0 grid place-items-center rounded-md bg-accent/30 text-accent-foreground mt-0.5">
                    <ExternalLink className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground leading-snug group-hover:text-primary transition">{it.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {it.source}{it.publishedAt ? ` | ${new Date(it.publishedAt).toLocaleDateString("pt-BR")}` : ""}
                    </p>
                    {it.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{it.description}</p>}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Próximo passo</div>
          <div className="text-foreground">Compare com seu perfil e adicione à sua carteira pessoal.</div>
        </div>
        <div className="flex gap-3">
          <Link to="/perfil" className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-accent/40 transition">Ver meu perfil</Link>
          <Link to="/meu-patrimonio" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition">Minha Carteira</Link>
        </div>
      </section>
    </div>
  );
}