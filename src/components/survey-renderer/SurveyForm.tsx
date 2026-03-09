"use client";

import { useState, useMemo, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import type { Survey, Field } from "@/lib/schema/survey";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "./ProgressBar";
import { StepNavigation } from "./StepNavigation";
import { CompletionScreen } from "./CompletionScreen";
import { Star, ChevronRight } from "lucide-react";

// ── Field renderer ──────────────────────────────────────────────────

function FieldRenderer({
  field,
  value,
  onChange,
  error,
}: {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}) {
  switch (field.type) {
    case "text":
      if (field.properties?.multiline) {
        return (
          <Textarea
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              (field.properties?.placeholder as string) ?? ""
            }
            className={cn(error && "border-destructive")}
            rows={4}
          />
        );
      }
      return (
        <Input
          type="text"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            (field.properties?.placeholder as string) ?? ""
          }
          className={cn(error && "border-destructive")}
        />
      );

    case "email":
      return (
        <Input
          type="email"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            (field.properties?.placeholder as string) ?? "you@example.com"
          }
          className={cn(error && "border-destructive")}
        />
      );

    case "phone":
      return (
        <Input
          type="tel"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            (field.properties?.placeholder as string) ?? ""
          }
          className={cn(error && "border-destructive")}
        />
      );

    case "number":
      return (
        <Input
          type="number"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
          placeholder={
            (field.properties?.placeholder as string) ?? ""
          }
          step={field.properties?.allowDecimals ? "any" : "1"}
          className={cn(error && "border-destructive")}
        />
      );

    case "date":
      return (
        <Input
          type="date"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(error && "border-destructive")}
        />
      );

    case "time":
      return (
        <Input
          type="time"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(error && "border-destructive")}
        />
      );

    case "select":
      return (
        <div className="space-y-2">
          {field.options?.map((opt) => (
            <label
              key={opt.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-accent",
                value === opt.value && "border-primary bg-primary/5"
              )}
            >
              <div
                className={cn(
                  "h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors",
                  value === opt.value
                    ? "border-primary"
                    : "border-muted-foreground/30"
                )}
              >
                {value === opt.value && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      );

    case "multi_select":
      return (
        <div className="space-y-2">
          {field.options?.map((opt) => {
            const selected = Array.isArray(value)
              ? (value as string[]).includes(opt.value)
              : false;
            return (
              <label
                key={opt.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-accent",
                  selected && "border-primary bg-primary/5"
                )}
              >
                <div
                  className={cn(
                    "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                    selected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  )}
                >
                  {selected && (
                    <svg
                      className="h-3 w-3 text-primary-foreground"
                      viewBox="0 0 12 12"
                    >
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm">{opt.label}</span>
              </label>
            );
          })}
        </div>
      );

    case "rating": {
      const maxRating = (field.properties?.maxRating as number) ?? 5;
      const currentRating = (value as number) ?? 0;
      return (
        <div className="flex gap-1">
          {Array.from({ length: maxRating }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i + 1)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-8 w-8 transition-colors",
                  i < currentRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/30"
                )}
              />
            </button>
          ))}
        </div>
      );
    }

    case "scale": {
      const min = (field.properties?.min as number) ?? 1;
      const max = (field.properties?.max as number) ?? 10;
      const step = (field.properties?.step as number) ?? 1;
      const minLabel = (field.properties?.minLabel as string) ?? "";
      const maxLabel = (field.properties?.maxLabel as string) ?? "";
      const scaleValues: number[] = [];
      for (let i = min; i <= max; i += step) scaleValues.push(i);

      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 justify-center">
            {scaleValues.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onChange(v)}
                className={cn(
                  "h-10 w-10 rounded-lg border text-sm font-medium transition-all hover:border-primary",
                  value === v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/20 hover:bg-accent"
                )}
              >
                {v}
              </button>
            ))}
          </div>
          {(minLabel || maxLabel) && (
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>{minLabel}</span>
              <span>{maxLabel}</span>
            </div>
          )}
        </div>
      );
    }

    case "nps": {
      const lowLabel =
        (field.properties?.lowLabel as string) ?? "Not at all likely";
      const highLabel =
        (field.properties?.highLabel as string) ?? "Extremely likely";
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5 justify-center">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChange(i)}
                className={cn(
                  "h-10 w-10 rounded-lg border text-sm font-medium transition-all",
                  value === i
                    ? i <= 6
                      ? "border-red-500 bg-red-500 text-white"
                      : i <= 8
                      ? "border-yellow-500 bg-yellow-500 text-white"
                      : "border-green-500 bg-green-500 text-white"
                    : "border-muted-foreground/20 hover:bg-accent"
                )}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>{lowLabel}</span>
            <span>{highLabel}</span>
          </div>
        </div>
      );
    }

    case "matrix": {
      const rows = (field.properties?.rows as string[]) ?? [];
      const columns = (field.properties?.columns as string[]) ?? [];
      const matrixValue = (value as Record<string, string>) ?? {};
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2" />
                {columns.map((col) => (
                  <th
                    key={col}
                    className="p-2 text-center font-medium text-muted-foreground"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row} className="border-t">
                  <td className="p-2 font-medium">{row}</td>
                  {columns.map((col) => (
                    <td key={col} className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          onChange({ ...matrixValue, [row]: col })
                        }
                        className={cn(
                          "h-5 w-5 rounded-full border-2 inline-flex items-center justify-center transition-colors",
                          matrixValue[row] === col
                            ? "border-primary"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {matrixValue[row] === col && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "ranking": {
      const items = field.options ?? [];
      const ranked = Array.isArray(value) ? (value as string[]) : [];
      const unranked = items.filter((it) => !ranked.includes(it.value));

      const moveUp = (val: string) => {
        const idx = ranked.indexOf(val);
        if (idx <= 0) return;
        const next = [...ranked];
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        onChange(next);
      };
      const moveDown = (val: string) => {
        const idx = ranked.indexOf(val);
        if (idx < 0 || idx >= ranked.length - 1) return;
        const next = [...ranked];
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
        onChange(next);
      };
      const addItem = (val: string) => onChange([...ranked, val]);
      const removeItem = (val: string) =>
        onChange(ranked.filter((v) => v !== val));

      return (
        <div className="space-y-2">
          {ranked.length > 0 && (
            <div className="space-y-1.5">
              {ranked.map((val, idx) => {
                const item = items.find((it) => it.value === val);
                return (
                  <div
                    key={val}
                    className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium">
                      {item?.label ?? val}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveUp(val)}
                        disabled={idx === 0}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        &#8593;
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDown(val)}
                        disabled={idx === ranked.length - 1}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        &#8595;
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(val)}
                        className="p-1 text-muted-foreground hover:text-destructive"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {unranked.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">
                Click to add to ranking:
              </p>
              {unranked.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addItem(item.value)}
                  className="flex w-full items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
                >
                  <span className="flex-1 text-left">{item.label}</span>
                  <span className="text-xs">+ Add</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    case "file_upload":
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Drag & drop or click to upload
          </p>
          <Input
            type="file"
            onChange={(e) => {
              const files = e.target.files;
              if (files?.length) onChange(files[0].name);
            }}
            className="max-w-xs"
          />
        </div>
      );

    case "signature":
      return (
        <div className="rounded-lg border p-4">
          <div className="h-32 bg-muted/30 rounded flex items-center justify-center text-sm text-muted-foreground">
            Signature pad would render here
          </div>
          <Input
            type="text"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your name as signature"
            className="mt-3"
          />
        </div>
      );

    case "statement":
      return (
        <div className="py-4">
          <p className="text-base text-muted-foreground leading-relaxed">
            {field.description}
          </p>
        </div>
      );

    case "section_break":
      return (
        <div className="py-2">
          {field.properties?.showDivider ? (
            <hr className="border-muted-foreground/20" />
          ) : null}
        </div>
      );

    case "payment":
      return (
        <div className="rounded-lg border p-4 bg-muted/10">
          <p className="text-sm font-medium">
            Payment: {String(field.properties?.currency ?? "USD")}{" "}
            {String(field.properties?.amount ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Payment processing via {String(field.properties?.provider ?? "stripe")}
          </p>
        </div>
      );

    default:
      return (
        <p className="text-sm text-muted-foreground">
          Unsupported field type: {field.type}
        </p>
      );
  }
}

// ── Conditional logic evaluator ────────────────────────────────────

function evaluateCondition(
  condition: { fieldId: string; operator: string; value?: unknown },
  formValues: Record<string, unknown>
): boolean {
  const fieldValue = formValues[condition.fieldId];

  switch (condition.operator) {
    case "equals":
      return fieldValue === condition.value;
    case "not_equals":
      return fieldValue !== condition.value;
    case "contains":
      return typeof fieldValue === "string" && typeof condition.value === "string"
        ? fieldValue.includes(condition.value)
        : false;
    case "not_contains":
      return typeof fieldValue === "string" && typeof condition.value === "string"
        ? !fieldValue.includes(condition.value)
        : true;
    case "greater_than":
      return typeof fieldValue === "number" && typeof condition.value === "number"
        ? fieldValue > condition.value
        : false;
    case "less_than":
      return typeof fieldValue === "number" && typeof condition.value === "number"
        ? fieldValue < condition.value
        : false;
    case "is_empty":
      return !fieldValue || (typeof fieldValue === "string" && fieldValue.trim() === "");
    case "is_not_empty":
      return !!fieldValue && !(typeof fieldValue === "string" && fieldValue.trim() === "");
    default:
      return true;
  }
}

function shouldShowField(
  field: Field,
  formValues: Record<string, unknown>
): boolean {
  if (!field.logic) return true;

  const { action, conditions, conjunction } = field.logic;

  const results = conditions.map((cond) =>
    evaluateCondition(cond, formValues)
  );

  const conditionsMet =
    conjunction === "or" ? results.some(Boolean) : results.every(Boolean);

  if (action === "show") return conditionsMet;
  if (action === "hide") return !conditionsMet;
  return true;
}

// ── Main SurveyForm ────────────────────────────────────────────────

interface SurveyFormProps {
  survey: Survey;
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
  className?: string;
}

export function SurveyForm({ survey, onSubmit, className }: SurveyFormProps) {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = welcome screen
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, watch, trigger, getValues, setError, formState } = useForm<
    Record<string, unknown>
  >({
    defaultValues: {},
  });

  const formValues = watch();

  // Normalize schema — DB stores { fields: [...] }, but type is Field[]
  const fields = useMemo<Field[]>(() => {
    const s = survey.schema as unknown;
    if (Array.isArray(s)) return s as Field[];
    if (s && typeof s === "object" && "fields" in s && Array.isArray((s as { fields: unknown }).fields)) {
      return (s as { fields: Field[] }).fields;
    }
    return [];
  }, [survey.schema]);

  // Group fields by step
  const steps = useMemo(() => {
    const grouped: Field[][] = [];
    for (const field of fields) {
      const stepIdx = field.step ?? 0;
      if (!grouped[stepIdx]) grouped[stepIdx] = [];
      grouped[stepIdx].push(field);
    }
    // Remove empty slots
    return grouped.filter((s) => s && s.length > 0);
  }, [fields]);

  const totalSteps = steps.length;
  const hasWelcome = !!survey.description;
  const isOnWelcome = currentStep === -1 && hasWelcome;

  // Visible fields for current step (conditional logic applied)
  const currentFields = useMemo(() => {
    if (currentStep < 0 || currentStep >= steps.length) return [];
    return steps[currentStep].filter((field) =>
      shouldShowField(field, formValues)
    );
  }, [currentStep, steps, formValues]);

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const fields = currentFields;
    let valid = true;

    for (const field of fields) {
      if (field.type === "section_break" || field.type === "statement") continue;

      const val = getValues(field.id);

      if (field.required) {
        if (val === undefined || val === null || val === "") {
          setError(field.id, {
            type: "required",
            message: `${field.label} is required`,
          });
          valid = false;
        }
      }

      if (field.validation?.maxLength && typeof val === "string") {
        if (val.length > field.validation.maxLength) {
          setError(field.id, {
            type: "maxLength",
            message: `Maximum ${field.validation.maxLength} characters`,
          });
          valid = false;
        }
      }

      if (field.validation?.pattern && typeof val === "string" && val) {
        const re = new RegExp(field.validation.pattern);
        if (!re.test(val)) {
          setError(field.id, {
            type: "pattern",
            message: field.validation.customMessage ?? "Invalid format",
          });
          valid = false;
        }
      }
    }

    return valid;
  }, [currentFields, getValues, setError]);

  const handleNext = useCallback(async () => {
    if (isOnWelcome) {
      setCurrentStep(0);
      return;
    }
    const valid = await validateCurrentStep();
    if (!valid) return;
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    }
  }, [isOnWelcome, validateCurrentStep, currentStep, totalSteps]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    } else if (hasWelcome) {
      setCurrentStep(-1);
    }
  }, [currentStep, hasWelcome]);

  const handleSubmit = useCallback(async () => {
    const valid = await validateCurrentStep();
    if (!valid) return;

    setIsSubmitting(true);
    try {
      const allValues = getValues();
      await onSubmit?.(allValues);
      setIsCompleted(true);
    } catch {
      // submission error
    } finally {
      setIsSubmitting(false);
    }
  }, [validateCurrentStep, getValues, onSubmit]);

  // Multi-select toggle helper
  const toggleMultiSelect = (
    currentValue: unknown,
    optionValue: string
  ): string[] => {
    const arr = Array.isArray(currentValue) ? (currentValue as string[]) : [];
    return arr.includes(optionValue)
      ? arr.filter((v) => v !== optionValue)
      : [...arr, optionValue];
  };

  if (isCompleted) {
    return (
      <div className={cn("max-w-2xl mx-auto", className)}>
        <CompletionScreen
          message={survey.settings?.confirmationMessage}
        />
      </div>
    );
  }

  return (
    <div className={cn("max-w-2xl mx-auto px-4 py-8", className)}>
      {/* Progress bar */}
      {survey.settings?.showProgressBar !== false && !isOnWelcome && (
        <ProgressBar
          current={currentStep + 1}
          total={totalSteps}
          className="mb-8"
        />
      )}

      {/* Welcome screen */}
      {isOnWelcome && (
        <div className="flex flex-col items-center text-center py-12">
          {survey.theme?.logoUrl && (
            <img
              src={survey.theme.logoUrl}
              alt="Logo"
              className="h-12 mb-6"
            />
          )}
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
              {survey.description}
            </p>
          )}
          <Button onClick={handleNext} size="lg" className="min-w-[160px]">
            Start Survey
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Form fields */}
      {!isOnWelcome && (
        <div className="space-y-6">
          {/* Step label */}
          {survey.stepLabels?.[currentStep] && (
            <h2 className="text-xl font-semibold mb-2">
              {survey.stepLabels[currentStep]}
            </h2>
          )}

          {/* Fields */}
          {currentFields.map((field, fieldIdx) => (
            <div key={field.id} className="space-y-2">
              {field.type !== "section_break" && field.type !== "statement" && (
                <Label
                  htmlFor={field.id}
                  className="text-sm font-medium flex items-center gap-1"
                >
                  {survey.settings?.showQuestionNumbers !== false && (
                    <span className="text-muted-foreground">
                      {fieldIdx + 1}.
                    </span>
                  )}
                  {field.label}
                  {field.required && (
                    <span className="text-destructive ml-0.5">*</span>
                  )}
                </Label>
              )}

              {field.description && field.type !== "statement" && (
                <p className="text-sm text-muted-foreground">
                  {field.description}
                </p>
              )}

              <Controller
                name={field.id}
                control={control}
                render={({ field: formField }) => (
                  <FieldRenderer
                    field={field}
                    value={formField.value}
                    onChange={(val) => {
                      if (field.type === "multi_select") {
                        formField.onChange(
                          toggleMultiSelect(formField.value, val as string)
                        );
                      } else {
                        formField.onChange(val);
                      }
                    }}
                    error={
                      formState.errors[field.id]?.message as string | undefined
                    }
                  />
                )}
              />

              {formState.errors[field.id] && (
                <p className="text-sm text-destructive">
                  {formState.errors[field.id]?.message as string}
                </p>
              )}
            </div>
          ))}

          {/* Navigation */}
          <StepNavigation
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
            isFirstStep={currentStep === 0 && !hasWelcome}
            isLastStep={currentStep === totalSteps - 1}
            isSubmitting={isSubmitting}
            className="mt-8 pt-6 border-t"
          />
        </div>
      )}
    </div>
  );
}
