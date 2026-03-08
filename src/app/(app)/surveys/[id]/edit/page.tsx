"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useBuilderStore } from "@/stores/builder-store";
import { Builder } from "@/components/form-builder/Builder";
import type { Survey } from "@/lib/schema/survey";
import { v4 as uuidv4 } from "uuid";

// Mock survey loader - in production, this would fetch from API
function useSurvey(id: string) {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setSurvey({
        id,
        orgId: uuidv4(),
        title: "Untitled Survey",
        description: "",
        slug: `survey-${id.slice(0, 8)}`,
        type: "survey",
        status: "draft",
        schema: [],
        settings: {
          allowAnonymous: true,
          requireAuth: false,
          showProgressBar: true,
          showQuestionNumbers: true,
          shuffleQuestions: false,
          notifyOnResponse: false,
        },
        theme: {
          primaryColor: "#6366f1",
          backgroundColor: "#ffffff",
          fontFamily: "Inter",
          borderRadius: 8,
        },
        multiStep: false,
        stepLabels: [],
        version: 1,
      });
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [id]);

  return { survey, loading, setSurvey };
}

export default function EditSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { survey, loading, setSurvey } = useSurvey(id);
  const { loadSurvey, isDirty, saveSurvey } = useBuilderStore();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [multiStep, setMultiStep] = useState(false);
  const [stepLabels, setStepLabels] = useState<string[]>([]);

  // Load survey into builder store
  useEffect(() => {
    if (survey) {
      loadSurvey(survey);
      setMultiStep(survey.multiStep);
      setStepLabels(survey.stepLabels || []);
    }
  }, [survey, loadSurvey]);

  // Auto-save after 3 seconds of inactivity
  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 3000);

    return () => clearTimeout(timer);
  }, [isDirty]);

  const handleSave = useCallback(() => {
    setSaveState("saving");
    const data = saveSurvey();

    // Simulate API save
    setTimeout(() => {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    }, 500);
  }, [saveSurvey]);

  const handlePublish = useCallback(() => {
    handleSave();
    // In production: update status to published via API
  }, [handleSave]);

  const handleUpdateMeta = useCallback(
    (meta: { multiStep?: boolean; stepLabels?: string[] }) => {
      if (meta.multiStep !== undefined) setMultiStep(meta.multiStep);
      if (meta.stepLabels !== undefined) setStepLabels(meta.stepLabels);
    },
    []
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Survey not found</p>
        <Link href="/surveys">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Surveys
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-2">
        <div className="flex items-center gap-3">
          <Link href="/surveys">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-sm font-semibold">{survey.title}</h2>
            <p className="text-[10px] text-muted-foreground">
              {survey.type} &middot; {survey.status}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SaveIndicator state={saveState} />
        </div>
      </div>

      {/* Builder */}
      <div className="flex-1 overflow-hidden">
        <Builder
          surveyTitle={survey.title}
          surveyDescription={survey.description}
          multiStep={multiStep}
          stepLabels={stepLabels}
          onSave={handleSave}
          onPublish={handlePublish}
          onUpdateMeta={handleUpdateMeta}
        />
      </div>
    </div>
  );
}

function SaveIndicator({ state }: { state: "idle" | "saving" | "saved" }) {
  if (state === "idle") return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all",
        state === "saving" && "text-muted-foreground",
        state === "saved" && "text-green-600"
      )}
    >
      {state === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {state === "saved" && (
        <>
          <Check className="h-3 w-3" />
          <span>Saved</span>
        </>
      )}
    </div>
  );
}
