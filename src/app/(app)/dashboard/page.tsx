"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  FileDown,
  LayoutTemplate,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";

const statsCards = [
  {
    label: "Total Surveys",
    value: "24",
    change: "+3 this month",
    trend: "up" as const,
    icon: ClipboardList,
  },
  {
    label: "Total Responses",
    value: "4,821",
    change: "+12% from last month",
    trend: "up" as const,
    icon: Users,
  },
  {
    label: "Active Surveys",
    value: "8",
    change: "2 ending soon",
    trend: "neutral" as const,
    icon: BarChart3,
  },
  {
    label: "Response Rate",
    value: "68%",
    change: "+5% from last month",
    trend: "up" as const,
    icon: TrendingUp,
  },
];

const recentSurveys = [
  {
    id: "1",
    title: "Q1 Employee Satisfaction",
    status: "Active",
    responses: 342,
    target: 500,
    createdAt: "2026-02-15",
  },
  {
    id: "2",
    title: "Product Feature Prioritization",
    status: "Active",
    responses: 128,
    target: 200,
    createdAt: "2026-02-28",
  },
  {
    id: "3",
    title: "Customer Onboarding Feedback",
    status: "Active",
    responses: 89,
    target: 150,
    createdAt: "2026-03-01",
  },
  {
    id: "4",
    title: "Website Usability Study",
    status: "Draft",
    responses: 0,
    target: 100,
    createdAt: "2026-03-05",
  },
  {
    id: "5",
    title: "Annual Company Culture Survey",
    status: "Completed",
    responses: 450,
    target: 450,
    createdAt: "2026-01-10",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-emerald-500/10 text-emerald-600";
    case "Draft":
      return "bg-amber-500/10 text-amber-600";
    case "Completed":
      return "bg-blue-500/10 text-blue-600";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, Jane
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
                <th className="hidden px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">
                  Progress
                </th>
                <th className="hidden px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentSurveys.map((survey) => {
                const progress =
                  survey.target > 0
                    ? Math.round((survey.responses / survey.target) * 100)
                    : 0;
                return (
                  <tr
                    key={survey.id}
                    className="transition-colors hover:bg-muted/50"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-card-foreground">
                        {survey.title}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(survey.status)}`}
                      >
                        {survey.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {survey.responses.toLocaleString()} /{" "}
                      {survey.target.toLocaleString()}
                    </td>
                    <td className="hidden px-6 py-4 sm:table-cell">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {progress}%
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 text-sm text-muted-foreground md:table-cell">
                      {new Date(survey.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
