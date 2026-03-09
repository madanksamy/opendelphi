"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Loader2,
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
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/providers/UserProvider";

type Category =
  | "Healthcare"
  | "Education"
  | "Business"
  | "Events"
  | "HR"
  | "Research";

interface TemplateSchema {
  fields: Array<{
    id: string;
    type: string;
    label: string;
    required?: boolean;
    description?: string;
    options?: Array<{ id: string; label: string; value: string }>;
    properties?: Record<string, unknown>;
    validation?: Record<string, unknown>;
  }>;
}

interface Template {
  id: string;
  title: string;
  description: string;
  category: Category;
  fieldCount: number;
  icon: React.ElementType;
  popular?: boolean;
  schema: TemplateSchema;
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
    schema: {
      fields: [
        { id: "ps-1", type: "rating", label: "Overall quality of care", required: true, properties: { maxRating: 5, icon: "star" } },
        { id: "ps-2", type: "rating", label: "Staff courtesy and professionalism", required: true, properties: { maxRating: 5, icon: "star" } },
        { id: "ps-3", type: "scale", label: "How would you rate the wait time?", required: true, properties: { min: 1, max: 10, step: 1, minLabel: "Unacceptable", maxLabel: "Very reasonable" } },
        { id: "ps-4", type: "select", label: "Type of visit", required: true, options: [{ id: "ps-4-0", label: "Outpatient", value: "outpatient" }, { id: "ps-4-1", label: "Inpatient", value: "inpatient" }, { id: "ps-4-2", label: "Emergency", value: "emergency" }, { id: "ps-4-3", label: "Telehealth", value: "telehealth" }] },
        { id: "ps-5", type: "rating", label: "Facility cleanliness", required: true, properties: { maxRating: 5, icon: "star" } },
        { id: "ps-6", type: "nps", label: "How likely are you to recommend us?", required: true, properties: { lowLabel: "Not at all likely", highLabel: "Extremely likely" } },
        { id: "ps-7", type: "text", label: "What could we improve?", required: false, properties: { placeholder: "Share your suggestions...", multiline: true } },
      ],
    },
  },
  {
    id: "t2",
    title: "Pre-Visit Intake",
    description:
      "Streamline patient onboarding with comprehensive medical history, current medications, allergies, and chief complaint documentation.",
    category: "Healthcare",
    fieldCount: 24,
    icon: ClipboardList,
    schema: {
      fields: [
        { id: "pv-1", type: "text", label: "Full name", required: true },
        { id: "pv-2", type: "date", label: "Date of birth", required: true },
        { id: "pv-3", type: "select", label: "Gender", required: true, options: [{ id: "pv-3-0", label: "Male", value: "male" }, { id: "pv-3-1", label: "Female", value: "female" }, { id: "pv-3-2", label: "Other", value: "other" }, { id: "pv-3-3", label: "Prefer not to say", value: "prefer_not_to_say" }] },
        { id: "pv-4", type: "text", label: "Current medications", required: false, properties: { multiline: true, placeholder: "List all current medications..." } },
        { id: "pv-5", type: "text", label: "Known allergies", required: false, properties: { multiline: true, placeholder: "List known allergies..." } },
        { id: "pv-6", type: "text", label: "Chief complaint / reason for visit", required: true, properties: { multiline: true } },
        { id: "pv-7", type: "multi_select", label: "Past medical conditions", required: false, options: [{ id: "pv-7-0", label: "Diabetes", value: "diabetes" }, { id: "pv-7-1", label: "Hypertension", value: "hypertension" }, { id: "pv-7-2", label: "Heart disease", value: "heart_disease" }, { id: "pv-7-3", label: "Asthma", value: "asthma" }, { id: "pv-7-4", label: "None", value: "none" }] },
      ],
    },
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
    schema: {
      fields: [
        { id: "ee-1", type: "rating", label: "Overall job satisfaction", required: true, properties: { maxRating: 5, icon: "star" } },
        { id: "ee-2", type: "scale", label: "I feel valued by my team", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly disagree", maxLabel: "Strongly agree" } },
        { id: "ee-3", type: "scale", label: "I have opportunities for professional growth", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly disagree", maxLabel: "Strongly agree" } },
        { id: "ee-4", type: "scale", label: "My workload is manageable", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly disagree", maxLabel: "Strongly agree" } },
        { id: "ee-5", type: "nps", label: "How likely are you to recommend this company as a workplace?", required: true },
        { id: "ee-6", type: "text", label: "What would improve your work experience?", required: false, properties: { multiline: true } },
      ],
    },
  },
  {
    id: "t4",
    title: "Conference Feedback",
    description:
      "Gather attendee feedback on sessions, speakers, venue, networking opportunities, and overall event organization.",
    category: "Events",
    fieldCount: 15,
    icon: CalendarDays,
    schema: {
      fields: [
        { id: "cf-1", type: "rating", label: "Overall event rating", required: true, properties: { maxRating: 5, icon: "star" } },
        { id: "cf-2", type: "rating", label: "Quality of speakers", required: true, properties: { maxRating: 5, icon: "star" } },
        { id: "cf-3", type: "rating", label: "Venue and logistics", required: true, properties: { maxRating: 5, icon: "star" } },
        { id: "cf-4", type: "rating", label: "Networking opportunities", required: true, properties: { maxRating: 5, icon: "star" } },
        { id: "cf-5", type: "select", label: "Would you attend again?", required: true, options: [{ id: "cf-5-0", label: "Definitely", value: "definitely" }, { id: "cf-5-1", label: "Probably", value: "probably" }, { id: "cf-5-2", label: "Not sure", value: "not_sure" }, { id: "cf-5-3", label: "Probably not", value: "probably_not" }] },
        { id: "cf-6", type: "text", label: "Additional comments", required: false, properties: { multiline: true } },
      ],
    },
  },
  {
    id: "t5",
    title: "Course Evaluation",
    description:
      "Enable students to evaluate course content, teaching effectiveness, learning resources, and assignment relevance.",
    category: "Education",
    fieldCount: 16,
    icon: GraduationCap,
    schema: {
      fields: [
        { id: "ce-1", type: "rating", label: "Course content quality", required: true, properties: { maxRating: 5, icon: "star" } },
        { id: "ce-2", type: "rating", label: "Instructor effectiveness", required: true, properties: { maxRating: 5, icon: "star" } },
        { id: "ce-3", type: "scale", label: "The course materials were helpful", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly disagree", maxLabel: "Strongly agree" } },
        { id: "ce-4", type: "scale", label: "The workload was appropriate", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly disagree", maxLabel: "Strongly agree" } },
        { id: "ce-5", type: "nps", label: "How likely are you to recommend this course?", required: true },
        { id: "ce-6", type: "text", label: "What did you enjoy most about the course?", required: false, properties: { multiline: true } },
      ],
    },
  },
  {
    id: "t6",
    title: "Product Review",
    description:
      "Collect structured product feedback covering usability, features, value for money, and likelihood to recommend to others.",
    category: "Business",
    fieldCount: 12,
    icon: Star,
    schema: {
      fields: [
        { id: "pr-1", type: "rating", label: "Overall product rating", required: true, properties: { maxRating: 5, icon: "star" } },
        { id: "pr-2", type: "rating", label: "Ease of use", required: true, properties: { maxRating: 5, icon: "star" } },
        { id: "pr-3", type: "rating", label: "Value for money", required: true, properties: { maxRating: 5, icon: "star" } },
        { id: "pr-4", type: "nps", label: "How likely are you to recommend this product?", required: true },
        { id: "pr-5", type: "multi_select", label: "What features do you use most?", required: false, options: [{ id: "pr-5-0", label: "Dashboard", value: "dashboard" }, { id: "pr-5-1", label: "Reports", value: "reports" }, { id: "pr-5-2", label: "Integrations", value: "integrations" }, { id: "pr-5-3", label: "Collaboration", value: "collaboration" }] },
        { id: "pr-6", type: "text", label: "How could we improve?", required: false, properties: { multiline: true } },
      ],
    },
  },
  {
    id: "t7",
    title: "Meeting Feedback",
    description:
      "Quick post-meeting evaluation covering agenda effectiveness, participation quality, action item clarity, and time management.",
    category: "Business",
    fieldCount: 8,
    icon: MessageSquare,
    schema: {
      fields: [
        { id: "mf-1", type: "rating", label: "Meeting effectiveness", required: true, properties: { maxRating: 5, icon: "star" } },
        { id: "mf-2", type: "scale", label: "The agenda was clear and followed", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly disagree", maxLabel: "Strongly agree" } },
        { id: "mf-3", type: "scale", label: "Action items were clearly defined", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly disagree", maxLabel: "Strongly agree" } },
        { id: "mf-4", type: "select", label: "Was the meeting the right length?", required: true, options: [{ id: "mf-4-0", label: "Too short", value: "too_short" }, { id: "mf-4-1", label: "Just right", value: "just_right" }, { id: "mf-4-2", label: "Too long", value: "too_long" }] },
        { id: "mf-5", type: "text", label: "Any additional feedback?", required: false, properties: { multiline: true } },
      ],
    },
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
    schema: {
      fields: [
        { id: "dr-1", type: "select", label: "Your relationship to this person", required: true, options: [{ id: "dr-1-0", label: "Manager", value: "manager" }, { id: "dr-1-1", label: "Peer", value: "peer" }, { id: "dr-1-2", label: "Direct report", value: "direct_report" }, { id: "dr-1-3", label: "Self", value: "self" }] },
        { id: "dr-2", type: "scale", label: "Leadership and decision-making", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Needs improvement", maxLabel: "Exceptional" } },
        { id: "dr-3", type: "scale", label: "Communication skills", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Needs improvement", maxLabel: "Exceptional" } },
        { id: "dr-4", type: "scale", label: "Teamwork and collaboration", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Needs improvement", maxLabel: "Exceptional" } },
        { id: "dr-5", type: "scale", label: "Problem-solving ability", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Needs improvement", maxLabel: "Exceptional" } },
        { id: "dr-6", type: "text", label: "What are this person's greatest strengths?", required: false, properties: { multiline: true } },
        { id: "dr-7", type: "text", label: "What areas could this person improve?", required: false, properties: { multiline: true } },
      ],
    },
  },
  {
    id: "t9",
    title: "Clinical Trial",
    description:
      "Structured data collection for clinical research including adverse events, efficacy measures, patient-reported outcomes, and compliance tracking.",
    category: "Research",
    fieldCount: 35,
    icon: FlaskConical,
    schema: {
      fields: [
        { id: "ct-1", type: "text", label: "Participant ID", required: true },
        { id: "ct-2", type: "date", label: "Visit date", required: true },
        { id: "ct-3", type: "select", label: "Visit type", required: true, options: [{ id: "ct-3-0", label: "Baseline", value: "baseline" }, { id: "ct-3-1", label: "Follow-up", value: "follow_up" }, { id: "ct-3-2", label: "Final", value: "final" }] },
        { id: "ct-4", type: "multi_select", label: "Reported adverse events", required: false, options: [{ id: "ct-4-0", label: "None", value: "none" }, { id: "ct-4-1", label: "Mild", value: "mild" }, { id: "ct-4-2", label: "Moderate", value: "moderate" }, { id: "ct-4-3", label: "Severe", value: "severe" }] },
        { id: "ct-5", type: "scale", label: "Self-reported symptom severity", required: true, properties: { min: 0, max: 10, step: 1, minLabel: "No symptoms", maxLabel: "Worst possible" } },
        { id: "ct-6", type: "text", label: "Notes", required: false, properties: { multiline: true } },
      ],
    },
  },
  {
    id: "t10",
    title: "Market Research",
    description:
      "Explore consumer preferences, brand perception, purchase behavior, and competitive landscape through targeted survey questions.",
    category: "Research",
    fieldCount: 22,
    icon: TrendingUp,
    schema: {
      fields: [
        { id: "mr-1", type: "select", label: "How did you hear about us?", required: true, options: [{ id: "mr-1-0", label: "Social media", value: "social_media" }, { id: "mr-1-1", label: "Search engine", value: "search_engine" }, { id: "mr-1-2", label: "Word of mouth", value: "word_of_mouth" }, { id: "mr-1-3", label: "Advertisement", value: "advertisement" }, { id: "mr-1-4", label: "Other", value: "other" }] },
        { id: "mr-2", type: "rating", label: "Brand perception", required: true, properties: { maxRating: 5, icon: "star" } },
        { id: "mr-3", type: "multi_select", label: "Which competitors do you also use?", required: false, options: [{ id: "mr-3-0", label: "Competitor A", value: "competitor_a" }, { id: "mr-3-1", label: "Competitor B", value: "competitor_b" }, { id: "mr-3-2", label: "Competitor C", value: "competitor_c" }, { id: "mr-3-3", label: "None", value: "none" }] },
        { id: "mr-4", type: "nps", label: "How likely are you to recommend our brand?", required: true },
        { id: "mr-5", type: "text", label: "What would make you choose us over competitors?", required: false, properties: { multiline: true } },
      ],
    },
  },
  {
    id: "t11",
    title: "Customer Exit",
    description:
      "Understand churn drivers by capturing reasons for leaving, satisfaction history, competitor comparisons, and win-back potential.",
    category: "Business",
    fieldCount: 14,
    icon: Briefcase,
    schema: {
      fields: [
        { id: "cx-1", type: "multi_select", label: "Reasons for leaving", required: true, options: [{ id: "cx-1-0", label: "Price", value: "price" }, { id: "cx-1-1", label: "Missing features", value: "missing_features" }, { id: "cx-1-2", label: "Poor support", value: "poor_support" }, { id: "cx-1-3", label: "Switched to competitor", value: "competitor" }, { id: "cx-1-4", label: "No longer needed", value: "no_longer_needed" }] },
        { id: "cx-2", type: "rating", label: "Overall satisfaction during your time with us", required: true, properties: { maxRating: 5, icon: "star" } },
        { id: "cx-3", type: "select", label: "Would you consider returning in the future?", required: true, options: [{ id: "cx-3-0", label: "Yes", value: "yes" }, { id: "cx-3-1", label: "Maybe", value: "maybe" }, { id: "cx-3-2", label: "No", value: "no" }] },
        { id: "cx-4", type: "text", label: "What could we have done differently?", required: false, properties: { multiline: true } },
      ],
    },
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
    schema: {
      fields: [
        { id: "nps-1", type: "nps", label: "How likely are you to recommend us to a friend or colleague?", required: true, properties: { lowLabel: "Not at all likely", highLabel: "Extremely likely" } },
        { id: "nps-2", type: "text", label: "What is the primary reason for your score?", required: true, properties: { multiline: true } },
        { id: "nps-3", type: "text", label: "What could we do to improve?", required: false, properties: { multiline: true } },
      ],
    },
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
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const router = useRouter();
  const { user, orgId } = useUser();

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

  async function handleUseTemplate(template: Template) {
    if (!user || !orgId) return;
    setCreatingId(template.id);
    try {
      const supabase = createClient();
      const slug = `${template.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}-${Date.now().toString(36)}`;

      const { data, error } = await supabase
        .from("surveys")
        .insert({
          org_id: orgId,
          created_by: user.id,
          title: template.title,
          description: template.description,
          slug,
          type: "standard",
          status: "draft",
          schema: template.schema,
          settings: {
            allowAnonymous: true,
            showProgressBar: true,
            showQuestionNumbers: true,
            confirmationMessage: "Thank you for your response!",
          },
          theme: {},
          multi_step: false,
          version: 1,
        })
        .select("id")
        .single();

      if (error) throw error;
      router.push(`/surveys/${data.id}/edit`);
    } catch (err) {
      console.error("Failed to create survey from template:", err);
      setCreatingId(null);
    }
  }

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
          const isCreating = creatingId === template.id;
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
                  disabled={isCreating || !user || !orgId}
                  onClick={() => handleUseTemplate(template)}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Use Template
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
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
