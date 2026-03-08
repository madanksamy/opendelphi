"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  Upload,
  Sparkles,
  Link2,
  X,
  Loader2,
  Crosshair,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditMode } from "./EditModeProvider";

interface EditableImageProps {
  id: string;
  defaultSrc: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

type PanelTab = "upload" | "ai" | "url";

export function EditableImage({
  id,
  defaultSrc,
  alt,
  width,
  height,
  className,
}: EditableImageProps) {
  const {
    isEditMode,
    registerChange,
    removeChange,
    getFieldValue,
    subscribeToDiscard,
  } = useEditMode();

  const [isHovered, setIsHovered] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>("upload");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [focalPoint, setFocalPoint] = useState<{ x: number; y: number }>({
    x: 50,
    y: 50,
  });
  const [showFocalPicker, setShowFocalPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const savedValue = getFieldValue(id);
  const displaySrc = previewSrc ?? savedValue ?? defaultSrc;

  useEffect(() => {
    const unsubscribe = subscribeToDiscard(id, () => {
      setPreviewSrc(null);
      setShowPanel(false);
      setShowFocalPicker(false);
    });
    return unsubscribe;
  }, [id, subscribeToDiscard]);

  useEffect(() => {
    if (!isEditMode) {
      setShowPanel(false);
      setShowFocalPicker(false);
    }
  }, [isEditMode]);

  useEffect(() => {
    if (!showPanel) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        imageContainerRef.current &&
        !imageContainerRef.current.contains(e.target as Node)
      ) {
        setShowPanel(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPanel]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setPreviewSrc(dataUrl);
        registerChange(id, defaultSrc, dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [id, defaultSrc, registerChange]
  );

  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) return;
    setPreviewSrc(urlInput.trim());
    registerChange(id, defaultSrc, urlInput.trim());
    setUrlInput("");
  }, [urlInput, id, defaultSrc, registerChange]);

  const handleAiGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);

    // Mock AI image generation - in production, call an image generation API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Use a placeholder SVG as mock result
    const mockSvg = `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect fill="#6366f1" width="400" height="300" rx="12"/>
        <text x="200" y="140" text-anchor="middle" fill="white" font-size="16" font-family="system-ui">AI Generated</text>
        <text x="200" y="170" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="12" font-family="system-ui">${aiPrompt.slice(0, 40)}</text>
      </svg>`
    )}`;

    setPreviewSrc(mockSvg);
    registerChange(id, defaultSrc, mockSvg);
    setIsGenerating(false);
    setAiPrompt("");
  }, [aiPrompt, id, defaultSrc, registerChange]);

  const handleRevert = useCallback(() => {
    setPreviewSrc(null);
    removeChange(id);
    setShowPanel(false);
  }, [id, removeChange]);

  const handleFocalPointClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!showFocalPicker) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      setFocalPoint({ x, y });
    },
    [showFocalPicker]
  );

  if (!isEditMode) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={displaySrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{ objectPosition: `${focalPoint.x}% ${focalPoint.y}%` }}
      />
    );
  }

  const tabs: { key: PanelTab; label: string; icon: React.ReactNode }[] = [
    { key: "upload", label: "Upload", icon: <Upload className="h-3.5 w-3.5" /> },
    { key: "ai", label: "AI Generate", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { key: "url", label: "URL", icon: <Link2 className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="relative inline-block">
      <div
        ref={imageContainerRef}
        className="group/image relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          if (showFocalPicker) {
            handleFocalPointClick(e);
          } else {
            setShowPanel((prev) => !prev);
          }
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displaySrc}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            className,
            "transition-all",
            isHovered && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
          )}
          style={{ objectPosition: `${focalPoint.x}% ${focalPoint.y}%` }}
        />
        {isHovered && !showFocalPicker && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity">
            <div className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-sm font-medium text-gray-800 shadow-lg">
              <ImagePlus className="h-4 w-4" />
              Replace Image
            </div>
          </div>
        )}
        {showFocalPicker && (
          <div className="absolute inset-0 cursor-crosshair bg-black/20">
            <div
              className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg"
              style={{
                left: `${focalPoint.x}%`,
                top: `${focalPoint.y}%`,
                background: "rgba(99,102,241,0.6)",
              }}
            >
              <Crosshair className="h-full w-full p-0.5 text-white" />
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-black/70 px-2.5 py-1 text-xs text-white">
              Click to set focal point ({focalPoint.x}%, {focalPoint.y}%)
            </div>
          </div>
        )}
      </div>

      {showPanel && (
        <div
          ref={panelRef}
          className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-card-foreground">
              Edit Image
            </h4>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={showFocalPicker ? "default" : "ghost"}
                className="h-7 gap-1 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFocalPicker((prev) => !prev);
                }}
              >
                <Crosshair className="h-3.5 w-3.5" />
                Focal
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPanel(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mb-3 flex gap-1 rounded-lg border border-border bg-muted/50 p-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  activeTab === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "upload" && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Choose File
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                JPG, PNG, SVG, or WebP. Max 5MB.
              </p>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-2">
              <Input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe the image you want..."
                className="text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAiGenerate();
                  }
                }}
              />
              <Button
                className="w-full gap-2"
                onClick={handleAiGenerate}
                disabled={isGenerating || !aiPrompt.trim()}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isGenerating ? "Generating..." : "Generate Image"}
              </Button>
            </div>
          )}

          {activeTab === "url" && (
            <div className="space-y-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleUrlSubmit();
                  }
                }}
              />
              <Button
                className="w-full gap-2"
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim()}
              >
                <Link2 className="h-4 w-4" />
                Load Image
              </Button>
            </div>
          )}

          {previewSrc && (
            <div className="mt-3 border-t border-border pt-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-destructive"
                onClick={handleRevert}
              >
                Revert to Original
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
