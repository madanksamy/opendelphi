"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  FileDown,
  LayoutTemplate,
  Loader2,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { createClient } from "@/lib/supabase/client";

interface SurveyRow {
  id: string;
  title: string;
  status: string;
  response_limit: number | null;
  created_at: string;
  response_count: number;
}

function getStatusLabel(status: string) {
  switch (status) {
    case "published": return "Active";
    case "draft": return "Draft";
    case "closed": return "Completed";
    case "archived": return "Archived";
    default: return status;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "published":
      return "bg-emerald-500/10 text-emerald-600";
    case "draft":
      return "bg-amber-500/10 text-amber-600";
    case "closed":
      return "bg-blue-500/10 text-blue-600";
    case "archived":
      return "bg-gray-500/10 text-gray-500";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function DashboardPage() {
  const { profile, orgId, loading: userLoading } = useUser();
  const [surveys, setSurveys] = useState<SurveyRow[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (!orgId) return;

    async function loadDashboard() {
      // Fetch surveys with response counts
      const { data: surveyData } = await supabase
        .from("surveys")
        .select("id, title, status, response_limit, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (surveyData && surveyData.length > 0) {
        // Get response counts per survey
        const surveyIds = surveyData.map((s: { id: string }) => s.id);
        const { data: responseCounts } = await supabase
          .from("responses")
          .select("survey_id")
          .in("survey_id", surveyIds);

        const countMap: Record<string, number> = {};
        (responseCounts || []).forEach((r: { survey_id: string }) => {
          countMap[r.survey_id] = (countMap[r.survey_id] || 0) + 1;
        });

        const surveysWithCounts = surveyData.map((s: { id: string; title: string; status: string; response_limit: number | null; created_at: string }) => ({
          ...s,
          response_count: countMap[s.id] || 0,
        }));

        setSurveys(surveysWithCounts);

        // Total responses across all surveys
        const total = Object.values(countMap).reduce((sum, c) => sum + c, 0);
        setTotalResponses(total);
      }

      setDataLoading(false);
    }

    loadDashboard();
  }, [orgId, supabase]);

  const loading = userLoading || dataLoading;
  const displayName = profile?.full_name?.split(" ")[0] || profile?.email?.split("@")[0] || "there";

  const totalSurveys = surveys.length;
  const activeSurveys = surveys.filter((s) => s.status === "published").length;

  const statsCards = [
    {
      label: "Total Surveys",
      value: totalSurveys.toString(),
      change: `${activeSurveys} active`,
      icon: ClipboardList,
    },
    {
      label: "Total Responses",
      value: totalResponses.toLocaleString(),
      change: "across all surveys",
      icon: Users,
    },
    {
      label: "Active Surveys",
      value: activeSurveys.toString(),
      change: activeSurveys > 0 ? "collecting responses" : "none active",
      icon: BarChart3,
    },
    {
      label: "Draft Surveys",
      value: surveys.filter((s) => s.status === "draft").length.toString(),
      change: "ready to publish",
      icon: TrendingUp,
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {displayName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s an overview of your surveys and recent activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </span>
              <div className="rounded-xl bg-primary/10 p-2">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-card-foreground">
                {stat.value}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/surveys/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Survey
        </Link>
        <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-accent">
          <FileDown className="h-4 w-4 text-muted-foreground" />
          Import
        </button>
        <Link
          href="/templates"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-accent"
        >
          <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
          Browse Templates
        </Link>
      </div>

      {/* Recent Surveys Table */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-card-foreground">
            Recent Surveys
          </h2>
          <Link
            href="/surveys"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
          >
            View all
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {surveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No surveys yet</p>
            <Link
              href="/surveys/new"
              className="mt-3 text-sm font-medium text-primary hover:text-primary/80"
            >
              Create your first survey
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Title
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Responses
                  </th>
                  <th className="hidden px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {surveys.slice(0, 5).map((survey) => (
                  <tr
                    key={survey.id}
                    className="transition-colors hover:bg-muted/50"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/surveys/${survey.id}/edit`}
                        className="text-sm font-medium text-card-foreground hover:text-primary"
                      >
                        {survey.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(survey.status)}`}
                      >
                        {getStatusLabel(survey.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {survey.response_count.toLocaleString()}
                    </td>
                    <td className="hidden px-6 py-4 text-sm text-muted-foreground md:table-cell">
                      {new Date(survey.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
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
