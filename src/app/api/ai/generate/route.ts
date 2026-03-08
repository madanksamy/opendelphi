import { NextRequest, NextResponse } from "next/server";
import type { Field } from "@/lib/schema/survey";

// ── Types ───────────────────────────────────────────────────────────
interface GeneratedSurvey {
  title: string;
  description: string;
  fields: Field[];
  settings: {
    allowAnonymous: boolean;
    showProgressBar: boolean;
    showQuestionNumbers: boolean;
    confirmationMessage: string;
  };
  generatedAt: string;
}

// Helper to generate a UUID-like string
function genId(prefix: string, idx: number): string {
  const hex = idx.toString(16).padStart(4, "0");
  const p = prefix.padEnd(8, "0").slice(0, 8);
  return `${p}-${hex}-4000-c000-000000000000`;
}

function opt(fIdx: number, oIdx: number, label: string): { id: string; label: string; value: string } {
  return {
    id: `gen-opt-${fIdx}-${oIdx}`,
    label,
    value: label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/_+$/, ""),
  };
}

// ── Topic-based survey templates ────────────────────────────────────
interface TopicTemplate {
  keywords: string[];
  title: string;
  description: string;
  fields: Field[];
  confirmationMessage: string;
}

const topicTemplates: TopicTemplate[] = [
  {
    keywords: ["patient", "health", "hospital", "medical", "clinic", "care"],
    title: "Patient Experience Survey",
    description: "Comprehensive survey to measure patient satisfaction with healthcare services, staff interactions, and facility quality.",
    confirmationMessage: "Thank you for sharing your experience. Your feedback helps us improve patient care.",
    fields: [
      { id: genId("gen", 0), type: "statement", label: "Patient Experience Survey", description: "Your feedback is confidential and helps us improve the quality of care.", required: false, properties: { buttonText: "Begin" } },
      { id: genId("gen", 1), type: "select", label: "Type of visit", required: true, options: [opt(1, 0, "Outpatient"), opt(1, 1, "Inpatient"), opt(1, 2, "Emergency"), opt(1, 3, "Telehealth"), opt(1, 4, "Lab/Imaging")] },
      { id: genId("gen", 2), type: "rating", label: "Quality of care received", required: true, properties: { maxRating: 5, icon: "star" } },
      { id: genId("gen", 3), type: "rating", label: "Staff courtesy and professionalism", required: true, properties: { maxRating: 5, icon: "star" } },
      { id: genId("gen", 4), type: "scale", label: "How would you rate the wait time?", required: true, properties: { min: 1, max: 10, step: 1, minLabel: "Unacceptable", maxLabel: "Very reasonable" } },
      { id: genId("gen", 5), type: "scale", label: "Clarity of information provided about your condition", required: true, properties: { min: 1, max: 10, step: 1, minLabel: "Very unclear", maxLabel: "Very clear" } },
      { id: genId("gen", 6), type: "multi_select", label: "Which aspects were most positive?", required: false, options: [opt(6, 0, "Staff attentiveness"), opt(6, 1, "Cleanliness"), opt(6, 2, "Communication"), opt(6, 3, "Treatment effectiveness"), opt(6, 4, "Follow-up care"), opt(6, 5, "Ease of scheduling")] },
      { id: genId("gen", 7), type: "nps", label: "How likely are you to recommend us to others?", required: true, properties: { lowLabel: "Not at all likely", highLabel: "Extremely likely" } },
      { id: genId("gen", 8), type: "rating", label: "Facility cleanliness and comfort", required: true, properties: { maxRating: 5, icon: "star" } },
      { id: genId("gen", 9), type: "text", label: "What could we do to improve your experience?", required: false, properties: { placeholder: "Share your suggestions...", multiline: true }, validation: { maxLength: 2000 } },
    ],
  },
  {
    keywords: ["employee", "engagement", "workplace", "staff", "hr", "satisfaction", "work"],
    title: "Employee Engagement & Satisfaction Survey",
    description: "Measure employee sentiment across key dimensions including culture, leadership, growth, and well-being.",
    confirmationMessage: "Thank you for your honest feedback. Your responses are anonymous and drive meaningful change.",
    fields: [
      { id: genId("gen", 0), type: "select", label: "Department", required: true, options: [opt(0, 0, "Engineering"), opt(0, 1, "Product"), opt(0, 2, "Marketing"), opt(0, 3, "Sales"), opt(0, 4, "Operations"), opt(0, 5, "HR"), opt(0, 6, "Finance")] },
      { id: genId("gen", 1), type: "select", label: "How long have you worked here?", required: true, options: [opt(1, 0, "Less than 1 year"), opt(1, 1, "1-3 years"), opt(1, 2, "3-5 years"), opt(1, 3, "5-10 years"), opt(1, 4, "10+ years")] },
      { id: genId("gen", 2), type: "scale", label: "I feel valued for my contributions", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
      { id: genId("gen", 3), type: "scale", label: "I have the resources to do my job effectively", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
      { id: genId("gen", 4), type: "scale", label: "My manager provides clear guidance and feedback", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
      { id: genId("gen", 5), type: "scale", label: "I see a clear path for career advancement", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
      { id: genId("gen", 6), type: "scale", label: "Work-life balance is reasonable", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
      { id: genId("gen", 7), type: "nps", label: "How likely are you to recommend this as a great place to work?", required: true, properties: { lowLabel: "Not at all likely", highLabel: "Extremely likely" } },
      { id: genId("gen", 8), type: "text", label: "What is one thing we should change?", required: false, properties: { placeholder: "Your honest feedback...", multiline: true }, validation: { maxLength: 1500 } },
      { id: genId("gen", 9), type: "text", label: "What do you appreciate most about working here?", required: false, properties: { placeholder: "Share what you value...", multiline: true }, validation: { maxLength: 1500 } },
    ],
  },
  {
    keywords: ["event", "conference", "workshop", "seminar", "session", "attendee"],
    title: "Event Feedback Survey",
    description: "Gather attendee feedback on event quality, content relevance, logistics, and suggestions for future events.",
    confirmationMessage: "Thank you for your feedback! Your input helps us create better events.",
    fields: [
      { id: genId("gen", 0), type: "text", label: "Your name (optional)", required: false, properties: { placeholder: "First and last name" } },
      { id: genId("gen", 1), type: "select", label: "How did you hear about this event?", required: true, options: [opt(1, 0, "Email"), opt(1, 1, "Social media"), opt(1, 2, "Colleague"), opt(1, 3, "Company website"), opt(1, 4, "Other")] },
      { id: genId("gen", 2), type: "rating", label: "Overall event experience", required: true, properties: { maxRating: 5, icon: "star" } },
      { id: genId("gen", 3), type: "rating", label: "Content quality and relevance", required: true, properties: { maxRating: 5, icon: "star" } },
      { id: genId("gen", 4), type: "rating", label: "Speaker/presenter quality", required: true, properties: { maxRating: 5, icon: "star" } },
      { id: genId("gen", 5), type: "rating", label: "Venue and logistics", required: true, properties: { maxRating: 5, icon: "star" } },
      { id: genId("gen", 6), type: "scale", label: "How relevant was the content to your role?", required: true, properties: { min: 1, max: 10, step: 1, minLabel: "Not relevant", maxLabel: "Highly relevant" } },
      { id: genId("gen", 7), type: "nps", label: "How likely are you to attend future events?", required: true, properties: { lowLabel: "Not at all likely", highLabel: "Extremely likely" } },
      { id: genId("gen", 8), type: "multi_select", label: "Which topics interested you most?", required: false, options: [opt(8, 0, "Industry trends"), opt(8, 1, "Best practices"), opt(8, 2, "Networking"), opt(8, 3, "Technical deep-dives"), opt(8, 4, "Case studies"), opt(8, 5, "Panel discussions")] },
      { id: genId("gen", 9), type: "text", label: "Suggestions for future events", required: false, properties: { placeholder: "What would make the next event even better?", multiline: true }, validation: { maxLength: 1500 } },
    ],
  },
  {
    keywords: ["product", "feature", "feedback", "review", "software", "app", "ux", "usability"],
    title: "Product Feedback Survey",
    description: "Collect user feedback on product quality, usability, feature satisfaction, and areas for improvement.",
    confirmationMessage: "Thanks for your feedback! It directly influences our product roadmap.",
    fields: [
      { id: genId("gen", 0), type: "select", label: "How long have you been using this product?", required: true, options: [opt(0, 0, "Less than a month"), opt(0, 1, "1-6 months"), opt(0, 2, "6-12 months"), opt(0, 3, "1-2 years"), opt(0, 4, "2+ years")] },
      { id: genId("gen", 1), type: "select", label: "How often do you use this product?", required: true, options: [opt(1, 0, "Daily"), opt(1, 1, "Several times a week"), opt(1, 2, "Weekly"), opt(1, 3, "Monthly"), opt(1, 4, "Rarely")] },
      { id: genId("gen", 2), type: "rating", label: "Overall satisfaction", required: true, properties: { maxRating: 5, icon: "star" } },
      { id: genId("gen", 3), type: "rating", label: "Ease of use", required: true, properties: { maxRating: 5, icon: "star" } },
      { id: genId("gen", 4), type: "rating", label: "Reliability and performance", required: true, properties: { maxRating: 5, icon: "star" } },
      { id: genId("gen", 5), type: "rating", label: "Value for price", required: true, properties: { maxRating: 5, icon: "star" } },
      { id: genId("gen", 6), type: "multi_select", label: "Which features do you use most?", required: false, options: [opt(6, 0, "Dashboard"), opt(6, 1, "Reporting"), opt(6, 2, "Integrations"), opt(6, 3, "Automation"), opt(6, 4, "Collaboration"), opt(6, 5, "API")] },
      { id: genId("gen", 7), type: "nps", label: "How likely are you to recommend this product?", required: true, properties: { lowLabel: "Not at all likely", highLabel: "Extremely likely" } },
      { id: genId("gen", 8), type: "ranking", label: "Rank these improvements by priority", required: false, options: [opt(8, 0, "Performance"), opt(8, 1, "New features"), opt(8, 2, "Better UX"), opt(8, 3, "Pricing"), opt(8, 4, "Documentation")] },
      { id: genId("gen", 9), type: "text", label: "What feature would you most like to see added?", required: false, properties: { placeholder: "Describe the feature...", multiline: true }, validation: { maxLength: 1500 } },
      { id: genId("gen", 10), type: "text", label: "Any other feedback?", required: false, properties: { placeholder: "Anything else you'd like us to know...", multiline: true }, validation: { maxLength: 1500 } },
    ],
  },
  {
    keywords: ["course", "class", "education", "training", "instructor", "teacher", "learning"],
    title: "Course Evaluation Survey",
    description: "Evaluate course content, instruction quality, and learning outcomes to improve educational offerings.",
    confirmationMessage: "Thank you for your evaluation. Your feedback helps improve future courses.",
    fields: [
      { id: genId("gen", 0), type: "text", label: "Course name or code", required: true, properties: { placeholder: "e.g., MGMT 301" } },
      { id: genId("gen", 1), type: "rating", label: "Overall course quality", required: true, properties: { maxRating: 5, icon: "star" } },
      { id: genId("gen", 2), type: "rating", label: "Instructor effectiveness", required: true, properties: { maxRating: 5, icon: "star" } },
      { id: genId("gen", 3), type: "rating", label: "Course material quality", required: true, properties: { maxRating: 5, icon: "star" } },
      { id: genId("gen", 4), type: "scale", label: "Difficulty level was appropriate", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Much too easy", maxLabel: "Much too difficult" } },
      { id: genId("gen", 5), type: "scale", label: "Workload was manageable", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
      { id: genId("gen", 6), type: "matrix", label: "Rate the following components", required: true, properties: { rows: ["Lectures", "Readings", "Assignments", "Assessments", "Group work"], columns: ["Poor", "Fair", "Good", "Very Good", "Excellent"], allowMultiple: false } },
      { id: genId("gen", 7), type: "scale", label: "I achieved the stated learning objectives", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
      { id: genId("gen", 8), type: "text", label: "Most valuable aspect of this course", required: false, properties: { placeholder: "What helped you learn the most?", multiline: true }, validation: { maxLength: 1000 } },
      { id: genId("gen", 9), type: "text", label: "Suggestions for improvement", required: false, properties: { placeholder: "How could this course be better?", multiline: true }, validation: { maxLength: 1000 } },
    ],
  },
  {
    keywords: ["research", "study", "academic", "survey", "data", "participant"],
    title: "Research Participant Survey",
    description: "Structured research questionnaire for collecting participant data with validated measurement scales.",
    confirmationMessage: "Thank you for participating in this research study. Your contribution is valuable.",
    fields: [
      { id: genId("gen", 0), type: "statement", label: "Research Study Questionnaire", description: "Your responses are confidential and will be used only for research purposes. This survey takes approximately 10 minutes.", required: false, properties: { buttonText: "I understand, begin" } },
      { id: genId("gen", 1), type: "select", label: "Age range", required: true, options: [opt(1, 0, "18-24"), opt(1, 1, "25-34"), opt(1, 2, "35-44"), opt(1, 3, "45-54"), opt(1, 4, "55-64"), opt(1, 5, "65+")] },
      { id: genId("gen", 2), type: "select", label: "Highest education level", required: true, options: [opt(2, 0, "High school"), opt(2, 1, "Some college"), opt(2, 2, "Bachelor's"), opt(2, 3, "Master's"), opt(2, 4, "Doctorate"), opt(2, 5, "Professional degree")] },
      { id: genId("gen", 3), type: "scale", label: "Rate your agreement: The topic is relevant to my daily life", required: true, properties: { min: 1, max: 7, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
      { id: genId("gen", 4), type: "scale", label: "Rate your agreement: I am knowledgeable about this topic", required: true, properties: { min: 1, max: 7, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
      { id: genId("gen", 5), type: "scale", label: "Rate your agreement: I have strong opinions on this topic", required: true, properties: { min: 1, max: 7, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
      { id: genId("gen", 6), type: "matrix", label: "Rate your experience with each factor", required: true, properties: { rows: ["Factor A", "Factor B", "Factor C", "Factor D"], columns: ["Never", "Rarely", "Sometimes", "Often", "Always"], allowMultiple: false } },
      { id: genId("gen", 7), type: "multi_select", label: "Select all that apply to your situation", required: true, options: [opt(7, 0, "Category 1"), opt(7, 1, "Category 2"), opt(7, 2, "Category 3"), opt(7, 3, "Category 4"), opt(7, 4, "None of the above")] },
      { id: genId("gen", 8), type: "text", label: "Please elaborate on your experiences", required: false, properties: { placeholder: "Provide additional context...", multiline: true }, validation: { maxLength: 2000 } },
      { id: genId("gen", 9), type: "select", label: "Would you be willing to participate in a follow-up study?", required: true, options: [opt(9, 0, "Yes"), opt(9, 1, "No"), opt(9, 2, "Maybe")] },
      { id: genId("gen", 10), type: "email", label: "Contact email (for follow-up only)", required: false, properties: { placeholder: "you@example.com" } },
    ],
  },
];

// Default/generic template for unmatched topics
const defaultTemplate: TopicTemplate = {
  keywords: [],
  title: "General Feedback Survey",
  description: "Collect feedback and insights on a specific topic with a balanced mix of quantitative and qualitative questions.",
  confirmationMessage: "Thank you for your feedback!",
  fields: [
    { id: genId("gen", 0), type: "text", label: "Your name (optional)", required: false, properties: { placeholder: "First name" } },
    { id: genId("gen", 1), type: "email", label: "Email address (optional)", required: false, properties: { placeholder: "you@example.com" } },
    { id: genId("gen", 2), type: "rating", label: "Overall satisfaction", required: true, properties: { maxRating: 5, icon: "star" } },
    { id: genId("gen", 3), type: "scale", label: "How well did this meet your expectations?", required: true, properties: { min: 1, max: 10, step: 1, minLabel: "Not at all", maxLabel: "Exceeded expectations" } },
    { id: genId("gen", 4), type: "select", label: "What best describes your experience?", required: true, options: [opt(4, 0, "Excellent"), opt(4, 1, "Good"), opt(4, 2, "Average"), opt(4, 3, "Below average"), opt(4, 4, "Poor")] },
    { id: genId("gen", 5), type: "multi_select", label: "What aspects stood out?", required: false, options: [opt(5, 0, "Quality"), opt(5, 1, "Communication"), opt(5, 2, "Timeliness"), opt(5, 3, "Professionalism"), opt(5, 4, "Value"), opt(5, 5, "Innovation")] },
    { id: genId("gen", 6), type: "nps", label: "How likely are you to recommend this to others?", required: true, properties: { lowLabel: "Not at all likely", highLabel: "Extremely likely" } },
    { id: genId("gen", 7), type: "text", label: "What did you like most?", required: false, properties: { placeholder: "Share what worked well...", multiline: true }, validation: { maxLength: 1000 } },
    { id: genId("gen", 8), type: "text", label: "What could be improved?", required: false, properties: { placeholder: "Share your suggestions...", multiline: true }, validation: { maxLength: 1000 } },
    { id: genId("gen", 9), type: "text", label: "Any additional comments?", required: false, properties: { placeholder: "Anything else you'd like us to know...", multiline: true }, validation: { maxLength: 1000 } },
  ],
};

function findBestTemplate(topic: string): TopicTemplate {
  const lowerTopic = topic.toLowerCase();
  let bestMatch: TopicTemplate | null = null;
  let bestScore = 0;

  for (const template of topicTemplates) {
    const score = template.keywords.filter((kw) => lowerTopic.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = template;
    }
  }

  return bestMatch ?? defaultTemplate;
}

// ── POST /api/ai/generate ───────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, description, fieldCount } = body;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "topic is required and must be a string" },
        { status: 400 }
      );
    }

    const searchText = `${topic} ${description ?? ""}`;
    const template = findBestTemplate(searchText);

    // Customize title and description based on the user's topic
    const customTitle = topic.length > 5 ? `${topic} Survey` : template.title;
    const customDescription = description ?? template.description;

    // Apply fieldCount limit if provided (clamp between 1 and template max)
    const maxFields = template.fields.length;
    const count =
      typeof fieldCount === "number" && fieldCount > 0
        ? Math.min(fieldCount, maxFields)
        : maxFields;
    const fields = template.fields.slice(0, count);

    const result: GeneratedSurvey = {
      title: customTitle,
      description: customDescription,
      fields,
      settings: {
        allowAnonymous: true,
        showProgressBar: true,
        showQuestionNumbers: true,
        confirmationMessage: template.confirmationMessage,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: result }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
