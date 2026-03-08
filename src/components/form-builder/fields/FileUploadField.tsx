"use client";

import React from "react";
import { Upload } from "lucide-react";
import type { Field } from "@/lib/schema/survey";

interface FileUploadFieldProps {
  field: Field;
  disabled?: boolean;
}

export function FileUploadField({ field, disabled = true }: FileUploadFieldProps) {
  const maxFiles = (field.properties?.maxFiles as number) || 1;
  const allowedTypes = (field.validation?.allowedFileTypes as string[]) || [];
  const maxSize = (field.validation?.maxFileSize as number) || 10 * 1024 * 1024;
  const maxSizeMB = Math.round(maxSize / (1024 * 1024));

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 px-6 py-10 text-center transition-colors hover:border-muted-foreground/40">
      <Upload className="mb-3 h-8 w-8 text-muted-foreground/50" />
      <p className="text-sm font-medium text-muted-foreground">
        Drag & drop file{maxFiles > 1 ? "s" : ""} here, or click to browse
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        {allowedTypes.length > 0 && (
          <span>{allowedTypes.join(", ")} &middot; </span>
        )}
        Max {maxSizeMB}MB
        {maxFiles > 1 && <span> &middot; Up to {maxFiles} files</span>}
      </p>
    </div>
  );
}
