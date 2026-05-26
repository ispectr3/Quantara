import type { Suitability } from "@/lib/wealth";

export type AllocSlice = { name: string; value: number; color: string };

const palette = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-accent)",
  "var(--color-chart-1)",
];

const RAW: Record<Suitability, { name: string; value: number }[]> = {
  Conservador: [
    { name: "Renda Fixa Pós", value: 35 },
    { name: "Renda Fixa Inflação", value: 30 },
    { name: "Multimercado", value: 15 },
    { name: "Ações Brasil", value: 10 },
    { name: "Mundo EUA", value: 8 },
    { name: "Cripto", value: 0 },
    { name: "Alternativos", value: 2 },
  ],
  Moderado: [
    { name: "Ações Brasil", value: 22 },
    { name: "Renda Fixa Pós", value: 22 },
    { name: "Renda Fixa Inflação", value: 18 },
    { name: "Multimercado", value: 12 },
    { name: "Mundo EUA", value: 15 },
    { name: "Cripto", value: 5 },
    { name: "Alternativos", value: 6 },
  ],
  Arrojado: [
    { name: "Ações Brasil", value: 32 },
    { name: "Mundo EUA", value: 22 },
    { name: "Renda Fixa Inflação", value: 10 },
    { name: "Renda Fixa Pós", value: 8 },
    { name: "Multimercado", value: 8 },
    { name: "Cripto", value: 12 },
    { name: "Alternativos", value: 8 },
  ],
};

export function allocationForSuitability(suit: Suitability | null): AllocSlice[] {
  const base = suit ? RAW[suit] : null;
  if (!base) {
    return [
      { name: "Ações Brasil", value: 28, color: palette[0] },
      { name: "Renda Fixa Pós", value: 20, color: palette[1] },
      { name: "Renda Fixa Inflação", value: 16, color: palette[2] },
      { name: "Multimercado", value: 12, color: palette[3] },
      { name: "Mundo EUA", value: 12, color: palette[4] },
      { name: "Cripto", value: 6, color: palette[5] },
      { name: "Alternativos", value: 6, color: palette[6] },
    ];
  }
  return base.filter((b) => b.value > 0).map((b, i) => ({ ...b, color: palette[i % palette.length] }));
}

export function allocSubtitleFor(suit: Suitability | null): string {
  if (!suit) return "Perfil moderado consolidado";
  if (suit === "Conservador") return "Carteira ajustada ao perfil conservador";
  if (suit === "Arrojado") return "Carteira ajustada ao perfil arrojado";
  return "Carteira ajustada ao perfil moderado";
}