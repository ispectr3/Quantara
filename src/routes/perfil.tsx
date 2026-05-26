import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import { questionPool, type Question } from "@/lib/market-data";
import { useServerFn } from "@tanstack/react-start";
import { setSuitability } from "@/lib/chat.functions";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/perfil")({
  component: Perfil,
  head: () => ({ meta: [{ title: "Perfil do Investidor , Quantara" }] }),
});

const N = 6;

function pick(seed: number): Question[] {
  const arr = [...questionPool];
  // Fisher-Yates with seed mix
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(((Math.sin(seed * 9301 + i * 49297) + 1) / 2) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, N);
}

function Perfil() {
  const { user } = useAuth();
  const saveSuit = useServerFn(setSuitability);
  const [attempt, setAttempt] = useState(() => Date.now());
  const questions = useMemo(() => pick(attempt), [attempt]);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const done = step >= questions.length;
  const total = scores.reduce((a, b) => a + b, 0);
  const max = N * 4;
  const ratio = total / max;
  const profile =
    ratio <= 0.42
      ? {
          name: "Conservador",
          desc: "Foco em preservação de capital com Renda Fixa e Tesouro.",
          alloc: [{ l: "Renda Fixa", v: 70 }, { l: "Multimercado", v: 15 }, { l: "Ações", v: 10 }, { l: "Mundo", v: 5 }],
          picks: [
            { ticker: "Tesouro IPCA+ 2035", note: "IPCA + 6,08% | liquidez diária | preservação real do poder de compra" },
            { ticker: "LCI Bradesco", note: "IPCA + 6,20% | isento de IR | 36 meses" },
            { ticker: "CDB BTG", note: "118% CDI | 24 meses | garantia FGC" },
            { ticker: "TAEE11", note: "Taesa | dividendos consistentes | setor regulado" },
            { ticker: "IVVB11", note: "ETF S&P 500 em reais | diversificação internacional" },
          ],
          horizon: "3 a 5 anos",
        }
      : ratio <= 0.7
      ? {
          name: "Moderado",
          desc: "Equilíbrio entre proteção e crescimento, com diversificação global e cripto.",
          alloc: [{ l: "Renda Fixa", v: 45 }, { l: "Ações Brasil", v: 22 }, { l: "Mundo EUA", v: 15 }, { l: "Multimercado", v: 12 }, { l: "Cripto", v: 6 }],
          picks: [
            { ticker: "ITUB4", note: "Itaú | score Quantara 91 | core defensivo bancário" },
            { ticker: "WEGE3", note: "WEG | score 89 | qualidade global em equipamentos" },
            { ticker: "EQTL3", note: "Equatorial | score 85 | utility de crescimento" },
            { ticker: "VOO", note: "Vanguard S&P 500 | taxa 0,03% | core internacional" },
            { ticker: "Debênture IPCA+ 7%", note: "Crédito privado incentivado | isento de IR" },
            { ticker: "BTC (até 5%)", note: "Reserva de valor digital | alocação tática" },
          ],
          horizon: "5 a 10 anos",
        }
      : {
          name: "Arrojado",
          desc: "Tolerância elevada a volatilidade em busca de retornos superiores.",
          alloc: [{ l: "Ações Brasil", v: 35 }, { l: "Mundo EUA", v: 22 }, { l: "Renda Fixa", v: 18 }, { l: "Cripto", v: 12 }, { l: "Multimercado", v: 8 }, { l: "Alternativos", v: 5 }],
          picks: [
            { ticker: "PRIO3", note: "PetroRio | score 86 | alavancagem ao petróleo" },
            { ticker: "NVDA", note: "NVIDIA | score 97 | líder global em IA" },
            { ticker: "MSFT", note: "Microsoft | score 95 | big tech core" },
            { ticker: "QQQ", note: "ETF Nasdaq 100 | exposição growth tech US" },
            { ticker: "BTC + ETH", note: "Core cripto 60/40 | alocação estratégica 10 a 12%" },
            { ticker: "Private Equity FoF", note: "Alternativo ilíquido | prêmio de iliquidez" },
          ],
          horizon: "Acima de 10 anos",
        };

  // Persiste o perfil no localStorage para o Especialista IA consumir
  if (done && typeof window !== "undefined") {
    try { localStorage.setItem("quantara_perfil", profile.name); } catch { /* noop */ }
  }
  useEffect(() => {
    if (done && user) {
      saveSuit({ data: { suitability: profile.name as "Conservador" | "Moderado" | "Arrojado" } }).catch(() => {});
    }
  }, [done, user, profile.name, saveSuit]);

  const reset = () => { setAttempt(Date.now()); setStep(0); setScores([]); };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Suitability Quantara</div>
        <h1 className="text-4xl font-medium text-foreground leading-tight">
          Seis perguntas para <span className="italic text-primary">desenhar sua carteira</span>.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">As perguntas são sorteadas de um banco com mais de 12 cenários , refaça quando quiser para revalidar seu perfil.</p>
      </header>

      {!done && (
        <div className="rounded-2xl border border-border bg-card/60 p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-muted-foreground">Pergunta {step + 1} de {questions.length}</span>
            <div className="flex gap-1.5">
              {questions.map((_, i) => (
                <span key={i} className={`h-1 w-8 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
          </div>
          <h2 className="text-2xl text-foreground mb-6">{questions[step].q}</h2>
          <div className="space-y-2">
            {questions[step].opts.map((o) => (
              <button
                key={o.label}
                onClick={() => { setScores([...scores, o.score]); setStep(step + 1); }}
                className="w-full text-left px-5 py-4 rounded-lg border border-border bg-muted/30 hover:bg-accent/40 hover:border-primary/50 transition text-foreground"
              >
                {o.label}
              </button>
            ))}
          </div>
          <button onClick={reset} className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <RefreshCw className="size-3" /> Sortear novas perguntas
          </button>
        </div>
      )}

      {done && (
        <div className="rounded-2xl border border-border bg-card/60 p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
          <CheckCircle2 className="size-10 text-primary mb-4" />
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Seu perfil</div>
          <h2 className="text-4xl text-foreground mt-1">{profile.name}</h2>
          <p className="mt-3 text-muted-foreground max-w-xl">{profile.desc}</p>
          <p className="mt-1 text-xs text-muted-foreground">Horizonte recomendado: <span className="text-foreground">{profile.horizon}</span></p>

          <div className="mt-8 space-y-3">
            {profile.alloc.map((a) => (
              <div key={a.l}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-foreground">{a.l}</span>
                  <span className="font-mono text-primary">{a.v}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${a.v}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-border">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="size-4 text-primary" />
              <h3 className="text-xl text-foreground">Carteira recomendada</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-5">Ativos sugeridos pelo desk Quantara para o seu perfil , ponto de partida para discussão com seu advisor.</p>
            <ul className="space-y-2">
              {profile.picks.map((p) => (
                <li key={p.ticker} className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-4 hover:border-primary/40 transition">
                  <div className="size-9 rounded-md bg-primary/15 text-primary grid place-items-center font-mono text-[11px] shrink-0">{p.ticker.split(" ")[0].slice(0, 5)}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{p.ticker}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.note}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex gap-3">
            <Link to="/onboarding" className="rounded-md bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:opacity-90">Completar diagnóstico (objetivos + patrimônio)</Link>
            <Link to="/carteiras" className="rounded-md border border-border px-5 py-3 text-sm hover:bg-accent/40">Ver carteiras compatíveis</Link>
            <button onClick={reset} className="rounded-md border border-border px-5 py-3 text-sm hover:bg-accent/40 inline-flex items-center gap-2">
              <RefreshCw className="size-3.5" /> Refazer com novas perguntas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
