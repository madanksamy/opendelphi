import type { Survey, SurveyResponse, Field } from "@/lib/schema/survey";

// ── Deterministic UUID generator ────────────────────────────────────
function uuid(prefix: string, index: number): string {
  const hex = index.toString(16).padStart(4, "0");
  const p = prefix.padEnd(8, "0").slice(0, 8);
  return `${p}-${hex}-4000-a000-000000000000`;
}

function fieldId(surveyIdx: number, fieldIdx: number): string {
  const s = surveyIdx.toString(16).padStart(4, "0");
  const f = fieldIdx.toString(16).padStart(4, "0");
  return `f${s}${f}0-0000-4000-b000-000000000000`;
}

function optionId(fieldIdx: number, optIdx: number): string {
  return `opt-${fieldIdx}-${optIdx}`;
}

// ── Organization Types ──────────────────────────────────────────────
export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "business" | "enterprise";
  sector: string;
}

// ── Organizations (64 total, 8 per sector) ──────────────────────────
const sectors = [
  {
    name: "Healthcare",
    orgs: [
      { name: "Mount Sinai Medical Center", slug: "mount-sinai", plan: "enterprise" as const, specialty: true },
      { name: "Cleveland Clinic Foundation", slug: "cleveland-clinic", plan: "enterprise" as const, specialty: true },
      { name: "Mayo Regional Health", slug: "mayo-regional", plan: "business" as const, specialty: true },
      { name: "Pacific Northwest Health Partners", slug: "pnw-health", plan: "business" as const, specialty: true },
      { name: "Sunrise Community Hospital", slug: "sunrise-hospital", plan: "pro" as const, specialty: true },
      { name: "Lakewood Family Medicine", slug: "lakewood-family-med", plan: "pro" as const, specialty: true },
      { name: "Riverside Pediatric Associates", slug: "riverside-pediatric", plan: "business" as const, specialty: true },
      { name: "Coastal Dermatology Group", slug: "coastal-derm", plan: "pro" as const, specialty: true },
    ],
  },
  {
    name: "Medical Education",
    orgs: [
      { name: "Johns Hopkins School of Medicine", slug: "jh-med", plan: "enterprise" as const, specialty: true },
      { name: "Stanford Medical Education", slug: "stanford-med-ed", plan: "enterprise" as const, specialty: true },
      { name: "UCSF Continuing Medical Education", slug: "ucsf-cme", plan: "business" as const, specialty: true },
      { name: "Duke University Medical Programs", slug: "duke-med", plan: "business" as const, specialty: true },
      { name: "Emory School of Nursing", slug: "emory-nursing", plan: "pro" as const, specialty: true },
      { name: "Columbia Residency Programs", slug: "columbia-residency", plan: "business" as const, specialty: true },
      { name: "NYU Grossman Medical School", slug: "nyu-grossman", plan: "enterprise" as const, specialty: true },
      { name: "Baylor College of Medicine CME", slug: "baylor-cme", plan: "pro" as const, specialty: true },
    ],
  },
  {
    name: "Pharma",
    orgs: [
      { name: "Novartis Clinical Research", slug: "novartis-clinical", plan: "enterprise" as const, specialty: true },
      { name: "Pfizer Research Division", slug: "pfizer-research", plan: "enterprise" as const, specialty: true },
      { name: "AstraZeneca Trials Unit", slug: "az-trials", plan: "enterprise" as const, specialty: true },
      { name: "Merck Patient Outcomes", slug: "merck-outcomes", plan: "business" as const, specialty: true },
      { name: "Roche Diagnostics Feedback", slug: "roche-feedback", plan: "business" as const, specialty: true },
      { name: "BioGen Clinical Ops", slug: "biogen-ops", plan: "business" as const, specialty: true },
      { name: "Amgen Survey Division", slug: "amgen-surveys", plan: "pro" as const, specialty: true },
      { name: "Gilead Sciences QA", slug: "gilead-qa", plan: "pro" as const, specialty: true },
    ],
  },
  {
    name: "Corporate/HR",
    orgs: [
      { name: "Accenture People & Culture", slug: "accenture-hr", plan: "enterprise" as const, specialty: false },
      { name: "Deloitte Workforce Insights", slug: "deloitte-workforce", plan: "enterprise" as const, specialty: false },
      { name: "TechCorp Internal Ops", slug: "techcorp-ops", plan: "business" as const, specialty: false },
      { name: "GlobalBank HR Division", slug: "globalbank-hr", plan: "business" as const, specialty: false },
      { name: "Pinnacle Consulting Group", slug: "pinnacle-consulting", plan: "pro" as const, specialty: false },
      { name: "Vertex Manufacturing HR", slug: "vertex-mfg-hr", plan: "pro" as const, specialty: false },
      { name: "Sapphire Retail Corp", slug: "sapphire-retail", plan: "free" as const, specialty: false },
      { name: "NorthStar Logistics", slug: "northstar-logistics", plan: "free" as const, specialty: false },
    ],
  },
  {
    name: "Events",
    orgs: [
      { name: "SXSW Interactive", slug: "sxsw-interactive", plan: "enterprise" as const, specialty: false },
      { name: "TED Conferences", slug: "ted-conferences", plan: "enterprise" as const, specialty: false },
      { name: "WebSummit Events", slug: "websummit", plan: "business" as const, specialty: false },
      { name: "DevCon Global", slug: "devcon-global", plan: "business" as const, specialty: false },
      { name: "MedConf International", slug: "medconf-intl", plan: "business" as const, specialty: false },
      { name: "Academy Awards Ceremony", slug: "academy-awards", plan: "pro" as const, specialty: false },
      { name: "Local Meetup Network", slug: "local-meetups", plan: "free" as const, specialty: false },
      { name: "StartupWeek Foundation", slug: "startupweek", plan: "pro" as const, specialty: false },
    ],
  },
  {
    name: "Product/SaaS",
    orgs: [
      { name: "Stripe Developer Experience", slug: "stripe-devex", plan: "enterprise" as const, specialty: false },
      { name: "Notion Product Team", slug: "notion-product", plan: "enterprise" as const, specialty: false },
      { name: "Figma User Research", slug: "figma-ux-research", plan: "business" as const, specialty: false },
      { name: "Linear App Feedback", slug: "linear-feedback", plan: "business" as const, specialty: false },
      { name: "Vercel Customer Success", slug: "vercel-cs", plan: "business" as const, specialty: false },
      { name: "Indie SaaS Studio", slug: "indie-saas", plan: "pro" as const, specialty: false },
      { name: "CloudSync Analytics", slug: "cloudsync", plan: "pro" as const, specialty: false },
      { name: "PixelForge Design Tools", slug: "pixelforge", plan: "free" as const, specialty: false },
    ],
  },
  {
    name: "Education",
    orgs: [
      { name: "MIT Open Learning", slug: "mit-open-learning", plan: "enterprise" as const, specialty: false },
      { name: "Coursera for Campus", slug: "coursera-campus", plan: "enterprise" as const, specialty: false },
      { name: "State University System", slug: "state-university", plan: "business" as const, specialty: false },
      { name: "Brookfield Academy", slug: "brookfield-academy", plan: "business" as const, specialty: false },
      { name: "EduTech Online Academy", slug: "edutech-online", plan: "pro" as const, specialty: false },
      { name: "Summit Prep School", slug: "summit-prep", plan: "pro" as const, specialty: false },
      { name: "Community College District 5", slug: "cc-district-5", plan: "free" as const, specialty: false },
      { name: "Khan Academy Research", slug: "khan-research", plan: "business" as const, specialty: false },
    ],
  },
  {
    name: "Government",
    orgs: [
      { name: "US Dept of Health & Human Services", slug: "us-hhs", plan: "enterprise" as const, specialty: false },
      { name: "CDC Public Health Surveys", slug: "cdc-surveys", plan: "enterprise" as const, specialty: false },
      { name: "VA Patient Experience", slug: "va-patient-exp", plan: "enterprise" as const, specialty: false },
      { name: "State of California Health Dept", slug: "ca-health", plan: "business" as const, specialty: false },
      { name: "City of Austin Digital Services", slug: "austin-digital", plan: "business" as const, specialty: false },
      { name: "UK NHS Digital", slug: "nhs-digital", plan: "enterprise" as const, specialty: false },
      { name: "Parks & Recreation Department", slug: "parks-rec", plan: "free" as const, specialty: false },
      { name: "County Board of Education", slug: "county-boe", plan: "pro" as const, specialty: false },
    ],
  },
];

