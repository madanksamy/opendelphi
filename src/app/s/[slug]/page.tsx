import { createClient } from "@/lib/supabase/server";
import { SurveyForm } from "@/components/survey-renderer/SurveyForm";
import type { Survey } from "@/lib/schema/survey";

// Hardcoded demo survey — no DB required
const DEMO_SURVEY: Survey = {
  id: "demo",
  orgId: "demo",
  title: "Product Feedback Survey",
  description: "Help us improve OpenDelphi by sharing your experience. This is a live demo — try filling it out!",
  slug: "demo",
  type: "survey",
  status: "published",
  schema: [
    {
      id: "q1",
      type: "text",
      label: "What is your name?",
      required: false,
      properties: {},
    },
    {
      id: "q2",
      type: "select",
      label: "How did you hear about OpenDelphi?",
      required: true,
      options: [
        { id: "o1", label: "Search Engine", value: "search" },
        { id: "o2", label: "Social Media", value: "social" },
        { id: "o3", label: "Colleague Recommendation", value: "referral" },
        { id: "o4", label: "Conference / Event", value: "event" },
        { id: "o5", label: "Other", value: "other" },
      ],
      properties: {},
    },
    {
      id: "q3",
      type: "rating",
      label: "How would you rate the overall user experience?",
      required: true,
      properties: { maxRating: 5 },
    },
    {
      id: "q4",
      type: "multi_select",
      label: "Which features are most important to you?",
      required: false,
      options: [
        { id: "f1", label: "Form Builder", value: "form-builder" },
        { id: "f2", label: "Analytics Dashboard", value: "analytics" },
        { id: "f3", label: "Delphi Consensus", value: "consensus" },
        { id: "f4", label: "AI Insights", value: "ai" },
        { id: "f5", label: "Team Collaboration", value: "collaboration" },
        { id: "f6", label: "API & Integrations", value: "api" },
      ],
      properties: {},
    },
    {
      id: "q5",
      type: "nps",
      label: "How likely are you to recommend OpenDelphi to a colleague?",
      required: true,
      properties: {},
    },
    {
      id: "q6",
      type: "text",
      label: "Any suggestions or feedback?",
      required: false,
      properties: { multiline: true },
    },
  ],
  settings: {
    allowAnonymous: true,
    requireAuth: false,
    showProgressBar: true,
    showQuestionNumbers: true,
    shuffleQuestions: false,
    notifyOnResponse: false,
    confirmationMessage: "Thank you for trying the demo! Your responses were not saved. Sign up to create your own surveys.",
  },
  multiStep: false,
  stepLabels: [],
  version: 1,
};

export default async function PublicSurveyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Demo survey — no DB lookup needed
  if (slug === "demo") {
    return (
      <main className="min-h-screen bg-background">
        <SurveyForm
          survey={DEMO_SURVEY}
          onSubmit={async () => {
            "use server";
            // Demo submissions are not saved
          }}
        />
      </main>
    );
  }

  const supabase = await createClient();

  const { data: row } = await supabase
    .from("surveys")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!row) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Survey Not Found</h1>
          <p className="text-muted-foreground">
            The survey you are looking for does not exist or has been closed.
          </p>
        </div>
      </div>
    );
  }

  const survey: Survey = {
    id: row.id,
    orgId: row.org_id,
    title: row.title,
    description: row.description || "",
    slug: row.slug,
    type: row.type || "survey",
    status: row.status,
    schema: row.schema || [],
    settings: row.settings || undefined,
    theme: row.theme || undefined,
    multiStep: row.multi_step || false,
    stepLabels: row.step_labels || [],
    version: row.version || 1,
  };

  return (
    <main className="min-h-screen bg-background">
      <SurveyForm
        survey={survey}
        onSubmit={async (answers) => {
          "use server";
          const { createClient: createServerClient } = await import("@/lib/supabase/server");
          const sb = await createServerClient();

          await sb.from("responses").insert({
            survey_id: row.id,
            survey_version: row.version || 1,
            answers,
            status: "complete",
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          });
        }}
      />
    </main>
  );
}
