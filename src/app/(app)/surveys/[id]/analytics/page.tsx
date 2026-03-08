"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { SummaryCards } from "@/components/analytics/SummaryCards";
import { ChartCard } from "@/components/analytics/ChartCard";
import { BarChart } from "@/components/analytics/BarChart";
import { PieChart } from "@/components/analytics/PieChart";
import { TrendChart } from "@/components/analytics/TrendChart";
import { NPSGauge } from "@/components/analytics/NPSGauge";
import { WordCloud } from "@/components/analytics/WordCloud";
import { ResponseTable } from "@/components/analytics/ResponseTable";
import { BarChart3, Table2, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

// ── Comprehensive Mock Data ────────────────────────────────────────

const MOCK_REFERRAL_DATA = [
  { name: "Search Engine", value: 387 },
  { name: "Social Media", value: 298 },
  { name: "Friend / Colleague", value: 256 },
  { name: "Blog / Article", value: 189 },
  { name: "Other", value: 117 },
];

const MOCK_SATISFACTION_DATA = [
  { name: "1 Star", value: 42 },
  { name: "2 Stars", value: 78 },
  { name: "3 Stars", value: 185 },
  { name: "4 Stars", value: 456 },
  { name: "5 Stars", value: 486 },
];

const MOCK_FEATURES_DATA = [
  { name: "Survey Builder", value: 823 },
  { name: "Analytics Dashboard", value: 712 },
  { name: "Team Collaboration", value: 543 },
  { name: "API Integration", value: 398 },
  { name: "Custom Branding", value: 267 },
];

const MOCK_EASE_DATA = [
  { name: "1", value: 12 },
  { name: "2", value: 18 },
  { name: "3", value: 34 },
  { name: "4", value: 56 },
  { name: "5", value: 89 },
  { name: "6", value: 112 },
  { name: "7", value: 198 },
  { name: "8", value: 287 },
  { name: "9", value: 245 },
  { name: "10", value: 196 },
];

const MOCK_SERVICE_ASPECTS = [
  { name: "Support - Excellent", value: 423 },
  { name: "Support - Good", value: 398 },
  { name: "Docs - Excellent", value: 312 },
  { name: "Docs - Good", value: 456 },
  { name: "Performance - Excellent", value: 534 },
  { name: "Pricing - Good", value: 389 },
];

const MOCK_TREND_DATA = [
  { date: "Jan 1", value: 32 },
  { date: "Jan 8", value: 45 },
  { date: "Jan 15", value: 38 },
  { date: "Jan 22", value: 52 },
  { date: "Jan 29", value: 67 },
  { date: "Feb 5", value: 58 },
  { date: "Feb 12", value: 73 },
  { date: "Feb 19", value: 82 },
  { date: "Feb 26", value: 78 },
  { date: "Mar 5", value: 95 },
  { date: "Mar 12", value: 88 },
  { date: "Mar 19", value: 102 },
  { date: "Mar 26", value: 115 },
  { date: "Apr 2", value: 98 },
  { date: "Apr 9", value: 125 },
  { date: "Apr 16", value: 132 },
];

const MOCK_WORD_CLOUD = [
  { text: "easy", value: 89 },
  { text: "intuitive", value: 76 },
  { text: "powerful", value: 65 },
  { text: "fast", value: 58 },
  { text: "analytics", value: 52 },
  { text: "collaboration", value: 48 },
  { text: "design", value: 45 },
  { text: "flexible", value: 42 },
  { text: "templates", value: 38 },
  { text: "dashboard", value: 36 },
  { text: "reports", value: 34 },
  { text: "customizable", value: 32 },
  { text: "integration", value: 30 },
  { text: "branding", value: 28 },
  { text: "responsive", value: 26 },
  { text: "mobile", value: 24 },
  { text: "export", value: 22 },
  { text: "clean", value: 20 },
  { text: "simple", value: 18 },
  { text: "reliable", value: 16 },
];

const MOCK_IMPROVEMENT_WORDS = [
  { text: "pricing", value: 72 },
  { text: "templates", value: 65 },
  { text: "mobile", value: 58 },
  { text: "speed", value: 52 },
  { text: "documentation", value: 48 },
  { text: "integrations", value: 45 },
  { text: "API", value: 42 },
  { text: "export", value: 38 },
  { text: "notifications", value: 35 },
  { text: "themes", value: 32 },
  { text: "scheduling", value: 28 },
  { text: "support", value: 26 },
  { text: "onboarding", value: 24 },
  { text: "localization", value: 20 },
  { text: "accessibility", value: 18 },
];

// Generate 50+ mock response rows
const FIRST_NAMES = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason",
  "Isabella", "Logan", "Mia", "Lucas", "Charlotte", "Jackson", "Amelia",
  "Aiden", "Harper", "Elijah", "Evelyn", "James", "Abigail", "Benjamin",
  "Emily", "Alexander", "Elizabeth", "Sebastian", "Sofia", "William", "Ella",
  "Daniel", "Scarlett", "Matthew", "Victoria", "Henry", "Aria", "Michael",
  "Grace", "Owen", "Chloe", "Jack", "Penelope", "Gabriel", "Layla", "Carter",
  "Riley", "Jayden", "Zoey", "Dylan", "Nora", "Luke",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
  "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
  "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
  "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts",
];

