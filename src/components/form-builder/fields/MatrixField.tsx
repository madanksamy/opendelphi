"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import type { Field } from "@/lib/schema/survey";

interface MatrixFieldProps {
  field: Field;
  disabled?: boolean;
}

export function MatrixField({ field, disabled = true }: MatrixFieldProps) {
  const rows = (field.properties?.rows as string[]) || ["Row 1", "Row 2"];
  const columns = (field.properties?.columns as string[]) || ["Column 1", "Column 2", "Column 3"];
  const allowMultiple = field.properties?.allowMultiple as boolean;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="py-2 pr-4 text-left font-medium text-muted-foreground" />
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-3 py-2 text-center font-medium text-muted-foreground"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={cn(ri % 2 === 0 && "bg-muted/30")}>
              <td className="py-2.5 pr-4 font-medium">{row}</td>
              {columns.map((_, ci) => (
                <td key={ci} className="px-3 py-2.5 text-center">
                  {allowMultiple ? (
                    <input
                      type="checkbox"
                      disabled={disabled}
                      className="h-4 w-4 rounded border-input"
                    />
                  ) : (
                    <input
                      type="radio"
                      name={`matrix-${field.id}-row-${ri}`}
                      disabled={disabled}
                      className="h-4 w-4 border-input"
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
