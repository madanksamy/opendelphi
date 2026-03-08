"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pencil, Check, X, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditMode } from "./EditModeProvider";

type HtmlTagName =
  | "span"
  | "p"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "div"
  | "label"
  | "li";

interface EditableTextProps {
  id: string;
  defaultContent: string;
  as?: HtmlTagName;
  className?: string;
  multiline?: boolean;
}

export function EditableText({
  id,
  defaultContent,
  as: Tag = "span",
  className,
  multiline = false,
}: EditableTextProps) {
  const {
    isEditMode,
    registerChange,
    removeChange,
    getFieldValue,
    subscribeToDiscard,
  } = useEditMode();

  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [draft, setDraft] = useState(defaultContent);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiInput, setShowAiInput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const savedValue = getFieldValue(id);
  const displayValue = savedValue ?? defaultContent;

  useEffect(() => {
    const unsubscribe = subscribeToDiscard(id, () => {
      setDraft(defaultContent);
      setIsEditing(false);
      setShowAiInput(false);
    });
    return unsubscribe;
  }, [id, defaultContent, subscribeToDiscard]);

  useEffect(() => {
    if (!isEditMode) {
      setIsEditing(false);
      setShowAiInput(false);
    }
  }, [isEditMode]);

  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    if (isEditing) {
      autoResize();
    }
  }, [isEditing, draft, autoResize]);

  const startEditing = useCallback(() => {
    if (!isEditMode) return;
    setDraft(displayValue);
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }, 0);
  }, [isEditMode, displayValue]);

  const confirmEdit = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== defaultContent) {
      registerChange(id, defaultContent, trimmed);
    } else if (trimmed === defaultContent) {
      removeChange(id);
    }
    setIsEditing(false);
    setShowAiInput(false);
  }, [draft, defaultContent, id, registerChange, removeChange]);

  const cancelEdit = useCallback(() => {
    setDraft(displayValue);
    setIsEditing(false);
    setShowAiInput(false);
  }, [displayValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !multiline) {
        e.preventDefault();
        confirmEdit();
      }
      if (e.key === "Enter" && e.metaKey) {
        e.preventDefault();
        confirmEdit();
      }
      if (e.key === "Escape") {
        cancelEdit();
      }
    },
    [multiline, confirmEdit, cancelEdit]
  );

  const handleAiGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);

    // Mock AI generation - in production this would call an API
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const mockResponses: Record<string, string> = {
      shorter: draft.split(".")[0] + ".",
      formal: draft.charAt(0).toUpperCase() + draft.slice(1),
      exciting: draft.replace(/\./g, "!"),
    };

    const key = aiPrompt.toLowerCase();
    const generated =
      mockResponses[key] ||
      `${aiPrompt.charAt(0).toUpperCase()}${aiPrompt.slice(1)}: ${draft.slice(0, 60)}...`;

    setDraft(generated);
    setIsGenerating(false);
    setShowAiInput(false);
    setAiPrompt("");
  }, [aiPrompt, draft]);

  if (!isEditMode) {
    return React.createElement(
      Tag,
      { className },
      displayValue
    );
  }

  if (isEditing) {
    return (
      <div ref={containerRef} className="relative inline-block w-full">
        <div className="rounded-lg border-2 border-primary bg-background p-1 shadow-lg shadow-primary/10">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={multiline ? 3 : 1}
            className={cn(
              "w-full resize-none bg-transparent px-2 py-1 text-foreground outline-none",
              !multiline && "overflow-hidden whitespace-nowrap",
              className
            )}
            style={{ fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit", lineHeight: "inherit", letterSpacing: "inherit" }}
          />
          <div className="flex items-center gap-1.5 border-t border-border px-1 pt-1.5">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1 px-2 text-xs text-primary hover:bg-primary/10 hover:text-primary"
              onClick={confirmEdit}
            >
              <Check className="h-3.5 w-3.5" />
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={cancelEdit}
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <div className="mx-1 h-4 w-px bg-border" />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1 px-2 text-xs text-violet-500 hover:bg-violet-500/10 hover:text-violet-600"
              onClick={() => setShowAiInput((prev) => !prev)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Write
            </Button>
          </div>
          {showAiInput && (
            <div className="flex items-center gap-1.5 border-t border-border px-1 pt-1.5">
              <Input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe what you want..."
                className="h-7 flex-1 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAiGenerate();
                  }
                  if (e.key === "Escape") {
                    setShowAiInput(false);
                    setAiPrompt("");
                  }
                }}
              />
              <Button
                size="sm"
                variant="default"
                className="h-7 gap-1 px-2.5 text-xs"
                onClick={handleAiGenerate}
                disabled={isGenerating || !aiPrompt.trim()}
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Generate
              </Button>
            </div>
          )}
        </div>
        <div className="mt-1 text-right text-[10px] text-muted-foreground">
          {multiline ? "Cmd+Enter to save" : "Enter to save"} / Esc to cancel
        </div>
      </div>
    );
  }

  return (
    <div
      className="group/editable relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={startEditing}
    >
      {React.createElement(
        Tag,
        {
          className: cn(
            className,
            "cursor-pointer rounded-sm transition-all",
            "ring-offset-background",
            isHovered && "ring-2 ring-primary/30 ring-offset-2"
          ),
          onClick: startEditing,
        },
        displayValue
      )}
      {isHovered && (
        <span className="pointer-events-none absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <Pencil className="h-2.5 w-2.5" />
        </span>
      )}
    </div>
  );
}
