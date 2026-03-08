"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { TrendingUp, TrendingDown, Users, CheckCircle2, Clock, Gauge } from "lucide-react";

interface StatCardData {
  label: string;
  value: string | number;
  trend: number; // percentage change
  trendLabel: string;
  icon: React.ReactNode;
}

interface SummaryCardsProps {
  stats?: StatCardData[];
  className?: string;
}

const DEFAULT_STATS: StatCardData[] = [
  {
    label: "Total Responses",
    value: "1,247",
    trend: 12.5,
    trendLabel: "vs last month",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Completion Rate",
    value: "84.2%",
    trend: 3.1,
    trendLabel: "vs last month",
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  {
    label: "Avg. Completion Time",
    value: "4m 32s",
    trend: -8.3,
    trendLabel: "vs last month",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    label: "NPS Score",
    value: "62",
    trend: 5.2,
    trendLabel: "vs last month",
    icon: <Gauge className="h-5 w-5" />,
  },
];

export function SummaryCards({
  stats = DEFAULT_STATS,
  className,
}: SummaryCardsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </span>
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                {stat.icon}
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight">
                {stat.value}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {stat.trend >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-600" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  stat.trend >= 0 ? "text-green-600" : "text-red-600"
                )}
              >
                {stat.trend >= 0 ? "+" : ""}
                {stat.trend}%
              </span>
              <span className="text-xs text-muted-foreground">
                {stat.trendLabel}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