export const MOCK_ORGANIZATIONS: Organization[] = sectors.flatMap(
  (sector, sIdx) =>
    sector.orgs.map((org, oIdx) => ({
      id: uuid("org", sIdx * 8 + oIdx),
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      sector: sector.name,
    }))
);

// ── Helper: build option arrays ─────────────────────────────────────
function opts(
  fIdx: number,
  labels: string[]
): { id: string; label: string; value: string }[] {
  return labels.map((label, i) => ({
    id: optionId(fIdx, i),
    label,
    value: label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/_+$/, ""),
  }));
}

// ── Survey Definitions ──────────────────────────────────────────────

const survey0Fields: Field[] = [
  { id: fieldId(0, 0), type: "statement", label: "Thank you for taking our Patient Satisfaction Survey", description: "Your feedback helps us improve the quality of care we provide.", required: false, properties: { buttonText: "Begin Survey" } },
  { id: fieldId(0, 1), type: "select", label: "Which department did you visit?", required: true, options: opts(1, ["Emergency", "Cardiology", "Orthopedics", "Pediatrics", "Oncology", "General Practice", "Radiology", "Neurology"]) },
  { id: fieldId(0, 2), type: "rating", label: "How would you rate the quality of care you received?", required: true, properties: { maxRating: 5, icon: "star" } },
  { id: fieldId(0, 3), type: "scale", label: "How would you rate the cleanliness of our facilities?", required: true, properties: { min: 1, max: 10, step: 1, minLabel: "Very poor", maxLabel: "Excellent" } },
  { id: fieldId(0, 4), type: "rating", label: "How would you rate the friendliness of the staff?", required: true, properties: { maxRating: 5, icon: "star" } },
  { id: fieldId(0, 5), type: "scale", label: "How long did you wait before being seen?", description: "1 = Very short wait, 10 = Extremely long wait", required: true, properties: { min: 1, max: 10, step: 1, minLabel: "No wait", maxLabel: "Over 2 hours" } },
  { id: fieldId(0, 6), type: "nps", label: "How likely are you to recommend our hospital to a friend or family member?", required: true, properties: { lowLabel: "Not at all likely", highLabel: "Extremely likely" } },
  { id: fieldId(0, 7), type: "multi_select", label: "What aspects of your visit were most positive?", required: false, options: opts(7, ["Staff attentiveness", "Cleanliness", "Wait time", "Communication", "Treatment effectiveness", "Follow-up care", "Billing transparency"]) },
  { id: fieldId(0, 8), type: "text", label: "Please share any additional comments about your experience", required: false, properties: { placeholder: "Your feedback is valuable to us...", multiline: true }, validation: { maxLength: 2000 } },
];

