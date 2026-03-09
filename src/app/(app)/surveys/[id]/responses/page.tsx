"use client";

import { useState, useMemo, useCallback, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { ArrowLeft, Download, Filter, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface ResponseRow {
  id: string;
  answers: Record<string, unknown>;
  status: string;
  created_at: string;
  completed_at: string | null;
  respondent_id: string | null;
}

export default function ResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: surveyId } = use(params);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [surveyTitle, setSurveyTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "complete" | "in_progress">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      // Get survey title
      const { data: survey } = await supabase
        .from("surveys")
        .select("title")
        .eq("id", surveyId)
        .single();

      if (survey) setSurveyTitle(survey.title);

      // Get responses
      const { data: responseData } = await supabase
        .from("responses")
        .select("id, answers, status, created_at, completed_at, respondent_id")
        .eq("survey_id", surveyId)
        .order("created_at", { ascending: false });

      setResponses(responseData || []);
      setLoading(false);
    }
    load();
  }, [surveyId, supabase]);

  const filteredResponses = useMemo(() => {
    let result = responses;

    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (dateFrom) {
      result = result.filter((r) => r.created_at >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((r) => r.created_at <= dateTo + "T23:59:59Z");
    }

    return result;
  }, [responses, statusFilter, dateFrom, dateTo]);

  const completedCount = responses.filter((r) => r.status === "complete").length;
  const inProgressCount = responses.filter((r) => r.status === "in_progress").length;

  const handleExportCSV = useCallback(() => {
    if (filteredResponses.length === 0) return;

    // Collect all answer keys
    const allKeys = new Set<string>();
    filteredResponses.forEach((r) => {
      Object.keys(r.answers || {}).forEach((k) => allKeys.add(k));
    });
    const answerKeys = Array.from(allKeys).sort();

    const headers = ["ID", "Status", "Date", ...answerKeys];
    const rows = filteredResponses.map((r) => [
      r.id,
      r.status,
      new Date(r.created_at).toISOString(),
      ...answerKeys.map((k) => {
        const val = r.answers?.[k];
        if (Array.isArray(val)) return val.join("; ");
        return String(val ?? "");
      }),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => (cell.includes(",") ? `"${cell}"` : cell)).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${surveyTitle || "survey"}-responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredResponses, surveyTitle]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/surveys/${surveyId}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to survey
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Responses</h1>
              <p className="text-muted-foreground mt-1">{surveyTitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={filteredResponses.length === 0}>
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filters
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <div className="flex gap-1.5">
                {([
                  { key: "all" as const, label: `All (${responses.length})` },
                  { key: "complete" as const, label: `Completed (${completedCount})` },
                  { key: "in_progress" as const, label: `In Progress (${inProgressCount})` },
                ]).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setStatusFilter(opt.key)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      statusFilter === opt.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">From</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-8 text-xs w-36"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-8 text-xs w-36"
                />
              </div>
              {(dateFrom || dateTo || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setStatusFilter("all");
                    setDateFrom("");
                    setDateTo("");
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Responses Table */}
        {filteredResponses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16">
            <p className="text-sm text-muted-foreground">
              {responses.length === 0
                ? "No responses yet. Share your survey to start collecting data."
                : "No responses match your filters."}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Answers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredResponses.map((response, idx) => (
                  <tr key={response.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          response.status === "complete"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        )}
                      >
                        {response.status === "complete" ? "Completed" : "In Progress"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(response.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-md truncate">
                      {Object.entries(response.answers || {})
                        .slice(0, 3)
                        .map(([, v]) => (typeof v === "string" ? v : JSON.stringify(v)))
                        .join(" | ")}
                      {Object.keys(response.answers || {}).length > 3 && " ..."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
