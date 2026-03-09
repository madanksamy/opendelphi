"use client";

import { use, useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import { ChartCard } from "@/components/analytics/ChartCard";
import { BarChart } from "@/components/analytics/BarChart";
import { PieChart } from "@/components/analytics/PieChart";
import { ResponseTable } from "@/components/analytics/ResponseTable";
import { SummaryCards } from "@/components/analytics/SummaryCards";
import {
  BarChart3,
  Table2,
  Sparkles,
  ArrowLeft,
  Loader2,
  Users,
  CheckCircle2,
  Clock,
  Inbox,
} from "lucide-react";
import Link from "next/link";

// ── Types ───────────────────────────────────────────────────────────

interface SchemaFieldOption {
  id: string;
  label: string;
  value: string;
}

interface SchemaField {
  id: string;
  type: string;
  label: string;
  options?: SchemaFieldOption[];
  properties?: Record<string, unknown>;
  min?: number;
  max?: number;
}

interface Survey {
  id: string;
  title: string;
  description: string | null;
  schema: SchemaField[];
  status: string;
  created_at: string;
}

interface SurveyResponse {
  id: string;
  survey_id: string;
  survey_version: number | null;
  answers: Record<string, unknown>;
  status: string;
  created_at: string;
  completed_at: string | null;
}

type ChartDataPoint = {
  name: string;
  value: number;
  [key: string]: string | number | boolean | null | undefined;
};

// ── Tabs ────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "responses", label: "Individual Responses", icon: Table2 },
  { id: "insights", label: "AI Insights", icon: Sparkles },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Aggregation helpers ─────────────────────────────────────────────

function aggregateDistribution(
  responses: SurveyResponse[],
  fieldId: string,
  labels: string[]
): ChartDataPoint[] {
  const counts = new Map<string, number>();
  for (const label of labels) counts.set(label, 0);

  for (const resp of responses) {
    const val = resp.answers[fieldId];
    if (val == null) continue;
    const key = String(val);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return labels.map((label) => ({ name: label, value: counts.get(label) ?? 0 }));
}

function aggregateRating(
  responses: SurveyResponse[],
  fieldId: string
): ChartDataPoint[] {
  const labels = ["1", "2", "3", "4", "5"];
  return aggregateDistribution(responses, fieldId, labels).map((d) => ({
    name: `${d.name} Star${d.name === "1" ? "" : "s"}`,
    value: d.value,
  }));
}

function aggregateScale(
  responses: SurveyResponse[],
  fieldId: string,
  min = 0,
  max = 10
): ChartDataPoint[] {
  const labels = Array.from({ length: max - min + 1 }, (_, i) => String(min + i));
  return aggregateDistribution(responses, fieldId, labels);
}

function aggregateNps(
  responses: SurveyResponse[],
  fieldId: string
): { data: ChartDataPoint[]; score: number; promoters: number; passives: number; detractors: number } {
  const data = aggregateScale(responses, fieldId, 0, 10);
  let promoterCount = 0;
  let passiveCount = 0;
  let detractorCount = 0;
  let total = 0;

  for (const resp of responses) {
    const val = resp.answers[fieldId];
    if (val == null) continue;
    const num = Number(val);
    if (Number.isNaN(num)) continue;
    total++;
    if (num >= 9) promoterCount++;
    else if (num >= 7) passiveCount++;
    else detractorCount++;
  }

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const promotersPct = pct(promoterCount);
  const detractorsPct = pct(detractorCount);

  return {
    data,
    score: promotersPct - detractorsPct,
    promoters: promotersPct,
    passives: pct(passiveCount),
    detractors: detractorsPct,
  };
}

function aggregateSelect(
  responses: SurveyResponse[],
  fieldId: string,
  options: SchemaFieldOption[]
): ChartDataPoint[] {
  const counts = new Map<string, number>();
  for (const opt of options) counts.set(opt.value, 0);

  for (const resp of responses) {
    const val = resp.answers[fieldId];
    if (val == null) continue;
    const key = String(val);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return options.map((opt) => ({ name: opt.label, value: counts.get(opt.value) ?? 0 }));
}

function aggregateMultiSelect(
  responses: SurveyResponse[],
  fieldId: string,
  options: SchemaFieldOption[]
): ChartDataPoint[] {
  const counts = new Map<string, number>();
  for (const opt of options) counts.set(opt.value, 0);

  for (const resp of responses) {
    const val = resp.answers[fieldId];
    if (!Array.isArray(val)) continue;
    for (const item of val) {
      const key = String(item);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return options.map((opt) => ({ name: opt.label, value: counts.get(opt.value) ?? 0 }));
}

function collectTextResponses(
  responses: SurveyResponse[],
  fieldId: string,
  limit = 20
): string[] {
  const texts: string[] = [];
  for (const resp of responses) {
    const val = resp.answers[fieldId];
    if (val == null || String(val).trim() === "") continue;
    texts.push(String(val));
    if (texts.length >= limit) break;
  }
  return texts;
}

// ── Page Component ──────────────────────────────────────────────────

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      const { data: surveyData, error: surveyError } = await supabase
        .from("surveys")
        .select("id, title, description, schema, status, created_at")
        .eq("id", id)
        .single();

      if (surveyError || !surveyData) {
        if (!cancelled) {
          setError(surveyError?.message ?? "Survey not found");
          setLoading(false);
        }
        return;
      }

      const { data: responseData, error: responseError } = await supabase
        .from("responses")
        .select("id, survey_id, survey_version, answers, status, created_at, completed_at")
        .eq("survey_id", id)
        .order("created_at", { ascending: false });

      if (!cancelled) {
        if (responseError) {
          setError(responseError.message);
        } else {
          setSurvey(surveyData as Survey);
          setResponses((responseData ?? []) as SurveyResponse[]);
        }
        setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Unable to load survey</h2>
          <p className="text-muted-foreground mb-4">{error ?? "Survey not found"}</p>
          <Link
            href="/surveys"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to surveys
          </Link>
        </div>
      </div>
    );
  }

  const completedCount = responses.filter((r) => r.status === "completed").length;
  const completionRate =
    responses.length > 0
      ? Math.round((completedCount / responses.length) * 100 * 10) / 10
      : 0;

  const avgCompletionSecs = (() => {
    const durations = responses
      .filter((r) => r.completed_at && r.created_at)
      .map((r) => {
        const start = new Date(r.created_at).getTime();
        const end = new Date(r.completed_at!).getTime();
        return (end - start) / 1000;
      })
      .filter((d) => d > 0 && d < 3600);
    if (durations.length === 0) return 0;
    return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  })();

  const formatDuration = (secs: number) => {
    if (secs === 0) return "--";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const summaryStats = [
    {
      label: "Total Responses",
      value: responses.length.toLocaleString(),
      trend: 0,
      trendLabel: "",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      trend: 0,
      trendLabel: "",
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    {
      label: "Avg. Completion Time",
      value: formatDuration(avgCompletionSecs),
      trend: 0,
      trendLabel: "",
      icon: <Clock className="h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/surveys"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to surveys
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{survey.title}</h1>
          {survey.description && (
            <p className="text-muted-foreground mt-1">{survey.description}</p>
          )}
          <p className="text-muted-foreground mt-1">Analytics and response data</p>
        </div>

        {/* Summary Cards */}
        <SummaryCards stats={summaryStats} className="mb-8" />

        {/* Empty state */}
        {responses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
            <Inbox className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No responses yet</h3>
            <p className="text-sm text-muted-foreground max-w-md text-center">
              Share your survey to start collecting responses. Analytics will appear here once people start responding.
            </p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="mb-6 border-b">
              <div className="flex gap-1 -mb-px">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                        activeTab === tab.id
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <OverviewTab schema={survey.schema} responses={responses} />
            )}
            {activeTab === "responses" && (
              <ResponsesTab schema={survey.schema} responses={responses} />
            )}
            {activeTab === "insights" && (
              <InsightsTab responseCount={responses.length} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Overview Tab ────────────────────────────────────────────────────

function OverviewTab({
  schema,
  responses,
}: {
  schema: SchemaField[];
  responses: SurveyResponse[];
}) {
  const charts = useMemo(() => {
    return schema.map((field) => {
      switch (field.type) {
        case "rating": {
          const data = aggregateRating(responses, field.id);
          return (
            <ChartCard
              key={field.id}
              title={field.label}
              subtitle="Star rating distribution"
              exportData={{
                headers: ["Rating", "Count"],
                rows: data.map((d) => [d.name, d.value]),
              }}
            >
              <BarChart data={data} height={280} />
            </ChartCard>
          );
        }

        case "nps": {
          const nps = aggregateNps(responses, field.id);
          return (
            <div key={field.id} className="space-y-6">
              <ChartCard
                title={field.label}
                subtitle="Score distribution (0-10)"
                exportData={{
                  headers: ["Score", "Count"],
                  rows: nps.data.map((d) => [d.name, d.value]),
                }}
              >
                <BarChart data={nps.data} height={280} />
              </ChartCard>
              <div className="rounded-xl border p-6">
                <h3 className="text-lg font-semibold mb-4">Net Promoter Score</h3>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className={cn(
                      "text-4xl font-bold",
                      nps.score > 0 ? "text-green-600" : nps.score < 0 ? "text-red-600" : "text-yellow-600"
                    )}>
                      {nps.score}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">NPS Score</p>
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xl font-semibold text-green-600">{nps.promoters}%</p>
                      <p className="text-xs text-muted-foreground">Promoters (9-10)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-yellow-600">{nps.passives}%</p>
                      <p className="text-xs text-muted-foreground">Passives (7-8)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-red-600">{nps.detractors}%</p>
                      <p className="text-xs text-muted-foreground">Detractors (0-6)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        case "scale": {
          const min = field.min ?? 1;
          const max = field.max ?? 10;
          const data = aggregateScale(responses, field.id, min, max);
          return (
            <ChartCard
              key={field.id}
              title={field.label}
              subtitle={`Scale distribution (${min}-${max})`}
              exportData={{
                headers: ["Score", "Count"],
                rows: data.map((d) => [d.name, d.value]),
              }}
            >
              <BarChart data={data} height={280} />
            </ChartCard>
          );
        }

        case "select": {
          const options = field.options ?? [];
          const data = aggregateSelect(responses, field.id, options);
          return (
            <ChartCard
              key={field.id}
              title={field.label}
              subtitle="Response distribution"
              exportData={{
                headers: ["Option", "Count"],
                rows: data.map((d) => [d.name, d.value]),
              }}
            >
              <PieChart data={data} height={280} />
            </ChartCard>
          );
        }

        case "multi_select": {
          const options = field.options ?? [];
          const data = aggregateMultiSelect(responses, field.id, options);
          return (
            <ChartCard
              key={field.id}
              title={field.label}
              subtitle="Selections (multiple allowed)"
              exportData={{
                headers: ["Option", "Count"],
                rows: data.map((d) => [d.name, d.value]),
              }}
            >
              <BarChart data={data} height={280} layout="horizontal" />
            </ChartCard>
          );
        }

        case "text":
        case "email":
        case "textarea": {
          const texts = collectTextResponses(responses, field.id);
          if (texts.length === 0) return null;
          return (
            <ChartCard key={field.id} title={field.label} subtitle="Recent responses">
              <div className="max-h-72 overflow-y-auto space-y-2 pr-2">
                {texts.map((text, i) => (
                  <div
                    key={i}
                    className="rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                  >
                    {text}
                  </div>
                ))}
              </div>
            </ChartCard>
          );
        }

        default:
          return null;
      }
    });
  }, [schema, responses]);

  const filteredCharts = charts.filter(Boolean);

  if (filteredCharts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BarChart3 className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">
          No chartable fields found in this survey schema.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {filteredCharts.map((chart, i) => {
        // NPS fields produce a wrapper div with space-y-6 that should span full width
        const field = schema.filter((f) =>
          ["rating", "nps", "scale", "select", "multi_select", "text", "email", "textarea"].includes(f.type)
        )[i];
        const isFullWidth =
          field?.type === "nps" ||
          field?.type === "multi_select" ||
          field?.type === "text" ||
          field?.type === "email" ||
          field?.type === "textarea";
        return (
          <div key={i} className={isFullWidth ? "lg:col-span-2" : ""}>
            {chart}
          </div>
        );
      })}
    </div>
  );
}

// ── Responses Tab ───────────────────────────────────────────────────

function ResponsesTab({
  schema,
  responses,
}: {
  schema: SchemaField[];
  responses: SurveyResponse[];
}) {
  const columns = useMemo(() => {
    const cols = [
      { key: "status", label: "Status", sortable: true },
      { key: "created_at", label: "Submitted", sortable: true, width: "140px" },
    ];

    // Add a column per schema field
    for (const field of schema) {
      cols.push({
        key: `answer_${field.id}`,
        label: field.label,
        sortable: true,
        width: undefined as unknown as string,
      });
    }

    return cols;
  }, [schema]);

  const rows = useMemo(() => {
    return responses.map((resp) => {
      const row: Record<string, unknown> & { id: string } = {
        id: resp.id,
        status: resp.status,
        created_at: new Date(resp.created_at).toLocaleDateString(),
      };

      for (const field of schema) {
        const val = resp.answers[field.id];
        if (Array.isArray(val)) {
          row[`answer_${field.id}`] = val.join(", ");
        } else if (val != null) {
          row[`answer_${field.id}`] = String(val);
        } else {
          row[`answer_${field.id}`] = "--";
        }
      }

      return row;
    });
  }, [schema, responses]);

  return <ResponseTable columns={columns} data={rows as Array<{ id: string; [key: string]: unknown }>} pageSize={10} />;
}

// ── Insights Tab ────────────────────────────────────────────────────

function InsightsTab({ responseCount }: { responseCount: number }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">AI-Powered Insights</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {responseCount < 10 ? (
                <>
                  AI insights will be generated when you have enough responses.
                  You currently have{" "}
                  <strong className="text-foreground">{responseCount}</strong>{" "}
                  response{responseCount === 1 ? "" : "s"}. We recommend at least
                  10 responses for meaningful analysis.
                </>
              ) : (
                <>
                  AI insights will be generated when you have enough responses.
                  You have{" "}
                  <strong className="text-foreground">{responseCount}</strong>{" "}
                  responses so far. This feature is coming soon.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