const survey1Fields: Field[] = [
  { id: fieldId(1, 0), type: "text", label: "Full Name", required: true, properties: { placeholder: "First and Last Name" }, validation: { maxLength: 100 } },
  { id: fieldId(1, 1), type: "date", label: "Date of Birth", required: true, properties: { includeTime: false, dateFormat: "yyyy-MM-dd" } },
  { id: fieldId(1, 2), type: "email", label: "Email Address", required: true, properties: { placeholder: "you@example.com" } },
  { id: fieldId(1, 3), type: "phone", label: "Phone Number", required: true, properties: { placeholder: "(555) 555-5555", defaultCountry: "US" } },
  { id: fieldId(1, 4), type: "select", label: "Insurance Provider", required: true, options: opts(4, ["Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Cigna", "Humana", "Kaiser Permanente", "Medicare", "Medicaid", "Self-Pay", "Other"]) },
  { id: fieldId(1, 5), type: "text", label: "Insurance Policy Number", required: true, properties: { placeholder: "Enter policy number" } },
  { id: fieldId(1, 6), type: "multi_select", label: "Reason for Visit", required: true, options: opts(6, ["Annual checkup", "Follow-up appointment", "New symptoms", "Chronic condition management", "Prescription refill", "Lab work", "Referral", "Other"]) },
  { id: fieldId(1, 7), type: "text", label: "Current Medications", description: "List all current medications, dosages, and frequency", required: false, properties: { placeholder: "e.g., Lisinopril 10mg daily", multiline: true }, validation: { maxLength: 1000 } },
  { id: fieldId(1, 8), type: "multi_select", label: "Known Allergies", required: false, options: opts(8, ["Penicillin", "Sulfa drugs", "Aspirin", "Latex", "Iodine", "Codeine", "None", "Other"]) },
  { id: fieldId(1, 9), type: "select", label: "Preferred Pharmacy", required: false, options: opts(9, ["CVS", "Walgreens", "Rite Aid", "Walmart", "Costco", "Local pharmacy", "Mail order"]) },
  { id: fieldId(1, 10), type: "text", label: "Emergency Contact Name", required: true, properties: { placeholder: "Full name" } },
  { id: fieldId(1, 11), type: "phone", label: "Emergency Contact Phone", required: true, properties: { placeholder: "(555) 555-5555", defaultCountry: "US" } },
  { id: fieldId(1, 12), type: "signature", label: "Patient Signature", description: "By signing, you confirm the above information is accurate", required: true, properties: { penColor: "#000000", backgroundColor: "#ffffff" } },
];

