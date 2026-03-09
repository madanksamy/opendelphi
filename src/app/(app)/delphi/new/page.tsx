"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  X,
  Loader2,
  Users,
  Target,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/providers/UserProvider";

interface QuestionDraft {
  id: string;
  label: string;
  type: "text" | "rating" | "select";
  options?: string[];
}

export default function NewDelphiStudyPage() {
  const router = useRouter();
  const { orgId } = useUser();
  const supabase = useMemo(() => createClient(), []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [consensusThreshold, setConsensusThreshold] = useState(70);
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    { id: "q1", label: "", type: "text" },
  ]);
  const [panelists, setPanelists] = useState<string[]>([]);
  const [panelistInput, setPanelistInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addQuestion = useCallback(() => {
    setQuestions((prev) => [
      ...prev,
      { id: `q${Date.now()}`, label: "", type: "text" },
    ]);
  }, []);

  const removeQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const updateQuestion = useCallback(
    (id: string, updates: Partial<QuestionDraft>) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
      );
    },
    []
  );

  const addPanelist = useCallback(() => {
    const emails = panelistInput
      .split(/[,;\s]+/)
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));
    if (emails.length === 0) return;
    setPanelists((prev) => {
      const existing = new Set(prev);
      return [...prev, ...emails.filter((e) => !existing.has(e))];
    });
    setPanelistInput("");
  }, [panelistInput]);

  const removePanelist = useCallback((email: string) => {
    setPanelists((prev) => prev.filter((e) => e !== email));
  }, []);

  const handleCreate = useCallback(async () => {
    if (!orgId || !title.trim()) return;

    setCreating(true);
    setError(null);

    try {
      // Build schema from questions
      const schema = questions
        .filter((q) => q.label.trim())
        .map((q, i) => ({
          id: `q${i + 1}`,
          type: q.type,
          label: q.label,
          required: true,
          properties: q.type === "rating" ? { maxRating: 5 } : {},
          ...(q.type === "select" && q.options
            ? {
                options: q.options.map((opt, j) => ({
                  id: `o${j + 1}`,
                  label: opt,
                  value: opt.toLowerCase().replace(/\s+/g, "-"),
                })),
              }
            : {}),
        }));

      // Create the survey with type "delphi"
      const { data: survey, error: surveyError } = await supabase
        .from("surveys")
        .insert({
          org_id: orgId,
          title: title.trim(),
          description: description.trim() || null,
          type: "delphi",
          status: "draft",
          schema,
          settings: {
            consensusThreshold,
            allowAnonymous: false,
            requireAuth: true,
          },
          slug: title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") +
            "-" +
            Date.now().toString(36),
        })
        .select("id")
        .single();

      if (surveyError) throw surveyError;

      // Create the first round
      const { error: roundError } = await supabase
        .from("delphi_rounds")
        .insert({
          survey_id: survey.id,
          round_number: 1,
          status: "draft",
          consensus_threshold: consensusThreshold / 100,
        });

      if (roundError) throw roundError;

      // Add panelists
      if (panelists.length > 0) {
        const panelistRows = panelists.map((email) => ({
          survey_id: survey.id,
          email,
          name: null,
          expertise: null,
          token: crypto.randomUUID(),
          status: "invited",
          invited_at: new Date().toISOString(),
        }));

        const { error: panelistError } = await supabase
          .from("delphi_panelists")
          .insert(panelistRows);

        if (panelistError) throw panelistError;
      }

      router.push(`/delphi/${survey.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create study";
      setError(message);
      setCreating(false);
    }
  }, [
    orgId,
    title,
    description,
    consensusThreshold,
    questions,
    panelists,
    supabase,
    router,
  ]);

  const isValid = title.trim().length > 0 && questions.some((q) => q.label.trim());

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {/* Header */}
      <div>
        <Link
          href="/delphi"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Delphi Studies
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          New Delphi Study
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a multi-round expert consensus study.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Study Details</CardTitle>
              <CardDescription>
                Basic information about your Delphi study
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Study title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Future of AI in Healthcare"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose and goals of this study..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="threshold">
              Consensus threshold: {consensusThreshold}%
            </Label>
            <input
              id="threshold"
              type="range"
              min={50}
              max={95}
              step={5}
              value={consensusThreshold}
              onChange={(e) => setConsensusThreshold(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50% (lenient)</span>
              <span>95% (strict)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">
                  Round 1 Questions
                </CardTitle>
                <CardDescription>
                  Questions for the first round of consensus
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={addQuestion}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="flex items-start gap-3 rounded-lg border border-border p-3"
            >
              <span className="mt-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {idx + 1}
              </span>
              <div className="flex-1 space-y-2">
                <Input
                  value={q.label}
                  onChange={(e) =>
                    updateQuestion(q.id, { label: e.target.value })
                  }
                  placeholder="Enter your question..."
                />
                <Select
                  value={q.type}
                  onValueChange={(v) =>
                    updateQuestion(q.id, {
                      type: v as QuestionDraft["type"],
                    })
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Open text</SelectItem>
                    <SelectItem value="rating">Rating (1-5)</SelectItem>
                    <SelectItem value="select">Single choice</SelectItem>
                  </SelectContent>
                </Select>
                {q.type === "select" && (
                  <div className="space-y-1">
                    <Label className="text-xs">
                      Options (comma separated)
                    </Label>
                    <Input
                      value={q.options?.join(", ") ?? ""}
                      onChange={(e) =>
                        updateQuestion(q.id, {
                          options: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Option A, Option B, Option C"
                    />
                  </div>
                )}
              </div>
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(q.id)}
                  className="mt-2.5 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Panelists */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Expert Panel</CardTitle>
              <CardDescription>
                Invite experts to participate (you can add more later)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={panelistInput}
              onChange={(e) => setPanelistInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPanelist();
                }
              }}
              placeholder="Enter email addresses (comma separated)"
              className="flex-1"
            />
            <Button variant="outline" onClick={addPanelist}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>
          {panelists.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {panelists.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
                >
                  {email}
                  <button
                    onClick={() => removePanelist(email)}
                    className="ml-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <span className="self-center text-xs text-muted-foreground">
                {panelists.length} panelist{panelists.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          {panelists.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No panelists added yet. You can invite experts after creating the
              study.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Create Button */}
      <div className="flex items-center justify-end gap-3">
        <Link href="/delphi">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button
          onClick={handleCreate}
          disabled={creating || !isValid}
        >
          {creating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {creating ? "Creating..." : "Create Study"}
        </Button>
      </div>
    </div>
  );
}
