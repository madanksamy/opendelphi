"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Save,
  Send,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils/cn";
import { useBuilderStore } from "@/stores/builder-store";
import { FIELD_TYPES } from "@/lib/schema/field-types";
import { FieldPalette } from "./FieldPalette";
import { FieldRenderer } from "./FieldRenderer";
import { FieldEditor } from "./FieldEditor";
import { StepManager } from "./StepManager";
import { PreviewMode } from "./PreviewMode";
import type { FieldType } from "@/lib/schema/survey";

interface BuilderProps {
  surveyTitle?: string;
  surveyDescription?: string;
  multiStep?: boolean;
  stepLabels?: string[];
  onSave?: () => void;
  onPublish?: () => void;
  onUpdateMeta?: (meta: { multiStep?: boolean; stepLabels?: string[] }) => void;
}

function CanvasDropZone({ children, id }: { children: React.ReactNode; id: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[200px] flex-1 transition-colors",
        isOver && "bg-primary/5"
      )}
    >
      {children}
    </div>
  );
}

export function Builder({
  surveyTitle = "Untitled Survey",
  surveyDescription,
  multiStep = false,
  stepLabels = [],
  onSave,
  onPublish,
  onUpdateMeta,
}: BuilderProps) {
  const {
    fields,
    selectedFieldId,
    activeStep,
    isDirty,
    past,
    future,
    addField,
    moveField,
    selectField,
    undo,
    redo,
  } = useBuilderStore();

  const [showPreview, setShowPreview] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter fields for current step
  const visibleFields = useMemo(() => {
    if (!multiStep) return fields;
    return fields.filter((f) => (f.step ?? 0) === activeStep);
  }, [fields, multiStep, activeStep]);

  const fieldIds = useMemo(
    () => visibleFields.map((f) => f.id),
    [visibleFields]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event;
      if (!over) {
        setDragOverIndex(null);
        return;
      }
      // Find the index in the visible fields
      const overIdx = visibleFields.findIndex((f) => f.id === over.id);
      setDragOverIndex(overIdx >= 0 ? overIdx : visibleFields.length);
    },
    [visibleFields]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragId(null);
      setDragOverIndex(null);

      if (!over) return;

      const activeId = String(active.id);

      // Check if dragging from palette
      if (activeId.startsWith("palette-")) {
        const fieldType = active.data?.current?.type as FieldType;
        if (!fieldType) return;

        // Find insert index
        const overIdx = visibleFields.findIndex((f) => f.id === over.id);
        if (overIdx >= 0) {
          // Find the global index
          const globalIdx = fields.findIndex((f) => f.id === visibleFields[overIdx].id);
          addField(fieldType, globalIdx);
        } else {
          // Drop on the canvas itself = append
          addField(fieldType);
        }
        return;
      }

      // Reordering existing fields
      if (activeId !== String(over.id)) {
        const fromGlobalIdx = fields.findIndex((f) => f.id === activeId);
        const toGlobalIdx = fields.findIndex((f) => f.id === String(over.id));
        if (fromGlobalIdx >= 0 && toGlobalIdx >= 0) {
          moveField(fromGlobalIdx, toGlobalIdx);
        }
      }
    },
    [fields, visibleFields, addField, moveField]
  );

  const handleToggleMultiStep = useCallback(
    (checked: boolean) => {
      onUpdateMeta?.({ multiStep: checked, stepLabels: checked ? ["Step 1"] : [] });
    },
    [onUpdateMeta]
  );

  if (showPreview) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b bg-background px-4 py-2">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Preview Mode</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(false)}
          >
            <EyeOff className="mr-2 h-4 w-4" />
            Exit Preview
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          <PreviewMode
            title={surveyTitle}
            description={surveyDescription}
            multiStep={multiStep}
            stepLabels={stepLabels}
          />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b bg-background px-4 py-2">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={undo}
                  disabled={past.length === 0}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={redo}
                  disabled={future.length === 0}
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-2 h-6" />

            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <Label className="text-xs">Multi-step</Label>
              <Switch
                checked={multiStep}
                onCheckedChange={handleToggleMultiStep}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDirty && (
              <Badge variant="secondary" className="text-[10px]">
                Unsaved
              </Badge>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview survey</TooltipContent>
            </Tooltip>
            <Button variant="outline" size="sm" onClick={onSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button size="sm" onClick={onPublish}>
              <Send className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>

        {/* Step Manager */}
        <StepManager
          stepLabels={stepLabels}
          onUpdateStepLabels={(labels) =>
            onUpdateMeta?.({ stepLabels: labels })
          }
          multiStep={multiStep}
        />

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {/* Left: Field Palette */}
            <FieldPalette />

            {/* Center: Canvas */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <ScrollArea className="flex-1">
                <CanvasDropZone id="canvas-droppable">
                  <div className="mx-auto max-w-2xl space-y-3 p-6">
                    {visibleFields.length === 0 ? (
                      <EmptyCanvas />
                    ) : (
                      <SortableContext
                        items={fieldIds}
                        strategy={verticalListSortingStrategy}
                      >
                        {visibleFields.map((field, index) => (
                          <React.Fragment key={field.id}>
                            {dragOverIndex === index && activeDragId && (
                              <DropIndicator />
                            )}
                            <FieldRenderer field={field} index={index} />
                          </React.Fragment>
                        ))}
                        {dragOverIndex === visibleFields.length &&
                          activeDragId && <DropIndicator />}
                      </SortableContext>
                    )}
                  </div>
                </CanvasDropZone>
              </ScrollArea>
            </div>

            {/* Drag overlay */}
            <DragOverlay>
              {activeDragId && activeDragId.startsWith("palette-") ? (
                <PaletteDragOverlay
                  type={activeDragId.replace("palette-", "") as FieldType}
                />
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Right: Field Editor */}
          <FieldEditor />
        </div>
      </div>
    </TooltipProvider>
  );
}

function EmptyCanvas() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 py-16">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Layers className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="mb-1 text-lg font-medium text-muted-foreground">
        Start building your survey
      </h3>
      <p className="max-w-sm text-center text-sm text-muted-foreground/70">
        Drag and drop fields from the left panel, or click on a field type to add it
      </p>
    </div>
  );
}

function DropIndicator() {
  return (
    <div className="relative py-1">
      <div className="h-0.5 rounded-full bg-primary" />
      <div className="absolute -left-1 -top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
    </div>
  );
}

function PaletteDragOverlay({ type }: { type: FieldType }) {
  const config = FIELD_TYPES[type];
  if (!config) return null;

  return (
    <div className="rounded-lg border bg-background px-4 py-3 shadow-xl">
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
}
