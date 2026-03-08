"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/cn";
import { TrendingUp, BarChart3 } from "lucide-react";

interface QuestionDistribution {
  label: string;
  round1: number;
  round2: number;
  round3: number;
}

interface QuestionData {
  id: string;
  text: string;
  distributions: QuestionDistribution[];
  consensus: { round: number; percent: number }[];
}

interface RoundComparisonProps {
  className?: string;
}

const MOCK_QUESTIONS: QuestionData[] = [
  {
    id: "q1",
    text: "Recommended first-line treatment approach",
    distributions: [
      { label: "Surgery", round1: 45, round2: 30, round3: 18 },
      { label: "Medication", round1: 30, round2: 42, round3: 55 },
      { label: "Therapy", round1: 15, round2: 20, round3: 22 },
      { label: "Observation", round1: 10, round2: 8, round3: 5 },
    ],
    consensus: [
      { round: 1, percent: 45 },
      { round: 2, percent: 62 },
      { round: 3, percent: 78 },
    ],
  },
  {
    id: "q2",
    text: "Optimal treatment duration (months)",
    distributions: [
      { label: "3 months", round1: 20, round2: 12, round3: 8 },
      { label: "6 months", round1: 35, round2: 48, round3: 65 },
      { label: "9 months", round1: 25, round2: 28, round3: 20 },
      { label: "12 months", round1: 20, round2: 12, round3: 7 },
    ],
    consensus: [
      { round: 1, percent: 35 },
      { round: 2, percent: 58 },
      { round: 3, percent: 82 },
    ],
  },
  {
    id: "q3",
    text: "Minimum diagnostic criteria required",
    distributions: [
      { label: "2 criteria", round1: 15, round2: 8, round3: 5 },
      { label: "3 criteria", round1: 40, round2: 52, round3: 70 },
      { label: "4 criteria", round1: 30, round2: 30, round3: 20 },
      { label: "5+ criteria", round1: 15, round2: 10, round3: 5 },
    ],
    consensus: [
      { round: 1, percent: 40 },
      { round: 2, percent: 65 },
      { round: 3, percent: 85 },
    ],
  },
  {
    id: "q4",
    text: "Follow-up frequency after initial treatment",
    distributions: [
      { label: "Weekly", round1: 25, round2: 18, round3: 10 },
      { label: "Bi-weekly", round1: 30, round2: 40, round3: 55 },
      { label: "Monthly", round1: 35, round2: 35, round3: 30 },
      { label: "Quarterly", round1: 10, round2: 7, round3: 5 },
    ],
    consensus: [
      { round: 1, percent: 35 },
      { round: 2, percent: 52 },
      { round: 3, percent: 72 },
    ],
  },
  {
    id: "q5",
    text: "Patient age threshold for aggressive intervention",
    distributions: [
      { label: "Under 40", round1: 20, round2: 15, round3: 10 },
      { label: "40-55", round1: 25, round2: 30, round3: 22 },
      { label: "55-65", round1: 35, round2: 40, round3: 58 },
      { label: "Over 65", round1: 20, round2: 15, round3: 10 },
    ],
    consensus: [
      { round: 1, percent: 35 },
      { round: 2, percent: 55 },
      { round: 3, percent: 75 },
    ],
  },
];

const ROUND_COLORS = {
  round1: "#94a3b8",
  round2: "#60a5fa",
  round3: "#22c55e",
};

export function RoundComparison({ className }: RoundComparisonProps) {
  const [activeTab, setActiveTab] = useState("distribution");

  // Convergence trend data
  const convergenceData = [
    {
      round: "Round 1",
      ...Object.fromEntries(
        MOCK_QUESTIONS.map((q) => [q.id, q.consensus[0].percent])
      ),
      average:
        MOCK_QUESTIONS.reduce((sum, q) => sum + q.consensus[0].percent, 0) /
        MOCK_QUESTIONS.length,
    },
    {
      round: "Round 2",
      ...Object.fromEntries(
        MOCK_QUESTIONS.map((q) => [q.id, q.consensus[1].percent])
      ),
      average:
        MOCK_QUESTIONS.reduce((sum, q) => sum + q.consensus[1].percent, 0) /
        MOCK_QUESTIONS.length,
    },
    {
      round: "Round 3",
      ...Object.fromEntries(
        MOCK_QUESTIONS.map((q) => [q.id, q.consensus[2].percent])
      ),
      average:
        MOCK_QUESTIONS.reduce((sum, q) => sum + q.consensus[2].percent, 0) /
        MOCK_QUESTIONS.length,
    },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="distribution" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Distribution Shift
          </TabsTrigger>
          <TabsTrigger value="convergence" className="gap-1.5">
            <TrendingUp className="h-4 w-4" />
            Convergence Trend
          </TabsTrigger>
        </TabsList>

        {/* Distribution Charts */}
        <TabsContent value="distribution" className="space-y-4">
          {MOCK_QUESTIONS.map((question) => {
            const latestConsensus =
              question.consensus[question.consensus.length - 1].percent;
            return (
              <Card key={question.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {question.text}
                    </CardTitle>
                    <Badge
                      variant={latestConsensus >= 75 ? "default" : "secondary"}
                    >
                      {latestConsensus}% consensus
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={question.distributions}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        formatter={(value) => [`${value}%`, ""]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid hsl(var(--border))",
                          backgroundColor: "hsl(var(--card))",
                          color: "hsl(var(--card-foreground))",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="round1"
                        name="Round 1"
                        fill={ROUND_COLORS.round1}
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar
                        dataKey="round2"
                        name="Round 2"
                        fill={ROUND_COLORS.round2}
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar
                        dataKey="round3"
                        name="Round 3"
                        fill={ROUND_COLORS.round3}
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Convergence Trend */}
        <TabsContent value="convergence">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Consensus Convergence Across Rounds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={convergenceData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="round"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, ""]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      backgroundColor: "hsl(var(--card))",
                      color: "hsl(var(--card-foreground))",
                    }}
                  />
                  <Legend />
                  {MOCK_QUESTIONS.map((q, idx) => {
                    const colors = [
                      "#f87171",
                      "#60a5fa",
                      "#34d399",
                      "#fbbf24",
                      "#a78bfa",
                    ];
                    return (
                      <Line
                        key={q.id}
                        type="monotone"
                        dataKey={q.id}
                        name={q.text.length > 35 ? q.text.slice(0, 35) + "..." : q.text}
                        stroke={colors[idx]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    );
                  })}
                  <Line
                    type="monotone"
                    dataKey="average"
                    name="Average"
                    stroke="hsl(var(--foreground))"
                    strokeWidth={3}
                    strokeDasharray="6 3"
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Summary cards */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card>
              <CardContent className="flex flex-col items-center p-4">
                <span className="text-3xl font-bold text-muted-foreground">
                  38%
                </span>
                <span className="text-xs text-muted-foreground">
                  Avg Consensus - Round 1
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-4">
                <span className="text-3xl font-bold text-blue-500">58%</span>
                <span className="text-xs text-muted-foreground">
                  Avg Consensus - Round 2
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-4">
                <span className="text-3xl font-bold text-green-500">78%</span>
                <span className="text-xs text-muted-foreground">
                  Avg Consensus - Round 3
                </span>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
