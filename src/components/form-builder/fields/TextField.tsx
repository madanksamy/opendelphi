"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type { Field } from "@/lib/schema/survey";

interface TextFieldProps {
  field: Field;
  disabled?: boolean;
}

export function TextField({ field, disabled = true }: TextFieldProps) {
  const placeholder =
    (field.properties?.placeholder as string) || `Enter ${field.label.toLowerCase()}...`;
  const multiline = field.properties?.multiline as boolean;

  if (multiline) {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-default disabled:opacity-70"
        )}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
      />
    );
  }

  const inputType =
    field.type === "email"
      ? "email"
      : field.type === "phone"
        ? "tel"
        : field.type === "number"
          ? "number"
          : "text";

  return (
    <Input
      type={inputType}
      placeholder={placeholder}
      disabled={disabled}
      className="disabled:cursor-default disabled:opacity-70"
    />
  );
}
