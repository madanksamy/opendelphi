"use client";

import React from "react";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Field } from "@/lib/schema/survey";

interface DateFieldProps {
  field: Field;
  disabled?: boolean;
}

export function DateField({ field, disabled = true }: DateFieldProps) {
  const includeTime = field.properties?.includeTime as boolean;
  const isTimeOnly = field.type === "time";

  if (isTimeOnly) {
    return (
      <div className="relative w-48">
        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="time"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-default disabled:opacity-70"
          )}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-48">
        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="date"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-default disabled:opacity-70"
          )}
        />
      </div>
      {includeTime && (
        <div className="relative w-36">
          <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="time"
            disabled={disabled}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "disabled:cursor-default disabled:opacity-70"
            )}
          />
        </div>
      )}
    </div>
  );
}
