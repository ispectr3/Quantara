import { memo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type AreaPoint = { t: string; v: number };

type Props = {
  data: AreaPoint[];
  gradientId: string;
  color: string;
  yPadding?: number;
  height?: number;
};

function MemoAreaChartBase({ data, gradientId, color, yPadding = 200, height = 288 }: Props) {
  return (
    <div
      className="w-full"
      style={{ height, contentVisibility: "auto", containIntrinsicSize: `${height}px` }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="t" stroke="oklch(0.55 0.02 220)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            stroke="oklch(0.55 0.02 220)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[`dataMin - ${yPadding}` as unknown as number, `dataMax + ${yPadding}` as unknown as number]}
          />
          <Tooltip
            contentStyle={{ background: "oklch(0.22 0.02 230)", border: "1px solid oklch(0.32 0.02 230)", borderRadius: 8, color: "oklch(0.92 0.005 220)" }}
            labelStyle={{ color: "oklch(0.68 0.015 220)" }}
          />
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export const MemoAreaChart = memo(MemoAreaChartBase, (a, b) => a.data === b.data && a.color === b.color && a.height === b.height);