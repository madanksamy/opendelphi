"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Users,
  BarChart3,
  Clock,
  Filter,
  Activity,
  FileText,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditableText } from "@/components/cms/EditableText";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
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
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/providers/UserProvider";

// ── Types ──────────────────────────────────────────────────────────────

interface DelphiStudy {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "active" | "completed";
  created_at: string;
  updated_at: string;
  roundCount: number;
  panelistCount: number;
  latestRoundStatus: string | null;
  consensusPercent: number;
  respondedPanelists: number;
}

interface SurveyRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  delphi_rounds: { id: string; status: string; consensus_threshold: number }[];
  delphi_panelists: { id: string; status: string }[];
}

// ── Status config ──────────────────────────────────────────────────────

const statusConfig = {
  draft: {
    label: "Draft",
    variant: "outline" as const,
    icon: FileText,
  },
  active: {
    label: "Active",
    variant: "default" as const,
    icon: Activity,
  },
  completed: {
    label: "Completed",
    variant: "secondary" as const,
    icon: CheckCircle2,
  },
};

function consensusColor(pct: number): string {
  if (pct >= 75) return "text-green-500";
  if (pct >= 50) return "text-yellow-500";
  if (pct > 0) return "text-red-500";
  return "text-muted-foreground";
}

// ── Page ───────────────────────────────────────────────────────────────

export default function DelphiPage() {
  const { orgId } = useUser();
  const [studies, setStudies] = useState<DelphiStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchStudies = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data, error: fetchError } = await supabase
      .from("surveys")
      .select(
        `
        id,
        title,
        description,
        status,
        created_at,
        updated_at,
        delphi_rounds ( id, status, consensus_threshold ),
        delphi_panelists ( id, status )
      `
      )
      .eq("type", "delphi")
      .eq("org_id", orgId)
      .order("updated_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as unknown as SurveyRow[];

    const mapped: DelphiStudy[] = rows.map((row) => {
      const rounds = row.delphi_rounds ?? [];
      const panelists = row.delphi_panelists ?? [];
      const activePanelists = panelists.filter(
        (p) => p.status === "accepted" || p.status === "invited"
      );

      // Find latest round by looking for active, then highest status
      const activeRound = rounds.find((r) => r.status === "active");
      const latestRoundStatus = activeRound
        ? activeRound.status
        : rounds.length > 0
          ? rounds[rounds.length - 1].status
          : null;

      // Use the latest active round's consensus threshold as a proxy,
      // or average across completed rounds
      const completedRounds = rounds.filter((r) => r.status === "completed");
      const consensusPercent =
        completedRounds.length > 0
          ? Math.round(
              (completedRounds.reduce(
                (sum, r) => sum + (r.consensus_threshold ?? 0),
                0
              ) /
                completedRounds.length) *
                100
            )
          : 0;

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        status: (row.status as DelphiStudy["status"]) ?? "draft",
        created_at: row.created_at,
        updated_at: row.updated_at,
        roundCount: rounds.length,
        panelistCount: panelists.length,
        latestRoundStatus,
        consensusPercent,
        respondedPanelists: activePanelists.length,
      };
    });

    setStudies(mapped);
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    fetchStudies();
  }, [fetchStudies]);

  const filtered = useMemo(() => {
    return studies.filter((s) => {
      const matchesSearch =
        !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        (s.description ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [studies, search, statusFilter]);

  const counts = useMemo(
    () => ({
      all: studies.length,
      active: studies.filter((s) => s.status === "active").length,
      completed: studies.filter((s) => s.status === "completed").length,
      draft: studies.filter((s) => s.status === "draft").length,
    }),
    [studies]
  );

  // ── Loading state ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-sm text-destructive">Failed to load studies: {error}</p>
        <Button variant="outline" onClick={fetchStudies}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <EditableText
            id="delphi-heading"
            defaultContent="Delphi Studies"
            as="h1"
            className="text-2xl font-bold tracking-tight"
          />
          <EditableText
            id="delphi-subheading"
            defaultContent="Manage multi-round expert consensus studies using the Delphi method."
            as="p"
            className="text-sm text-muted-foreground"
          />
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Delphi Study
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search studies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({counts.all})</SelectItem>
            <SelectItem value="active">Active ({counts.active})</SelectItem>
            <SelectItem value="completed">
              Completed ({counts.completed})
            </SelectItem>
            <SelectItem value="draft">Draft ({counts.draft})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Study grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((study) => {
          const config =
            statusConfig[study.status] ?? statusConfig.draft;
          const Icon = config.icon;
          return (
            <Link key={study.id} href={`/delphi/${study.id}`}>
              <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-base">
                      {study.title}
                    </CardTitle>
                    <Badge variant={config.variant} className="shrink-0">
                      <Icon className="mr-1 h-3 w-3" />
                      {config.label}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {study.description ?? "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metrics row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-semibold">
                        {study.roundCount}
                      </p>
                      <p className="text-xs text-muted-foreground">Rounds</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {study.panelistCount}
                      </p>
                      <p className="text-xs text-muted-foreground">Panelists</p>
                    </div>
                    <div>
                      <p
                        className={cn(
                          "text-lg font-semibold",
                          consensusColor(study.consensusPercent)
                        )}
                      >
                        {study.consensusPercent}%
                      </p>
                      <p className="text-xs text-muted-foreground">Consensus</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Consensus Progress</span>
                      <span>{study.consensusPercent}%</span>
                    </div>
                    <Progress value={study.consensusPercent} />
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  <div className="flex w-full items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {study.panelistCount} panelists
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(study.updated_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {studies.length === 0
              ? "No Delphi studies yet. Create your first study to get started."
              : "No Delphi studies match your filters."}
          </p>
        </div>
      )}
    </div>
  );
}
