"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Users,
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils/cn";
import { ConsensusGauge } from "@/components/delphi/ConsensusGauge";
import {
  RoundManager,
  type DelphiRound,
} from "@/components/delphi/RoundManager";
import {
  PanelManager,
  type Panelist,
} from "@/components/delphi/PanelManager";
import { RoundComparison } from "@/components/delphi/RoundComparison";

// ── Mock Data ──────────────────────────────────────────────────────────

const STUDY = {
  id: "delphi-1",
  title: "Clinical Treatment Protocol Consensus",
  description:
    "A multi-round Delphi study to establish expert consensus on first-line treatment approaches for chronic inflammatory conditions in adult patients aged 30-65. The study aims to develop standardized treatment protocols that can be adopted across academic medical centers.",
  status: "active" as const,
  methodology: "Modified Delphi with controlled feedback",
  targetConsensus: 75,
  createdAt: "2024-01-15T09:00:00Z",
  startedAt: "2024-01-20T10:00:00Z",
  estimatedCompletion: "2024-04-15T00:00:00Z",
  questionCount: 5,
};

const QUESTIONS = [
  "Recommended first-line treatment approach",
  "Optimal treatment duration (months)",
  "Minimum diagnostic criteria required",
  "Follow-up frequency after initial treatment",
  "Patient age threshold for aggressive intervention",
];

const MOCK_ROUNDS: DelphiRound[] = [
  {
    id: "r1",
    number: 1,
    status: "completed",
    startDate: "2024-01-20T10:00:00Z",
    endDate: "2024-02-03T23:59:59Z",
    responseCount: 12,
    totalPanelists: 12,
    questions: QUESTIONS.map((q, i) => ({
      id: `r1q${i}`,
      text: q,
      consensusPercent: [45, 35, 40, 35, 35][i],
      responseCount: 12,
    })),
  },
  {
    id: "r2",
    number: 2,
    status: "completed",
    startDate: "2024-02-05T10:00:00Z",
    endDate: "2024-02-19T23:59:59Z",
    responseCount: 11,
    totalPanelists: 12,
    questions: QUESTIONS.map((q, i) => ({
      id: `r2q${i}`,
      text: q,
      consensusPercent: [62, 58, 65, 52, 55][i],
      responseCount: 11,
    })),
  },
  {
    id: "r3",
    number: 3,
    status: "active",
    startDate: "2024-02-21T10:00:00Z",
    endDate: null,
    responseCount: 10,
    totalPanelists: 12,
    questions: QUESTIONS.map((q, i) => ({
      id: `r3q${i}`,
      text: q,
      consensusPercent: [78, 82, 85, 72, 75][i],
      responseCount: 10,
    })),
  },
  {
    id: "r4",
    number: 4,
    status: "pending",
    startDate: null,
    endDate: null,
    responseCount: 0,
    totalPanelists: 12,
    questions: [],
  },
];

