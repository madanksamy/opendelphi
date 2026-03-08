"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { Field } from "@/lib/schema/survey";

interface ScaleFieldProps {
  field: Field;
  disabled?: boolean;
}

export function ScaleField({ field, disabled = true }: ScaleFieldProps) {
  const min = (field.properties?.min as number) ?? 1;
  const max = (field.properties?.max as number) ?? 10;
  const step = (field.properties?.step as number) ?? 1;
  const minLabel = (field.properties?.minLabel as string) || "";
  const maxLabel = (field.properties?.maxLabel as string) || "";
  const [selected, setSelected] = useState<number | null>(null);

  const values: number[] = [];
  for (let v = min; v <= max; v += step) {
    values.push(v);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setSelected(value)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors",
              selected === value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background hover:bg-accent",
              disabled && "cursor-default"
            )}
          >
            {value}
          </button>
        ))}
      </div>
      {(minLabel || maxLabel) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
