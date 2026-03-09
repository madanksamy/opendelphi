"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Mic,
  MessageCircle,
  Wand2,
  Copy,
  ArrowRight,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EditableText } from "@/components/cms/EditableText";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/providers/UserProvider";

// ── Types ─────────────────────────────────────────────────────────────

interface GeneratedField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  description?: string;
  options?: Array<{ id: string; label: string; value: string }>;
  properties?: Record<string, unknown>;
  validation?: Record<string, unknown>;
}

interface GeneratedSurvey {
  title: string;
  description: string;
  fields: GeneratedField[];
  settings: {
    allowAnonymous: boolean;
    showProgressBar: boolean;
    showQuestionNumbers: boolean;
    confirmationMessage: string;
  };
  generatedAt: string;
}

// ── Static data ───────────────────────────────────────────────────────

const examplePrompts = [
  "Create a patient satisfaction survey for a cardiology clinic",
  "Design a 10-question employee engagement survey",
  "Build a post-event feedback form with rating scales",
  "Generate a product-market fit survey for a B2B SaaS",
];

// ── Component ─────────────────────────────────────────────────────────

export default function AiStudioPage() {
  const router = useRouter();
  const { user, orgId } = useUser();

  const [activeTab, setActiveTab] = useState("generate");
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [generating, setGenerating] = useState(false);
  const [generatedSurvey, setGeneratedSurvey] = useState<GeneratedSurvey | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [creatingSurvey, setCreatingSurvey] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setGenerateError(null);
    setGeneratedSurvey(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: prompt,
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Generation failed (${res.status})`);
      }

      const data: GeneratedSurvey = await res.json();
      setGeneratedSurvey(data);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCreateSurvey() {
    if (!generatedSurvey || !user || !orgId) return;
    setCreatingSurvey(true);

    try {
      const supabase = createClient();
      const slug = `${generatedSurvey.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}-${Date.now().toString(36)}`;

      const { data, error } = await supabase
        .from("surveys")
        .insert({
          org_id: orgId,
          created_by: user.id,
          title: generatedSurvey.title,
          description: generatedSurvey.description,
          slug,
          type: "standard",
          status: "draft",
          schema: { fields: generatedSurvey.fields },
          settings: generatedSurvey.settings,
          theme: {},
          multi_step: false,
          version: 1,
        })
        .select("id")
        .single();

      if (error) throw error;
      router.push(`/surveys/${data.id}/edit`);
    } catch (err) {
      console.error("Failed to create survey:", err);
      setCreatingSurvey(false);
    }
  }

  function handleCopy() {
    if (!generatedSurvey) return;
    navigator.clipboard.writeText(JSON.stringify(generatedSurvey, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <EditableText
            id="ai-studio-heading"
            defaultContent="AI Studio"
            as="h1"
            className="text-2xl font-bold text-foreground"
          />
          <Badge className="gap-1">
            <Sparkles className="h-3 w-3" />
            Beta
          </Badge>
        </div>
        <EditableText
          id="ai-studio-subheading"
          defaultContent="Generate surveys, use voice input, and get AI-powered support."
          as="p"
          className="mt-1 text-sm text-muted-foreground"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="gap-2">
            <Wand2 className="h-4 w-4" />
            Generate with AI
          </TabsTrigger>
          <TabsTrigger value="voice" className="gap-2">
            <Mic className="h-4 w-4" />
            Voice Mode
          </TabsTrigger>
          <TabsTrigger value="support" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            AI Chat
          </TabsTrigger>
        </TabsList>

        {/* ── Generate Tab ─────────────────────────────────────────── */}
        <TabsContent value="generate" className="space-y-6">
          {/* Input Section */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-card-foreground">
                  Describe your survey
                </label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the survey you want to create..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-input bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        handleGenerate();
                      }
                    }}
                  />
                </div>
              </div>

              {/* Example Prompts */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Try an example:
                </p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example) => (
                    <button
                      key={example}
                      onClick={() => setPrompt(example)}
                      className="rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model + Generate */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Model:</span>
                  <div className="flex rounded-lg border border-border">
                    {["gpt-4o", "claude", "gemini"].map((model) => (
                      <button
                        key={model}
                        onClick={() => setSelectedModel(model)}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                          selectedModel === model
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {model === "gpt-4o"
                          ? "GPT-4o"
                          : model === "claude"
                            ? "Claude"
                            : "Gemini"}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={generating || !prompt.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Survey
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {generateError && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
              <p className="text-sm text-red-700 dark:text-red-400">
                {generateError}
              </p>
            </div>
          )}

          {/* Generated Preview */}
          {generatedSurvey && (
            <div className="rounded-2xl border border-primary/20 bg-card">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-card-foreground">
                      Generated Survey
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {generatedSurvey.fields.length} question{generatedSurvey.fields.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCopy}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                  title="Copy JSON"
                >
                  {copied ? (
                    <span className="text-xs text-emerald-600">Copied!</span>
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="p-6">
                <h4 className="mb-1 text-base font-semibold text-card-foreground">
                  {generatedSurvey.title}
                </h4>
                {generatedSurvey.description && (
                  <p className="mb-4 text-sm text-muted-foreground">
                    {generatedSurvey.description}
                  </p>
                )}
                <div className="space-y-4">
                  {generatedSurvey.fields.map((field, i) => (
                    <div
                      key={field.id}
                      className="rounded-xl border border-border p-4"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {i + 1}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {field.type}
                        </Badge>
                        {field.required && (
                          <Badge variant="secondary" className="text-[10px]">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-card-foreground">
                        {field.label}
                      </p>
                      {field.options && (
                        <div className="mt-2 space-y-1">
                          {field.options.map((opt) => (
                            <div
                              key={opt.id}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                              <span className="h-3 w-3 rounded-full border border-border" />
                              {opt.label}
                            </div>
                          ))}
                        </div>
                      )}
                      {field.properties &&
                        "maxRating" in field.properties && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Scale: 1-{String(field.properties.maxRating)} stars
                          </p>
                        )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleCreateSurvey}
                    disabled={creatingSurvey || !user || !orgId}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {creatingSurvey ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Survey
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Voice Mode Tab ───────────────────────────────────────── */}
        <TabsContent value="voice" className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-12">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-muted p-6">
                <Mic className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-card-foreground">
                  Voice Mode
                </h3>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  Coming Soon
                </Badge>
              </div>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Describe your survey using your voice and let AI convert your
                words into a structured survey. This feature is currently in
                development and will be available soon.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* ── AI Chat Tab ──────────────────────────────────────────── */}
        <TabsContent value="support" className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-12">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-muted p-6">
                <MessageCircle className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-card-foreground">
                  AI Chat Assistant
                </h3>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  Coming Soon
                </Badge>
              </div>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Chat with an AI assistant to get help with your surveys,
                understand your data, and manage your account. This feature is
                currently in development and will be available soon.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
