import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/contato")({
  component: Contato,
  head: () => ({
    meta: [
      { title: "Contato" },
      { name: "description", content: "Fale com a equipe da Quantara e agende uma conversa com nossos especialistas em wealth management." },
      { property: "og:title", content: "Contato" },
      { property: "og:description", content: "Agende uma conversa com nossos especialistas." },
      { property: "og:url", content: "/contato" },
    ],
    links: [{ rel: "canonical", href: "/contato" }],
  }),
});

function Contato() {
  return (
    <div className="max-w-3xl space-y-8">
      <header>
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Contato</div>
        <h1 className="text-4xl font-medium text-foreground leading-tight">Agende uma conversa com nossos especialistas.</h1>
        <p className="mt-4 text-sm text-muted-foreground max-w-2xl">
          Atendemos investidores do segmento private com discrição e proximidade. Escreva para a nossa equipe e responderemos em até um dia útil.
        </p>
      </header>
      <section className="grid sm:grid-cols-2 gap-4">
        <a href="mailto:contato@quantarainvest.com.br" className="rounded-2xl border border-border bg-card/60 p-6 hover:bg-accent/30 transition">
          <Mail className="size-5 text-primary mb-3" />
          <div className="text-sm text-foreground font-medium">E-mail</div>
          <div className="text-xs text-muted-foreground mt-1">contato@quantarainvest.com.br</div>
        </a>
        <a href="/advisor" className="rounded-2xl border border-border bg-card/60 p-6 hover:bg-accent/30 transition">
          <MessageSquare className="size-5 text-primary mb-3" />
          <div className="text-sm text-foreground font-medium">Advisor IA</div>
          <div className="text-xs text-muted-foreground mt-1">Tire dúvidas iniciais com o nosso especialista virtual.</div>
        </a>
      </section>
    </div>
  );
}