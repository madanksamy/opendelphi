"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface DelphiStudy {
  id: string;
  title: string;
  description: string;
  status: "draft" | "active" | "completed";
  currentRound: number;
  totalRounds: number;
  totalPanelists: number;
  respondedPanelists: number;
  consensusPercent: number;
  createdAt: string;
  updatedAt: string;
}

const MOCK_STUDIES: DelphiStudy[] = [
  {
    id: "delphi-1",
    title: "Clinical Treatment Protocol Consensus",
    description:
      "Multi-round expert consensus on first-line treatment approaches for chronic inflammatory conditions in adult patients.",
    status: "active",
    currentRound: 3,
    totalRounds: 4,
    totalPanelists: 12,
    respondedPanelists: 10,
    consensusPercent: 78,
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-03-01T14:30:00Z",
  },
  {
    id: "delphi-2",
    title: "Diagnostic Imaging Guidelines",
    description:
      "Establishing consensus on appropriate imaging modalities and timing for suspected oncological presentations.",
    status: "active",
    currentRound: 2,
    totalRounds: 3,
    totalPanelists: 18,
    respondedPanelists: 14,
    consensusPercent: 52,
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-03-05T11:20:00Z",
  },
  {
    id: "delphi-3",
    title: "Antimicrobial Stewardship Best Practices",
    description:
      "Expert panel evaluation of antimicrobial stewardship interventions and their effectiveness in hospital settings.",
    status: "completed",
    currentRound: 4,
    totalRounds: 4,
    totalPanelists: 15,
    respondedPanelists: 15,
    consensusPercent: 91,
    createdAt: "2023-10-01T08:00:00Z",
    updatedAt: "2024-01-20T16:45:00Z",
  },
  {
    id: "delphi-4",
    title: "Telemedicine Quality Indicators",
    description:
      "Defining measurable quality indicators for telemedicine consultations across primary and specialty care.",
    status: "draft",
    currentRound: 0,
    totalRounds: 3,
    totalPanelists: 8,
    respondedPanelists: 0,
    consensusPercent: 0,
    createdAt: "2024-03-01T12:00:00Z",
    updatedAt: "2024-03-02T09:15:00Z",
  },
  {
    id: "delphi-5",
    title: "Patient Safety Reporting Framework",
    description:
      "Consensus development on standardized patient safety incident reporting and classification across healthcare systems.",
    status: "active",
    currentRound: 1,
    totalRounds: 3,
    totalPanelists: 22,
    respondedPanelists: 16,
    consensusPercent: 34,
    createdAt: "2024-02-15T11:00:00Z",
    updatedAt: "2024-03-04T10:30:00Z",
  },
  {
    id: "delphi-6",
    title: "Rehabilitation Outcome Measures",
    description:
      "Establishing expert agreement on core outcome measures for post-surgical musculoskeletal rehabilitation programs.",
    status: "completed",
    currentRound: 3,
    totalRounds: 3,
    totalPanelists: 10,
    respondedPanelists: 10,
    consensusPercent: 86,
    createdAt: "2023-11-10T09:30:00Z",
    updatedAt: "2024-02-28T15:00:00Z",
  },
];

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

export default function DelphiPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return MOCK_STUDIES.filter((s) => {
      const matchesSearch =
        !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const counts = {
    all: MOCK_STUDIES.length,
    active: MOCK_STUDIES.filter((s) => s.status === "active").length,
    completed: MOCK_STUDIES.filter((s) => s.status === "completed").length,
    draft: MOCK_STUDIES.filter((s) => s.status === "draft").length,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Delphi Studies</h1>
          <p className="text-sm text-muted-foreground">
            Manage multi-round expert consensus studies using the Delphi method.
          </p>
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
          const config = statusConfig[study.status];
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
                    {study.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metrics row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-semibold">
                        {study.currentRound}/{study.totalRounds}
                      </p>
                      <p className="text-xs text-muted-foreground">Rounds</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {study.totalPanelists}
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
                      {study.respondedPanelists}/{study.totalPanelists} responded
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(study.updatedAt).toLocaleDateString("en-US", {
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
            No Delphi studies found.
          </p>
        </div>
      )}
    </div>
  );
}
