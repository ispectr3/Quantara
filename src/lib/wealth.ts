import { Briefcase, Building2, Car, Banknote, Landmark, Bitcoin, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";

export type AssetKind =
  | "investimento"
  | "imovel"
  | "veiculo"
  | "conta"
  | "previdencia"
  | "cripto"
  | "seguro"
  | "alternativo";

export const KIND_META: Record<AssetKind, { label: string; icon: LucideIcon; color: string }> = {
  investimento: { label: "Investimentos", icon: Briefcase, color: "var(--color-chart-1)" },
  imovel: { label: "Imóveis", icon: Building2, color: "var(--color-chart-2)" },
  veiculo: { label: "Veículos", icon: Car, color: "var(--color-chart-3)" },
  conta: { label: "Conta / Liquidez", icon: Banknote, color: "var(--color-chart-4)" },
  previdencia: { label: "Previdência", icon: Landmark, color: "var(--color-chart-5)" },
  cripto: { label: "Cripto", icon: Bitcoin, color: "var(--color-accent)" },
  seguro: { label: "Seguros (capital)", icon: ShieldCheck, color: "var(--color-chart-1)" },
  alternativo: { label: "Alternativos", icon: Sparkles, color: "var(--color-chart-2)" },
};

export type Suitability = "Conservador" | "Moderado" | "Arrojado";

export const IDEAL_ALLOCATION: Record<Suitability, Record<AssetKind, number>> = {
  Conservador: { investimento: 80, conta: 10, previdencia: 8, alternativo: 2, cripto: 0, imovel: 0, veiculo: 0, seguro: 0 },
  Moderado:    { investimento: 60, conta: 5,  previdencia: 10, alternativo: 7, cripto: 6, imovel: 12, veiculo: 0, seguro: 0 },
  Arrojado:    { investimento: 50, conta: 3,  previdencia: 5,  alternativo: 15, cripto: 12, imovel: 15, veiculo: 0, seguro: 0 },
};

export const GOAL_KINDS: { value: string; label: string }[] = [
  { value: "aposentadoria", label: "Aposentadoria" },
  { value: "renda_passiva", label: "Renda passiva mensal" },
  { value: "imovel", label: "Compra de imóvel" },
  { value: "reserva", label: "Reserva de emergência" },
  { value: "educacao", label: "Educação dos filhos" },
  { value: "sucessao", label: "Sucessão patrimonial" },
  { value: "viagem", label: "Viagem dos sonhos" },
  { value: "carro", label: "Compra de veículo" },
  { value: "casamento", label: "Casamento" },
  { value: "negocio", label: "Abrir um negócio" },
  { value: "intercambio", label: "Intercâmbio / estudo no exterior" },
  { value: "independencia", label: "Independência financeira" },
  { value: "quitar_dividas", label: "Quitar dívidas" },
  { value: "saude", label: "Saúde e bem-estar" },
  { value: "filantropia", label: "Doações e filantropia" },
  { value: "renda_extra", label: "Renda extra de curto prazo" },
  { value: "protecao", label: "Proteção familiar (seguros)" },
  { value: "crescimento", label: "Crescimento patrimonial geral" },
  { value: "outro", label: "Outro" },
];

export const fmtBRL = (n: number) =>
  "R$ " + (n || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 });

export function diagnose(
  suitability: Suitability | null,
  byKind: Partial<Record<AssetKind, number>>,
  total: number,
): { kind: AssetKind; current: number; ideal: number; delta: number; advice: string }[] {
  if (!suitability || total <= 0) return [];
  const ideal = IDEAL_ALLOCATION[suitability];
  const rows: { kind: AssetKind; current: number; ideal: number; delta: number; advice: string }[] = [];
  (Object.keys(ideal) as AssetKind[]).forEach((k) => {
    const cur = ((byKind[k] || 0) / total) * 100;
    const target = ideal[k];
    if (target === 0 && cur < 1) return;
    const delta = cur - target;
    if (Math.abs(delta) < 3) return;
    const label = KIND_META[k].label;
    const advice =
      delta > 0
        ? `Reduzir exposição em ${label} (${cur.toFixed(0)}% para meta ${target}%). Realocar o excedente para classes deficitárias.`
        : `Aumentar exposição em ${label} (${cur.toFixed(0)}% para meta ${target}%). Direcione novos aportes para esta classe.`;
    rows.push({ kind: k, current: cur, ideal: target, delta, advice });
  });
  return rows.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 3);
}