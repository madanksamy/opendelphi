"use client";

import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting?: boolean;
  className?: string;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isFirstStep,
  isLastStep,
  isSubmitting = false,
  className,
}: StepNavigationProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "TEXTAREA") return;
        e.preventDefault();
        if (isLastStep) {
          onSubmit();
        } else {
          onNext();
        }
      }
    },
    [isLastStep, onNext, onSubmit]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Step indicator dots */}
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === currentStep
                ? "w-6 bg-primary"
                : i < currentStep
                ? "w-2 bg-primary/60"
                : "w-2 bg-muted-foreground/20"
            )}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={onPrevious}
          disabled={isFirstStep}
          className={cn(isFirstStep && "invisible")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Submitting
              </span>
            ) : (
              <>
                Submit
                <Send className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        ) : (
          <Button type="button" onClick={onNext} className="min-w-[100px]">
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-xs text-muted-foreground">
        Press <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px] font-mono">Enter</kbd> to continue
      </p>
    </div>
  );
}
