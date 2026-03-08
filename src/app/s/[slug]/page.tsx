import type { Survey } from "@/lib/schema/survey";
import { SurveyForm } from "@/components/survey-renderer/SurveyForm";

// ── Mock survey data ───────────────────────────────────────────────

const MOCK_SURVEY: Survey = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  orgId: "550e8400-e29b-41d4-a716-446655440001",
  title: "Customer Satisfaction Survey",
  description:
    "We value your feedback. Please take a few minutes to tell us about your experience with our product. Your responses will help us improve.",
  slug: "customer-satisfaction",
  type: "survey",
  status: "published",
  multiStep: true,
  stepLabels: [
    "About You",
    "Product Experience",
    "Detailed Feedback",
    "Final Thoughts",
  ],
  settings: {
    allowAnonymous: true,
    requireAuth: false,
    showProgressBar: true,
    showQuestionNumbers: true,
    shuffleQuestions: false,
    confirmationMessage:
      "Thank you for your feedback! Your responses help us build a better product for everyone.",
    notifyOnResponse: false,
  },
  theme: {
    primaryColor: "#6366f1",
    backgroundColor: "#ffffff",
    fontFamily: "Inter",
    borderRadius: 8,
  },
  schema: [
    // Step 0 - About You
    {
      id: "f1000000-0000-0000-0000-000000000001",
      type: "text",
      label: "Full Name",
      required: true,
      step: 0,
      properties: { placeholder: "John Doe" },
    },
    {
      id: "f1000000-0000-0000-0000-000000000002",
      type: "email",
      label: "Email Address",
      required: true,
      step: 0,
      properties: { placeholder: "you@example.com" },
    },
    {
      id: "f1000000-0000-0000-0000-000000000003",
      type: "select",
      label: "How did you hear about us?",
      required: false,
      step: 0,
      options: [
        { id: "src-1", label: "Search Engine", value: "search" },
        { id: "src-2", label: "Social Media", value: "social" },
        { id: "src-3", label: "Friend / Colleague", value: "referral" },
        { id: "src-4", label: "Blog / Article", value: "blog" },
        { id: "src-5", label: "Other", value: "other" },
      ],
    },

    // Step 1 - Product Experience
    {
      id: "f1000000-0000-0000-0000-000000000004",
      type: "rating",
      label: "Overall Satisfaction",
      description: "How satisfied are you with our product overall?",
      required: true,
      step: 1,
      properties: { maxRating: 5 },
    },
    {
      id: "f1000000-0000-0000-0000-000000000005",
      type: "multi_select",
      label: "Which features do you use most?",
      required: false,
      step: 1,
      options: [
        { id: "feat-1", label: "Survey Builder", value: "builder" },
        { id: "feat-2", label: "Analytics Dashboard", value: "analytics" },
        { id: "feat-3", label: "Team Collaboration", value: "collab" },
        { id: "feat-4", label: "API Integration", value: "api" },
        { id: "feat-5", label: "Custom Branding", value: "branding" },
      ],
    },
    {
      id: "f1000000-0000-0000-0000-000000000006",
      type: "scale",
      label: "Ease of Use",
      description: "How easy is it to use our platform?",
      required: true,
      step: 1,
      properties: {
        min: 1,
        max: 10,
        step: 1,
        minLabel: "Very Difficult",
        maxLabel: "Very Easy",
      },
    },

    // Step 2 - Detailed Feedback
    {
      id: "f1000000-0000-0000-0000-000000000007",
      type: "text",
      label: "What do you like most about our product?",
      required: false,
      step: 2,
      properties: { multiline: true, placeholder: "Tell us what you love..." },
      validation: { maxLength: 2000 },
    },
    {
      id: "f1000000-0000-0000-0000-000000000008",
      type: "text",
      label: "What could we improve?",
      required: false,
      step: 2,
      properties: {
        multiline: true,
        placeholder: "Share your suggestions...",
      },
      validation: { maxLength: 2000 },
    },
    {
      id: "f1000000-0000-0000-0000-000000000009",
      type: "matrix",
      label: "Rate these aspects of our service",
      required: false,
      step: 2,
      properties: {
        rows: ["Customer Support", "Documentation", "Performance", "Pricing"],
        columns: ["Poor", "Fair", "Good", "Excellent"],
      },
    },

    // Step 3 - Final Thoughts
    {
      id: "f1000000-0000-0000-0000-000000000010",
      type: "nps",
      label: "How likely are you to recommend us?",
      description:
        "On a scale of 0-10, how likely are you to recommend our product to a friend or colleague?",
      required: true,
      step: 3,
      properties: {
        lowLabel: "Not at all likely",
        highLabel: "Extremely likely",
      },
    },
    {
      id: "f1000000-0000-0000-0000-000000000011",
      type: "text",
      label: "Any additional comments?",
      required: false,
      step: 3,
      properties: { multiline: true, placeholder: "Anything else on your mind..." },
      validation: { maxLength: 2000 },
    },
  ],
  version: 1,
};

export default async function PublicSurveyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // In production this would fetch from DB by slug
  const survey = MOCK_SURVEY;

  if (!survey) {
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

  return (
    <main className="min-h-screen bg-background">
      <SurveyForm
        survey={survey}
        onSubmit={async (data) => {
          "use server";
          // In production, save response to DB
          console.log("Survey response submitted:", slug, data);
        }}
      />
    </main>
  );
}
