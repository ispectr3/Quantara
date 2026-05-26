import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { BellRing, Plus, Trash2 } from "lucide-react";
import { listAlertsByTicker, upsertAlert, deleteAlert } from "@/lib/alerts.functions";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";

export function AlertsPanel({ ticker, currentPrice }: { ticker: string; currentPrice: number }) {
  const t = useT();
  const { user } = useAuth();
  const qc = useQueryClient();
  const fetchList = useServerFn(listAlertsByTicker);
  const upsertFn = useServerFn(upsertAlert);
  const deleteFn = useServerFn(deleteAlert);

  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"price" | "news">("price");
  const [direction, setDirection] = useState<"above" | "below" | "any">("above");
  const [target, setTarget] = useState<string>(currentPrice.toFixed(2));

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts", ticker],
    queryFn: () => fetchList({ data: { ticker } }),
    enabled: !!user,
  });

  const mUpsert = useMutation({
    mutationFn: () =>
      upsertFn({
        data: {
          ticker,
          kind,
          direction: kind === "news" ? "any" : direction,
          target: kind === "price" ? Number(target.replace(",", ".")) : null,
          active: true,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts", ticker] });
      setOpen(false);
    },
  });

  const mDelete = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts", ticker] }),
  });

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <BellRing className="size-4 text-primary" />
          <div>
            <h2 className="text-xl text-foreground">{t("alert.title")}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{t("alert.sub")}</p>
          </div>
        </div>
        {user && !open && (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium"
          >
            <Plus className="size-3.5" /> {t("alert.add")}
          </button>
        )}
      </div>

      {!user ? (
        <div className="text-sm text-muted-foreground">
          {t("alert.signIn")}{" "}
          <Link to="/login" className="text-primary hover:underline">
            →
          </Link>
        </div>
      ) : (
        <>
          {open && (
            <div className="rounded-lg border border-border bg-muted/20 p-4 mb-4 space-y-3">
              <div className="flex gap-2 text-xs">
                {(["price", "news"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setKind(k)}
                    className={`px-3 py-1.5 rounded-md border transition ${kind === k ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                  >
                    {t(`alert.kind.${k}` as "alert.kind.price")}
                  </button>
                ))}
              </div>
              {kind === "price" && (
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value as "above" | "below")}
                    className="rounded-md bg-background border border-border px-3 py-2 text-sm"
                  >
                    <option value="above">{t("alert.dir.above")}</option>
                    <option value="below">{t("alert.dir.below")}</option>
                  </select>
                  <input
                    inputMode="decimal"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder={t("alert.target")}
                    className="rounded-md bg-background border border-border px-3 py-2 text-sm font-mono"
                  />
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  {t("alert.cancel")}
                </button>
                <button
                  onClick={() => mUpsert.mutate()}
                  disabled={mUpsert.isPending}
                  className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium disabled:opacity-60"
                >
                  {t("alert.save")}
                </button>
              </div>
            </div>
          )}

          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("alert.empty")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {alerts.map((a) => (
                <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="text-sm">
                    <span className="text-foreground">{t(`alert.kind.${a.kind}` as "alert.kind.price")}</span>
                    {a.kind === "price" && (
                      <>
                        {" "}
                        <span className="text-muted-foreground">{t(`alert.dir.${a.direction}` as "alert.dir.above")}</span>{" "}
                        <span className="font-mono text-foreground">R$ {Number(a.target ?? 0).toFixed(2)}</span>
                      </>
                    )}
                    <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                      · {a.active ? t("alert.active") : t("alert.inactive")}
                    </span>
                  </div>
                  <button
                    onClick={() => mDelete.mutate(a.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={t("alert.remove")}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}