const survey2Fields: Field[] = [
  { id: fieldId(2, 0), type: "statement", label: "Employee Engagement Survey 2025", description: "This anonymous survey takes approximately 10 minutes. Your honest feedback drives meaningful change.", required: false, properties: { buttonText: "Start" } },
  { id: fieldId(2, 1), type: "select", label: "Department", required: true, options: opts(1, ["Engineering", "Product", "Design", "Marketing", "Sales", "Customer Success", "HR", "Finance", "Operations", "Legal"]) },
  { id: fieldId(2, 2), type: "select", label: "Tenure at Company", required: true, options: opts(2, ["Less than 6 months", "6-12 months", "1-2 years", "2-5 years", "5-10 years", "10+ years"]) },
  { id: fieldId(2, 3), type: "scale", label: "I feel valued for my contributions", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
  { id: fieldId(2, 4), type: "scale", label: "I have the tools and resources to do my job effectively", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
  { id: fieldId(2, 5), type: "scale", label: "My manager provides clear expectations and feedback", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
  { id: fieldId(2, 6), type: "scale", label: "I see a clear path for career growth here", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
  { id: fieldId(2, 7), type: "scale", label: "Work-life balance at this company is reasonable", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
  { id: fieldId(2, 8), type: "nps", label: "How likely are you to recommend this company as a great place to work?", required: true, properties: { lowLabel: "Not at all likely", highLabel: "Extremely likely" } },
  { id: fieldId(2, 9), type: "ranking", label: "Rank these benefits in order of importance to you", required: true, options: opts(9, ["Health insurance", "Remote work flexibility", "Professional development", "Compensation", "PTO/Vacation", "Company culture"]) },
  { id: fieldId(2, 10), type: "text", label: "What is one thing the company could improve?", required: false, properties: { placeholder: "Share your thoughts...", multiline: true }, validation: { maxLength: 2000 } },
  { id: fieldId(2, 11), type: "text", label: "What do you appreciate most about working here?", required: false, properties: { placeholder: "Share what you value...", multiline: true }, validation: { maxLength: 2000 } },
];

const survey3Fields: Field[] = [
  { id: fieldId(3, 0), type: "text", label: "Your Name", required: false, properties: { placeholder: "Optional" } },
  { id: fieldId(3, 1), type: "email", label: "Email Address", required: false, properties: { placeholder: "For follow-up (optional)" } },
  { id: fieldId(3, 2), type: "select", label: "Which sessions did you attend?", required: true, options: opts(2, ["Opening Keynote", "Workshop Track A", "Workshop Track B", "Panel Discussion", "Lightning Talks", "Closing Keynote", "Networking Event"]) },
  { id: fieldId(3, 3), type: "rating", label: "Overall event quality", required: true, properties: { maxRating: 5, icon: "star" } },
  { id: fieldId(3, 4), type: "rating", label: "Speaker quality", required: true, properties: { maxRating: 5, icon: "star" } },
  { id: fieldId(3, 5), type: "rating", label: "Venue and logistics", required: true, properties: { maxRating: 5, icon: "star" } },
  { id: fieldId(3, 6), type: "rating", label: "Networking opportunities", required: true, properties: { maxRating: 5, icon: "star" } },
  { id: fieldId(3, 7), type: "scale", label: "How relevant was the content to your work?", required: true, properties: { min: 1, max: 10, step: 1, minLabel: "Not relevant", maxLabel: "Extremely relevant" } },
  { id: fieldId(3, 8), type: "nps", label: "How likely are you to attend this conference again?", required: true, properties: { lowLabel: "Not at all likely", highLabel: "Extremely likely" } },
  { id: fieldId(3, 9), type: "multi_select", label: "Topics you'd like to see next year", required: false, options: opts(9, ["AI/ML", "Cloud Infrastructure", "Security", "DevOps", "Frontend", "Mobile", "Data Engineering", "Leadership"]) },
  { id: fieldId(3, 10), type: "text", label: "Any other feedback?", required: false, properties: { placeholder: "Tell us what you think...", multiline: true }, validation: { maxLength: 1500 } },
];

const survey4Fields: Field[] = [
  { id: fieldId(4, 0), type: "statement", label: "Delphi Method: Treatment Protocol Consensus", description: "Round 2 of 3. Please review the summarized panel opinions and provide your updated assessment.", required: false, properties: { buttonText: "Begin Round 2" } },
  { id: fieldId(4, 1), type: "select", label: "Your Clinical Specialty", required: true, options: opts(1, ["Internal Medicine", "Cardiology", "Oncology", "Neurology", "Pulmonology", "Infectious Disease", "Emergency Medicine", "Geriatrics"]) },
  { id: fieldId(4, 2), type: "number", label: "Years of Clinical Experience", required: true, properties: { placeholder: "e.g., 15", allowDecimals: false }, validation: { min: 0, max: 60 } },
  { id: fieldId(4, 3), type: "matrix", label: "Rate the effectiveness of each treatment approach", required: true, properties: { rows: ["Monotherapy A", "Combination B+C", "Stepped protocol D", "Watchful waiting", "Surgical intervention"], columns: ["Strongly Ineffective", "Ineffective", "Neutral", "Effective", "Strongly Effective"], allowMultiple: false } },
  { id: fieldId(4, 4), type: "scale", label: "Confidence level in your treatment ratings above", required: true, properties: { min: 1, max: 10, step: 1, minLabel: "Very uncertain", maxLabel: "Very confident" } },
  { id: fieldId(4, 5), type: "ranking", label: "Rank treatment approaches by overall preference", required: true, options: opts(5, ["Monotherapy A", "Combination B+C", "Stepped protocol D", "Watchful waiting", "Surgical intervention"]) },
  { id: fieldId(4, 6), type: "multi_select", label: "Which patient populations benefit most from Combination B+C?", required: true, options: opts(6, ["Elderly (65+)", "Pediatric", "Immunocompromised", "Comorbid diabetes", "Comorbid cardiovascular", "Pregnant patients", "Post-surgical"]) },
  { id: fieldId(4, 7), type: "scale", label: "How strongly do you agree with the panel's Round 1 consensus?", required: true, properties: { min: 1, max: 7, step: 1, minLabel: "Strongly disagree", maxLabel: "Strongly agree" } },
  { id: fieldId(4, 8), type: "text", label: "Provide rationale for any disagreement with consensus", description: "Reference specific evidence or clinical experience", required: false, properties: { placeholder: "Cite evidence or experience...", multiline: true }, validation: { maxLength: 3000 } },
  { id: fieldId(4, 9), type: "text", label: "Additional considerations or evidence to share with the panel", required: false, properties: { placeholder: "New evidence, case studies, or concerns...", multiline: true }, validation: { maxLength: 3000 } },
];

const survey5Fields: Field[] = [
  { id: fieldId(5, 0), type: "select", label: "Product Purchased", required: true, options: opts(0, ["Widget Pro X1", "Widget Pro X2", "Widget Lite", "Widget Enterprise", "Accessory Pack A", "Accessory Pack B"]) },
  { id: fieldId(5, 1), type: "date", label: "Purchase Date", required: true, properties: { includeTime: false, dateFormat: "yyyy-MM-dd" } },
  { id: fieldId(5, 2), type: "rating", label: "Overall Product Quality", required: true, properties: { maxRating: 5, icon: "star" } },
  { id: fieldId(5, 3), type: "rating", label: "Value for Money", required: true, properties: { maxRating: 5, icon: "star" } },
  { id: fieldId(5, 4), type: "rating", label: "Ease of Use", required: true, properties: { maxRating: 5, icon: "star" } },
  { id: fieldId(5, 5), type: "scale", label: "How well does the product meet your needs?", required: true, properties: { min: 1, max: 10, step: 1, minLabel: "Not at all", maxLabel: "Perfectly" } },
  { id: fieldId(5, 6), type: "multi_select", label: "What features do you use most?", required: false, options: opts(6, ["Auto-sync", "Custom dashboards", "API integrations", "Reporting", "Team collaboration", "Mobile app", "Notifications"]) },
  { id: fieldId(5, 7), type: "nps", label: "How likely are you to recommend this product?", required: true, properties: { lowLabel: "Not at all likely", highLabel: "Extremely likely" } },
  { id: fieldId(5, 8), type: "text", label: "What improvement would you most like to see?", required: false, properties: { placeholder: "Tell us what would make this product better...", multiline: true }, validation: { maxLength: 1500 } },
];

const survey6Fields: Field[] = [
  { id: fieldId(6, 0), type: "select", label: "Course Name", required: true, options: opts(0, ["CS 101 - Intro to Programming", "CS 201 - Data Structures", "CS 301 - Algorithms", "CS 401 - Machine Learning", "CS 450 - Distributed Systems"]) },
  { id: fieldId(6, 1), type: "select", label: "Semester", required: true, options: opts(1, ["Fall 2025", "Spring 2025", "Summer 2025"]) },
  { id: fieldId(6, 2), type: "rating", label: "Instructor Effectiveness", required: true, properties: { maxRating: 5, icon: "star" } },
  { id: fieldId(6, 3), type: "rating", label: "Course Material Quality", required: true, properties: { maxRating: 5, icon: "star" } },
  { id: fieldId(6, 4), type: "scale", label: "Difficulty level was appropriate", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Way too easy", maxLabel: "Way too hard" } },
  { id: fieldId(6, 5), type: "scale", label: "Workload was manageable", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
  { id: fieldId(6, 6), type: "matrix", label: "Rate the following aspects", required: true, properties: { rows: ["Lectures", "Assignments", "Exams", "Office Hours", "Online Resources"], columns: ["Poor", "Fair", "Good", "Very Good", "Excellent"], allowMultiple: false } },
  { id: fieldId(6, 7), type: "scale", label: "I would recommend this course to other students", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
  { id: fieldId(6, 8), type: "text", label: "What was the most valuable part of this course?", required: false, properties: { placeholder: "Share your thoughts...", multiline: true }, validation: { maxLength: 1000 } },
  { id: fieldId(6, 9), type: "text", label: "Suggestions for improvement", required: false, properties: { placeholder: "How could this course be better?", multiline: true }, validation: { maxLength: 1000 } },
];

const survey7Fields: Field[] = [
  { id: fieldId(7, 0), type: "text", label: "Meeting Title", required: true, properties: { placeholder: "e.g., Q4 Planning Session" } },
  { id: fieldId(7, 1), type: "date", label: "Meeting Date", required: true, properties: { includeTime: false, dateFormat: "yyyy-MM-dd" } },
  { id: fieldId(7, 2), type: "select", label: "Meeting Type", required: true, options: opts(2, ["Team standup", "Sprint planning", "Retrospective", "All-hands", "1:1", "Client meeting", "Workshop", "Other"]) },
  { id: fieldId(7, 3), type: "rating", label: "How productive was this meeting?", required: true, properties: { maxRating: 5, icon: "star" } },
  { id: fieldId(7, 4), type: "scale", label: "The meeting had a clear agenda", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
  { id: fieldId(7, 5), type: "scale", label: "My time was well-spent in this meeting", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Strongly Disagree", maxLabel: "Strongly Agree" } },
  { id: fieldId(7, 6), type: "select", label: "Could this meeting have been an email?", required: true, options: opts(6, ["Definitely yes", "Probably yes", "Not sure", "Probably not", "Definitely not"]) },
  { id: fieldId(7, 7), type: "text", label: "Key takeaways or action items", required: false, properties: { placeholder: "What were the outcomes?", multiline: true }, validation: { maxLength: 1000 } },
];

const survey8Fields: Field[] = [
  { id: fieldId(8, 0), type: "statement", label: "360-Degree Performance Review", description: "This review is confidential. Please provide honest and constructive feedback.", required: false, properties: { buttonText: "Begin Review" } },
  { id: fieldId(8, 1), type: "select", label: "Your relationship to the person being reviewed", required: true, options: opts(1, ["Direct report", "Peer", "Manager", "Cross-functional colleague", "External stakeholder"]) },
  { id: fieldId(8, 2), type: "scale", label: "Communication skills", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Needs significant improvement", maxLabel: "Exceptional" } },
  { id: fieldId(8, 3), type: "scale", label: "Technical competency", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Needs significant improvement", maxLabel: "Exceptional" } },
  { id: fieldId(8, 4), type: "scale", label: "Leadership and initiative", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Needs significant improvement", maxLabel: "Exceptional" } },
  { id: fieldId(8, 5), type: "scale", label: "Collaboration and teamwork", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Needs significant improvement", maxLabel: "Exceptional" } },
  { id: fieldId(8, 6), type: "scale", label: "Problem-solving ability", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Needs significant improvement", maxLabel: "Exceptional" } },
  { id: fieldId(8, 7), type: "scale", label: "Reliability and follow-through", required: true, properties: { min: 1, max: 5, step: 1, minLabel: "Needs significant improvement", maxLabel: "Exceptional" } },
  { id: fieldId(8, 8), type: "matrix", label: "Rate competency areas", required: true, properties: { rows: ["Strategic thinking", "Time management", "Adaptability", "Mentoring others", "Innovation"], columns: ["Below expectations", "Meets expectations", "Exceeds expectations", "Outstanding"], allowMultiple: false } },
  { id: fieldId(8, 9), type: "text", label: "What are this person's greatest strengths?", required: true, properties: { placeholder: "Be specific with examples...", multiline: true }, validation: { maxLength: 2000 } },
  { id: fieldId(8, 10), type: "text", label: "What areas could they improve?", required: true, properties: { placeholder: "Constructive suggestions...", multiline: true }, validation: { maxLength: 2000 } },
  { id: fieldId(8, 11), type: "text", label: "Any additional comments", required: false, properties: { placeholder: "Optional feedback...", multiline: true }, validation: { maxLength: 1500 } },
];

const survey9Fields: Field[] = [
  { id: fieldId(9, 0), type: "statement", label: "Phase III Clinical Trial — Patient Reported Outcomes", description: "Study Protocol #NCT-2025-04821. Please complete all required fields accurately.", required: false, properties: { buttonText: "Begin Assessment" } },
  { id: fieldId(9, 1), type: "text", label: "Patient ID", description: "Enter your assigned patient identifier", required: true, properties: { placeholder: "e.g., PT-2025-0001" }, validation: { pattern: "^PT-\\d{4}-\\d{4}$", customMessage: "Must match format PT-YYYY-NNNN" } },
  { id: fieldId(9, 2), type: "select", label: "Study Arm", required: true, options: opts(2, ["Treatment Group A (Active)", "Treatment Group B (Active)", "Placebo Control", "Open-label Extension"]) },
  { id: fieldId(9, 3), type: "number", label: "Visit Number", required: true, properties: { placeholder: "e.g., 4", allowDecimals: false }, validation: { min: 1, max: 24 } },
  { id: fieldId(9, 4), type: "date", label: "Assessment Date", required: true, properties: { includeTime: false, dateFormat: "yyyy-MM-dd" } },
  { id: fieldId(9, 5), type: "scale", label: "Overall symptom severity today", required: true, properties: { min: 0, max: 10, step: 1, minLabel: "No symptoms", maxLabel: "Worst imaginable" } },
  { id: fieldId(9, 6), type: "matrix", label: "Rate symptom severity over the past 7 days", required: true, properties: { rows: ["Pain", "Fatigue", "Nausea", "Sleep disturbance", "Appetite changes", "Mood changes"], columns: ["None", "Mild", "Moderate", "Severe", "Very Severe"], allowMultiple: false } },
  { id: fieldId(9, 7), type: "scale", label: "Ability to perform daily activities", required: true, properties: { min: 0, max: 10, step: 1, minLabel: "Unable", maxLabel: "Fully able" } },
  { id: fieldId(9, 8), type: "multi_select", label: "Adverse events experienced since last visit", required: true, options: opts(8, ["None", "Headache", "Dizziness", "GI disturbance", "Skin rash", "Joint pain", "Insomnia", "Fatigue", "Other"]) },
  { id: fieldId(9, 9), type: "scale", label: "Quality of life rating", required: true, properties: { min: 0, max: 100, step: 5, minLabel: "Worst possible", maxLabel: "Best possible" } },
  { id: fieldId(9, 10), type: "select", label: "Medication adherence", required: true, options: opts(10, ["Took all doses as prescribed", "Missed 1-2 doses", "Missed 3-5 doses", "Missed more than 5 doses", "Discontinued medication"]) },
  { id: fieldId(9, 11), type: "text", label: "Additional notes or concerns", required: false, properties: { placeholder: "Report any new symptoms or concerns...", multiline: true }, validation: { maxLength: 2000 } },
  { id: fieldId(9, 12), type: "signature", label: "Patient Signature", description: "I confirm this information is accurate to the best of my knowledge", required: true, properties: { penColor: "#000000", backgroundColor: "#ffffff" } },
];

// ── Survey definitions ──────────────────────────────────────────────
interface SurveyDef {
  title: string;
  description: string;
  slug: string;
  type: "survey" | "form" | "quiz" | "poll";
  status: "draft" | "published" | "closed" | "archived";
  schema: Field[];
  multiStep: boolean;
  stepLabels?: string[];
  orgIdx: number;
  settings?: Partial<Survey["settings"]>;
  theme?: Partial<NonNullable<Survey["theme"]>>;
}

const surveyDefs: SurveyDef[] = [
  {
    title: "Patient Satisfaction Survey",
    description: "Measure patient experience across all hospital departments to drive quality improvement initiatives.",
    slug: "patient-satisfaction-2025",
    type: "survey",
    status: "published",
    schema: survey0Fields,
    multiStep: false,
    orgIdx: 0, // Mount Sinai
    settings: { allowAnonymous: true, showProgressBar: true, showQuestionNumbers: true, notifyOnResponse: true, notifyEmails: ["quality@mountsinai.example.com"], confirmationMessage: "Thank you for your feedback. Your responses help us improve care quality." },
    theme: { primaryColor: "#0e7490", fontFamily: "Inter" },
  },
  {
    title: "Pre-Visit Patient Intake Form",
    description: "Collect patient demographics, insurance, and medical history prior to appointment.",
    slug: "pre-visit-intake",
    type: "form",
    status: "published",
    schema: survey1Fields,
    multiStep: true,
    stepLabels: ["Personal Information", "Insurance & Visit", "Medical History", "Confirmation"],
    orgIdx: 4, // Sunrise Hospital
    settings: { allowAnonymous: false, requireAuth: true, showProgressBar: true, confirmationMessage: "Your intake form has been submitted. Please arrive 15 minutes early for your appointment." },
    theme: { primaryColor: "#059669", fontFamily: "Inter" },
  },
  {
    title: "Employee Engagement Survey Q1 2025",
    description: "Annual engagement pulse survey to measure employee satisfaction, growth opportunities, and workplace culture.",
    slug: "engagement-q1-2025",
    type: "survey",
    status: "published",
    schema: survey2Fields,
    multiStep: false,
    orgIdx: 24, // Accenture
    settings: { allowAnonymous: true, startDate: "2025-01-15T00:00:00Z", endDate: "2025-02-15T00:00:00Z", showProgressBar: true, shuffleQuestions: false },
    theme: { primaryColor: "#7c3aed", fontFamily: "Inter" },
  },
  {
    title: "DevConf 2025 Feedback",
    description: "Help us improve future conferences by sharing your experience at DevConf 2025.",
    slug: "devconf-2025-feedback",
    type: "survey",
    status: "closed",
    schema: survey3Fields,
    multiStep: false,
    orgIdx: 35, // DevCon Global
    settings: { allowAnonymous: true, showProgressBar: true, confirmationMessage: "Thanks for your feedback! See you next year." },
    theme: { primaryColor: "#ea580c", fontFamily: "Inter" },
  },
  {
    title: "Delphi Treatment Protocol Consensus — Round 2",
    description: "Second round of expert panel assessment for the novel treatment protocol. Review aggregated Round 1 results and provide updated opinions.",
    slug: "delphi-treatment-r2",
    type: "survey",
    status: "published",
    schema: survey4Fields,
    multiStep: true,
    stepLabels: ["Background", "Treatment Assessment", "Consensus Review"],
    orgIdx: 16, // Novartis
    settings: { allowAnonymous: false, requireAuth: true, limitResponses: 50, showProgressBar: true, showQuestionNumbers: true },
    theme: { primaryColor: "#0284c7", fontFamily: "Inter" },
  },
  {
    title: "Product Review — Widget Pro Series",
    description: "Share your experience with our Widget Pro products to help us build better tools.",
    slug: "widget-pro-review",
    type: "survey",
    status: "published",
    schema: survey5Fields,
    multiStep: false,
    orgIdx: 40, // Stripe
    settings: { allowAnonymous: true, showProgressBar: true, confirmationMessage: "Thanks for your review! Your feedback shapes our roadmap." },
    theme: { primaryColor: "#6366f1", fontFamily: "Inter" },
  },
  {
    title: "Course Evaluation — Computer Science Department",
    description: "End-of-semester course evaluation for CS department courses. Your feedback is anonymous and helps improve instruction.",
    slug: "cs-course-eval-fall-2025",
    type: "survey",
    status: "draft",
    schema: survey6Fields,
    multiStep: false,
    orgIdx: 48, // MIT
    settings: { allowAnonymous: true, showProgressBar: true, showQuestionNumbers: true },
    theme: { primaryColor: "#dc2626", fontFamily: "Inter" },
  },
  {
    title: "Meeting Effectiveness Check",
    description: "Quick post-meeting feedback to improve how we run meetings.",
    slug: "meeting-feedback",
    type: "poll",
    status: "published",
    schema: survey7Fields,
    multiStep: false,
    orgIdx: 26, // TechCorp
    settings: { allowAnonymous: true, showProgressBar: false, showQuestionNumbers: false },
    theme: { primaryColor: "#8b5cf6", fontFamily: "Inter" },
  },
  {
    title: "360-Degree Performance Review",
    description: "Confidential multi-rater feedback for performance evaluation. Responses are aggregated anonymously.",
    slug: "360-review-q4-2025",
    type: "form",
    status: "draft",
    schema: survey8Fields,
    multiStep: true,
    stepLabels: ["Relationship", "Competency Ratings", "Open Feedback"],
    orgIdx: 25, // Deloitte
    settings: { allowAnonymous: false, requireAuth: true, showProgressBar: true },
    theme: { primaryColor: "#0f766e", fontFamily: "Inter" },
  },
  {
    title: "Phase III Clinical Trial — Patient Reported Outcomes",
    description: "Standardized patient-reported outcome measures for clinical trial NCT-2025-04821. All fields are validated per protocol requirements.",
    slug: "clinical-trial-nct-2025-04821",
    type: "form",
    status: "published",
    schema: survey9Fields,
    multiStep: true,
    stepLabels: ["Patient Info", "Symptom Assessment", "Quality of Life", "Confirmation"],
    orgIdx: 17, // Pfizer
    settings: { allowAnonymous: false, requireAuth: true, showProgressBar: true, showQuestionNumbers: true, notifyOnResponse: true, notifyEmails: ["trials@pfizer-research.example.com"] },
    theme: { primaryColor: "#0369a1", fontFamily: "Inter" },
  },
];

// ── Build MOCK_SURVEYS ──────────────────────────────────────────────
const now = new Date();
export const MOCK_SURVEYS: Survey[] = surveyDefs.map((def, idx) => {
  const createdAt = new Date(now.getTime() - (30 - idx * 3) * 86400000).toISOString();
  const updatedAt = new Date(now.getTime() - (10 - idx) * 86400000).toISOString();
  const publishedAt = def.status !== "draft" ? new Date(now.getTime() - (25 - idx * 2) * 86400000).toISOString() : undefined;

  return {
    id: uuid("survey", idx),
    orgId: MOCK_ORGANIZATIONS[def.orgIdx].id,
    title: def.title,
    description: def.description,
    slug: def.slug,
    type: def.type,
    status: def.status,
    schema: def.schema,
    settings: {
      allowAnonymous: true,
      requireAuth: false,
      showProgressBar: true,
      showQuestionNumbers: true,
      shuffleQuestions: false,
      notifyOnResponse: false,
      ...def.settings,
    },
    theme: {
      primaryColor: "#6366f1",
      backgroundColor: "#ffffff",
      fontFamily: "Inter",
      borderRadius: 8,
      ...def.theme,
    },
    multiStep: def.multiStep,
    stepLabels: def.stepLabels,
    createdAt,
    updatedAt,
    publishedAt,
    version: 1,
  } satisfies Survey;
});

// ── Mock Response Generator ─────────────────────────────────────────
// Seeded pseudo-random for deterministic output
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function pickRandom<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickMultiple<T>(arr: T[], count: number, rand: () => number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

const sampleTextResponses: Record<string, string[]> = {
  positive: [
    "Excellent experience overall. Very satisfied with the service.",
    "The staff was incredibly helpful and professional.",
    "Everything exceeded my expectations. Would definitely recommend.",
    "Great attention to detail and follow-through on commitments.",
    "Impressed with the quality and thoroughness.",
  ],
  neutral: [
    "It was acceptable but there is room for improvement.",
    "Average experience. Nothing particularly stood out.",
    "Met basic expectations but nothing more.",
    "Some aspects were good, others could be better.",
    "Adequate but would appreciate more attention to detail.",
  ],
  negative: [
    "Disappointed with the overall experience.",
    "Wait times were unacceptably long.",
    "Communication could be significantly improved.",
    "Did not meet my expectations in several areas.",
    "Would not recommend in its current state.",
  ],
};

export function generateMockResponses(
  survey: Survey,
  count: number = 25,
  seed: number = 42
): SurveyResponse[] {
  const rand = seededRandom(seed);
  const responses: SurveyResponse[] = [];

  for (let i = 0; i < count; i++) {
    const answers: Record<string, unknown> = {};
    const sentiment = rand() < 0.5 ? "positive" : rand() < 0.75 ? "neutral" : "negative";
    const biasHigh = sentiment === "positive";
    const biasLow = sentiment === "negative";

    for (const field of survey.schema) {
      if (field.type === "statement" || field.type === "section_break") continue;

      switch (field.type) {
        case "text":
          if (field.label.toLowerCase().includes("name")) {
            const firstNames = ["Sarah", "James", "Maria", "David", "Emily", "Michael", "Lisa", "Robert", "Jennifer", "William"];
            const lastNames = ["Chen", "Johnson", "Garcia", "Williams", "Brown", "Jones", "Miller", "Davis", "Rodriguez", "Martinez"];
            answers[field.id] = `${pickRandom(firstNames, rand)} ${pickRandom(lastNames, rand)}`;
          } else if (field.label.toLowerCase().includes("medication")) {
            answers[field.id] = pickRandom(["Lisinopril 10mg daily", "Metformin 500mg twice daily", "None", "Atorvastatin 20mg daily, Omeprazole 20mg daily"], rand);
          } else if (field.label.toLowerCase().includes("patient id")) {
            answers[field.id] = `PT-2025-${String(1000 + i).padStart(4, "0")}`;
          } else {
            const pool = sampleTextResponses[sentiment];
            answers[field.id] = pickRandom(pool, rand);
          }
          break;
        case "number":
          answers[field.id] = Math.floor(rand() * 30) + 1;
          break;
        case "email":
          answers[field.id] = `respondent${i + 1}@example.com`;
          break;
        case "phone":
          answers[field.id] = `(555) ${String(Math.floor(rand() * 900) + 100)}-${String(Math.floor(rand() * 9000) + 1000)}`;
          break;
        case "select":
          if (field.options?.length) {
            answers[field.id] = pickRandom(field.options, rand).value;
          }
          break;
        case "multi_select":
          if (field.options?.length) {
            const picked = pickMultiple(field.options, Math.floor(rand() * 3) + 1, rand);
            answers[field.id] = picked.map((o) => o.value);
          }
          break;
        case "rating": {
          const maxR = (field.properties?.maxRating as number) ?? 5;
          answers[field.id] = biasHigh
            ? Math.floor(rand() * 2) + maxR - 1
            : biasLow
              ? Math.floor(rand() * 2) + 1
              : Math.floor(rand() * maxR) + 1;
          break;
        }
        case "scale": {
          const min = (field.properties?.min as number) ?? 1;
          const max = (field.properties?.max as number) ?? 10;
          const range = max - min;
          answers[field.id] = biasHigh
            ? Math.floor(rand() * (range * 0.3)) + min + Math.floor(range * 0.7)
            : biasLow
              ? Math.floor(rand() * (range * 0.3)) + min
              : Math.floor(rand() * range) + min;
          break;
        }
        case "nps":
          answers[field.id] = biasHigh
            ? Math.floor(rand() * 2) + 9
            : biasLow
              ? Math.floor(rand() * 5)
              : Math.floor(rand() * 4) + 5;
          break;
        case "matrix": {
          const rows = (field.properties?.rows as string[]) ?? [];
          const cols = (field.properties?.columns as string[]) ?? [];
          const matrixAnswers: Record<string, string> = {};
          for (const row of rows) {
            matrixAnswers[row] = biasHigh
              ? cols[cols.length - 1 - Math.floor(rand() * Math.min(2, cols.length))]
              : biasLow
                ? cols[Math.floor(rand() * Math.min(2, cols.length))]
                : pickRandom(cols, rand);
          }
          answers[field.id] = matrixAnswers;
          break;
        }
        case "ranking":
          if (field.options?.length) {
            const ranked = [...field.options].sort(() => rand() - 0.5);
            answers[field.id] = ranked.map((o) => o.value);
          }
          break;
        case "date":
          answers[field.id] = new Date(now.getTime() - Math.floor(rand() * 365) * 86400000).toISOString().split("T")[0];
          break;
        case "time":
          answers[field.id] = `${String(Math.floor(rand() * 12) + 8).padStart(2, "0")}:${String(Math.floor(rand() * 4) * 15).padStart(2, "0")}`;
          break;
        case "signature":
          answers[field.id] = "[signature_data]";
          break;
        case "file_upload":
          answers[field.id] = null;
          break;
        case "payment":
          answers[field.id] = { status: "completed", amount: (field.properties?.amount as number) ?? 0 };
          break;
      }
    }

    const startedAt = new Date(now.getTime() - Math.floor(rand() * 14) * 86400000);
    const duration = Math.floor(rand() * 600) + 60; // 60-660 seconds
    const completedAt = new Date(startedAt.getTime() + duration * 1000);

    responses.push({
      id: uuid(`resp${survey.id.slice(0, 4)}`, i),
      surveyId: survey.id,
      respondentId: rand() < 0.3 ? undefined : uuid("user", Math.floor(rand() * 1000)),
      answers,
      metadata: {
        userAgent: pickRandom([
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
          "Mozilla/5.0 (Linux; Android 14)",
        ], rand),
        startedAt: startedAt.toISOString(),
        completedAt: completedAt.toISOString(),
        duration,
      },
      status: rand() < 0.9 ? "completed" : "in_progress",
      createdAt: startedAt.toISOString(),
      updatedAt: completedAt.toISOString(),
    } satisfies SurveyResponse);
  }

  return responses;
}

// ── Lookup helpers ──────────────────────────────────────────────────
export function findSurveyById(id: string): Survey | undefined {
  return MOCK_SURVEYS.find((s) => s.id === id);
}

export function findOrgById(id: string): Organization | undefined {
  return MOCK_ORGANIZATIONS.find((o) => o.id === id);
}

export function getMedicalOrgs(): Organization[] {
  return MOCK_ORGANIZATIONS.filter((o) =>
    ["Healthcare", "Medical Education", "Pharma"].includes(o.sector)
  );
}
