import { Link } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import { NewsletterCTA } from "./NewsletterCTA";

export function Footer() {
  const t = useT();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-border bg-background/40">
      <div className="px-4 lg:px-10 py-8 max-w-[1400px] space-y-5">
        <NewsletterCTA source="footer" />
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{t("footer.disclaimerTitle")}</div>
          <p className="text-xs leading-relaxed text-muted-foreground max-w-4xl">{t("footer.disclaimer")}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
          <div className="text-[11px] text-muted-foreground">© {year} Quantara · {t("footer.rights")}</div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <Link to="/privacidade" className="hover:text-foreground transition-colors">{t("footer.privacy")}</Link>
            <Link to="/termos" className="hover:text-foreground transition-colors">{t("footer.terms")}</Link>
            <Link to="/contato" className="hover:text-foreground transition-colors">{t("footer.contact")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}