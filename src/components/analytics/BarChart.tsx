"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils/cn";

const THEME_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#ec4899", // pink
  "#f43f5e", // rose
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
];

interface BarChartData {
  name: string;
  value: number;
  [key: string]: unknown;
}

interface BarChartProps {
  data: BarChartData[];
  dataKey?: string;
  nameKey?: string;
  height?: number;
  layout?: "vertical" | "horizontal";
  showGrid?: boolean;
  className?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export function BarChart({
  data,
  dataKey = "value",
  nameKey = "name",
  height = 300,
  layout = "vertical",
  showGrid = true,
  className,
}: BarChartProps) {
  if (layout === "horizontal") {
    return (
      <div className={cn("w-full", className)}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="hsl(var(--border))"
              />
            )}
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              dataKey={nameKey}
              type="category"
              tick={{ fontSize: 12 }}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} animationDuration={800}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={THEME_COLORS[index % THEME_COLORS.length]}
                />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
          )}
          <XAxis
            dataKey={nameKey}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} animationDuration={800}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={THEME_COLORS[index % THEME_COLORS.length]}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
