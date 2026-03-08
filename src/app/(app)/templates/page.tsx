"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Heart,
  GraduationCap,
  Briefcase,
  CalendarDays,
  UserCog,
  FlaskConical,
  Stethoscope,
  ClipboardList,
  SmilePlus,
  MessageSquare,
  Star,
  Users,
  TrendingUp,
  BarChart3,
  ThumbsUp,
  ArrowRight,
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
import { cn } from "@/lib/utils/cn";

type Category =
  | "Healthcare"
  | "Education"
  | "Business"
  | "Events"
  | "HR"
  | "Research";

interface Template {
  id: string;
  title: string;
  description: string;
  category: Category;
  fieldCount: number;
  icon: React.ElementType;
  popular?: boolean;
}

const CATEGORY_CONFIG: Record<
  Category,
  { color: string; bg: string; border: string }
> = {
  Healthcare: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
  },
  Education: {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
  },
  Business: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  Events: {
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800",
  },
  HR: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
  },
  Research: {
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    border: "border-cyan-200 dark:border-cyan-800",
  },
};

const TEMPLATES: Template[] = [
  {
    id: "t1",
    title: "Patient Satisfaction",
    description:
      "Measure patient experience across care dimensions including communication, wait times, facility quality, and overall satisfaction with treatment outcomes.",
    category: "Healthcare",
    fieldCount: 18,
    icon: Heart,
    popular: true,
  },
  {
    id: "t2",
    title: "Pre-Visit Intake",
    description:
      "Streamline patient onboarding with comprehensive medical history, current medications, allergies, and chief complaint documentation.",
    category: "Healthcare",
    fieldCount: 24,
    icon: ClipboardList,
  },
  {
    id: "t3",
    title: "Employee Engagement",
    description:
      "Assess workplace satisfaction, team dynamics, career development opportunities, and organizational culture alignment.",
    category: "HR",
    fieldCount: 20,
    icon: SmilePlus,
    popular: true,
  },
  {
    id: "t4",
    title: "Conference Feedback",
    description:
      "Gather attendee feedback on sessions, speakers, venue, networking opportunities, and overall event organization.",
    category: "Events",
    fieldCount: 15,
    icon: CalendarDays,
  },
  {
    id: "t5",
    title: "Course Evaluation",
    description:
      "Enable students to evaluate course content, teaching effectiveness, learning resources, and assignment relevance.",
    category: "Education",
    fieldCount: 16,
    icon: GraduationCap,
  },
  {
    id: "t6",
    title: "Product Review",
    description:
      "Collect structured product feedback covering usability, features, value for money, and likelihood to recommend to others.",
    category: "Business",
    fieldCount: 12,
    icon: Star,
  },
  {
    id: "t7",
    title: "Meeting Feedback",
    description:
      "Quick post-meeting evaluation covering agenda effectiveness, participation quality, action item clarity, and time management.",
    category: "Business",
    fieldCount: 8,
    icon: MessageSquare,
  },
  {
    id: "t8",
    title: "360-Degree Review",
    description:
      "Comprehensive multi-rater feedback covering leadership, communication, teamwork, problem-solving, and professional development.",
    category: "HR",
    fieldCount: 30,
    icon: UserCog,
    popular: true,
  },
  {
    id: "t9",
    title: "Clinical Trial",
    description:
      "Structured data collection for clinical research including adverse events, efficacy measures, patient-reported outcomes, and compliance tracking.",
    category: "Research",
    fieldCount: 35,
    icon: FlaskConical,
  },
  {
    id: "t10",
    title: "Market Research",
    description:
      "Explore consumer preferences, brand perception, purchase behavior, and competitive landscape through targeted survey questions.",
    category: "Research",
    fieldCount: 22,
    icon: TrendingUp,
  },
  {
    id: "t11",
    title: "Customer Exit",
    description:
      "Understand churn drivers by capturing reasons for leaving, satisfaction history, competitor comparisons, and win-back potential.",
    category: "Business",
    fieldCount: 14,
    icon: Briefcase,
  },
  {
    id: "t12",
    title: "NPS Survey",
    description:
      "Net Promoter Score measurement with follow-up questions to understand promoter and detractor motivations and improvement areas.",
    category: "Business",
    fieldCount: 6,
    icon: ThumbsUp,
    popular: true,
  },
];

const ALL_CATEGORIES: Category[] = [
  "Healthcare",
  "Education",
  "Business",
  "Events",
  "HR",
  "Research",
];

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  Healthcare: Stethoscope,
  Education: GraduationCap,
  Business: Briefcase,
  Events: CalendarDays,
  HR: Users,
  Research: FlaskConical,
};

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    return TEMPLATES.filter((t) => {
      const matchesSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Survey Templates
        </h1>
        <p className="text-sm text-muted-foreground">
          Start from professionally designed templates. Customize any template to
          fit your needs.
        </p>
      </div>

      {/* Search + category filter */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("all")}
          >
            All Templates
          </Button>
          {ALL_CATEGORIES.map((cat) => {
            const CatIcon = CATEGORY_ICONS[cat];
            return (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className="gap-1.5"
              >
                <CatIcon className="h-3.5 w-3.5" />
                {cat}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((template) => {
          const Icon = template.icon;
          const catConfig = CATEGORY_CONFIG[template.category];
          return (
            <Card
              key={template.id}
              className="group flex flex-col transition-shadow hover:shadow-lg"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      catConfig.bg,
                      catConfig.border,
                      "border"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", catConfig.color)} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {template.popular && (
                      <Badge variant="secondary" className="text-xs">
                        Popular
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="mt-3 text-base">
                  {template.title}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <BarChart3 className="h-3.5 w-3.5" />
                  {template.fieldCount} fields
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full gap-2 transition-transform group-hover:translate-x-0"
                  variant="outline"
                >
                  Use Template
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <Search className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No templates match your search.
          </p>
        </div>
      )}
    </div>
  );
}
