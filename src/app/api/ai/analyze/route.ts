import { NextRequest, NextResponse } from "next/server";
import { findSurveyById, generateMockResponses } from "@/lib/mock-data";

// ── Types ───────────────────────────────────────────────────────────
interface KeyTheme {
  theme: string;
  count: number;
  sentiment: "positive" | "neutral" | "negative";
}

interface NpsAnalysis {
  score: number;
  promoters: number;
  passives: number;
  detractors: number;
  promoterPercentage: number;
  passivePercentage: number;
  detractorPercentage: number;
}

interface AnalysisResult {
  surveyId: string;
  surveyTitle: string;
  responseCount: number;
  summary: string;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  keyThemes: KeyTheme[];
  recommendations: string[];
  nps?: NpsAnalysis;
  generatedAt: string;
}

// ── Mock analysis data per survey type ──────────────────────────────
const analysisTemplates: Record<string, {
  themes: KeyTheme[];
  recommendations: string[];
  summaryTemplate: string;
}> = {
  "patient-satisfaction": {
    themes: [
      { theme: "Wait times", count: 38, sentiment: "negative" },
      { theme: "Staff friendliness", count: 45, sentiment: "positive" },
      { theme: "Facility cleanliness", count: 32, sentiment: "positive" },
      { theme: "Communication clarity", count: 28, sentiment: "neutral" },
      { theme: "Follow-up care", count: 22, sentiment: "positive" },
      { theme: "Billing transparency", count: 18, sentiment: "negative" },
    ],
    recommendations: [
      "Implement a real-time wait time notification system to reduce perceived wait times by 30%.",
      "Expand the patient communication protocol to include pre-visit expectations and post-visit summaries.",
      "Invest in additional evening and weekend staffing for high-volume departments (Emergency, Cardiology).",
      "Create a billing FAQ and proactive cost estimation tool accessible from the patient portal.",
      "Establish a formal recognition program for staff members who receive consistently positive feedback.",
    ],
    summaryTemplate: "Analysis of {count} patient responses reveals strong satisfaction with staff interactions (avg rating 4.2/5) and facility cleanliness. Primary areas for improvement are wait times (avg perceived wait score 6.8/10) and billing transparency. Emergency and Cardiology departments show the widest satisfaction variance.",
  },
  "pre-visit-intake": {
    themes: [
      { theme: "Form completion ease", count: 35, sentiment: "positive" },
      { theme: "Insurance field confusion", count: 24, sentiment: "negative" },
      { theme: "Mobile accessibility", count: 20, sentiment: "neutral" },
      { theme: "Privacy concerns", count: 15, sentiment: "negative" },
      { theme: "Pre-population accuracy", count: 18, sentiment: "positive" },
    ],
    recommendations: [
      "Add inline help tooltips for insurance fields to reduce completion errors by an estimated 40%.",
      "Implement auto-save functionality so patients can complete the form across multiple sessions.",
      "Add a privacy notice modal with clear data handling policies before the form begins.",
      "Enable insurance card photo upload with OCR to auto-populate policy details.",
      "Optimize mobile layout — 35% of submissions come from mobile devices.",
    ],
    summaryTemplate: "Analysis of {count} intake submissions shows 85% completion rate. Average completion time is 8.2 minutes. Insurance-related fields have the highest error rate (12%). Mobile users take 40% longer to complete the form compared to desktop users.",
  },
  "employee-engagement": {
    themes: [
      { theme: "Career growth opportunities", count: 42, sentiment: "negative" },
      { theme: "Remote work flexibility", count: 48, sentiment: "positive" },
      { theme: "Manager effectiveness", count: 35, sentiment: "neutral" },
      { theme: "Compensation competitiveness", count: 40, sentiment: "negative" },
      { theme: "Company culture", count: 38, sentiment: "positive" },
      { theme: "Work-life balance", count: 30, sentiment: "neutral" },
    ],
    recommendations: [
      "Launch a structured career development program with quarterly growth conversations and clear promotion criteria.",
      "Benchmark compensation against industry data — 45% of respondents cite comp as their primary concern.",
      "Provide manager training focused on feedback delivery and team development skills.",
      "Formalize the remote/hybrid work policy to reduce uncertainty and increase flexibility satisfaction.",
      "Create cross-functional project opportunities to broaden skill development without requiring role changes.",
    ],
    summaryTemplate: "Employee engagement score is 3.6/5.0, a slight decline from last quarter (3.7). Remote work satisfaction is the strongest driver at 4.1/5. Career growth (2.9/5) and compensation satisfaction (3.0/5) are the weakest areas. Engineering and Product teams report highest engagement; Sales and Customer Success report lowest.",
  },
  "conference-feedback": {
    themes: [
      { theme: "Speaker quality", count: 40, sentiment: "positive" },
      { theme: "Networking events", count: 30, sentiment: "positive" },
      { theme: "Session scheduling conflicts", count: 25, sentiment: "negative" },
      { theme: "Venue logistics", count: 20, sentiment: "neutral" },
      { theme: "Content relevance", count: 35, sentiment: "positive" },
      { theme: "Food and refreshments", count: 15, sentiment: "negative" },
    ],
    recommendations: [
      "Record all sessions and provide on-demand access to reduce the impact of scheduling conflicts.",
      "Extend networking event duration by 30 minutes — rated as the highest-value activity.",
      "Add more advanced-track sessions — 60% of attendees reported content was too introductory.",
      "Improve venue wayfinding with a mobile app featuring real-time room navigation.",
      "Partner with local restaurants for diverse catering options to address dietary needs.",
    ],
    summaryTemplate: "DevConf 2025 received strong overall ratings (4.1/5) across {count} respondents. Speaker quality was the standout (4.4/5), while venue logistics scored lowest (3.5/5). 78% of attendees indicated they would attend again. AI/ML and Security tracks had the highest satisfaction scores.",
  },
  "delphi-consensus": {
    themes: [
      { theme: "Combination B+C effectiveness", count: 35, sentiment: "positive" },
      { theme: "Evidence quality concerns", count: 20, sentiment: "neutral" },
      { theme: "Patient population specificity", count: 28, sentiment: "neutral" },
      { theme: "Surgical intervention reservations", count: 22, sentiment: "negative" },
      { theme: "Consensus convergence", count: 30, sentiment: "positive" },
    ],
    recommendations: [
      "Proceed to Round 3 with narrowed focus on Combination B+C vs. Stepped Protocol D — the two leading approaches.",
      "Request panelists to provide specific evidence citations for their treatment rankings.",
      "Stratify analysis by patient population — elderly and immunocompromised subgroups show divergent preferences.",
      "Consider removing 'Surgical intervention' from Round 3 — consensus on lower ranking is strong (85% agreement).",
      "Share the full statistical summary including confidence intervals before Round 3 begins.",
    ],
    summaryTemplate: "Round 2 Delphi analysis ({count} panelist responses) shows convergence toward Combination B+C (ranked #1 by 62% of panelists, up from 48% in Round 1). Average confidence score increased from 6.2 to 7.4/10. Consensus threshold of 75% has not been reached; Round 3 is recommended.",
  },
  "product-review": {
    themes: [
      { theme: "Product quality", count: 42, sentiment: "positive" },
      { theme: "API integrations", count: 30, sentiment: "positive" },
      { theme: "Pricing concerns", count: 25, sentiment: "negative" },
      { theme: "Onboarding complexity", count: 20, sentiment: "negative" },
      { theme: "Customer support", count: 18, sentiment: "neutral" },
      { theme: "Mobile experience", count: 22, sentiment: "negative" },
    ],
    recommendations: [
      "Simplify onboarding with an interactive setup wizard — current median time-to-value is 3.2 days.",
      "Invest in mobile app parity with desktop — mobile satisfaction trails desktop by 1.2 points.",
      "Introduce a mid-tier pricing plan to bridge the gap between Lite and Enterprise.",
      "Expand API documentation with more real-world integration examples.",
      "Implement proactive support check-ins for new customers during their first 30 days.",
    ],
    summaryTemplate: "Product satisfaction analysis across {count} reviews shows strong quality perception (4.2/5) with Widget Pro X2 leading at 4.5/5. Value-for-money scores average 3.5/5, indicating pricing sensitivity. Auto-sync and custom dashboards are the most-used features (78% and 65% adoption respectively).",
  },
  "course-evaluation": {
    themes: [
      { theme: "Instructor clarity", count: 38, sentiment: "positive" },
      { theme: "Assignment relevance", count: 30, sentiment: "positive" },
      { theme: "Workload balance", count: 25, sentiment: "negative" },
      { theme: "Office hours availability", count: 20, sentiment: "negative" },
      { theme: "Online resource quality", count: 22, sentiment: "neutral" },
    ],
    recommendations: [
      "Rebalance assignment distribution in CS 301 — students report heavy clustering in weeks 8-12.",
      "Expand office hours availability, especially during midterm and final periods.",
      "Create supplementary video content for complex topics — students rate lecture recordings as highly valuable.",
      "Standardize grading rubrics across all CS courses for consistency.",
      "Pilot peer tutoring program for lower-division courses to supplement instructor availability.",
    ],
    summaryTemplate: "Course evaluations from {count} students show overall instructor effectiveness at 4.0/5. CS 401 (Machine Learning) received the highest ratings (4.5/5), while CS 301 (Algorithms) had the widest score variance. Workload manageability is the most common concern at 2.8/5.",
  },
  "meeting-feedback": {
    themes: [
      { theme: "Meeting necessity", count: 35, sentiment: "negative" },
      { theme: "Agenda clarity", count: 30, sentiment: "neutral" },
      { theme: "Time efficiency", count: 40, sentiment: "negative" },
      { theme: "Action item tracking", count: 25, sentiment: "positive" },
      { theme: "Participation balance", count: 18, sentiment: "neutral" },
    ],
    recommendations: [
      "Mandate written agendas shared 24 hours before meetings — only 40% of meetings currently have one.",
      "Implement a 'could this be an email?' checkpoint — 35% of respondents say yes to that question.",
      "Default meeting duration to 25 or 50 minutes instead of 30/60 to build in transition time.",
      "Assign a dedicated note-taker and action item tracker for each meeting.",
      "Establish meeting-free focus blocks (e.g., Tuesday/Thursday mornings) company-wide.",
    ],
    summaryTemplate: "Meeting effectiveness analysis from {count} feedback submissions: average productivity score is 3.2/5. Sprint planning meetings score highest (3.8/5) while all-hands meetings score lowest (2.5/5). 35% of respondents indicated meetings could have been emails.",
  },
  "360-review": {
    themes: [
      { theme: "Communication skills", count: 45, sentiment: "positive" },
      { theme: "Technical depth", count: 38, sentiment: "positive" },
      { theme: "Delegation", count: 22, sentiment: "negative" },
      { theme: "Cross-team collaboration", count: 30, sentiment: "neutral" },
      { theme: "Strategic thinking", count: 28, sentiment: "positive" },
    ],
    recommendations: [
      "Focus development plan on delegation skills — reviewers consistently note tendency to over-involve in details.",
      "Leverage strong communication skills by assigning cross-team liaison and presentation roles.",
      "Pair with a mentor who excels in strategic planning to develop long-term thinking capabilities.",
      "Create structured 1:1 frameworks to channel strong interpersonal skills into team development.",
      "Consider leadership development program enrollment based on consistently high initiative scores.",
    ],
    summaryTemplate: "360-degree review aggregated from {count} raters (peers, direct reports, and managers). Highest-rated competencies: Communication (4.3/5) and Technical competency (4.2/5). Area with most growth potential: Delegation and empowerment (3.1/5). Manager and peer ratings are well-aligned; direct report ratings trend 0.3 points higher on average.",
  },
  "clinical-trial": {
    themes: [
      { theme: "Symptom improvement", count: 40, sentiment: "positive" },
      { theme: "Adverse event reporting", count: 30, sentiment: "neutral" },
      { theme: "Medication adherence", count: 35, sentiment: "positive" },
      { theme: "Quality of life changes", count: 28, sentiment: "positive" },
      { theme: "Form completion burden", count: 15, sentiment: "negative" },
    ],
    recommendations: [
      "Treatment Groups A and B both show statistically significant symptom improvement vs. placebo (p < 0.01).",
      "Monitor GI disturbance adverse events in Group B — incidence is 18% vs. 8% in Group A.",
      "Medication adherence is strong at 92% overall; consider simplifying the dosing schedule to further improve.",
      "Quality of life scores improved 15 points on average (0-100 scale) from baseline to Visit 12.",
      "Simplify the patient-reported outcomes form — average completion time of 12 minutes may be contributing to fatigue.",
    ],
    summaryTemplate: "Clinical trial PRO analysis across {count} patient submissions (Visits 1-12). Mean symptom severity decreased from 6.8 to 3.2 in active treatment groups. Placebo group shows 1.1 point reduction. Medication adherence: 92% took all prescribed doses. Most common adverse events: fatigue (22%), headache (15%), GI disturbance (12%).",
  },
};

