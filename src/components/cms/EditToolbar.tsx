"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Pencil,
  Eye,
  Save,
  Undo2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { useEditMode } from "./EditModeProvider";

export function EditToolbar() {
  const { isEditMode, toggleEditMode, isDirty, dirtyCount, save, discard } =
    useEditMode();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveFlash, setShowSaveFlash] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        toggleEditMode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s" && isEditMode) {
        e.preventDefault();
        if (isDirty) {
          handleSave();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, isDirty, toggleEditMode]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    await save();
    setIsSaving(false);
    setShowSaveFlash(true);
    setTimeout(() => setShowSaveFlash(false), 2000);
  }, [save]);

  const handleDiscard = useCallback(() => {
    if (
      dirtyCount > 0 &&
      !window.confirm(
        `Discard ${dirtyCount} unsaved change${dirtyCount === 1 ? "" : "s"}?`
      )
    ) {
      return;
    }
    discard();
  }, [discard, dirtyCount]);

  if (isCollapsed) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setIsCollapsed(false)}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110",
            isEditMode
              ? "bg-primary text-primary-foreground"
              : "bg-card text-card-foreground border border-border"
          )}
          title="Expand CMS toolbar"
        >
          {isEditMode ? (
            <Pencil className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
          {isDirty && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
              {dirtyCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Save flash notification */}
      {showSaveFlash && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
          Changes saved successfully
        </div>
      )}

      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/95 p-2 shadow-xl backdrop-blur-sm">
        {/* Toggle edit mode */}
        <Button
          onClick={toggleEditMode}
          variant={isEditMode ? "default" : "outline"}
          size="sm"
          className={cn(
            "gap-2 rounded-xl transition-all",
            isEditMode && "bg-primary text-primary-foreground shadow-md shadow-primary/25"
          )}
        >
          {isEditMode ? (
            <>
              <Eye className="h-4 w-4" />
              Preview
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" />
              Edit
            </>
          )}
        </Button>

        {/* Save and Discard - only show in edit mode */}
        {isEditMode && (
          <>
            <div className="h-6 w-px bg-border" />

            <Button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              variant="ghost"
              size="sm"
              className={cn(
                "relative gap-2 rounded-xl",
                isDirty && "text-primary hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Save className="h-4 w-4" />
              Save
              {isDirty && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                  {dirtyCount}
                </span>
              )}
            </Button>

            <Button
              onClick={handleDiscard}
              disabled={!isDirty}
              variant="ghost"
              size="sm"
              className="gap-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Undo2 className="h-4 w-4" />
              Discard
            </Button>
          </>
        )}

        {/* Collapse */}
        <div className="h-6 w-px bg-border" />
        <Button
          onClick={() => setIsCollapsed(true)}
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl text-muted-foreground"
          title="Minimize toolbar"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Keyboard shortcut hint */}
      {!isEditMode && (
        <div className="mt-1.5 text-center text-[10px] text-muted-foreground/60">
          Ctrl+E to toggle edit mode
        </div>
      )}
    </div>
  );
}
