"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

interface FieldChange {
  fieldId: string;
  originalValue: string;
  currentValue: string;
}

interface EditModeContextValue {
  isEditMode: boolean;
  toggleEditMode: () => void;
  isDirty: boolean;
  dirtyCount: number;
  save: () => Promise<void>;
  discard: () => void;
  registerChange: (fieldId: string, originalValue: string, currentValue: string) => void;
  removeChange: (fieldId: string) => void;
  getFieldValue: (fieldId: string) => string | undefined;
  subscribeToDiscard: (fieldId: string, callback: () => void) => () => void;
}

const EditModeContext = createContext<EditModeContextValue | null>(null);

export function useEditMode() {
  const ctx = useContext(EditModeContext);
  if (!ctx) {
    throw new Error("useEditMode must be used within an EditModeProvider");
  }
  return ctx;
}

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [changes, setChanges] = useState<Map<string, FieldChange>>(new Map());
  const discardListeners = useRef<Map<string, () => void>>(new Map());

  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  const registerChange = useCallback(
    (fieldId: string, originalValue: string, currentValue: string) => {
      setChanges((prev) => {
        const next = new Map(prev);
        if (currentValue === originalValue) {
          next.delete(fieldId);
        } else {
          next.set(fieldId, { fieldId, originalValue, currentValue });
        }
        return next;
      });
    },
    []
  );

  const removeChange = useCallback((fieldId: string) => {
    setChanges((prev) => {
      const next = new Map(prev);
      next.delete(fieldId);
      return next;
    });
  }, []);

  const getFieldValue = useCallback(
    (fieldId: string) => {
      return changes.get(fieldId)?.currentValue;
    },
    [changes]
  );

  const save = useCallback(async () => {
    if (changes.size === 0) return;

    const payload: Record<string, string> = {};
    changes.forEach((change) => {
      payload[change.fieldId] = change.currentValue;
    });

    // eslint-disable-next-line no-console
    console.log("[CMS] Saving changes:", payload);

    // In production, this would POST to an API endpoint:
    // await fetch("/api/cms/save", { method: "POST", body: JSON.stringify(payload) });

    setChanges(new Map());
  }, [changes]);

  const discard = useCallback(() => {
    setChanges(new Map());
    discardListeners.current.forEach((callback) => callback());
  }, []);

  const subscribeToDiscard = useCallback(
    (fieldId: string, callback: () => void) => {
      discardListeners.current.set(fieldId, callback);
      return () => {
        discardListeners.current.delete(fieldId);
      };
    },
    []
  );

  const value = useMemo<EditModeContextValue>(
    () => ({
      isEditMode,
      toggleEditMode,
      isDirty: changes.size > 0,
      dirtyCount: changes.size,
      save,
      discard,
      registerChange,
      removeChange,
      getFieldValue,
      subscribeToDiscard,
    }),
    [
      isEditMode,
      toggleEditMode,
      changes,
      save,
      discard,
      registerChange,
      removeChange,
      getFieldValue,
      subscribeToDiscard,
    ]
  );

  return (
    <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>
  );
}
