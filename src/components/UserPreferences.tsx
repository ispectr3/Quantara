import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { LogOut, Palette, Save, UserRound, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getProfile, updateProfile } from "@/lib/chat.functions";

type ThemeChoice = "dark" | "comfort" | "light";

const THEME_KEY = "quantara_theme";
const themeOptions: { value: ThemeChoice; label: string }[] = [
  { value: "dark", label: "Escuro" },
  { value: "comfort", label: "Conforto" },
  { value: "light", label: "Claro" },
];

function applyTheme(theme: ThemeChoice) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}

export function UserPreferences() {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const fetchProfile = useServerFn(getProfile);
  const saveProfile = useServerFn(updateProfile);
  const [open, setOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [theme, setTheme] = useState<ThemeChoice>("dark");
  const [saving, setSaving] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile-menu"],
    queryFn: () => fetchProfile(),
    enabled: !!user,
  });

  const displayName = useMemo(() => (
    profile?.display_name
    || (user?.user_metadata?.display_name as string | undefined)
    || user?.email?.split("@")[0]
    || "cliente"
  ), [profile?.display_name, user?.email, user?.user_metadata?.display_name]);

  useEffect(() => {
    if (!open) return;
    setDraftName(displayName);
  }, [displayName, open]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(THEME_KEY) as ThemeChoice | null;
    const next = saved && themeOptions.some((t) => t.value === saved) ? saved : "dark";
    setTheme(next);
    applyTheme(next);
  }, []);

  const initial = (displayName[0] || "?").toUpperCase();

  const chooseTheme = (next: ThemeChoice) => {
    setTheme(next);
    applyTheme(next);
    try { window.localStorage.setItem(THEME_KEY, next); } catch { /* noop */ }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextName = draftName.trim();
    if (!nextName) return;
    setSaving(true);
    try {
      await saveProfile({ data: { displayName: nextName } });
      queryClient.invalidateQueries({ queryKey: ["profile-menu"] });
      queryClient.invalidateQueries({ queryKey: ["user-context"] });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="hidden md:flex items-center gap-3 pl-3 border-l border-border">
        <span className="text-sm text-muted-foreground">Olá, visitante</span>
        <Link to="/login" className="text-sm font-medium text-primary hover:underline">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="relative hidden md:flex items-center gap-3 pl-3 border-l border-border">
      <button onClick={() => setOpen((value) => !value)} className="text-right" aria-label="Personalizar conta">
        <div className="text-sm font-medium text-foreground">Olá, {displayName}</div>
        <div className="text-[11px] text-muted-foreground hover:text-foreground transition">Personalizar</div>
      </button>
      <button onClick={() => setOpen((value) => !value)} className="size-9 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-medium" aria-label="Abrir preferências">
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-[340px] rounded-xl border border-border bg-card shadow-2xl z-50 p-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="text-sm font-medium text-foreground">Preferências</div>
              <div className="text-[11px] text-muted-foreground">Ajuste nome e aparência</div>
            </div>
            <button onClick={() => setOpen(false)} className="size-7 grid place-items-center rounded hover:bg-accent/40" aria-label="Fechar preferências">
              <X className="size-3.5" />
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"><UserRound className="size-3" /> Nome exibido</span>
              <input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                maxLength={80}
              />
            </label>

            <div>
              <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"><Palette className="size-3" /> Tema</div>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => chooseTheme(option.value)}
                    className={`rounded-md border px-3 py-2 text-xs transition ${theme === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted/20 text-muted-foreground hover:text-foreground"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button type="button" onClick={() => signOut()} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <LogOut className="size-3.5" /> Sair
              </button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-60">
                <Save className="size-3.5" /> {saving ? "Salvando" : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}