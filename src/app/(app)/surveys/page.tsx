"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  BarChart3,
  Clock,
  Filter,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardFooter,
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
import { cn } from "@/lib/utils/cn";
import { useUser } from "@/components/providers/UserProvider";
import { createClient } from "@/lib/supabase/client";

interface SurveyItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  response_count: number;
  updated_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-700" },
  published: { label: "Published", className: "bg-green-100 text-green-700" },
  closed: { label: "Closed", className: "bg-amber-100 text-amber-700" },
  archived: { label: "Archived", className: "bg-gray-100 text-gray-500" },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function SurveysPage() {
  const { orgId, loading: userLoading } = useUser();
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const supabase = createClient();

  useEffect(() => {
    if (!orgId) return;

    async function loadSurveys() {
      const { data: surveyData } = await supabase
        .from("surveys")
        .select("id, title, description, type, status, updated_at")
        .eq("org_id", orgId)
        .order("updated_at", { ascending: false });

      if (surveyData && surveyData.length > 0) {
        // Get response counts
        const surveyIds = surveyData.map((s: { id: string }) => s.id);
        const { data: responseCounts } = await supabase
          .from("responses")
          .select("survey_id")
          .in("survey_id", surveyIds);

        const countMap: Record<string, number> = {};
        (responseCounts || []).forEach((r: { survey_id: string }) => {
          countMap[r.survey_id] = (countMap[r.survey_id] || 0) + 1;
        });

        setSurveys(
          surveyData.map((s: { id: string; title: string; description: string | null; type: string; status: string; updated_at: string }) => ({
            ...s,
            response_count: countMap[s.id] || 0,
          }))
        );
      }

      setDataLoading(false);
    }

    loadSurveys();
  }, [orgId, supabase]);

  const filtered = useMemo(() => {
    return surveys.filter((s) => {
      const matchesSearch =
        search === "" ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        (s.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [surveys, search, statusFilter]);

  const loading = userLoading || dataLoading;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Surveys</h1>
          <p className="mt-1 text-muted-foreground">
            Create, manage, and analyze your surveys and forms
          </p>
        </div>
        <Link href="/surveys/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Survey
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search surveys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <h3 className="mb-1 text-lg font-medium text-muted-foreground">
            No surveys found
          </h3>
          <p className="text-sm text-muted-foreground/70">
            {search || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first survey to get started"}
          </p>
          {!search && statusFilter === "all" && (
            <Link href="/surveys/new" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Survey
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((survey) => {
            const statusConf = STATUS_CONFIG[survey.status] || STATUS_CONFIG.draft;

            return (
              <Link key={survey.id} href={`/surveys/${survey.id}/edit`}>
                <Card className="group h-full transition-all hover:shadow-md hover:border-primary/30 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-md bg-muted p-1.5">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] px-1.5 py-0", statusConf.className)}
                        >
                          {statusConf.label}
                        </Badge>
                      </div>
                      <button
                        onClick={(e) => e.preventDefault()}
                        className="rounded-md p-1 opacity-0 group-hover:opacity-100 hover:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                    <CardTitle className="text-base leading-snug mt-2">
                      {survey.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      {survey.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        <span>{survey.response_count} responses</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(survey.updated_at)}</span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