const REFERRALS = ["Search Engine", "Social Media", "Friend / Colleague", "Blog / Article", "Other"];
const FEATURES = ["Survey Builder", "Analytics Dashboard", "Team Collaboration", "API Integration", "Custom Branding"];
const STATUSES: Array<"completed" | "in_progress"> = ["completed", "completed", "completed", "completed", "in_progress"];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const MOCK_RESPONSES = Array.from({ length: 54 }, (_, i) => {
  const r = (s: number) => seededRandom(i * 100 + s);
  const firstName = FIRST_NAMES[Math.floor(r(1) * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(r(2) * LAST_NAMES.length)];
  const status = STATUSES[Math.floor(r(3) * STATUSES.length)];
  const daysAgo = Math.floor(r(4) * 90);
  const date = new Date(Date.now() - daysAgo * 86400000);

  return {
    id: `resp-${String(i + 1).padStart(3, "0")}`,
    respondent: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    referral: REFERRALS[Math.floor(r(5) * REFERRALS.length)],
    satisfaction: Math.floor(r(6) * 5) + 1,
    features: Array.from(
      { length: Math.floor(r(7) * 3) + 1 },
      (_, j) => FEATURES[Math.floor(r(8 + j) * FEATURES.length)]
    ).filter((v, idx, arr) => arr.indexOf(v) === idx),
    easeOfUse: Math.floor(r(12) * 10) + 1,
    nps: Math.floor(r(13) * 11),
    status,
    completedAt: date.toISOString().split("T")[0],
    duration: `${Math.floor(r(14) * 8) + 1}m ${Math.floor(r(15) * 59)}s`,
  };
});

const RESPONSE_COLUMNS = [
  { key: "respondent", label: "Respondent", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "referral", label: "Referral Source", sortable: true },
  { key: "satisfaction", label: "Satisfaction", sortable: true },
  { key: "nps", label: "NPS Score", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "completedAt", label: "Date", sortable: true, width: "110px" },
  { key: "duration", label: "Duration", sortable: false },
];

// ── Page Component ─────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "responses", label: "Individual Responses", icon: Table2 },
  { id: "insights", label: "AI Insights", icon: Sparkles },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/surveys"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to surveys
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            Customer Satisfaction Survey
          </h1>
          <p className="text-muted-foreground mt-1">
            Analytics and response data
          </p>
        </div>

        {/* Summary Cards */}
        <SummaryCards className="mb-8" />

        {/* Tabs */}
        <div className="mb-6 border-b">
          <div className="flex gap-1 -mb-px">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "responses" && <ResponsesTab />}
        {activeTab === "insights" && <InsightsTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Responses over time */}
      <ChartCard
        title="Responses Over Time"
        subtitle="Daily response volume over the last 4 months"
        exportData={{
          headers: ["Date", "Responses"],
          rows: MOCK_TREND_DATA.map((d) => [d.date, d.value]),
        }}
      >
        <TrendChart data={MOCK_TREND_DATA} height={280} />
      </ChartCard>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Referral Sources */}
        <ChartCard
          title="How did you hear about us?"
          subtitle="Distribution of referral sources"
          exportData={{
            headers: ["Source", "Count"],
            rows: MOCK_REFERRAL_DATA.map((d) => [d.name, d.value]),
          }}
        >
          <PieChart data={MOCK_REFERRAL_DATA} height={280} />
        </ChartCard>

        {/* Overall Satisfaction */}
        <ChartCard
          title="Overall Satisfaction"
          subtitle="Star rating distribution"
          exportData={{
            headers: ["Rating", "Count"],
            rows: MOCK_SATISFACTION_DATA.map((d) => [d.name, d.value]),
          }}
        >
          <BarChart data={MOCK_SATISFACTION_DATA} height={280} />
        </ChartCard>
      </div>

      {/* Features usage */}
      <ChartCard
        title="Most Used Features"
        subtitle="Features selected by respondents"
        exportData={{
          headers: ["Feature", "Count"],
          rows: MOCK_FEATURES_DATA.map((d) => [d.name, d.value]),
        }}
      >
        <BarChart data={MOCK_FEATURES_DATA} height={280} layout="horizontal" />
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Ease of Use */}
        <ChartCard
          title="Ease of Use"
          subtitle="Scale distribution (1-10)"
          exportData={{
            headers: ["Score", "Count"],
            rows: MOCK_EASE_DATA.map((d) => [d.name, d.value]),
          }}
        >
          <BarChart data={MOCK_EASE_DATA} height={280} />
        </ChartCard>

        {/* NPS Gauge */}
        <ChartCard
          title="Net Promoter Score"
          subtitle="Based on likelihood to recommend"
        >
          <div className="flex items-center justify-center py-4">
            <NPSGauge
              score={62}
              promoters={68}
              passives={18}
              detractors={14}
            />
          </div>
        </ChartCard>
      </div>

      {/* Word clouds */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="What You Love"
          subtitle="Most common words from positive feedback"
        >
          <WordCloud words={MOCK_WORD_CLOUD} />
        </ChartCard>

        <ChartCard
          title="Areas for Improvement"
          subtitle="Most common words from improvement suggestions"
        >
          <WordCloud words={MOCK_IMPROVEMENT_WORDS} />
        </ChartCard>
      </div>

      {/* Service aspects */}
      <ChartCard
        title="Service Aspect Ratings"
        subtitle="Matrix response breakdown"
        exportData={{
          headers: ["Aspect", "Count"],
          rows: MOCK_SERVICE_ASPECTS.map((d) => [d.name, d.value]),
        }}
      >
        <BarChart
          data={MOCK_SERVICE_ASPECTS}
          height={280}
          layout="horizontal"
        />
      </ChartCard>
    </div>
  );
}

