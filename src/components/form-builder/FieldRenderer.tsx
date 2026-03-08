"use client";

import React, { useState, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { useBuilderStore } from "@/stores/builder-store";
import { FIELD_TYPES } from "@/lib/schema/field-types";
import { FIELD_REGISTRY } from "./fields";
import type { Field } from "@/lib/schema/survey";

function getIcon(iconName: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icons = LucideIcons as any;
  const Icon = icons[iconName] as React.ComponentType<{ className?: string }> | undefined;
  return Icon || LucideIcons.HelpCircle;
}

interface FieldRendererProps {
  field: Field;
  index: number;
}

export function FieldRenderer({ field, index }: FieldRendererProps) {
  const { selectedFieldId, selectField, removeField, updateField } = useBuilderStore();
  const isSelected = selectedFieldId === field.id;
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editLabel, setEditLabel] = useState(field.label);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const fieldTypeConfig = FIELD_TYPES[field.type];
  const Icon = getIcon(fieldTypeConfig?.icon || "HelpCircle");
  const registry = FIELD_REGISTRY[field.type];
  const PreviewComponent = registry?.BuilderComponent;

  const handleClick = useCallback(() => {
    if (!isEditingLabel) {
      selectField(field.id);
    }
  }, [field.id, selectField, isEditingLabel]);

  const handleDoubleClick = useCallback(() => {
    setEditLabel(field.label);
    setIsEditingLabel(true);
  }, [field.label]);

  const handleLabelSave = useCallback(() => {
    if (editLabel.trim()) {
      updateField(field.id, { label: editLabel.trim() });
    } else {
      setEditLabel(field.label);
    }
    setIsEditingLabel(false);
  }, [editLabel, field.id, field.label, updateField]);

  const handleLabelKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleLabelSave();
      } else if (e.key === "Escape") {
        setEditLabel(field.label);
        setIsEditingLabel(false);
      }
    },
    [handleLabelSave, field.label]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      removeField(field.id);
    },
    [field.id, removeField]
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border bg-background p-4 transition-all",
        isSelected
          ? "border-primary ring-2 ring-primary/20 shadow-md"
          : "border-border hover:border-muted-foreground/30 hover:shadow-sm",
        isDragging && "z-50 opacity-80 shadow-xl"
      )}
      onClick={handleClick}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 cursor-grab rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <div className="pl-6">
        {/* Header: Label + type badge */}
        <div className="mb-3 flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          {isEditingLabel ? (
            <input
              autoFocus
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onBlur={handleLabelSave}
              onKeyDown={handleLabelKeyDown}
              className="flex-1 rounded border border-primary bg-transparent px-1.5 py-0.5 text-sm font-medium outline-none ring-1 ring-primary/30"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="flex-1 cursor-text text-sm font-medium"
              onDoubleClick={handleDoubleClick}
            >
              {field.label}
            </span>
          )}
          {field.required && (
            <span className="text-xs font-medium text-destructive">*</span>
          )}
          <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">
            {fieldTypeConfig?.label || field.type}
          </Badge>
        </div>

        {/* Field description */}
        {field.description && (
          <p className="mb-2 text-xs text-muted-foreground">{field.description}</p>
        )}

        {/* Preview */}
        {PreviewComponent && (
          <div className="pointer-events-none">
            <PreviewComponent field={field} disabled />
          </div>
        )}

        {/* Layout fields without a preview component */}
        {!PreviewComponent && field.type === "section_break" && (
          <div className="border-t border-dashed border-muted-foreground/30 pt-1" />
        )}
        {!PreviewComponent && field.type === "statement" && (
          <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground italic">
            {field.description || "Statement text..."}
          </div>
        )}
        {!PreviewComponent && field.type === "payment" && (
          <div className="rounded-md border border-dashed border-muted-foreground/30 px-3 py-2 text-sm text-muted-foreground">
            Payment field preview
          </div>
        )}
      </div>
    </div>
  );
}
