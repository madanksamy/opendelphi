"use client";

import React, { useCallback, useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Plus,
  GripVertical,
  Type,
  ImageIcon,
  LayoutGrid,
  Megaphone,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { useEditMode } from "./EditModeProvider";

type BlockType = "text" | "image-text" | "card-grid" | "cta-banner" | "stats-row";

interface BlockTypeOption {
  type: BlockType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const blockTypes: BlockTypeOption[] = [
  {
    type: "text",
    label: "Text Block",
    icon: <Type className="h-5 w-5" />,
    description: "Heading with paragraph text",
  },
  {
    type: "image-text",
    label: "Image + Text",
    icon: <ImageIcon className="h-5 w-5" />,
    description: "Side-by-side image and text",
  },
  {
    type: "card-grid",
    label: "Card Grid",
    icon: <LayoutGrid className="h-5 w-5" />,
    description: "Grid of feature cards",
  },
  {
    type: "cta-banner",
    label: "CTA Banner",
    icon: <Megaphone className="h-5 w-5" />,
    description: "Call-to-action banner",
  },
  {
    type: "stats-row",
    label: "Stats Row",
    icon: <BarChart3 className="h-5 w-5" />,
    description: "Row of statistics",
  },
];

function getBlockTemplate(type: BlockType): React.ReactNode {
  switch (type) {
    case "text":
      return (
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            New Section Heading
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Add your content here. Click to edit this text and make it your own.
          </p>
        </div>
      );
    case "image-text":
      return (
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-2">
          <div className="flex items-center justify-center rounded-2xl bg-muted/50 p-12">
            <ImageIcon className="h-16 w-16 text-muted-foreground/40" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">
              Feature Highlight
            </h3>
            <p className="mt-4 text-muted-foreground">
              Describe your feature here. This layout works great for showcasing
              a product screenshot alongside descriptive text.
            </p>
            <button className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Learn More
            </button>
          </div>
        </div>
      );
    case "card-grid":
      return (
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2.5">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-semibold text-card-foreground">
                  Card Title {i}
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Card description goes here. Edit this text to describe the
                  feature.
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    case "cta-banner":
      return (
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="rounded-2xl bg-gradient-to-r from-primary to-indigo-500 px-8 py-12 text-center">
            <h3 className="text-2xl font-bold text-white">
              Ready to get started?
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
              Join thousands of teams already using our platform.
            </p>
            <button className="mt-6 inline-flex items-center rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-primary shadow-sm">
              Get Started Free
            </button>
          </div>
        </div>
      );
    case "stats-row":
      return (
        <div className="border-y border-border bg-muted/30">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
            {[
              { value: "100+", label: "Customers" },
              { value: "50K", label: "Data Points" },
              { value: "99%", label: "Satisfaction" },
              { value: "24/7", label: "Support" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
  }
}

interface EditableBlockProps {
  id: string;
  children: React.ReactNode;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onAddAbove?: (type: BlockType) => void;
  onAddBelow?: (type: BlockType) => void;
  isFirst?: boolean;
  isLast?: boolean;
  className?: string;
}

function BlockTypePicker({
  onSelect,
  onClose,
}: {
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute left-1/2 z-50 w-72 -translate-x-1/2 rounded-xl border border-border bg-card p-2 shadow-xl">
      <div className="mb-2 px-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Choose Block Type
      </div>
      {blockTypes.map((bt) => (
        <button
          key={bt.type}
          onClick={() => {
            onSelect(bt.type);
            onClose();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            {bt.icon}
          </div>
          <div>
            <div className="text-sm font-medium text-card-foreground">
              {bt.label}
            </div>
            <div className="text-xs text-muted-foreground">
              {bt.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export function EditableBlock({
  id,
  children,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDuplicate,
  onAddAbove,
  onAddBelow,
  isFirst = false,
  isLast = false,
  className,
}: EditableBlockProps) {
  const { isEditMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const [showAddAbove, setShowAddAbove] = useState(false);
  const [showAddBelow, setShowAddBelow] = useState(false);

  const handleAddAbove = useCallback(
    (type: BlockType) => {
      onAddAbove?.(type);
      setShowAddAbove(false);
    },
    [onAddAbove]
  );

  const handleAddBelow = useCallback(
    (type: BlockType) => {
      onAddBelow?.(type);
      setShowAddBelow(false);
    },
    [onAddBelow]
  );

  if (!isEditMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn("group/block relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowAddAbove(false);
        setShowAddBelow(false);
      }}
      data-block-id={id}
    >
      {/* Add Above zone */}
      <div className="relative">
        {isHovered && (
          <div className="absolute -top-3 left-1/2 z-40 -translate-x-1/2">
            <button
              onClick={() => {
                setShowAddAbove((prev) => !prev);
                setShowAddBelow(false);
              }}
              className="flex h-6 items-center gap-1 rounded-full border border-border bg-background px-2.5 text-xs text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="h-3 w-3" />
              Add above
            </button>
          </div>
        )}
        {showAddAbove && (
          <div className="absolute -top-2 left-1/2 z-50 pt-8">
            <BlockTypePicker
              onSelect={handleAddAbove}
              onClose={() => setShowAddAbove(false)}
            />
          </div>
        )}
      </div>

      {/* Block outline and toolbar */}
      <div
        className={cn(
          "relative rounded-lg transition-all",
          isHovered && "ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
        )}
      >
        {/* Side toolbar */}
        {isHovered && (
          <div className="absolute -left-12 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-0.5 rounded-lg border border-border bg-card p-1 shadow-md">
            <button
              className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <button
              onClick={onMoveUp}
              disabled={isFirst}
              className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={isLast}
              className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="mx-1 my-0.5 border-t border-border" />
            <button
              onClick={onDuplicate}
              className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Duplicate"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="Delete block"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {children}
      </div>

      {/* Add Below zone */}
      <div className="relative">
        {isHovered && (
          <div className="absolute -bottom-3 left-1/2 z-40 -translate-x-1/2">
            <button
              onClick={() => {
                setShowAddBelow((prev) => !prev);
                setShowAddAbove(false);
              }}
              className="flex h-6 items-center gap-1 rounded-full border border-border bg-background px-2.5 text-xs text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="h-3 w-3" />
              Add below
            </button>
          </div>
        )}
        {showAddBelow && (
          <div className="absolute -bottom-2 left-1/2 z-50 pb-8">
            <BlockTypePicker
              onSelect={handleAddBelow}
              onClose={() => setShowAddBelow(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export { getBlockTemplate };
export type { BlockType };
