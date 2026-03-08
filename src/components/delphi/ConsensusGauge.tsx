"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface ConsensusGaugeProps {
  percentage: number;
  size?: number;
  className?: string;
  animated?: boolean;
}

function getConsensusLabel(pct: number): string {
  if (pct < 33) return "Low Consensus";
  if (pct < 66) return "Medium Consensus";
  return "High Consensus";
}

function getConsensusColor(pct: number): string {
  if (pct < 25) return "#ef4444";
  if (pct < 50) return "#f59e0b";
  if (pct < 75) return "#eab308";
  return "#22c55e";
}

export function ConsensusGauge({
  percentage,
  size = 200,
  className,
  animated = true,
}: ConsensusGaugeProps) {
  const [displayPct, setDisplayPct] = useState(animated ? 0 : percentage);

  useEffect(() => {
    if (!animated) {
      setDisplayPct(percentage);
      return;
    }
    let frame: number;
    const start = performance.now();
    const duration = 1200;
    const from = 0;
    const to = Math.min(100, Math.max(0, percentage));

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPct(from + (to - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [percentage, animated]);

  const cx = size / 2;
  const cy = size / 2 + 10;
  const radius = size / 2 - 20;
  const strokeWidth = 18;
  const arcRadius = radius - strokeWidth / 2;

  // Semicircle arc from 180deg to 0deg (left to right)
  const startAngle = Math.PI;
  const endAngle = 0;
  const sweepAngle = startAngle - (startAngle - endAngle) * (displayPct / 100);

  const needleLength = arcRadius - 8;
  const needleX = cx + needleLength * Math.cos(sweepAngle);
  const needleY = cy - needleLength * Math.sin(sweepAngle);

  // Arc path for the background
  const arcPath = (startA: number, endA: number, r: number) => {
    const x1 = cx + r * Math.cos(startA);
    const y1 = cy - r * Math.sin(startA);
    const x2 = cx + r * Math.cos(endA);
    const y2 = cy - r * Math.sin(endA);
    const largeArc = startA - endA > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 0 ${x2} ${y2}`;
  };

  const gradientId = `consensus-gradient-${size}`;
  const labelColor = getConsensusColor(displayPct);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        width={size}
        height={size / 2 + 40}
        viewBox={`0 0 ${size} ${size / 2 + 40}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="30%" stopColor="#f59e0b" />
            <stop offset="60%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        {/* Background arc (gray) */}
        <path
          d={arcPath(Math.PI, 0, arcRadius)}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Colored arc */}
        <path
          d={arcPath(Math.PI, 0, arcRadius)}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = Math.PI - (Math.PI * tick) / 100;
          const outerR = arcRadius + strokeWidth / 2 + 4;
          const innerR = arcRadius + strokeWidth / 2 - 2;
          return (
            <line
              key={tick}
              x1={cx + innerR * Math.cos(angle)}
              y1={cy - innerR * Math.sin(angle)}
              x2={cx + outerR * Math.cos(angle)}
              y2={cy - outerR * Math.sin(angle)}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1.5}
              opacity={0.5}
            />
          );
        })}

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="hsl(var(--foreground))"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Center pivot */}
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="hsl(var(--foreground))"
        />
        <circle
          cx={cx}
          cy={cy}
          r={3}
          fill="hsl(var(--background))"
        />

        {/* Percentage text */}
        <text
          x={cx}
          y={cy - 20}
          textAnchor="middle"
          className="text-3xl font-bold"
          fill="hsl(var(--foreground))"
          fontSize={size * 0.16}
          fontWeight="700"
        >
          {Math.round(displayPct)}%
        </text>
      </svg>

      <span
        className="mt-1 text-sm font-medium"
        style={{ color: labelColor }}
      >
        {getConsensusLabel(displayPct)}
      </span>
    </div>
  );
}
