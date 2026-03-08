"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import { Check, ChevronDown } from "lucide-react";
import type { Field } from "@/lib/schema/survey";

interface SelectFieldProps {
  field: Field;
  disabled?: boolean;
}

export function SelectField({ field, disabled = true }: SelectFieldProps) {
  const options = field.options || [];
  const isMulti = field.type === "multi_select";

  if (isMulti) {
    return (
      <div className="space-y-2">
        {options.map((opt) => (
          <label
            key={opt.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border border-input px-4 py-3 text-sm transition-colors",
              !disabled && "cursor-pointer hover:bg-accent"
            )}
          >
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-primary">
              <Check className="h-3 w-3 text-primary opacity-0" />
            </div>
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
          "disabled:cursor-default disabled:opacity-70"
        )}
      >
        <span className="text-muted-foreground">Select an option...</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      <div className="mt-1 rounded-md border bg-popover p-1 shadow-sm">
        {options.map((opt) => (
          <div
            key={opt.id}
            className="rounded-sm px-2 py-1.5 text-sm text-popover-foreground"
          >
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  );
}