const MOCK_PANELISTS: Panelist[] = [
  {
    id: "p1",
    name: "Dr. Sarah Chen",
    email: "s.chen@mayo.edu",
    expertise: "Rheumatology",
    status: "accepted",
    responseStatus: "completed",
  },
  {
    id: "p2",
    name: "Dr. Michael Torres",
    email: "m.torres@jhu.edu",
    expertise: "Internal Medicine",
    status: "accepted",
    responseStatus: "completed",
  },
  {
    id: "p3",
    name: "Dr. Emily Watson",
    email: "e.watson@stanford.edu",
    expertise: "Immunology",
    status: "accepted",
    responseStatus: "completed",
  },
  {
    id: "p4",
    name: "Dr. James Park",
    email: "j.park@clevelandclinic.org",
    expertise: "Gastroenterology",
    status: "accepted",
    responseStatus: "completed",
  },
  {
    id: "p5",
    name: "Dr. Lisa Ramirez",
    email: "l.ramirez@ucsf.edu",
    expertise: "Dermatology",
    status: "accepted",
    responseStatus: "completed",
  },
  {
    id: "p6",
    name: "Dr. Robert Kim",
    email: "r.kim@mit.edu",
    expertise: "Pharmacology",
    status: "accepted",
    responseStatus: "completed",
  },
  {
    id: "p7",
    name: "Dr. Anna Müller",
    email: "a.muller@charite.de",
    expertise: "Rheumatology",
    status: "accepted",
    responseStatus: "completed",
  },
  {
    id: "p8",
    name: "Dr. David Okonkwo",
    email: "d.okonkwo@upmc.edu",
    expertise: "Internal Medicine",
    status: "accepted",
    responseStatus: "completed",
  },
  {
    id: "p9",
    name: "Dr. Maria Gonzalez",
    email: "m.gonzalez@nyu.edu",
    expertise: "Clinical Trials",
    status: "accepted",
    responseStatus: "in_progress",
  },
  {
    id: "p10",
    name: "Dr. William Chang",
    email: "w.chang@uchicago.edu",
    expertise: "Biostatistics",
    status: "accepted",
    responseStatus: "in_progress",
  },
  {
    id: "p11",
    name: "Dr. Fatima Al-Rashidi",
    email: "f.alrashidi@kcl.ac.uk",
    expertise: "Epidemiology",
    status: "invited",
    responseStatus: "not_started",
  },
  {
    id: "p12",
    name: "Dr. Henrik Johansson",
    email: "h.johansson@ki.se",
    expertise: "Pharmacology",
    status: "declined",
    responseStatus: "not_started",
  },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ── Page ───────────────────────────────────────────────────────────────

export default function DelphiStudyPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [rounds, setRounds] = useState(MOCK_ROUNDS);

  const overallConsensus = Math.round(
    rounds
      .filter((r) => r.status !== "pending")
      .flatMap((r) => r.questions)
      .reduce((sum, q, _, arr) => sum + q.consensusPercent / arr.length, 0)
  );

  function handleStartRound(roundId: string) {
    setRounds((prev) =>
      prev.map((r) =>
        r.id === roundId
          ? {
              ...r,
              status: "active" as const,
              startDate: new Date().toISOString(),
            }
          : r
      )
    );
  }

  function handleCloseRound(roundId: string) {
    setRounds((prev) =>
      prev.map((r) =>
        r.id === roundId
          ? {
              ...r,
              status: "completed" as const,
              endDate: new Date().toISOString(),
            }
          : r
      )
    );
  }

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
                {STUDY.title}
              </h1>
              <Badge variant="default">Active</Badge>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {STUDY.description}
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
                      value: `${STUDY.targetConsensus}%`,
                      color: "text-blue-500",
                    },
                    {
                      icon: BarChart3,
                      label: "Questions",
                      value: STUDY.questionCount.toString(),
                      color: "text-purple-500",
                    },
                    {
                      icon: Users,
                      label: "Active Panelists",
                      value: `${MOCK_PANELISTS.filter((p) => p.status === "accepted").length}`,
                      color: "text-green-500",
                    },
                    {
                      icon: TrendingUp,
                      label: "Current Round",
                      value: `${rounds.filter((r) => r.status === "active")[0]?.number ?? "--"} of ${rounds.length}`,
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
                  { label: "Methodology", value: STUDY.methodology },
                  { label: "Created", value: formatDate(STUDY.createdAt) },
                  { label: "Started", value: formatDate(STUDY.startedAt) },
                  {
                    label: "Est. Completion",
                    value: formatDate(STUDY.estimatedCompletion),
                  },
                  {
                    label: "Target Consensus",
                    value: `${STUDY.targetConsensus}% agreement`,
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
                        {round.status !== "pending" && (
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
            onStartRound={handleStartRound}
            onCloseRound={handleCloseRound}
          />
        </TabsContent>

        {/* ── Panel ───────────────────────────────────────────────── */}
        <TabsContent value="panel">
          <PanelManager
            panelists={MOCK_PANELISTS}
            onAdd={(p) => console.log("Add panelist:", p)}
            onRemove={(id) => console.log("Remove panelist:", id)}
            onInvite={(ids) => console.log("Invite panelists:", ids)}
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
