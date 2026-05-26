import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Send, Brain, Loader2, AlertTriangle, Sparkles, RotateCcw, LogIn, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateConversation, listMessages, saveMessage, resetConversation } from "@/lib/chat.functions";
import { getUserContext } from "@/lib/wealth.functions";
import { KIND_META, fmtBRL, type AssetKind } from "@/lib/wealth";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/advisor")({
  component: Advisor,
  head: () => ({
    meta: [
      { title: "Especialista IA , Quantara" },
      { name: "description", content: "Converse com o Especialista Quantara: IA private banking que cruza carteiras de 12 casas e recomenda alocações." },
      { property: "og:title", content: "Especialista IA · Quantara" },
      { property: "og:description", content: "IA private banking que cruza carteiras de 12 casas." },
      { property: "og:url", content: "/advisor" },
    ],
    links: [{ rel: "canonical", href: "/advisor" }],
  }),
});

type Msg = { role: "user" | "assistant"; content: string };

const GUEST_LIMIT = 3;

const DEFAULT_SUGGESTIONS = [
  "Como balancear Brasil x EUA na minha carteira?",
  "Quanto alocar em cripto sendo moderado?",
  "Compare CDB 118% CDI com Tesouro IPCA+ 2035 em tabela.",
  "Vale migrar parte da renda fixa para Treasuries?",
];

const WELCOME: Msg = {
  role: "assistant",
  content:
    "Olá. Sou o **Especialista Quantara**.\n\nAnaliso seu perfil, comparo carteiras de **XP, BTG, J.P. Morgan, Julius Baer** e mais 8 casas, e sugiro realocações táticas.\n\nPosso ajudar com:\n- Rebalanceamento Brasil × EUA × Cripto\n- Comparação de CDBs, LCIs, Tesouro\n- Seleção de seguros private (Chubb, AIG, Berkshire)\n- Estratégias de sucessão patrimonial\n\nO que vamos analisar hoje?",
};

