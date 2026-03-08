"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { Field } from "@/lib/schema/survey";

interface NPSFieldProps {
  field: Field;
  disabled?: boolean;
}

export function NPSField({ field, disabled = true }: NPSFieldProps) {
  const lowLabel = (field.properties?.lowLabel as string) || "Not at all likely";
  const highLabel = (field.properties?.highLabel as string) || "Extremely likely";
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 11 }, (_, i) => i).map((value) => {
          const colorClass =
            value <= 6
              ? selected === value
                ? "border-red-500 bg-red-500 text-white"
                : "border-red-200 hover:border-red-300"
              : value <= 8
                ? selected === value
                  ? "border-amber-500 bg-amber-500 text-white"
                  : "border-amber-200 hover:border-amber-300"
                : selected === value
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-green-200 hover:border-green-300";

          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setSelected(value)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors",
                colorClass,
                disabled && "cursor-default"
              )}
            >
              {value}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
