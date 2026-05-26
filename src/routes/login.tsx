import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TrendingUp, Loader2, AlertTriangle, Mail, Lock, User, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: Login,
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s.redirect === "string" ? s.redirect : undefined }),
  head: () => ({ meta: [{ title: "Entrar · Quantara" }] }),
});

const REDIRECT_KEY = "quantara_post_login_redirect";

function safeRedirect(target: string | undefined | null): string {
  if (!target) return "/";
  try {
    if (target.startsWith("/") && !target.startsWith("//")) return target;
  } catch {}
  return "/";
}

function Login() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const search = Route.useSearch();

  // Determine where to return after login: ?redirect=... > sessionStorage > current referrer > "/"
  const computeRedirect = (): string => {
    if (search.redirect) return safeRedirect(search.redirect);
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(REDIRECT_KEY);
      if (stored) return safeRedirect(stored);
      // Fallback: same-origin referrer (where the user came from)
      try {
        if (document.referrer) {
          const u = new URL(document.referrer);
          if (u.origin === window.location.origin && u.pathname !== "/login") {
            return safeRedirect(u.pathname + u.search + u.hash);
          }
        }
      } catch {}
    }
    return "/";
  };

  useEffect(() => {
    if (typeof window !== "undefined" && search.redirect) {
      try { sessionStorage.setItem(REDIRECT_KEY, search.redirect); } catch {}
    }
  }, [search.redirect]);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      const to = computeRedirect();
      try { sessionStorage.removeItem(REDIRECT_KEY); } catch {}
      nav({ to, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      if (mode === "signup") {
        const back = computeRedirect();
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}${back}`, data: { display_name: name || email.split("@")[0] } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro");
    } finally { setBusy(false); }
  };

  const google = async () => {
    setBusy(true); setErr(null);
    const back = computeRedirect();
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + back });
    if (r.error) { setErr(r.error.message); setBusy(false); }
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 size-[36rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-1/2 -right-40 size-[32rem] rounded-full bg-primary/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-2">
        {/* Brand panel */}
        <aside className="hidden lg:flex flex-col justify-between p-12 border-r border-border/60">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary text-primary-foreground grid place-items-center" style={{ boxShadow: "var(--shadow-elegant)" }}>
              <TrendingUp className="size-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-semibold tracking-tight text-foreground text-lg leading-none">Quantara</div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mt-1">Wealth Intelligence</div>
            </div>
          </Link>

          <div className="space-y-8 max-w-md">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3 inline-flex items-center gap-2">
                <Sparkles className="size-3.5" /> Segmento Private
              </div>
              <h2 className="text-4xl font-medium leading-tight">
                Inteligência de mercado <span className="italic text-primary">consolidada</span>.
              </h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                XP, BTG, J.P. Morgan, Julius Baer e mais 8 casas — em uma visão unificada para suas decisões.
              </p>
            </div>

            <ul className="space-y-3 text-sm">
              {[
                "Comparação de carteiras das 12 maiores casas",
                "Especialista IA com memória entre sessões",
                "Alertas táticos e rebalanceamento sugerido",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-muted-foreground">
                  <span className="mt-1 size-1.5 rounded-full bg-primary shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-[10px] text-muted-foreground inline-flex items-center gap-2">
            <ShieldCheck className="size-3.5" /> Criptografia em trânsito e em repouso · LGPD
          </div>
        </aside>

        {/* Form panel */}
        <main className="flex flex-col items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-sm">
            <Link to="/" className="lg:hidden flex items-center gap-2.5 justify-center mb-8">
              <div className="size-10 rounded-lg bg-primary text-primary-foreground grid place-items-center">
                <TrendingUp className="size-5" strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-semibold tracking-tight text-foreground text-lg leading-none">Quantara</div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-1">Wealth Intelligence</div>
              </div>
            </Link>

            <div className="mb-8">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                {mode === "signin" ? "Acesso" : "Cadastro"}
              </div>
              <h1 className="text-3xl font-medium leading-tight">
                {mode === "signin" ? (
                  <>Bem-vindo de <span className="italic text-primary">volta</span>.</>
                ) : (
                  <>Criar conta <span className="italic text-primary">Quantara</span>.</>
                )}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Entre para continuar de onde parou."
                  : "Memória do Especialista IA salva entre sessões."}
              </p>
            </div>

            <button
              onClick={google}
              disabled={busy}
              className="group w-full mb-5 rounded-lg border border-border bg-card hover:bg-accent/40 px-4 py-3 text-sm font-medium text-foreground transition disabled:opacity-60 inline-flex items-center justify-center gap-3"
            >
              <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.2-5.5 4.2-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
              </svg>
              Continuar com Google
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">ou e-mail</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={submit} className="space-y-3">
              {mode === "signup" && (
                <Field icon={<User className="size-4" />}>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/70" />
                </Field>
              )}
              <Field icon={<Mail className="size-4" />}>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/70" />
              </Field>
              <Field icon={<Lock className="size-4" />}>
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha (mín. 6 caracteres)" className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/70" />
              </Field>

              {err && (
                <div className="flex items-center gap-2 text-xs text-[oklch(0.7_0.18_25)] bg-[oklch(0.65_0.18_25_/0.08)] border border-[oklch(0.65_0.18_25_/0.3)] rounded-lg px-3 py-2.5">
                  <AlertTriangle className="size-3.5 shrink-0" /> {err}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="group w-full mt-2 rounded-lg bg-primary text-primary-foreground px-4 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-60 inline-flex items-center justify-center gap-2 transition"
                style={{ boxShadow: "var(--shadow-elegant)" }}
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : <>
                  {mode === "signin" ? "Entrar" : "Criar conta"}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </>}
              </button>
            </form>

            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setErr(null); }}
              className="mt-6 w-full text-xs text-muted-foreground hover:text-foreground transition"
            >
              {mode === "signin" ? "Não tem conta? " : "Já tem conta? "}
              <span className="text-foreground underline-offset-4 hover:underline">
                {mode === "signin" ? "Cadastre-se" : "Entrar"}
              </span>
            </button>

            <p className="mt-8 text-[10px] text-muted-foreground text-center leading-relaxed">
              Ao continuar você concorda em receber recomendações consultivas. Quantara não constitui oferta de valores mobiliários (CVM 39/21).
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-3 w-full bg-muted/30 border border-border rounded-lg px-3.5 py-3 focus-within:ring-2 focus-within:ring-ring focus-within:border-ring transition">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      {children}
    </label>
  );
}