function Advisor() {
  const t = useT();
  const { user, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const getConv = useServerFn(getOrCreateConversation);
  const loadMsgs = useServerFn(listMessages);
  const persist = useServerFn(saveMessage);
  const clearAll = useServerFn(resetConversation);
  const loadCtx = useServerFn(getUserContext);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [hydrating, setHydrating] = useState(true);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(0);
  const [showGate, setShowGate] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const saved = typeof window !== "undefined" ? Number(localStorage.getItem("quantara_guest_count") || "0") : 0;
      setGuestCount(saved);
      if (saved >= GUEST_LIMIT) setShowGate(true);
      setHydrating(false);
      return;
    }
    (async () => {
      try {
        const { id } = await getConv({});
        setConversationId(id);
        const rows = await loadMsgs({ data: { conversationId: id } });
        if (rows.length) setMessages(rows.map((r) => ({ role: r.role as "user" | "assistant", content: r.content })));
      } catch (e) {
        console.error(e);
      } finally { setHydrating(false); }
    })();
  }, [user, authLoading, getConv, loadMsgs]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    if (!user && guestCount >= GUEST_LIMIT) { setShowGate(true); return; }
    setError(null);
    setInput("");
    const userMsg: Msg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setStreaming(true);

    if (!user) {
      const nc = guestCount + 1;
      setGuestCount(nc);
      try { localStorage.setItem("quantara_guest_count", String(nc)); } catch {}
    }

    let ctx: { perfil?: string; patrimonio?: string; objetivos?: string; composicao?: string } = {};
    if (user) {
      try {
        const c = await loadCtx();
        const comp = Object.entries(c.wallet.byKind || {})
          .map(([k, v]) => `${KIND_META[k as AssetKind]?.label ?? k} ${fmtBRL(Number(v))}`)
          .join(", ");
        const obj = c.goals.map((g) => `${g.kind} ${fmtBRL(Number(g.target_value))} em ${g.horizon_years}a`).join("; ");
        ctx = {
          perfil: c.profile.suitability ?? undefined,
          patrimonio: c.wallet.total > 0 ? fmtBRL(c.wallet.total) : undefined,
          composicao: comp || undefined,
          objetivos: obj || undefined,
        };
      } catch { /* ignore */ }
    } else {
      const perfil = typeof window !== "undefined" ? localStorage.getItem("quantara_perfil") : null;
      ctx = { perfil: perfil ?? undefined };
    }

    const controller = new AbortController();
    abortRef.current = controller;

    if (conversationId) {
      persist({ data: { conversationId, role: "user", content: trimmed } }).catch(console.error);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          context: ctx,
        }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || `Falha (${resp.status})`);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") { done = true; break; }
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              acc += delta;
              setMessages((prev) => prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: acc } : m)));
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
      if (conversationId && acc) {
        persist({ data: { conversationId, role: "assistant", content: acc } }).catch(console.error);
      }
      if (!user && guestCount + 1 >= GUEST_LIMIT) {
        // Após a 3ª resposta, abre o gate
        setTimeout(() => setShowGate(true), 400);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      if (!msg.includes("abort")) setError(msg);
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();
  const reset = async () => {
    setMessages([WELCOME]);
    if (conversationId) {
      try { await clearAll({ data: { conversationId } }); } catch (e) { console.error(e); }
    }
  };

  const remaining = Math.max(0, GUEST_LIMIT - guestCount);

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3 flex items-center gap-2">
          <Brain className="size-3.5" /> {t("advisor.eyebrow")} {user ? `· ${t("advisor.memoryOn")}` : `· ${remaining} ${t("advisor.guestRemaining")}`}
        </div>
        <h1 className="text-4xl font-medium text-foreground leading-tight">
          {t("advisor.titleA")} <span className="italic text-primary">{t("advisor.titleB")}</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
          {t("advisor.lead")}
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-card/60 overflow-hidden" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div ref={scrollRef} className="p-6 space-y-5 min-h-[560px] max-h-[78vh] overflow-y-auto">
          {hydrating && (
            <div className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="size-3 animate-spin" /> {t("advisor.hydrating")}</div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`${m.role === "user" ? "max-w-[78%]" : "max-w-[92%]"} rounded-2xl px-5 py-4 text-[15px] leading-[1.7] ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted/40 text-foreground border border-border rounded-bl-sm"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none text-[15px] leading-[1.7] [&_p]:my-2.5 [&_h1]:text-lg [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-base [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:uppercase [&_h3]:tracking-wider [&_h3]:text-muted-foreground [&_ul]:my-2.5 [&_li]:my-1 [&_table]:text-[13px] [&_table]:my-3 [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:bg-muted/40 [&_th]:border [&_th]:border-border [&_th]:text-left [&_td]:px-2.5 [&_td]:py-1.5 [&_td]:border [&_td]:border-border [&_code]:text-primary [&_code]:bg-muted/40 [&_code]:px-1 [&_code]:rounded [&_strong]:text-foreground [&_em]:text-muted-foreground [&_em]:text-xs">
                    {m.content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    ) : (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-4 bg-background/40">
          {!user && !showGate && (
            <div className="mb-3 flex items-center justify-between gap-3 text-xs bg-muted/40 border border-border rounded-md px-3 py-2">
              <span className="text-muted-foreground">
                {t("advisor.guestMode")} · <strong className="text-foreground">{remaining}</strong> / {GUEST_LIMIT} {t("advisor.guestRemaining")}
              </span>
              <Link to="/login" className="text-primary hover:underline inline-flex items-center gap-1"><LogIn className="size-3" /> {t("advisor.signIn")}</Link>
            </div>
          )}
          {showGate && (
            <div className="mb-3 rounded-md border border-primary/40 bg-primary/5 px-4 py-3 text-sm">
              <div className="flex items-center gap-2 text-foreground font-medium mb-1"><Lock className="size-4 text-primary" /> {t("advisor.gateTitle")}</div>
              <p className="text-xs text-muted-foreground mb-3">{t("advisor.gateLead")}</p>
              <div className="flex gap-2">
                <button onClick={() => nav({ to: "/login" })} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-xs font-medium hover:opacity-90 inline-flex items-center gap-1.5"><LogIn className="size-3.5" /> {t("advisor.gateCta")}</button>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-3 flex items-center gap-2 text-xs text-[oklch(0.65_0.18_25)] bg-[oklch(0.65_0.18_25_/0.08)] border border-[oklch(0.65_0.18_25_/0.3)] rounded-md px-3 py-2">
              <AlertTriangle className="size-3.5" /> {error}
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            {DEFAULT_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={streaming}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:bg-accent/40 text-muted-foreground hover:text-foreground transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Sparkles className="size-3" /> {s}
              </button>
            ))}
            {messages.length > 1 && (
              <button onClick={reset} className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:bg-accent/40 text-muted-foreground hover:text-foreground transition flex items-center gap-1.5">
                <RotateCcw className="size-3" /> {t("advisor.newChat")}
              </button>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={3}
              placeholder={t("advisor.placeholder")}
              disabled={streaming}
              className="flex-1 resize-none bg-muted/40 border border-border rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 min-h-[88px] max-h-[240px]"
            />
            {streaming ? (
              <button type="button" onClick={stop} className="rounded-xl bg-muted text-foreground border border-border px-4 py-3 hover:bg-accent/40 h-[88px]">
                <Loader2 className="size-4 animate-spin" />
              </button>
            ) : (
              <button type="submit" className="rounded-xl bg-primary text-primary-foreground px-5 py-3 hover:opacity-90 h-[88px] inline-flex items-center gap-2 text-sm font-medium">
                <Send className="size-4" />
                <span className="hidden sm:inline">Enviar</span>
              </button>
            )}
          </form>
          <p className="mt-3 text-[10px] text-muted-foreground leading-relaxed">
            {t("advisor.disclaimer")}
          </p>
        </div>
      </div>
    </div>
  );
}