function ResponsesTab() {
  return (
    <ResponseTable
      columns={RESPONSE_COLUMNS}
      data={MOCK_RESPONSES}
      pageSize={10}
    />
  );
}

function InsightsTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">AI-Powered Summary</h3>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Based on analysis of <strong className="text-foreground">1,247 responses</strong>,
                here are the key insights from your Customer Satisfaction Survey:
              </p>

              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  Overall Sentiment: Positive
                </h4>
                <p>
                  84.2% of respondents completed the survey, indicating high engagement.
                  The average satisfaction rating is 3.9 out of 5 stars, with 37.6% giving
                  the highest rating. Your NPS score of 62 places you in the "Great" category,
                  suggesting strong customer loyalty.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  Key Strengths
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong className="text-foreground">Survey Builder</strong> is the most
                    valued feature (66% of respondents use it regularly)
                  </li>
                  <li>
                    <strong className="text-foreground">Ease of use</strong> scores consistently
                    high (mean 7.2/10), with "intuitive" and "easy" being the most
                    common descriptors
                  </li>
                  <li>
                    <strong className="text-foreground">Performance</strong> rated as "Excellent"
                    by 43% of respondents in the service matrix
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  Areas for Improvement
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong className="text-foreground">Pricing</strong> is the #1 requested
                    improvement area, mentioned in 72 responses
                  </li>
                  <li>
                    <strong className="text-foreground">More templates</strong> are desired
                    by respondents who primarily use the Survey Builder
                  </li>
                  <li>
                    <strong className="text-foreground">Mobile experience</strong> could be
                    improved, with 58 mentions in improvement suggestions
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  Trends to Watch
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Response volume is trending upward (+12.5% month over month), indicating
                    growing engagement with the survey program
                  </li>
                  <li>
                    NPS has improved by 5.2 points compared to the previous period
                  </li>
                  <li>
                    Average completion time decreased 8.3% to 4m 32s, suggesting improved
                    survey design efficiency
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  Recommendations
                </h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Consider introducing more competitive pricing tiers to address the top
                    concern
                  </li>
                  <li>
                    Expand the template library, particularly for common use cases like
                    customer satisfaction and employee engagement
                  </li>
                  <li>
                    Invest in mobile optimization to capture the growing mobile respondent
                    segment
                  </li>
                  <li>
                    Leverage your high NPS by implementing a referral program targeting
                    promoters
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment breakdown card */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <h4 className="font-semibold">Positive Mentions</h4>
          </div>
          <p className="text-3xl font-bold text-green-600 mb-1">847</p>
          <p className="text-sm text-muted-foreground">67.9% of responses</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["easy", "great", "love", "fast", "powerful"].map((w) => (
              <span
                key={w}
                className="rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <h4 className="font-semibold">Neutral Mentions</h4>
          </div>
          <p className="text-3xl font-bold text-yellow-600 mb-1">267</p>
          <p className="text-sm text-muted-foreground">21.4% of responses</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["okay", "fine", "decent", "average", "normal"].map((w) => (
              <span
                key={w}
                className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:text-yellow-400"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <h4 className="font-semibold">Negative Mentions</h4>
          </div>
          <p className="text-3xl font-bold text-red-600 mb-1">133</p>
          <p className="text-sm text-muted-foreground">10.7% of responses</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["expensive", "slow", "confusing", "limited", "buggy"].map((w) => (
              <span
                key={w}
                className="rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-400"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
