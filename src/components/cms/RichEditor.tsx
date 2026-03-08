"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Link2,
  List,
  ListOrdered,
  Heading2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface RichEditorProps {
  initialHtml: string;
  onChange: (html: string) => void;
  className?: string;
  placeholder?: string;
}

interface ToolbarButton {
  command: string;
  icon: React.ReactNode;
  label: string;
  value?: string;
}

export function RichEditor({
  initialHtml,
  onChange,
  className,
  placeholder = "Start typing...",
}: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  const toolbarButtons: ToolbarButton[] = [
    { command: "bold", icon: <Bold className="h-4 w-4" />, label: "Bold" },
    { command: "italic", icon: <Italic className="h-4 w-4" />, label: "Italic" },
    {
      command: "underline",
      icon: <Underline className="h-4 w-4" />,
      label: "Underline",
    },
    {
      command: "createLink",
      icon: <Link2 className="h-4 w-4" />,
      label: "Link",
    },
    {
      command: "insertUnorderedList",
      icon: <List className="h-4 w-4" />,
      label: "Bullet List",
    },
    {
      command: "insertOrderedList",
      icon: <ListOrdered className="h-4 w-4" />,
      label: "Numbered List",
    },
    {
      command: "formatBlock",
      icon: <Heading2 className="h-4 w-4" />,
      label: "Heading",
      value: "H2",
    },
  ];

  const checkActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    if (document.queryCommandState("bold")) formats.add("bold");
    if (document.queryCommandState("italic")) formats.add("italic");
    if (document.queryCommandState("underline")) formats.add("underline");
    if (document.queryCommandState("insertUnorderedList"))
      formats.add("insertUnorderedList");
    if (document.queryCommandState("insertOrderedList"))
      formats.add("insertOrderedList");

    const block = document.queryCommandValue("formatBlock");
    if (block && block.toLowerCase() === "h2") formats.add("formatBlock");

    // Check if cursor is inside a link
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.anchorNode;
      while (node && node !== editorRef.current) {
        if (node instanceof HTMLAnchorElement) {
          formats.add("createLink");
          break;
        }
        node = node.parentNode;
      }
    }

    setActiveFormats(formats);
  }, []);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = initialHtml;
    }
  }, [initialHtml]);

  const handleCommand = useCallback(
    (command: string, value?: string) => {
      if (command === "createLink") {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          let node: Node | null = sel.anchorNode;
          let existingLink: HTMLAnchorElement | null = null;
          while (node && node !== editorRef.current) {
            if (node instanceof HTMLAnchorElement) {
              existingLink = node;
              break;
            }
            node = node.parentNode;
          }

          if (existingLink) {
            document.execCommand("unlink");
          } else {
            const url = window.prompt("Enter URL:");
            if (url) {
              document.execCommand("createLink", false, url);
            }
          }
        }
      } else if (command === "formatBlock") {
        const current = document.queryCommandValue("formatBlock");
        if (current && current.toLowerCase() === (value || "h2").toLowerCase()) {
          document.execCommand("formatBlock", false, "P");
        } else {
          document.execCommand("formatBlock", false, value || "H2");
        }
      } else {
        document.execCommand(command, false, value);
      }

      checkActiveFormats();
      editorRef.current?.focus();
    },
    [checkActiveFormats]
  );

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    checkActiveFormats();
  }, [onChange, checkActiveFormats]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleCommand("bold");
      }
      if (e.key === "i" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleCommand("italic");
      }
      if (e.key === "u" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleCommand("underline");
      }
    },
    [handleCommand]
  );

  return (
    <div className={cn("rounded-lg border border-border bg-background", className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
        {toolbarButtons.map((btn) => (
          <button
            key={btn.command}
            type="button"
            title={btn.label}
            onMouseDown={(e) => {
              e.preventDefault();
              handleCommand(btn.command, btn.value);
            }}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
              activeFormats.has(btn.command)
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {btn.icon}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onMouseUp={checkActiveFormats}
        onKeyUp={checkActiveFormats}
        data-placeholder={placeholder}
        className={cn(
          "min-h-[120px] px-3 py-2 text-sm text-foreground outline-none",
          "[&:empty]:before:pointer-events-none [&:empty]:before:text-muted-foreground [&:empty]:before:content-[attr(data-placeholder)]",
          "[&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold",
          "[&_a]:text-primary [&_a]:underline",
          "[&_ul]:ml-4 [&_ul]:list-disc [&_ol]:ml-4 [&_ol]:list-decimal",
          "[&_li]:my-0.5"
        )}
      />
    </div>
  );
}
