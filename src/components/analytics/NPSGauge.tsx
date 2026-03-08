"use client";

import { cn } from "@/lib/utils/cn";

interface NPSGaugeProps {
  score: number; // -100 to 100
  promoters: number; // percentage
  passives: number;
  detractors: number;
  className?: string;
}

export function NPSGauge({
  score,
  promoters,
  passives,
  detractors,
  className,
}: NPSGaugeProps) {
  // Map score from [-100, 100] to [0, 180] degrees for semicircle
  const clampedScore = Math.max(-100, Math.min(100, score));
  const needleAngle = ((clampedScore + 100) / 200) * 180;

  const getScoreColor = (s: number) => {
    if (s >= 50) return "text-green-600";
    if (s >= 0) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 70) return "Excellent";
    if (s >= 50) return "Great";
    if (s >= 30) return "Good";
    if (s >= 0) return "Okay";
    if (s >= -50) return "Needs Work";
    return "Critical";
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Gauge SVG */}
      <div className="relative w-64 h-36">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Background arc segments */}
          {/* Detractors (red) - 0 to 60 degrees */}
          <path
            d="M 10 100 A 90 90 0 0 1 55.36 19.34"
            fill="none"
            stroke="#ef4444"
            strokeWidth="12"
            strokeLinecap="round"
            opacity={0.2}
          />
          {/* Passives (yellow) - 60 to 120 degrees */}
          <path
            d="M 55.36 19.34 A 90 90 0 0 1 144.64 19.34"
            fill="none"
            stroke="#eab308"
            strokeWidth="12"
            strokeLinecap="round"
            opacity={0.2}
          />
          {/* Promoters (green) - 120 to 180 degrees */}
          <path
            d="M 144.64 19.34 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="#22c55e"
            strokeWidth="12"
            strokeLinecap="round"
            opacity={0.2}
          />

          {/* Active segment highlight */}
          {clampedScore < -34 && (
            <path
              d="M 10 100 A 90 90 0 0 1 55.36 19.34"
              fill="none"
              stroke="#ef4444"
              strokeWidth="12"
              strokeLinecap="round"
              opacity={0.6}
            />
          )}
          {clampedScore >= -34 && clampedScore < 34 && (
            <path
              d="M 55.36 19.34 A 90 90 0 0 1 144.64 19.34"
              fill="none"
              stroke="#eab308"
              strokeWidth="12"
              strokeLinecap="round"
              opacity={0.6}
            />
          )}
          {clampedScore >= 34 && (
            <path
              d="M 144.64 19.34 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="#22c55e"
              strokeWidth="12"
              strokeLinecap="round"
              opacity={0.6}
            />
          )}

          {/* Needle */}
          <g
            transform={`rotate(${needleAngle}, 100, 100)`}
            className="transition-transform duration-1000 ease-out"
          >
            <line
              x1="100"
              y1="100"
              x2="18"
              y2="100"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-foreground"
            />
            <circle
              cx="100"
              cy="100"
              r="5"
              fill="currentColor"
              className="text-foreground"
            />
          </g>

          {/* Labels */}
          <text x="10" y="108" fontSize="8" className="fill-muted-foreground">
            -100
          </text>
          <text x="95" y="8" fontSize="8" textAnchor="middle" className="fill-muted-foreground">
            0
          </text>
          <text x="185" y="108" fontSize="8" textAnchor="end" className="fill-muted-foreground">
            100
          </text>
        </svg>

        {/* Score display */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <span
            className={cn(
              "text-4xl font-bold tabular-nums",
              getScoreColor(clampedScore)
            )}
          >
            {clampedScore}
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">
            {getScoreLabel(clampedScore)}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-xs">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Promoters
            </span>
          </div>
          <span className="text-lg font-bold text-green-600">{promoters}%</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Passives
            </span>
          </div>
          <span className="text-lg font-bold text-yellow-600">{passives}%</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Detractors
            </span>
          </div>
          <span className="text-lg font-bold text-red-600">{detractors}%</span>
        </div>
      </div>
    </div>
  );
}
