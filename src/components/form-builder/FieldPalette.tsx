"use client";

import React, { useState, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Search, GripVertical } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils/cn";
import { FIELD_TYPES, FIELD_CATEGORIES } from "@/lib/schema/field-types";
import type { FieldType } from "@/lib/schema/survey";

function getIcon(iconName: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icons = LucideIcons as any;
  const Icon = icons[iconName] as React.ComponentType<{ className?: string }> | undefined;
  return Icon || LucideIcons.HelpCircle;
}

interface DraggableFieldItemProps {
  type: FieldType;
  label: string;
  iconName: string;
}

function DraggableFieldItem({ type, label, iconName }: DraggableFieldItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, fromPalette: true },
  });

  const Icon = getIcon(iconName);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-transparent bg-background px-3 py-2 text-sm font-medium transition-all cursor-grab active:cursor-grabbing",
        "hover:border-border hover:bg-accent hover:shadow-sm",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary/20"
      )}
    >
      <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{label}</span>
    </div>
  );
}

export function FieldPalette() {
  const [search, setSearch] = useState("");

  const filteredTypes = useMemo(() => {
    const lower = search.toLowerCase();
    return Object.entries(FIELD_TYPES).filter(([, config]) =>
      config.label.toLowerCase().includes(lower)
    );
  }, [search]);

  const groupedTypes = useMemo(() => {
    const groups: Record<string, { type: FieldType; label: string; icon: string }[]> = {};
    for (const c of FIELD_CATEGORIES) {
      groups[c.key] = [];
    }
    for (const [type, config] of filteredTypes) {
      if (groups[config.category]) {
        groups[config.category].push({
          type: type as FieldType,
          label: config.label,
          icon: config.icon,
        });
      }
    }
    return groups;
  }, [filteredTypes]);

  return (
    <div className="flex h-full w-[250px] shrink-0 flex-col border-r bg-muted/30">
      <div className="border-b p-3">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Fields
        </h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-3">
          {FIELD_CATEGORIES.map((fieldCat) => {
            const items = groupedTypes[fieldCat.key];
            if (!items || items.length === 0) return null;
            return (
              <div key={fieldCat.key}>
                <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {fieldCat.label}
                </h4>
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <DraggableFieldItem
                      key={item.type}
                      type={item.type}
                      label={item.label}
                      iconName={item.icon}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          {filteredTypes.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No fields match your search
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
