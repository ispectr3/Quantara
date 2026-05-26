import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { useI18n, useT } from "@/lib/i18n";

export function NewsletterCTA({ source = "footer" }: { source?: string }) {
  const t = useT();
  const { lang } = useI18n();
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setState("loading"); setErr(null);
    try {
      await subscribe({ data: { email, source, lang } });
      setState("ok");
      setEmail("");
    } catch (e2) {
      setState("error");
      setErr(e2 instanceof Error ? e2.message : "Erro");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
        <Mail className="size-3.5" /> {t("nl.eyebrow")}
      </div>
      <div className="text-sm text-foreground mb-3">{t("nl.title")}</div>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <label className="sr-only" htmlFor="nl-email">{t("nl.placeholder")}</label>
        <input
          id="nl-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("nl.placeholder")}
          className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={state === "loading" || state === "ok"}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {state === "loading" && <Loader2 className="size-4 animate-spin" />}
          {state === "ok" && <CheckCircle2 className="size-4" />}
          {state === "ok" ? t("nl.success") : t("nl.subscribe")}
        </button>
      </form>
      {state === "error" && err && (
        <div className="mt-2 text-xs text-destructive">{err}</div>
      )}
      <div className="mt-2 text-[10px] text-muted-foreground">{t("nl.disclaimer")}</div>
    </div>
  );
}