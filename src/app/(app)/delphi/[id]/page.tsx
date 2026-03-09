"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  BarChart3,
  Target,
  TrendingUp,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/providers/UserProvider";
import { ConsensusGauge } from "@/components/delphi/ConsensusGauge";
import {
  RoundManager,
  type DelphiRound,
  type RoundQuestion,
} from "@/components/delphi/RoundManager";
import {
  PanelManager,
  type Panelist,
} from "@/components/delphi/PanelManager";
import { RoundComparison } from "@/components/delphi/RoundComparison";

// ── Types ──────────────────────────────────────────────────────────────

interface Survey {
  id: string;
  title: string;
  description: string | null;
  status: string;
  schema: SurveyField[] | null;
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

interface SurveyField {
  id?: string;
  label?: string;
  type?: string;
  [key: string]: unknown;
}

interface RoundRow {
  id: string;
  survey_id: string;
  round_number: number;
  status: string;
  consensus_threshold: number;
  summary: Record<string, unknown> | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

interface PanelistRow {
  id: string;
  survey_id: string;
  email: string;
  name: string | null;
  expertise: string | null;
  token: string;
  status: string;
  invited_at: string | null;
  created_at: string;
}

interface ResponseRow {
  id: string;
  survey_id: string;
  delphi_round_id: string;
  panelist_id: string | null;
  answers: Record<string, unknown>;
  status: string;
  created_at: string;
  completed_at: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const statusBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  completed: "secondary",
  draft: "outline",
};

/**
 * Compute per-question consensus from responses for a given round.
 * For each question (schema field), looks at the answers and calculates
 * the percentage of the most common answer.
 */
function computeQuestionConsensus(
  fields: SurveyField[],
  responses: ResponseRow[]
): RoundQuestion[] {
  if (fields.length === 0) return [];

  return fields.map((field, idx) => {
    const fieldKey = field.id ?? field.label ?? `q${idx}`;
    const answersForField: unknown[] = [];

    for (const resp of responses) {
      const val = resp.answers?.[fieldKey];
      if (val !== undefined && val !== null && val !== "") {
        answersForField.push(val);
      }
    }

    if (answersForField.length === 0) {
      return {
        id: fieldKey,
        text: field.label ?? `Question ${idx + 1}`,
        consensusPercent: 0,
        responseCount: 0,
      };
    }

    // Tally frequencies
    const freq = new Map<string, number>();
    for (const a of answersForField) {
      const key = String(a);
      freq.set(key, (freq.get(key) ?? 0) + 1);
    }

    const maxFreq = Math.max(...freq.values());
    const consensusPercent = Math.round(
      (maxFreq / answersForField.length) * 100
    );

    return {
      id: fieldKey,
      text: field.label ?? `Question ${idx + 1}`,
      consensusPercent,
      responseCount: answersForField.length,
    };
  });
}

// ── Page ───────────────────────────────────────────────────────────────

export default function DelphiStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { orgId } = useUser();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [rounds, setRounds] = useState<DelphiRound[]>([]);
  const [panelists, setPanelists] = useState<Panelist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [mutating, setMutating] = useState(false);

  const supabase = createClient();

  // ── Data fetching ──────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Fetch survey
    const { data: surveyData, error: surveyErr } = await supabase
      .from("surveys")
      .select("id, title, description, status, schema, settings, created_at, updated_at")
      .eq("id", id)
      .eq("type", "delphi")
      .single();

    if (surveyErr || !surveyData) {
      setError(surveyErr?.message ?? "Survey not found");
      setLoading(false);
      return;
    }

    setSurvey(surveyData as Survey);

    // Fetch rounds
    const { data: roundRows } = await supabase
      .from("delphi_rounds")
      .select("*")
      .eq("survey_id", id)
      .order("round_number", { ascending: true });

    const typedRounds = (roundRows ?? []) as RoundRow[];

    // Fetch panelists
    const { data: panelistRows } = await supabase
      .from("delphi_panelists")
      .select("*")
      .eq("survey_id", id)
      .order("created_at", { ascending: true });

    const typedPanelists = (panelistRows ?? []) as PanelistRow[];

    // Fetch all responses for this survey
    const { data: responseRows } = await supabase
      .from("responses")
      .select("*")
      .eq("survey_id", id);

    const typedResponses = (responseRows ?? []) as ResponseRow[];

    // Group responses by round
    const responsesByRound = new Map<string, ResponseRow[]>();
    for (const resp of typedResponses) {
      if (!resp.delphi_round_id) continue;
      const existing = responsesByRound.get(resp.delphi_round_id) ?? [];
      existing.push(resp);
      responsesByRound.set(resp.delphi_round_id, existing);
    }

