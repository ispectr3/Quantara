import { useEffect, useState } from "react";
import { Moon, Sun, SunMedium } from "lucide-react";

type ThemeChoice = "dark" | "comfort" | "light";
const THEME_KEY = "quantara_theme";
const ORDER: ThemeChoice[] = ["dark", "comfort", "light"];
const LABEL: Record<ThemeChoice, string> = {
  dark: "Tema escuro",
  comfort: "Tema conforto",
  light: "Tema claro",
};

function apply(theme: ThemeChoice) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeChoice>("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(THEME_KEY) as ThemeChoice | null;
    const next = saved && ORDER.includes(saved) ? saved : "dark";
    setTheme(next);
    apply(next);
  }, []);

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setTheme(next);
    apply(next);
    try { window.localStorage.setItem(THEME_KEY, next); } catch { /* noop */ }
  };

  const Icon = theme === "dark" ? Moon : theme === "comfort" ? SunMedium : Sun;

  return (
    <button
      onClick={cycle}
      aria-label={`Alternar tema (atual: ${LABEL[theme]})`}
      title={`${LABEL[theme]}, clique para alternar`}
      className="size-9 grid place-items-center rounded-md border border-border bg-card hover:bg-accent/40 transition text-muted-foreground hover:text-foreground"
    >
      <Icon className="size-4" />
    </button>
  );
}