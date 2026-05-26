import { useI18n } from "@/lib/i18n";

export function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="inline-flex items-center rounded-md border border-border bg-card overflow-hidden text-[11px] font-medium tracking-wide" role="group" aria-label="Language">
      <button
        onClick={() => setLang("pt")}
        className={`px-2.5 py-1.5 transition-colors ${lang === "pt" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        aria-pressed={lang === "pt"}
      >
        PT
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-2.5 py-1.5 border-l border-border transition-colors ${lang === "en" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}