    // Build schema fields array
    const fields: SurveyField[] = Array.isArray(surveyData.schema)
      ? (surveyData.schema as SurveyField[])
      : [];

    // Map rounds to component format
    const totalPanelists = typedPanelists.filter(
      (p) => p.status === "accepted" || p.status === "invited"
    ).length;

    const mappedRounds: DelphiRound[] = typedRounds.map((r) => {
      const roundResponses = responsesByRound.get(r.id) ?? [];
      const questions = computeQuestionConsensus(fields, roundResponses);

      return {
        id: r.id,
        number: r.round_number,
        status: r.status as DelphiRound["status"],
        startDate: r.starts_at,
        endDate: r.ends_at,
        responseCount: roundResponses.length,
        totalPanelists,
        questions,
      };
    });

    setRounds(mappedRounds);

    // Map panelists — determine response status from latest active/completed round
    const latestActiveRound = typedRounds.find((r) => r.status === "active");
    const latestRoundId = latestActiveRound?.id ?? typedRounds[typedRounds.length - 1]?.id;
    const latestRoundResponses = latestRoundId
      ? responsesByRound.get(latestRoundId) ?? []
      : [];
    const respondedPanelistIds = new Set(
      latestRoundResponses
        .filter((r) => r.panelist_id)
        .map((r) => r.panelist_id!)
    );
    const completedPanelistIds = new Set(
      latestRoundResponses
        .filter((r) => r.panelist_id && r.status === "completed")
        .map((r) => r.panelist_id!)
    );

    const mappedPanelists: Panelist[] = typedPanelists
      .filter((p) => p.status !== "removed")
      .map((p) => {
        let responseStatus: Panelist["responseStatus"] = "not_started";
        if (completedPanelistIds.has(p.id)) {
          responseStatus = "completed";
        } else if (respondedPanelistIds.has(p.id)) {
          responseStatus = "in_progress";
        }

        return {
          id: p.id,
          name: p.name ?? p.email,
          email: p.email,
          expertise: p.expertise ?? "",
          status: p.status as Panelist["status"],
          responseStatus,
        };
      });

    setPanelists(mappedPanelists);
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Mutations ──────────────────────────────────────────────────────

