"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils/cn";
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  Clock,
  Users,
  ChevronRight,
  BarChart3,
} from "lucide-react";

export interface RoundQuestion {
  id: string;
  text: string;
  consensusPercent: number;
  responseCount: number;
}

export interface DelphiRound {
  id: string;
  number: number;
  status: "pending" | "active" | "completed";
  startDate: string | null;
  endDate: string | null;
  responseCount: number;
  totalPanelists: number;
  questions: RoundQuestion[];
}

interface RoundManagerProps {
  rounds: DelphiRound[];
  onStartRound?: (roundId: string) => void;
  onCloseRound?: (roundId: string) => void;
  className?: string;
}

const statusConfig = {
  pending: {
    label: "Pending",
    variant: "outline" as const,
    icon: Circle,
    lineColor: "bg-muted-foreground/30",
  },
  active: {
    label: "Active",
    variant: "default" as const,
    icon: PlayCircle,
    lineColor: "bg-primary",
  },
  completed: {
    label: "Completed",
    variant: "secondary" as const,
    icon: CheckCircle2,
    lineColor: "bg-green-500",
  },
};

function formatDate(iso: string | null): string {
  if (!iso) return "--";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ConsensusBar({ percent }: { percent: number }) {
  const color =
    percent >= 75
      ? "bg-green-500"
      : percent >= 50
        ? "bg-yellow-500"
        : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{percent}%</span>
    </div>
  );
}

export function RoundManager({
  rounds,
  onStartRound,
  onCloseRound,
  className,
}: RoundManagerProps) {
  const activeRound = rounds.find((r) => r.status === "active");
  const nextPendingRound = rounds.find((r) => r.status === "pending");

  return (
    <div className={cn("space-y-6", className)}>
      {/* Timeline */}
      <div className="relative">
        {rounds.map((round, idx) => {
          const config = statusConfig[round.status];
          const Icon = config.icon;
          const isLast = idx === rounds.length - 1;

          return (
            <div key={round.id} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Timeline line */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-[15px] top-[32px] h-[calc(100%-24px)] w-0.5",
                    config.lineColor
                  )}
                />
              )}

              {/* Timeline dot */}
              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                  round.status === "active"
                    ? "border-primary bg-primary text-primary-foreground"
                    : round.status === "completed"
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-muted-foreground/30 bg-background text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Round card */}
              <Card
                className={cn(
                  "flex-1",
                  round.status === "active" && "border-primary shadow-md"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">
                        Round {round.number}
                      </CardTitle>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {round.status === "active" && onCloseRound && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCloseRound(round.id)}
                        >
                          Close Round
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-4 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(round.startDate)}
                      {round.endDate && ` - ${formatDate(round.endDate)}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {round.responseCount}/{round.totalPanelists} responses
                    </span>
                  </CardDescription>
                </CardHeader>

                {round.questions.length > 0 && round.status !== "pending" && (
                  <CardContent>
                    <Separator className="mb-4" />
                    <div className="space-y-3">
                      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <BarChart3 className="h-3.5 w-3.5" />
                        Consensus by Question
                      </p>
                      <div className="space-y-2">
                        {round.questions.map((q) => (
                          <div
                            key={q.id}
                            className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                          >
                            <span className="max-w-[60%] truncate text-sm">
                              {q.text}
                            </span>
                            <ConsensusBar percent={q.consensusPercent} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          );
        })}
      </div>

      {/* Start Next Round button */}
      {nextPendingRound && !activeRound && onStartRound && (
        <div className="flex justify-center pt-2">
          <Button
            size="lg"
            onClick={() => onStartRound(nextPendingRound.id)}
            className="gap-2"
          >
            <PlayCircle className="h-5 w-5" />
            Start Round {nextPendingRound.number}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
