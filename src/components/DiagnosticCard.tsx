import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, AlertTriangle, ArrowRight, Target } from "lucide-react";
import { getUserContext } from "@/lib/wealth.functions";
import { diagnose, fmtBRL, type AssetKind, type Suitability } from "@/lib/wealth";
import { useAuth } from "@/lib/auth";

export function DiagnosticCard() {
  const { user } = useAuth();
  const fetchCtx = useServerFn(getUserContext);
  const { data, isLoading } = useQuery({
    queryKey: ["user-context"],
    queryFn: () => fetchCtx(),
    enabled: !!user,
  });

  if (!user) {
    return (
      <section className="rounded-2xl border border-dashed border-primary/40 bg-primary/[0.04] p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Diagnóstico personalizado</div>
          <h2 className="text-xl text-foreground">Entenda sua carteira real em 3 minutos.</h2>
          <p className="text-sm text-muted-foreground mt-1">Faça o onboarding: perfil, objetivos e patrimônio. Receba recomendações imediatas.</p>
        </div>
        <Link to="/login" className="rounded-md bg-primary text-primary-foreground px-5 py-3 text-sm font-medium inline-flex items-center gap-2 self-start">
          Começar <ArrowRight className="size-4" />
        </Link>
      </section>
    );
  }

  if (isLoading || !data) {
    return <div className="rounded-2xl border border-border bg-card/40 p-6 text-sm text-muted-foreground">Carregando diagnóstico…</div>;
  }

  const { profile, goals, wallet } = data;

  if (!profile.suitability || wallet.count === 0) {
    return (
      <section className="rounded-2xl border border-primary/40 bg-primary/[0.06] p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="size-5 text-primary mt-1" />
          <div className="flex-1">
            <h2 className="text-xl text-foreground">Complete seu diagnóstico</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {!profile.suitability && "Falta definir seu perfil de risco. "}
              {wallet.count === 0 && "Falta cadastrar seu patrimônio inicial. "}
              Leva 3 minutos.
            </p>
          </div>
          <Link to="/onboarding" className="rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2">
            Fazer agora <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    );
  }

  const suit = profile.suitability as Suitability;
  const recs = diagnose(suit, wallet.byKind as Partial<Record<AssetKind, number>>, wallet.total);

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6" style={{ boxShadow: "var(--shadow-elegant)" }}>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-1">Seu diagnóstico Quantara</div>
          <h2 className="text-2xl text-foreground">Perfil <span className="text-primary italic">{suit}</span> | {fmtBRL(wallet.total)}</h2>
        </div>
        <div className="flex gap-2">
          {goals.length > 0 && (
            <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground rounded-full border border-border bg-muted/30 px-3 py-1.5">
              <Target className="size-3" /> {goals.length} objetivo{goals.length === 1 ? "" : "s"}
            </div>
          )}
          <Link to="/advisor" className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-xs font-medium inline-flex items-center gap-1.5">
            Falar com IA <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>

      {recs.length === 0 ? (
        <div className="rounded-lg border border-[oklch(0.72_0.16_155_/0.3)] bg-[oklch(0.72_0.16_155_/0.06)] p-4 text-sm">
          ✓ Sua carteira está alinhada com o perfil <strong>{suit}</strong>. Mantenha o monitoramento mensal.
        </div>
      ) : (
        <ul className="space-y-3">
          {recs.map((r) => (
            <li key={r.kind} className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-4">
              <AlertTriangle className={`size-4 mt-0.5 shrink-0 ${Math.abs(r.delta) > 10 ? "text-destructive" : "text-primary"}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground">{r.advice}</div>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                  <span>atual {r.current.toFixed(0)}%</span>
                  <span>|</span>
                  <span>meta {r.ideal}%</span>
                  <span>|</span>
                  <span className={r.delta > 0 ? "text-destructive" : "text-primary"}>
                    {r.delta > 0 ? "+" : ""}{r.delta.toFixed(1)}pp
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex gap-3 text-xs">
        <Link to="/meu-patrimonio" className="text-primary hover:underline">Editar carteira</Link>
        <span className="text-muted-foreground">|</span>
        <Link to="/onboarding" className="text-primary hover:underline">Refazer diagnóstico</Link>
        <span className="text-muted-foreground">|</span>
        <Link to="/carteiras" className="text-primary hover:underline">Ver carteiras compatíveis</Link>
      </div>
    </section>
  );
}