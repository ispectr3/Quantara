import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  component: Privacidade,
  head: () => ({
    meta: [
      { title: "Política de Privacidade · Quantara" },
      { name: "description", content: "Como a Quantara coleta, utiliza e protege os dados dos investidores do segmento private." },
      { property: "og:title", content: "Política de Privacidade · Quantara" },
      { property: "og:description", content: "Como a Quantara coleta, utiliza e protege seus dados." },
      { property: "og:url", content: "/privacidade" },
    ],
    links: [{ rel: "canonical", href: "/privacidade" }],
  }),
});

function Privacidade() {
  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Regulatório</div>
        <h1 className="text-4xl font-medium text-foreground leading-tight">Política de Privacidade</h1>
        <p className="mt-3 text-sm text-muted-foreground">Última atualização: maio de 2026.</p>
      </header>
      <section className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>A Quantara respeita a sua privacidade e adota práticas alinhadas à Lei Geral de Proteção de Dados (LGPD , Lei nº 13.709/2018). Esta política descreve quais informações coletamos, como utilizamos e quais são os seus direitos como titular.</p>
        <h2 className="text-base text-foreground mt-6">Dados coletados</h2>
        <p>Coletamos dados cadastrais (nome, e-mail), informações de suitability fornecidas no questionário de perfil e dados de uso da plataforma para fins analíticos. Não compartilhamos seus dados com terceiros para fins comerciais.</p>
        <h2 className="text-base text-foreground mt-6">Finalidade</h2>
        <p>Os dados são utilizados exclusivamente para personalizar análises, recomendações de carteira e comunicação com você sobre a plataforma.</p>
        <h2 className="text-base text-foreground mt-6">Direitos do titular</h2>
        <p>Você pode solicitar acesso, correção, portabilidade ou exclusão dos seus dados a qualquer momento pelo e-mail <a className="text-primary hover:underline" href="mailto:contato@quantarainvest.com.br">contato@quantarainvest.com.br</a>.</p>
      </section>
    </div>
  );
}