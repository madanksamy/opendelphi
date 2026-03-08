import { z } from "zod";

// ── Field type enum ──────────────────────────────────────────────────
export const fieldTypeEnum = z.enum([
  "text",
  "number",
  "email",
  "phone",
  "select",
  "multi_select",
  "rating",
  "scale",
  "matrix",
  "ranking",
  "file_upload",
  "date",
  "time",
  "signature",
  "nps",
  "section_break",
  "statement",
  "payment",
]);

export type FieldType = z.infer<typeof fieldTypeEnum>;

// ── Field validation ─────────────────────────────────────────────────
export const fieldValidationSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  customMessage: z.string().optional(),
  allowedFileTypes: z.array(z.string()).optional(),
  maxFileSize: z.number().optional(), // bytes
});

export type FieldValidation = z.infer<typeof fieldValidationSchema>;

// ── Field logic (conditional branching) ──────────────────────────────
export const fieldLogicSchema = z.object({
  action: z.enum(["show", "hide", "skip_to", "require"]),
  conditions: z.array(
    z.object({
      fieldId: z.string().uuid(),
      operator: z.enum([
        "equals",
        "not_equals",
        "contains",
        "not_contains",
        "greater_than",
        "less_than",
        "is_empty",
        "is_not_empty",
      ]),
      value: z.union([z.string(), z.number(), z.boolean()]).optional(),
    })
  ),
  conjunction: z.enum(["and", "or"]).default("and"),
  targetFieldId: z.string().uuid().optional(), // for skip_to
});

export type FieldLogic = z.infer<typeof fieldLogicSchema>;

// ── Field schema ─────────────────────────────────────────────────────
export const fieldSchema = z.object({
  id: z.string().uuid(),
  type: fieldTypeEnum,
  label: z.string().min(1, "Label is required"),
  description: z.string().optional(),
  required: z.boolean().default(false),
  validation: fieldValidationSchema.optional(),
  options: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  logic: fieldLogicSchema.optional(),
  column: z.number().min(1).max(12).optional(), // grid column span
  step: z.number().min(0).optional(), // which step this field belongs to
  properties: z
    .record(z.string(), z.unknown())
    .optional(), // type-specific properties (e.g., scale min/max labels, matrix rows/cols)
});

export type Field = z.infer<typeof fieldSchema>;

// ── Survey settings ──────────────────────────────────────────────────
const surveySettingsSchema = z.object({
  allowAnonymous: z.boolean().optional().default(true),
  requireAuth: z.boolean().optional().default(false),
  limitResponses: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  showProgressBar: z.boolean().optional().default(true),
  showQuestionNumbers: z.boolean().optional().default(true),
  shuffleQuestions: z.boolean().optional().default(false),
  confirmationMessage: z.string().optional(),
  redirectUrl: z.string().optional(),
  notifyOnResponse: z.boolean().optional().default(false),
  notifyEmails: z.array(z.string()).optional(),
});

// ── Survey theme ─────────────────────────────────────────────────────
const surveyThemeSchema = z.object({
  primaryColor: z.string().optional().default("#6366f1"),
  backgroundColor: z.string().optional().default("#ffffff"),
  fontFamily: z.string().optional().default("Inter"),
  borderRadius: z.number().optional().default(8),
  logoUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
  customCss: z.string().optional(),
});

// ── Survey schema ────────────────────────────────────────────────────
export const surveySchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  slug: z.string().min(1),
  type: z.enum(["survey", "form", "quiz", "poll"]).default("survey"),
  status: z.enum(["draft", "published", "closed", "archived"]).default("draft"),
  schema: z.array(fieldSchema),
  settings: surveySettingsSchema.optional(),
  theme: surveyThemeSchema.optional(),
  multiStep: z.boolean().default(false),
  stepLabels: z.array(z.string()).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  publishedAt: z.string().datetime().optional(),
  createdBy: z.string().uuid().optional(),
  version: z.number().int().default(1),
});

export type Survey = z.infer<typeof surveySchema>;

// ── Create survey schema (for form submission) ───────────────────────
export const createSurveySchema = surveySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  version: true,
});

export type CreateSurveyInput = z.infer<typeof createSurveySchema>;

// ── Response schema ──────────────────────────────────────────────────
export const responseSchema = z.object({
  id: z.string().uuid(),
  surveyId: z.string().uuid(),
  respondentId: z.string().uuid().optional(),
  answers: z.record(z.string(), z.unknown()), // fieldId -> answer value
  metadata: z
    .object({
      userAgent: z.string().optional(),
      ipAddress: z.string().optional(),
      referrer: z.string().optional(),
      startedAt: z.string().datetime().optional(),
      completedAt: z.string().datetime().optional(),
      duration: z.number().optional(), // seconds
    })
    .optional(),
  status: z.enum(["in_progress", "completed", "disqualified"]).default("in_progress"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type SurveyResponse = z.infer<typeof responseSchema>;
