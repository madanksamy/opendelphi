"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useBuilderStore } from "@/stores/builder-store";
import { Builder } from "@/components/form-builder/Builder";
import type { Survey } from "@/lib/schema/survey";
import { createClient } from "@/lib/supabase/client";

// Map DB row (snake_case) to Survey type (camelCase)
function dbToSurvey(row: Record<string, unknown>): Survey {
  return {
    id: row.id as string,
    orgId: row.org_id as string,
    title: row.title as string,
    description: (row.description as string) || "",
    slug: row.slug as string,
    type: (row.type as Survey["type"]) || "survey",
    status: (row.status as Survey["status"]) || "draft",
    schema: (row.schema as Survey["schema"]) || [],
    settings: (row.settings as Survey["settings"]) || undefined,
    theme: (row.theme as Survey["theme"]) || undefined,
    multiStep: (row.multi_step as boolean) || false,
    stepLabels: (row.step_labels as string[]) || [],
    version: (row.version as number) || 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    publishedAt: row.published_at as string | undefined,
    createdBy: row.created_by as string | undefined,
  };
}

function useSurvey(id: string) {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setSurvey(dbToSurvey(data));
      setLoading(false);
    }
    load();
  }, [id, supabase]);

  return { survey, loading, notFound, setSurvey };
}

export default function EditSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { survey, loading, notFound, setSurvey } = useSurvey(id);
  const { loadSurvey, isDirty, saveSurvey } = useBuilderStore();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [multiStep, setMultiStep] = useState(false);
  const [stepLabels, setStepLabels] = useState<string[]>([]);
  const supabase = createClient();

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

  const handleSave = useCallback(async () => {
    setSaveState("saving");
    const data = saveSurvey();

    const { error } = await supabase
      .from("surveys")
      .update({
        schema: data.fields,
        title: data.meta?.title || survey?.title,
        description: data.meta?.description || survey?.description,
        settings: data.meta?.settings || survey?.settings,
        theme: data.meta?.theme || survey?.theme,
        multi_step: multiStep,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Save failed:", error.message);
      setSaveState("idle");
    } else {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    }
  }, [saveSurvey, supabase, id, survey, multiStep]);

  const handlePublish = useCallback(async () => {
    await handleSave();
    const { error } = await supabase
      .from("surveys")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (!error && survey) {
      setSurvey({ ...survey, status: "published" });
    }
  }, [handleSave, supabase, id, survey, setSurvey]);

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

  if (notFound || !survey) {
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
