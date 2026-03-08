"use client";

import React, { useState } from "react";
import { Plus, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import { useBuilderStore } from "@/stores/builder-store";

interface StepManagerProps {
  stepLabels: string[];
  onUpdateStepLabels: (labels: string[]) => void;
  multiStep: boolean;
}

export function StepManager({
  stepLabels,
  onUpdateStepLabels,
  multiStep,
}: StepManagerProps) {
  const { activeStep, setActiveStep, fields } = useBuilderStore();
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  if (!multiStep) return null;

  const labels = stepLabels.length > 0 ? stepLabels : ["Step 1"];

  const addStep = () => {
    const newLabels = [...labels, `Step ${labels.length + 1}`];
    onUpdateStepLabels(newLabels);
  };

  const removeStep = (idx: number) => {
    if (labels.length <= 1) return;
    const newLabels = labels.filter((_, i) => i !== idx);
    onUpdateStepLabels(newLabels);
    if (activeStep >= newLabels.length) {
      setActiveStep(newLabels.length - 1);
    }
    setDeleteIdx(null);
  };

  const renameStep = (idx: number, name: string) => {
    const newLabels = [...labels];
    newLabels[idx] = name;
    onUpdateStepLabels(newLabels);
  };

  const getFieldCount = (stepIdx: number) => {
    return fields.filter((f) => (f.step ?? 0) === stepIdx).length;
  };

  return (
    <>
      <div className="flex items-center gap-1 border-b bg-muted/30 px-4 py-2">
        {labels.map((label, idx) => (
          <div
            key={idx}
            className={cn(
              "group relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              activeStep === idx
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
            )}
            onClick={() => setActiveStep(idx)}
          >
            <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-50" />
            <input
              className="w-20 bg-transparent text-sm outline-none"
              value={label}
              onChange={(e) => renameStep(idx, e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-[10px] text-muted-foreground/70">
              ({getFieldCount(idx)})
            </span>
            {labels.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteIdx(idx);
                }}
                className="ml-0.5 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={addStep}
        >
          <Plus className="mr-1 h-3 w-3" />
          Step
        </Button>
      </div>

      <Dialog open={deleteIdx !== null} onOpenChange={() => setDeleteIdx(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Step</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &ldquo;{deleteIdx !== null ? labels[deleteIdx] : ""}&rdquo;?
            Fields assigned to this step will need to be reassigned.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteIdx !== null && removeStep(deleteIdx)}
            >
              Delete Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
