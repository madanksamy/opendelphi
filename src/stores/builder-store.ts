import { create } from "zustand";
import { produce } from "immer";
import { v4 as uuidv4 } from "uuid";
import type { Field, FieldType, Survey } from "@/lib/schema/survey";
import { FIELD_TYPES } from "@/lib/schema/field-types";

interface HistoryEntry {
  fields: Field[];
  selectedFieldId: string | null;
}

interface BuilderState {
  // ── State ──────────────────────────────────────────────────────────
  fields: Field[];
  selectedFieldId: string | null;
  activeStep: number;
  isDirty: boolean;
  surveyId: string | null;
  surveyMeta: Partial<Omit<Survey, "schema">> | null;

  // History for undo/redo
  past: HistoryEntry[];
  future: HistoryEntry[];

  // ── Actions ────────────────────────────────────────────────────────
  addField: (type: FieldType, index?: number) => void;
  removeField: (id: string) => void;
  moveField: (fromIndex: number, toIndex: number) => void;
  updateField: (id: string, updates: Partial<Field>) => void;
  selectField: (id: string | null) => void;
  setActiveStep: (step: number) => void;
  undo: () => void;
  redo: () => void;
  loadSurvey: (survey: Survey) => void;
  saveSurvey: () => { fields: Field[]; meta: Partial<Omit<Survey, "schema">> | null };
  reset: () => void;
}

const MAX_HISTORY = 50;

function pushHistory(state: BuilderState): { past: HistoryEntry[]; future: HistoryEntry[] } {
  const entry: HistoryEntry = {
    fields: JSON.parse(JSON.stringify(state.fields)),
    selectedFieldId: state.selectedFieldId,
  };
  const past = [...state.past, entry].slice(-MAX_HISTORY);
  return { past, future: [] };
}

function createDefaultField(type: FieldType): Field {
  const config = FIELD_TYPES[type];
  return {
    id: uuidv4(),
    type,
    label: config.label,
    required: config.defaultConfig.required,
    ...(config.defaultConfig.properties && {
      properties: { ...config.defaultConfig.properties },
    }),
    ...(config.defaultConfig.validation && {
      validation: { ...config.defaultConfig.validation },
    }),
    ...(config.defaultConfig.options && {
      options: config.defaultConfig.options.map((opt) => ({
        ...opt,
        id: uuidv4(),
      })),
    }),
  };
}

export const useBuilderStore = create<BuilderState>()((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────
  fields: [],
  selectedFieldId: null,
  activeStep: 0,
  isDirty: false,
  surveyId: null,
  surveyMeta: null,
  past: [],
  future: [],

  // ── Actions ────────────────────────────────────────────────────────
  addField: (type, index) =>
    set(
      produce((state: BuilderState) => {
        const history = pushHistory(state);
        state.past = history.past;
        state.future = history.future;

        const field = createDefaultField(type);
        field.step = state.activeStep;

        if (index !== undefined && index >= 0 && index <= state.fields.length) {
          state.fields.splice(index, 0, field);
        } else {
          state.fields.push(field);
        }

        state.selectedFieldId = field.id;
        state.isDirty = true;
      })
    ),

  removeField: (id) =>
    set(
      produce((state: BuilderState) => {
        const history = pushHistory(state);
        state.past = history.past;
        state.future = history.future;

        const idx = state.fields.findIndex((f) => f.id === id);
        if (idx === -1) return;

        state.fields.splice(idx, 1);

        if (state.selectedFieldId === id) {
          // Select the previous field, or the next, or null
          if (state.fields.length === 0) {
            state.selectedFieldId = null;
          } else if (idx < state.fields.length) {
            state.selectedFieldId = state.fields[idx].id;
          } else {
            state.selectedFieldId = state.fields[state.fields.length - 1].id;
          }
        }

        state.isDirty = true;
      })
    ),

  moveField: (fromIndex, toIndex) =>
    set(
      produce((state: BuilderState) => {
        if (
          fromIndex < 0 ||
          fromIndex >= state.fields.length ||
          toIndex < 0 ||
          toIndex >= state.fields.length ||
          fromIndex === toIndex
        ) {
          return;
        }

        const history = pushHistory(state);
        state.past = history.past;
        state.future = history.future;

        const [moved] = state.fields.splice(fromIndex, 1);
        state.fields.splice(toIndex, 0, moved);
        state.isDirty = true;
      })
    ),

  updateField: (id, updates) =>
    set(
      produce((state: BuilderState) => {
        const history = pushHistory(state);
        state.past = history.past;
        state.future = history.future;

        const field = state.fields.find((f) => f.id === id);
        if (!field) return;

        Object.assign(field, updates);
        state.isDirty = true;
      })
    ),

  selectField: (id) => set({ selectedFieldId: id }),

  setActiveStep: (step) => set({ activeStep: step }),

  undo: () =>
    set(
      produce((state: BuilderState) => {
        if (state.past.length === 0) return;

        const current: HistoryEntry = {
          fields: JSON.parse(JSON.stringify(state.fields)),
          selectedFieldId: state.selectedFieldId,
        };

        const previous = state.past.pop()!;
        state.future.push(current);
        state.fields = previous.fields;
        state.selectedFieldId = previous.selectedFieldId;
        state.isDirty = true;
      })
    ),

  redo: () =>
    set(
      produce((state: BuilderState) => {
        if (state.future.length === 0) return;

        const current: HistoryEntry = {
          fields: JSON.parse(JSON.stringify(state.fields)),
          selectedFieldId: state.selectedFieldId,
        };

        const next = state.future.pop()!;
        state.past.push(current);
        state.fields = next.fields;
        state.selectedFieldId = next.selectedFieldId;
        state.isDirty = true;
      })
    ),

  loadSurvey: (survey) =>
    set({
      fields: JSON.parse(JSON.stringify(survey.schema)),
      selectedFieldId: null,
      activeStep: 0,
      isDirty: false,
      surveyId: survey.id,
      surveyMeta: {
        orgId: survey.orgId,
        title: survey.title,
        description: survey.description,
        slug: survey.slug,
        type: survey.type,
        status: survey.status,
        settings: survey.settings,
        theme: survey.theme,
        multiStep: survey.multiStep,
        stepLabels: survey.stepLabels,
        version: survey.version,
      },
      past: [],
      future: [],
    }),

  saveSurvey: () => {
    const state = get();
    set({ isDirty: false });
    return {
      fields: JSON.parse(JSON.stringify(state.fields)),
      meta: state.surveyMeta,
    };
  },

  reset: () =>
    set({
      fields: [],
      selectedFieldId: null,
      activeStep: 0,
      isDirty: false,
      surveyId: null,
      surveyMeta: null,
      past: [],
      future: [],
    }),
}));
