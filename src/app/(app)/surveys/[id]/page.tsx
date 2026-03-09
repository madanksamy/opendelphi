"use client";

import { useState, useCallback, useEffect, use } from "react";
import Link from "next/link";
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
  Clock,
  Users,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SurveyData {
  id: string;
  title: string;
  description: string;
  slug: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  version: number;
  schema: unknown[];
  multi_step: boolean;
}

interface Stats {
  totalResponses: number;
  completedCount: number;
  completionRate: number;
}

const STATUS_STYLES: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  draft: { variant: "secondary", label: "Draft" },
  published: { variant: "default", label: "Published" },
  closed: { variant: "destructive", label: "Closed" },
  archived: { variant: "outline", label: "Archived" },
};

export default function SurveyOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: surveyId } = use(params);
  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [stats, setStats] = useState<Stats>({ totalResponses: 0, completedCount: 0, completionRate: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: surveyRow } = await supabase
        .from("surveys")
        .select("id, title, description, slug, type, status, created_at, updated_at, published_at, version, schema, multi_step")
        .eq("id", surveyId)
        .single();

      if (surveyRow) {
        setSurvey(surveyRow);

        // Get response counts
        const { data: responses } = await supabase
          .from("responses")
          .select("status")
          .eq("survey_id", surveyId);

        const total = responses?.length || 0;
        const completed = responses?.filter((r: { status: string }) => r.status === "complete").length || 0;

        setStats({
          totalResponses: total,
          completedCount: completed,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        });
      }

      setLoading(false);
    }
    load();
  }, [surveyId, supabase]);

  const shareUrl = survey
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/s/${survey.slug}`
    : "";

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Survey not found</p>
        <Link href="/surveys">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Surveys
          </Button>
        </Link>
      </div>
    );
  }

  const statusConfig = STATUS_STYLES[survey.status] ?? STATUS_STYLES.draft;
  const fieldCount = Array.isArray(survey.schema) ? survey.schema.length : 0;

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
                  {survey.title}
                </h1>
                <Badge variant={statusConfig.variant}>
                  {statusConfig.label}
                </Badge>
              </div>
              {survey.description && (
                <p className="text-muted-foreground max-w-2xl">
                  {survey.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span>{fieldCount} questions</span>
                <span>v{survey.version}</span>
                <span>
                  Created{" "}
                  {new Date(survey.created_at).toLocaleDateString()}
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
              <Link href={`/surveys/${surveyId}/edit`}>
                <Button size="sm">
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit Survey
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-3">
          {[
            {
              label: "Total Responses",
              value: stats.totalResponses.toLocaleString(),
              icon: Users,
            },
            {
              label: "Completed",
              value: stats.completedCount.toLocaleString(),
              icon: CheckCircle2,
            },
            {
              label: "Completion Rate",
              value: `${stats.completionRate}%`,
              icon: Clock,
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
                      description: "Charts, trends, and insights",
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
                      href: `/surveys/${surveyId}/edit`,
                      icon: Settings,
                      label: "Edit",
                      description: "Survey builder and configuration",
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
            {survey.status === "published" && (
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
            )}
          </div>

          {/* Right column - Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Survey Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{survey.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={statusConfig.variant} className="text-xs">
                    {statusConfig.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-medium">{fieldCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">v{survey.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Multi-step</span>
                  <span className="font-medium">{survey.multi_step ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {new Date(survey.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-medium">
                    {new Date(survey.updated_at).toLocaleDateString()}
                  </span>
                </div>
                {survey.published_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published</span>
                    <span className="font-medium">
                      {new Date(survey.published_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
