import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({
  component: Termos,
  head: () => ({
    meta: [
      { title: "Termos de Uso · Quantara" },
      { name: "description", content: "Condições gerais de uso da plataforma Quantara para investidores do segmento private." },
      { property: "og:title", content: "Termos de Uso · Quantara" },
      { property: "og:description", content: "Condições gerais de uso da plataforma Quantara." },
      { property: "og:url", content: "/termos" },
    ],
    links: [{ rel: "canonical", href: "/termos" }],
  }),
});

function Termos() {
  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Regulatório</div>
        <h1 className="text-4xl font-medium text-foreground leading-tight">Termos de Uso</h1>
        <p className="mt-3 text-sm text-muted-foreground">Última atualização: maio de 2026.</p>
      </header>
      <section className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>Ao utilizar a Quantara você concorda com estes Termos de Uso. A plataforma fornece conteúdo de natureza informativa e educacional sobre carteiras recomendadas por casas de wealth management e não constitui recomendação personalizada de investimento.</p>
        <h2 className="text-base text-foreground mt-6">Natureza do serviço</h2>
        <p>A Quantara não é instituição financeira, corretora ou consultora autorizada pela CVM. As informações exibidas refletem análises públicas das casas de wealth listadas e não substituem a recomendação de um profissional registrado.</p>
        <h2 className="text-base text-foreground mt-6">Responsabilidades</h2>
        <p>O usuário é integralmente responsável por suas decisões de investimento. Rentabilidade passada não representa garantia de rentabilidade futura.</p>
        <h2 className="text-base text-foreground mt-6">Contato</h2>
        <p>Dúvidas sobre estes termos podem ser enviadas para <a className="text-primary hover:underline" href="mailto:contato@quantarainvest.com.br">contato@quantarainvest.com.br</a>.</p>
      </section>
    </div>
  );
}