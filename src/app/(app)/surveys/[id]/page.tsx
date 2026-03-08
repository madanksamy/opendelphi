"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  Edit3,
  ExternalLink,
  Link2,
  Copy,
  Check,
  Share2,
  Settings,
  Send,
  Clock,
  Users,
  CheckCircle2,
  Gauge,
  Activity,
  Eye,
  FileEdit,
  Globe,
  Archive,
} from "lucide-react";

// ── Mock survey data ───────────────────────────────────────────────

const MOCK_SURVEY = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Customer Satisfaction Survey",
  description:
    "Collect feedback from customers about their experience with our product and services.",
  slug: "customer-satisfaction",
  type: "survey" as const,
  status: "published" as const,
  createdAt: "2025-12-15T10:00:00Z",
  updatedAt: "2026-02-28T14:30:00Z",
  publishedAt: "2026-01-05T09:00:00Z",
  version: 3,
  fieldCount: 11,
  stepCount: 4,
};

const MOCK_STATS = {
  totalResponses: 1247,
  completionRate: 84.2,
  avgDuration: "4m 32s",
  npsScore: 62,
  todayResponses: 23,
  weekResponses: 156,
};

const MOCK_ACTIVITY = [
  {
    id: 1,
    action: "Response received",
    detail: "from emma.smith@example.com",
    time: "2 minutes ago",
    icon: ClipboardList,
  },
  {
    id: 2,
    action: "Response received",
    detail: "from liam.johnson@example.com",
    time: "15 minutes ago",
    icon: ClipboardList,
  },
  {
    id: 3,
    action: "Survey edited",
    detail: "Updated question 5 wording",
    time: "2 hours ago",
    icon: FileEdit,
  },
  {
    id: 4,
    action: "Response received",
    detail: "from olivia.williams@example.com",
    time: "3 hours ago",
    icon: ClipboardList,
  },
  {
    id: 5,
    action: "Email blast sent",
    detail: "Sent to 350 recipients",
    time: "1 day ago",
    icon: Send,
  },
  {
    id: 6,
    action: "Survey published",
    detail: "Version 3 went live",
    time: "1 week ago",
    icon: Globe,
  },
  {
    id: 7,
    action: "Response milestone",
    detail: "Reached 1,000 responses",
    time: "2 weeks ago",
    icon: Activity,
  },
  {
    id: 8,
    action: "Survey edited",
    detail: "Added NPS question",
    time: "3 weeks ago",
    icon: FileEdit,
  },
];

// ── Helpers ────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  draft: { variant: "secondary", label: "Draft" },
  published: { variant: "default", label: "Published" },
  closed: { variant: "destructive", label: "Closed" },
  archived: { variant: "outline", label: "Archived" },
};

// ── Page ───────────────────────────────────────────────────────────

export default function SurveyOverviewPage() {
  const params = useParams();
  const surveyId = params.id as string;
  const [copied, setCopied] = useState(false);

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/s/${MOCK_SURVEY.slug}`;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const statusConfig = STATUS_STYLES[MOCK_SURVEY.status] ?? STATUS_STYLES.draft;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/surveys"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to surveys
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {MOCK_SURVEY.title}
                </h1>
                <Badge variant={statusConfig.variant}>
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                {MOCK_SURVEY.description}
              </p>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span>{MOCK_SURVEY.fieldCount} questions</span>
                <span>{MOCK_SURVEY.stepCount} steps</span>
                <span>v{MOCK_SURVEY.version}</span>
                <span>
                  Created{" "}
                  {new Date(MOCK_SURVEY.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/surveys/${surveyId}/analytics`}>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Analytics
                </Button>
              </Link>
              <Button size="sm">
                <Edit3 className="h-4 w-4 mr-1" />
                Edit Survey
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-3 lg:grid-cols-6">
          {[
            {
              label: "Total Responses",
              value: MOCK_STATS.totalResponses.toLocaleString(),
              icon: Users,
            },
            {
              label: "Completion Rate",
              value: `${MOCK_STATS.completionRate}%`,
              icon: CheckCircle2,
            },
            {
              label: "Avg Duration",
              value: MOCK_STATS.avgDuration,
              icon: Clock,
            },
            {
              label: "NPS Score",
              value: String(MOCK_STATS.npsScore),
              icon: Gauge,
            },
            {
              label: "Today",
              value: String(MOCK_STATS.todayResponses),
              icon: Activity,
            },
            {
              label: "This Week",
              value: String(MOCK_STATS.weekResponses),
              icon: Activity,
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {stat.label}
                    </span>
                  </div>
                  <span className="text-xl font-bold">{stat.value}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column - Navigation & Share */}
          <div className="space-y-6 lg:col-span-2">
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Manage Survey</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    {
                      href: `/surveys/${surveyId}/analytics`,
                      icon: BarChart3,
                      label: "Analytics",
                      description: "Charts, trends, and AI insights",
                    },
                    {
                      href: `/surveys/${surveyId}/responses`,
                      icon: ClipboardList,
                      label: "Responses",
                      description: "View and export all responses",
                    },
                    {
                      href: `/surveys/${surveyId}/distribute`,
                      icon: Share2,
                      label: "Distribute",
                      description: "Email, SMS, links, and embed",
                    },
                    {
                      href: "#",
                      icon: Settings,
                      label: "Settings",
                      description: "Survey configuration and access",
                    },
                  ].map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
                      >
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{link.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {link.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Share Link */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Share Link</CardTitle>
                <CardDescription>
                  Send this link to respondents to collect responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={shareUrl}
                      readOnly
                      className="pl-9 pr-4 bg-muted/50 font-mono text-sm"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleCopy}
                    className="min-w-[100px]"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Link href={shareUrl} target="_blank">
                    <Button variant="outline" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {MOCK_ACTIVITY.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="rounded-full border bg-background p-1.5">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        {idx < MOCK_ACTIVITY.length - 1 && (
                          <div className="w-px flex-1 bg-border my-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium leading-tight">
                          {item.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.detail}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
