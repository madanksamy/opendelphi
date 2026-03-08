"use client";

import React, { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useBuilderStore } from "@/stores/builder-store";
import { FIELD_TYPES } from "@/lib/schema/field-types";
import { v4 as uuidv4 } from "uuid";
import type { Field, FieldType } from "@/lib/schema/survey";

export function FieldEditor() {
  const { fields, selectedFieldId, updateField, removeField, selectField } =
    useBuilderStore();

  const field = fields.find((f) => f.id === selectedFieldId);

  if (!field) {
    return (
      <div className="flex h-full w-[300px] shrink-0 flex-col items-center justify-center border-l bg-muted/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Select a field to edit its properties
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col border-l bg-muted/30">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Field Properties</h3>
        <button
          onClick={() => selectField(null)}
          className="rounded-md p-1 hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4">
          <GeneralSection field={field} updateField={updateField} />
          <Separator />
          <OptionsSection field={field} updateField={updateField} />
          <TypeSpecificSection field={field} updateField={updateField} />
          <Separator />
          <ValidationSection field={field} updateField={updateField} />
          <Separator />
          <ConditionalLogicSection
            field={field}
            fields={fields}
            updateField={updateField}
          />
          <Separator />
          <LayoutSection field={field} updateField={updateField} />
          <Separator />
          <div className="pt-2">
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => {
                removeField(field.id);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Field
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ── General Section ────────────────────────────────────────────────────

function GeneralSection({
  field,
  updateField,
}: {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Label</Label>
        <Input
          value={field.label}
          onChange={(e) => updateField(field.id, { label: e.target.value })}
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Description</Label>
        <Input
          value={field.description || ""}
          onChange={(e) =>
            updateField(field.id, {
              description: e.target.value || undefined,
            })
          }
          placeholder="Help text for this field"
          className="h-8 text-sm"
        />
      </div>
      {["text", "number", "email", "phone"].includes(field.type) && (
        <div className="space-y-1.5">
          <Label className="text-xs">Placeholder</Label>
          <Input
            value={(field.properties?.placeholder as string) || ""}
            onChange={(e) =>
              updateField(field.id, {
                properties: {
                  ...field.properties,
                  placeholder: e.target.value,
                },
              })
            }
            className="h-8 text-sm"
          />
        </div>
      )}
      <div className="flex items-center justify-between">
        <Label className="text-xs">Required</Label>
        <Switch
          checked={field.required}
          onCheckedChange={(checked) =>
            updateField(field.id, { required: checked })
          }
        />
      </div>
    </div>
  );
}

// ── Options Section (for select/multi_select/ranking) ─────────────────

function OptionsSection({
  field,
  updateField,
}: {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
}) {
  const hasOptions = ["select", "multi_select", "ranking"].includes(field.type);
  if (!hasOptions) return null;

  const options = field.options || [];

  const addOption = () => {
    const newOpt = {
      id: uuidv4(),
      label: `Option \${options.length + 1}`,
      value: `option_\${options.length + 1}`,
    };
    updateField(field.id, { options: [...options, newOpt] });
  };

  const updateOption = (optId: string, label: string) => {
    updateField(field.id, {
      options: options.map((o) =>
        o.id === optId
          ? { ...o, label, value: label.toLowerCase().replace(/\s+/g, "_") }
          : o
      ),
    });
  };

  const removeOption = (optId: string) => {
    updateField(field.id, {
      options: options.filter((o) => o.id !== optId),
    });
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Options
      </Label>
      <div className="space-y-1.5">
        {options.map((opt, i) => (
          <div key={opt.id} className="flex items-center gap-1.5">
            <span className="w-5 text-center text-xs text-muted-foreground">
              {i + 1}
            </span>
            <Input
              value={opt.label}
              onChange={(e) => updateOption(opt.id, e.target.value)}
              className="h-7 flex-1 text-xs"
            />
            <button
              onClick={() => removeOption(opt.id)}
              className="rounded p-0.5 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={addOption}>
        <Plus className="mr-1 h-3 w-3" />
        Add Option
      </Button>
    </div>
  );
}

// ── Type-Specific Section ─────────────────────────────────────────────

function TypeSpecificSection({
  field,
  updateField,
}: {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
}) {
  const updateProp = (key: string, value: unknown) => {
    updateField(field.id, {
      properties: { ...field.properties, [key]: value },
    });
  };

  if (field.type === "rating") {
    return (
      <>
        <Separator />
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Rating Settings
          </Label>
          <div className="space-y-1.5">
            <Label className="text-xs">Max Rating</Label>
            <Select
              value={String((field.properties?.maxRating as number) || 5)}
              onValueChange={(v) => updateProp("maxRating", Number(v))}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="7">7</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </>
    );
  }

  if (field.type === "scale") {
    return (
      <>
        <Separator />
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Scale Settings
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Min</Label>
              <Input
                type="number"
                value={(field.properties?.min as number) ?? 1}
                onChange={(e) => updateProp("min", Number(e.target.value))}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Max</Label>
              <Input
                type="number"
                value={(field.properties?.max as number) ?? 10}
                onChange={(e) => updateProp("max", Number(e.target.value))}
                className="h-7 text-xs"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Min Label</Label>
            <Input
              value={(field.properties?.minLabel as string) || ""}
              onChange={(e) => updateProp("minLabel", e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Max Label</Label>
            <Input
              value={(field.properties?.maxLabel as string) || ""}
              onChange={(e) => updateProp("maxLabel", e.target.value)}
              className="h-7 text-xs"
            />
          </div>
        </div>
      </>
    );
  }

  if (field.type === "matrix") {
    const rows = (field.properties?.rows as string[]) || [];
    const columns = (field.properties?.columns as string[]) || [];

    return (
      <>
        <Separator />
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Matrix Settings
          </Label>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Allow Multiple</Label>
            <Switch
              checked={(field.properties?.allowMultiple as boolean) || false}
              onCheckedChange={(checked) => updateProp("allowMultiple", checked)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Rows</Label>
            {rows.map((row, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Input
                  value={row}
                  onChange={(e) => {
                    const newRows = [...rows];
                    newRows[i] = e.target.value;
                    updateProp("rows", newRows);
                  }}
                  className="h-7 flex-1 text-xs"
                />
                <button
                  onClick={() => updateProp("rows", rows.filter((_, j) => j !== i))}
                  className="rounded p-0.5 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs"
              onClick={() => updateProp("rows", [...rows, `Row \${rows.length + 1}`])}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Row
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Columns</Label>
            {columns.map((col, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Input
                  value={col}
                  onChange={(e) => {
                    const newCols = [...columns];
                    newCols[i] = e.target.value;
                    updateProp("columns", newCols);
                  }}
                  className="h-7 flex-1 text-xs"
                />
                <button
                  onClick={() => updateProp("columns", columns.filter((_, j) => j !== i))}
                  className="rounded p-0.5 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs"
              onClick={() => updateProp("columns", [...columns, `Column \${columns.length + 1}`])}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Column
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (field.type === "nps") {
    return (
      <>
        <Separator />
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            NPS Settings
          </Label>
          <div className="space-y-1.5">
            <Label className="text-xs">Low Label (0)</Label>
            <Input
              value={(field.properties?.lowLabel as string) || ""}
              onChange={(e) => updateProp("lowLabel", e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">High Label (10)</Label>
            <Input
              value={(field.properties?.highLabel as string) || ""}
              onChange={(e) => updateProp("highLabel", e.target.value)}
              className="h-7 text-xs"
            />
          </div>
        </div>
      </>
    );
  }

  if (field.type === "text") {
    return (
      <>
        <Separator />
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Text Settings
          </Label>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Multiline</Label>
            <Switch
              checked={(field.properties?.multiline as boolean) || false}
              onCheckedChange={(checked) => updateProp("multiline", checked)}
            />
          </div>
        </div>
      </>
    );
  }

  if (field.type === "date") {
    return (
      <>
        <Separator />
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Date Settings
          </Label>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Include Time</Label>
            <Switch
              checked={(field.properties?.includeTime as boolean) || false}
              onCheckedChange={(checked) => updateProp("includeTime", checked)}
            />
          </div>
        </div>
      </>
    );
  }

  if (field.type === "file_upload") {
    return (
      <>
        <Separator />
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Upload Settings
          </Label>
          <div className="space-y-1.5">
            <Label className="text-xs">Max Files</Label>
            <Input
              type="number"
              value={(field.properties?.maxFiles as number) || 1}
              onChange={(e) => updateProp("maxFiles", Number(e.target.value))}
              min={1}
              max={20}
              className="h-7 text-xs"
            />
          </div>
        </div>
      </>
    );
  }

  return null;
}

// ── Validation Section ────────────────────────────────────────────────

function ValidationSection({
  field,
  updateField,
}: {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
}) {
  const isTextLike = ["text", "email", "phone"].includes(field.type);
  const isNumeric = field.type === "number";
  if (!isTextLike && !isNumeric) return null;

  const updateValidation = (key: string, value: unknown) => {
    updateField(field.id, {
      validation: { ...field.validation, [key]: value },
    });
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Validation
      </Label>
      {isTextLike && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Min Length</Label>
              <Input
                type="number"
                value={field.validation?.minLength ?? ""}
                onChange={(e) =>
                  updateValidation(
                    "minLength",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Max Length</Label>
              <Input
                type="number"
                value={field.validation?.maxLength ?? ""}
                onChange={(e) =>
                  updateValidation(
                    "maxLength",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="h-7 text-xs"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Pattern (regex)</Label>
            <Input
              value={field.validation?.pattern || ""}
              onChange={(e) => updateValidation("pattern", e.target.value || undefined)}
              placeholder="e.g. ^[A-Z].*"
              className="h-7 text-xs font-mono"
            />
          </div>
        </>
      )}
      {isNumeric && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Min Value</Label>
            <Input
              type="number"
              value={field.validation?.min ?? ""}
              onChange={(e) =>
                updateValidation(
                  "min",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Max Value</Label>
            <Input
              type="number"
              value={field.validation?.max ?? ""}
              onChange={(e) =>
                updateValidation(
                  "max",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="h-7 text-xs"
            />
          </div>
        </div>
      )}
      <div className="space-y-1.5">
        <Label className="text-xs">Error Message</Label>
        <Input
          value={field.validation?.customMessage || ""}
          onChange={(e) => updateValidation("customMessage", e.target.value || undefined)}
          placeholder="Custom error message"
          className="h-7 text-xs"
        />
      </div>
    </div>
  );
}

// ── Conditional Logic Section ─────────────────────────────────────────

function ConditionalLogicSection({
  field,
  fields,
  updateField,
}: {
  field: Field;
  fields: Field[];
  updateField: (id: string, updates: Partial<Field>) => void;
}) {
  const otherFields = fields.filter((f) => f.id !== field.id);
  const logic = field.logic;

  const enableLogic = () => {
    updateField(field.id, {
      logic: {
        action: "show",
        conditions: [
          {
            fieldId: otherFields[0]?.id || "",
            operator: "equals",
            value: "",
          },
        ],
        conjunction: "and",
      },
    });
  };

  const clearLogic = () => {
    updateField(field.id, { logic: undefined });
  };

  if (!logic) {
    return (
      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Conditional Logic
        </Label>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-7 text-xs"
          onClick={enableLogic}
          disabled={otherFields.length === 0}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add Condition
        </Button>
        {otherFields.length === 0 && (
          <p className="text-[10px] text-muted-foreground">
            Add more fields to enable conditions
          </p>
        )}
      </div>
    );
  }

  const updateLogic = (updates: Record<string, unknown>) => {
    updateField(field.id, { logic: { ...logic, ...updates } as Field["logic"] });
  };

  const updateCondition = (idx: number, updates: Record<string, unknown>) => {
    const conditions = [...logic.conditions];
    conditions[idx] = { ...conditions[idx], ...updates } as typeof conditions[0];
    updateLogic({ conditions });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Conditional Logic
        </Label>
        <button
          onClick={clearLogic}
          className="text-xs text-destructive hover:underline"
        >
          Remove
        </button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Action</Label>
        <Select
          value={logic.action}
          onValueChange={(v) => updateLogic({ action: v })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="show">Show</SelectItem>
            <SelectItem value="hide">Hide</SelectItem>
            <SelectItem value="require">Require</SelectItem>
            <SelectItem value="skip_to">Skip to</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {logic.conditions.map((cond, idx) => (
        <div key={idx} className="space-y-1.5 rounded-md border bg-muted/30 p-2">
          {idx > 0 && (
            <Select
              value={logic.conjunction}
              onValueChange={(v) => updateLogic({ conjunction: v })}
            >
              <SelectTrigger className="h-6 text-[10px] w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="and">AND</SelectItem>
                <SelectItem value="or">OR</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Select
            value={cond.fieldId}
            onValueChange={(v) => updateCondition(idx, { fieldId: v })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {otherFields.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={cond.operator}
            onValueChange={(v) => updateCondition(idx, { operator: v })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Equals</SelectItem>
              <SelectItem value="not_equals">Not equals</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="not_contains">Not contains</SelectItem>
              <SelectItem value="greater_than">Greater than</SelectItem>
              <SelectItem value="less_than">Less than</SelectItem>
              <SelectItem value="is_empty">Is empty</SelectItem>
              <SelectItem value="is_not_empty">Is not empty</SelectItem>
            </SelectContent>
          </Select>
          {!["is_empty", "is_not_empty"].includes(cond.operator) && (
            <Input
              value={String(cond.value ?? "")}
              onChange={(e) => updateCondition(idx, { value: e.target.value })}
              placeholder="Value"
              className="h-7 text-xs"
            />
          )}
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        className="w-full h-7 text-xs"
        onClick={() =>
          updateLogic({
            conditions: [
              ...logic.conditions,
              { fieldId: otherFields[0]?.id || "", operator: "equals", value: "" },
            ],
          })
        }
      >
        <Plus className="mr-1 h-3 w-3" />
        Add Condition
      </Button>
    </div>
  );
}

// ── Layout Section ────────────────────────────────────────────────────

function LayoutSection({
  field,
  updateField,
}: {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Layout
      </Label>
      <div className="space-y-1.5">
        <Label className="text-xs">Column Width</Label>
        <Select
          value={String(field.column || 12)}
          onValueChange={(v) =>
            updateField(field.id, { column: Number(v) })
          }
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">Half (1/2)</SelectItem>
            <SelectItem value="12">Full</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Step</Label>
        <Input
          type="number"
          value={field.step ?? 0}
          onChange={(e) =>
            updateField(field.id, { step: Number(e.target.value) })
          }
          min={0}
          className="h-8 text-sm"
        />
      </div>
    </div>
  );
}