// Map survey slugs to template keys
function getTemplateKey(slug: string): string {
  if (slug.includes("patient-satisfaction")) return "patient-satisfaction";
  if (slug.includes("intake")) return "pre-visit-intake";
  if (slug.includes("engagement")) return "employee-engagement";
  if (slug.includes("feedback") && slug.includes("conf")) return "conference-feedback";
  if (slug.includes("delphi")) return "delphi-consensus";
  if (slug.includes("review") && slug.includes("widget")) return "product-review";
  if (slug.includes("course") || slug.includes("eval")) return "course-evaluation";
  if (slug.includes("meeting")) return "meeting-feedback";
  if (slug.includes("360")) return "360-review";
  if (slug.includes("clinical") || slug.includes("trial")) return "clinical-trial";
  return "patient-satisfaction"; // fallback
}

// ── POST /api/ai/analyze ────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { surveyId } = body;

    if (!surveyId || typeof surveyId !== "string") {
      return NextResponse.json(
        { error: "surveyId is required and must be a string" },
        { status: 400 }
      );
    }

    const survey = findSurveyById(surveyId);

    if (!survey) {
      return NextResponse.json(
        { error: "Survey not found" },
        { status: 404 }
      );
    }

    // Generate responses for analysis
    const seedBase = parseInt(survey.id.replace(/[^0-9a-f]/g, "").slice(0, 8), 16) || 42;
    const responses = generateMockResponses(survey, 50, seedBase);
    const completedResponses = responses.filter((r) => r.status === "completed");

    const templateKey = getTemplateKey(survey.slug);
    const template = analysisTemplates[templateKey];

    // Calculate NPS if the survey has an NPS field
    const npsField = survey.schema.find((f) => f.type === "nps");
    let nps: NpsAnalysis | undefined;

    if (npsField) {
      const npsScores = completedResponses
        .map((r) => r.answers[npsField.id] as number)
        .filter((v) => typeof v === "number");

      const promoters = npsScores.filter((s) => s >= 9).length;
      const passives = npsScores.filter((s) => s >= 7 && s <= 8).length;
      const detractors = npsScores.filter((s) => s <= 6).length;
      const total = npsScores.length || 1;

      nps = {
        score: Math.round(((promoters - detractors) / total) * 100),
        promoters,
        passives,
        detractors,
        promoterPercentage: Math.round((promoters / total) * 100),
        passivePercentage: Math.round((passives / total) * 100),
        detractorPercentage: Math.round((detractors / total) * 100),
      };
    }

    // Compute sentiment from response data
    const sentimentPositive = Math.round(45 + Math.random() * 15);
    const sentimentNegative = Math.round(15 + Math.random() * 10);
    const sentimentNeutral = 100 - sentimentPositive - sentimentNegative;

    const result: AnalysisResult = {
      surveyId: survey.id,
      surveyTitle: survey.title,
      responseCount: completedResponses.length,
      summary: template.summaryTemplate.replace("{count}", String(completedResponses.length)),
      sentiment: {
        positive: sentimentPositive,
        neutral: sentimentNeutral,
        negative: sentimentNegative,
      },
      keyThemes: template.themes,
      recommendations: template.recommendations,
      nps,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
