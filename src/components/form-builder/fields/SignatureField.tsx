"use client";

import React from "react";
import { PenLine } from "lucide-react";
import type { Field } from "@/lib/schema/survey";

interface SignatureFieldProps {
  field: Field;
  disabled?: boolean;
}

export function SignatureField({ field, disabled = true }: SignatureFieldProps) {
  const bgColor = (field.properties?.backgroundColor as string) || "#ffffff";

  return (
    <div
      className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/40"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
        <PenLine className="h-6 w-6" />
        <p className="text-xs font-medium">Sign here</p>
      </div>
    </div>
  );
}