  async function handleStartRound() {
    if (mutating || !survey) return;
    setMutating(true);

    const nextNumber =
      rounds.length > 0
        ? Math.max(...rounds.map((r) => r.number)) + 1
        : 1;

    const { data, error: insertErr } = await supabase
      .from("delphi_rounds")
      .insert({
        survey_id: survey.id,
        round_number: nextNumber,
        status: "active",
        starts_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr) {
      console.error("Failed to start round:", insertErr.message);
      setMutating(false);
      return;
    }

    // Re-fetch to get fresh data
    await fetchData();
    setMutating(false);
  }

  async function handleCloseRound(roundId: string) {
    if (mutating) return;
    setMutating(true);

    const { error: updateErr } = await supabase
      .from("delphi_rounds")
      .update({
        status: "completed",
        ends_at: new Date().toISOString(),
      })
      .eq("id", roundId);

    if (updateErr) {
      console.error("Failed to close round:", updateErr.message);
      setMutating(false);
      return;
    }

    await fetchData();
    setMutating(false);
  }

  async function handleInvitePanelist(
    panelist: Omit<Panelist, "id" | "status" | "responseStatus">
  ) {
    if (mutating || !survey) return;
    setMutating(true);

    const token = crypto.randomUUID();

    const { error: insertErr } = await supabase
      .from("delphi_panelists")
      .insert({
        survey_id: survey.id,
        email: panelist.email,
        name: panelist.name,
        expertise: panelist.expertise,
        token,
        status: "invited",
        invited_at: new Date().toISOString(),
      });

    if (insertErr) {
      console.error("Failed to invite panelist:", insertErr.message);
      setMutating(false);
      return;
    }

    await fetchData();
    setMutating(false);
  }

  async function handleRemovePanelist(panelistId: string) {
    if (mutating) return;
    setMutating(true);

    const { error: updateErr } = await supabase
      .from("delphi_panelists")
      .update({ status: "removed" })
      .eq("id", panelistId);

    if (updateErr) {
      console.error("Failed to remove panelist:", updateErr.message);
      setMutating(false);
      return;
    }

    await fetchData();
    setMutating(false);
  }

  // ── Derived data ───────────────────────────────────────────────────

  const overallConsensus = Math.round(
    rounds
      .filter((r) => r.status !== "pending" && r.questions.length > 0)
      .flatMap((r) => r.questions)
      .reduce((sum, q, _, arr) => sum + q.consensusPercent / (arr.length || 1), 0)
  );

  const fields: SurveyField[] = Array.isArray(survey?.schema)
    ? (survey.schema as SurveyField[])
    : [];

  const activeRound = rounds.find((r) => r.status === "active");
  const acceptedPanelists = panelists.filter((p) => p.status === "accepted");
  const targetConsensus =
    (survey?.settings as Record<string, unknown>)?.consensus_threshold != null
      ? Number((survey?.settings as Record<string, unknown>).consensus_threshold) * 100
      : 70;

  // ── Loading state ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-sm text-destructive">
          {error ?? "Survey not found"}
        </p>
        <Link href="/delphi">
          <Button variant="outline">Back to Studies</Button>
        </Link>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <Link
          href="/delphi"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Studies
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {survey.title}
              </h1>
              <Badge
                variant={
                  statusBadgeVariant[survey.status] ?? "outline"
                }
              >
                {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
              </Badge>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {survey.description ?? "No description"}
            </p>
          </div>
          <Button variant="outline" className="shrink-0 gap-2">
            <FileText className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rounds">Rounds</TabsTrigger>
          <TabsTrigger value="panel">Panel</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        {/* ── Overview ────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Consensus gauge */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Overall Consensus</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ConsensusGauge percentage={overallConsensus} size={220} />
              </CardContent>
            </Card>

            {/* Key metrics */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Study Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    {
                      icon: Target,
                      label: "Target Consensus",
                      value: `${targetConsensus}%`,
                      color: "text-blue-500",
                    },
                    {
                      icon: BarChart3,
                      label: "Questions",
                      value: fields.length.toString(),
                      color: "text-purple-500",
                    },
                    {
                      icon: Users,
                      label: "Active Panelists",
                      value: `${acceptedPanelists.length}`,
                      color: "text-green-500",
                    },
                    {
                      icon: TrendingUp,
                      label: "Current Round",
                      value: `${activeRound?.number ?? "--"} of ${rounds.length}`,
                      color: "text-orange-500",
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="flex flex-col items-center rounded-lg border p-4 text-center"
                    >
                      <metric.icon
                        className={cn("mb-2 h-5 w-5", metric.color)}
                      />
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <span className="text-xs text-muted-foreground">
                        {metric.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Study details + timeline */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Study Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    label: "Created",
                    value: formatDate(survey.created_at),
                  },
                  {
                    label: "Last Updated",
                    value: formatDate(survey.updated_at),
                  },
                  {
                    label: "Target Consensus",
                    value: `${targetConsensus}% agreement`,
                  },
                  {
                    label: "Total Rounds",
                    value: rounds.length.toString(),
                  },
                  {
                    label: "Total Panelists",
                    value: panelists.length.toString(),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Round Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rounds.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No rounds yet. Start your first round from the Rounds tab.
                    </p>
                  )}
                  {rounds.map((round) => {
                    const avgConsensus =
                      round.questions.length > 0
                        ? Math.round(
                            round.questions.reduce(
                              (s, q) => s + q.consensusPercent,
                              0
                            ) / round.questions.length
                          )
                        : 0;
                    return (
                      <div
                        key={round.id}
                        className={cn(
                          "flex items-center justify-between rounded-lg border px-4 py-3",
                          round.status === "active" &&
                            "border-primary bg-primary/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                              round.status === "completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : round.status === "active"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                            )}
                          >
                            {round.number}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Round {round.number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {round.status === "pending"
                                ? "Not started"
                                : `${round.responseCount}/${round.totalPanelists} responses`}
                            </p>
                          </div>
                        </div>
                        {round.status !== "pending" && round.questions.length > 0 && (
                          <Badge
                            variant={
                              avgConsensus >= 75 ? "default" : "secondary"
                            }
                          >
                            {avgConsensus}% avg
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Rounds ──────────────────────────────────────────────── */}
        <TabsContent value="rounds">
          <RoundManager
            rounds={rounds}
            onStartRound={
              // RoundManager expects (roundId: string) => void for starting
              // But we create a new round, so we adapt:
              // If there's a pending round, start it; otherwise create new
              (_roundId: string) => {
                handleStartRound();
              }
            }
            onCloseRound={handleCloseRound}
          />
        </TabsContent>

        {/* ── Panel ───────────────────────────────────────────────── */}
        <TabsContent value="panel">
          <PanelManager
            panelists={panelists}
            onAdd={handleInvitePanelist}
            onRemove={handleRemovePanelist}
            onInvite={(ids) => {
              // Bulk re-invite: no-op for now since panelists are already invited on add
              console.log("Bulk invite:", ids);
            }}
          />
        </TabsContent>

        {/* ── Results ─────────────────────────────────────────────── */}
        <TabsContent value="results">
          <RoundComparison />
        </TabsContent>
      </Tabs>
    </div>
  );
}
