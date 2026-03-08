"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Monitor, Tablet, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useBuilderStore } from "@/stores/builder-store";
import { FIELD_REGISTRY } from "./fields";
import type { Field } from "@/lib/schema/survey";

type Viewport = "desktop" | "tablet" | "mobile";

interface PreviewModeProps {
  title?: string;
  description?: string;
  multiStep?: boolean;
  stepLabels?: string[];
}

export function PreviewMode({
  title = "Untitled Survey",
  description,
  multiStep = false,
  stepLabels = [],
}: PreviewModeProps) {
  const { fields } = useBuilderStore();
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [currentStep, setCurrentStep] = useState(0);

  const steps = stepLabels.length > 0 ? stepLabels : ["Step 1"];

  const visibleFields = useMemo(() => {
    if (!multiStep) return fields;
    return fields.filter((f) => (f.step ?? 0) === currentStep);
  }, [fields, multiStep, currentStep]);

  const viewportWidth =
    viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "375px";

  return (
    <div className="flex h-full flex-col bg-muted/20">
      {/* Viewport toolbar */}
      <div className="flex items-center justify-center gap-2 border-b bg-background px-4 py-2">
        <Button
          variant={viewport === "desktop" ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setViewport("desktop")}
        >
          <Monitor className="h-4 w-4" />
        </Button>
        <Button
          variant={viewport === "tablet" ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setViewport("tablet")}
        >
          <Tablet className="h-4 w-4" />
        </Button>
        <Button
          variant={viewport === "mobile" ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setViewport("mobile")}
        >
          <Smartphone className="h-4 w-4" />
        </Button>
      </div>

      {/* Preview content */}
      <div className="flex flex-1 items-start justify-center overflow-auto p-6">
        <div
          className="w-full rounded-xl border bg-background shadow-lg transition-all duration-300"
          style={{ maxWidth: viewportWidth }}
        >
          {/* Header */}
          <div className="border-b px-8 py-6">
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && (
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          {/* Progress bar for multi-step */}
          {multiStep && steps.length > 1 && (
            <div className="border-b px-8 py-4">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{steps[currentStep]}</span>
                <span>
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full bg-primary transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Fields */}
          <div className="space-y-6 px-8 py-6">
            {visibleFields.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No fields in this {multiStep ? "step" : "survey"} yet
              </p>
            )}
            {visibleFields.map((field) => (
              <PreviewField key={field.id} field={field} />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between border-t px-8 py-4">
            {multiStep && currentStep > 0 ? (
              <Button
                variant="outline"
                onClick={() => setCurrentStep((s) => s - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}
            {multiStep && currentStep < steps.length - 1 ? (
              <Button onClick={() => setCurrentStep((s) => s + 1)}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button>Submit</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewField({ field }: { field: Field }) {
  const registry = FIELD_REGISTRY[field.type];
  const Component = registry?.RendererComponent;

  if (field.type === "section_break") {
    return (
      <div className="py-2">
        {field.label !== "Section Break" && (
          <h3 className="mb-1 text-lg font-semibold">{field.label}</h3>
        )}
        {field.description && (
          <p className="text-sm text-muted-foreground">{field.description}</p>
        )}
        {(field.properties?.showDivider as boolean) !== false && (
          <div className="mt-3 border-t" />
        )}
      </div>
    );
  }

  if (field.type === "statement") {
    return (
      <div className="rounded-lg bg-muted/50 px-6 py-4">
        <p className="text-sm">{field.label}</p>
        {field.description && (
          <p className="mt-1 text-xs text-muted-foreground">{field.description}</p>
        )}
        <Button size="sm" className="mt-3">
          {(field.properties?.buttonText as string) || "Continue"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
      {Component ? (
        <Component field={field} disabled={false} />
      ) : (
        <div className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
          {field.type} field
        </div>
      )}
    </div>
  );
}
