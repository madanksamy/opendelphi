"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ResponseTable } from "@/components/analytics/ResponseTable";
import { cn } from "@/lib/utils/cn";
import { ArrowLeft, Download, Calendar, Filter } from "lucide-react";
import Link from "next/link";

// ── Mock response data (50+) ───────────────────────────────────────

const FIRST_NAMES = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason",
  "Isabella", "Logan", "Mia", "Lucas", "Charlotte", "Jackson", "Amelia",
  "Aiden", "Harper", "Elijah", "Evelyn", "James", "Abigail", "Benjamin",
  "Emily", "Alexander", "Elizabeth", "Sebastian", "Sofia", "William", "Ella",
  "Daniel", "Scarlett", "Matthew", "Victoria", "Henry", "Aria", "Michael",
  "Grace", "Owen", "Chloe", "Jack", "Penelope", "Gabriel", "Layla", "Carter",
  "Riley", "Jayden", "Zoey", "Dylan", "Nora", "Luke", "Hannah", "Andrew",
  "Lily", "Nathan",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
  "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
  "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
  "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Phillips", "Evans", "Turner", "Parker",
];

const REFERRALS = ["Search Engine", "Social Media", "Friend / Colleague", "Blog / Article", "Other"];
const FEATURES_LIST = ["Survey Builder", "Analytics Dashboard", "Team Collaboration", "API Integration", "Custom Branding"];
const LIKE_RESPONSES = [
  "Easy to use interface", "Great analytics dashboard", "Love the collaboration features",
  "Powerful API", "Clean design", "Fast performance", "Great templates",
  "Excellent customer support", "Intuitive survey builder", "Good value for money",
  "Flexible customization", "Real-time analytics", "Simple setup process",
];
const IMPROVE_RESPONSES = [
  "More templates needed", "Mobile app could be better", "Pricing is a bit high",
  "Need more integrations", "Better documentation", "Faster load times",
  "More export options", "Dark mode support", "Better notification system",
  "Improved search functionality", "More chart types", "Offline support",
];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const ALL_RESPONSES = Array.from({ length: 54 }, (_, i) => {
  const r = (s: number) => seededRandom(i * 100 + s);
  const firstName = FIRST_NAMES[Math.floor(r(1) * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(r(2) * LAST_NAMES.length)];
  const statusRoll = r(3);
  const status = statusRoll > 0.15 ? "completed" : "in_progress";
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
      (_, j) => FEATURES_LIST[Math.floor(r(8 + j) * FEATURES_LIST.length)]
    ).filter((v, idx, arr) => arr.indexOf(v) === idx),
    easeOfUse: Math.floor(r(12) * 10) + 1,
    whatYouLike: LIKE_RESPONSES[Math.floor(r(20) * LIKE_RESPONSES.length)],
    whatToImprove: IMPROVE_RESPONSES[Math.floor(r(21) * IMPROVE_RESPONSES.length)],
    nps: Math.floor(r(13) * 11),
    status,
    completedAt: date.toISOString().split("T")[0],
    duration: `${Math.floor(r(14) * 8) + 1}m ${Math.floor(r(15) * 59)}s`,
  };
});

const FULL_COLUMNS = [
  { key: "respondent", label: "Respondent", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "referral", label: "Referral", sortable: true },
  { key: "satisfaction", label: "Satisfaction", sortable: true },
  { key: "features", label: "Features Used", sortable: false },
  { key: "easeOfUse", label: "Ease of Use", sortable: true },
  { key: "whatYouLike", label: "Liked Most", sortable: false },
  { key: "whatToImprove", label: "Improvements", sortable: false },
  { key: "nps", label: "NPS", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "completedAt", label: "Date", sortable: true, width: "110px" },
  { key: "duration", label: "Duration", sortable: false },
];

// ── Page ───────────────────────────────────────────────────────────

export default function ResponsesPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "in_progress">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredResponses = useMemo(() => {
    let result = ALL_RESPONSES;

    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (dateFrom) {
      result = result.filter((r) => r.completedAt >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((r) => r.completedAt <= dateTo);
    }

    return result;
  }, [statusFilter, dateFrom, dateTo]);

  const handleExportCSV = useCallback(() => {
    const headers = FULL_COLUMNS.map((c) => c.label);
    const rows = filteredResponses.map((row) =>
      FULL_COLUMNS.map((c) => {
        const val = row[c.key as keyof typeof row];
        if (Array.isArray(val)) return val.join("; ");
        return String(val ?? "");
      })
    );
    const csv = [headers.join(","), ...rows.map((r) => r.map((cell) => cell.includes(",") ? `"${cell}"` : cell).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "survey-responses.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredResponses]);

  const completedCount = ALL_RESPONSES.filter((r) => r.status === "completed").length;
  const inProgressCount = ALL_RESPONSES.filter((r) => r.status === "in_progress").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/surveys"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to surveys
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Responses</h1>
              <p className="text-muted-foreground mt-1">
                Customer Satisfaction Survey
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Excel
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filters
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            {/* Status filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Status
              </label>
              <div className="flex gap-1.5">
                {(
                  [
                    { key: "all", label: `All (${ALL_RESPONSES.length})` },
                    { key: "completed", label: `Completed (${completedCount})` },
                    { key: "in_progress", label: `In Progress (${inProgressCount})` },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setStatusFilter(opt.key)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      statusFilter === opt.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date range */}
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  From
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-8 text-xs w-36"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  To
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-8 text-xs w-36"
                />
              </div>
              {(dateFrom || dateTo || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setStatusFilter("all");
                    setDateFrom("");
                    setDateTo("");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <ResponseTable
          columns={FULL_COLUMNS}
          data={filteredResponses}
          pageSize={15}
          onExportCSV={handleExportCSV}
        />
      </div>
    </div>
  );
}
