import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Shield, MapPin, Globe2, Monitor, RefreshCw, Loader2 } from "lucide-react";

export const Route = createFileRoute("/seguranca")({
  component: Seguranca,
  head: () => ({ meta: [{ title: "Segurança & Acessos , Quantara" }] }),
});

type AccessLog = {
  id: string;
  event: string;
  ip: string | null;
  country: string | null;
  country_code: string | null;
  region: string | null;
  city: string | null;
  isp: string | null;
  org: string | null;
  user_agent: string | null;
  created_at: string;
};

function parseDevice(ua: string | null): string {
  if (!ua) return "Desconhecido";
  if (/iPhone|iPad/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Windows/.test(ua)) return "Windows";
  if (/Linux/.test(ua)) return "Linux";
  return "Outro";
}

function Seguranca() {
  const { user, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("access_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) console.error(error);
    setLogs((data ?? []) as AccessLog[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  if (authLoading) return null;
  if (!user) {
    return (
      <div className="max-w-xl space-y-4">
        <h1 className="text-3xl font-medium">Segurança</h1>
        <p className="text-muted-foreground">Faça login para visualizar seu histórico de acessos.</p>
      </div>
    );
  }

  const countries = Array.from(new Set(logs.map((l) => l.country).filter(Boolean))) as string[];
  const ips = Array.from(new Set(logs.map((l) => l.ip).filter(Boolean))) as string[];

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-6">
        <div className="max-w-2xl">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Segurança</div>
          <h1 className="text-4xl font-medium text-foreground leading-tight">
            De onde sua conta foi <span className="italic text-primary">acessada</span>.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Cada login é registrado com IP, geolocalização (ip-api.com) e dispositivo. Se você reconhecer um acesso suspeito,
            altere sua senha imediatamente.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="shrink-0 size-9 grid place-items-center rounded-md border border-border bg-card hover:bg-accent/40 disabled:opacity-50"
          aria-label="Atualizar"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card/60 p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
            <Shield className="size-3.5" /> Total de acessos
          </div>
          <div className="text-3xl font-medium">{logs.length}</div>
        </div>
        <div className="rounded-xl border border-border bg-card/60 p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
            <Globe2 className="size-3.5" /> Países distintos
          </div>
          <div className="text-3xl font-medium">{countries.length}</div>
          <div className="text-xs text-muted-foreground mt-1 truncate">{countries.join(", ") || ","}</div>
        </div>
        <div className="rounded-xl border border-border bg-card/60 p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
            <MapPin className="size-3.5" /> IPs distintos
          </div>
          <div className="text-3xl font-medium">{ips.length}</div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card/60 overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
          Últimos 100 acessos
        </div>
        {loading ? (
          <div className="p-8 flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Carregando…
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-sm text-muted-foreground">
            Nenhum acesso registrado ainda. Saia e entre novamente para gerar o primeiro registro.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 font-normal">Quando</th>
                  <th className="text-left px-5 py-3 font-normal">Localização</th>
                  <th className="text-left px-5 py-3 font-normal">IP / ISP</th>
                  <th className="text-left px-5 py-3 font-normal">Dispositivo</th>
                  <th className="text-left px-5 py-3 font-normal">Evento</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-border/50 hover:bg-accent/10">
                    <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
                      {new Date(l.created_at).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {l.country_code && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/40">{l.country_code}</span>
                        )}
                        <span>{[l.city, l.region, l.country].filter(Boolean).join(", ") || ","}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-mono text-xs">{l.ip || ","}</div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[220px]">{l.isp || l.org || ""}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <Monitor className="size-3.5 text-muted-foreground" />
                        {parseDevice(l.user_agent)}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-primary/15 text-primary">
                        {l.event}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}