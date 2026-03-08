"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Field } from "@/lib/schema/survey";

interface RatingFieldProps {
  field: Field;
  disabled?: boolean;
}

export function RatingField({ field, disabled = true }: RatingFieldProps) {
  const maxRating = (field.properties?.maxRating as number) || 5;
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((value) => {
        const filled = hovered !== null ? value <= hovered : value <= (selected || 0);
        return (
          <button
            key={value}
            type="button"
            disabled={disabled}
            className={cn(
              "rounded-sm p-0.5 transition-colors",
              !disabled && "cursor-pointer hover:scale-110"
            )}
            onMouseEnter={() => !disabled && setHovered(value)}
            onMouseLeave={() => !disabled && setHovered(null)}
            onClick={() => !disabled && setSelected(value === selected ? null : value)}
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/40"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
