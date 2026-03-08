"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  BarChart3,
  Clock,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

// Mock data
const MOCK_SURVEYS = [
  {
    id: "1",
    title: "Customer Satisfaction Survey 2024",
    type: "survey" as const,
    status: "published" as const,
    responseCount: 342,
    updatedAt: "2024-03-05T10:30:00Z",
    description: "Annual customer satisfaction measurement",
  },
  {
    id: "2",
    title: "Employee Engagement Poll",
    type: "poll" as const,
    status: "draft" as const,
    responseCount: 0,
    updatedAt: "2024-03-04T14:20:00Z",
    description: "Quick pulse check on team morale",
  },
  {
    id: "3",
    title: "Product Feedback Form",
    type: "form" as const,
    status: "published" as const,
    responseCount: 89,
    updatedAt: "2024-03-03T09:15:00Z",
    description: "Collect feedback on new feature releases",
  },
  {
    id: "4",
    title: "Onboarding Knowledge Quiz",
    type: "quiz" as const,
    status: "closed" as const,
    responseCount: 156,
    updatedAt: "2024-02-28T16:45:00Z",
    description: "Test new hire knowledge after onboarding",
  },
  {
    id: "5",
    title: "Market Research Survey",
    type: "survey" as const,
    status: "draft" as const,
    responseCount: 0,
    updatedAt: "2024-03-01T11:00:00Z",
    description: "Understanding market trends and preferences",
  },
  {
    id: "6",
    title: "Event Registration Form",
    type: "form" as const,
    status: "archived" as const,
    responseCount: 203,
    updatedAt: "2024-01-15T08:30:00Z",
    description: "Registration for annual company event",
  },
];

const STATUS_CONFIG = {
  draft: { label: "Draft", variant: "secondary" as const, className: "bg-slate-100 text-slate-700" },
  published: { label: "Published", variant: "default" as const, className: "bg-green-100 text-green-700" },
  closed: { label: "Closed", variant: "outline" as const, className: "bg-amber-100 text-amber-700" },
  archived: { label: "Archived", variant: "outline" as const, className: "bg-gray-100 text-gray-500" },
};

const TYPE_ICONS = {
  survey: FileText,
  form: FileText,
  quiz: BarChart3,
  poll: BarChart3,
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return MOCK_SURVEYS.filter((s) => {
      const matchesSearch =
        search === "" ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

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
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((survey) => {
            const statusConf = STATUS_CONFIG[survey.status];
            const TypeIcon = TYPE_ICONS[survey.type];

            return (
              <Link key={survey.id} href={`/surveys/${survey.id}/edit`}>
                <Card className="group h-full transition-all hover:shadow-md hover:border-primary/30 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-md bg-muted p-1.5">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
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
                      {survey.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        <span>{survey.responseCount} responses</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(survey.updatedAt)}</span>
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
