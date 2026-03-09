"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Check,
  Zap,
  Sparkles,
  Receipt,
  HardDrive,
  MessageSquare,
  FileText,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/providers/UserProvider";

interface UsageMeter {
  label: string;
  used: number;
  limit: number;
  unit?: string;
  icon: typeof FileText;
}

interface OrgData {
  plan: string;
  plan_expires_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

const planLimits: Record<string, { surveys: number; responses: number; members: number }> = {
  free: { surveys: 3, responses: 100, members: 1 },
  pro: { surveys: 25, responses: 5000, members: 5 },
  business: { surveys: 999999, responses: 25000, members: 25 },
  enterprise: { surveys: 999999, responses: 999999, members: 999999 },
};

const plans = [
  {
    name: "Free",
    key: "free",
    price: "$0",
    period: "",
    description: "For individuals getting started",
    features: [
      "3 active surveys",
      "100 responses/month",
      "1 team member",
      "Basic analytics",
      "Community support",
    ],
    highlight: false,
  },
  {
    name: "Pro",
    key: "pro",
    price: "$29",
    period: "/mo",
    description: "For growing teams",
    features: [
      "25 active surveys",
      "5,000 responses/month",
      "5 team members",
      "Advanced analytics",
      "AI-powered insights",
      "Priority email support",
      "Custom branding",
    ],
    highlight: true,
  },
  {
    name: "Business",
    key: "business",
    price: "$79",
    period: "/mo",
    description: "For scaling organizations",
    features: [
      "Unlimited surveys",
      "25,000 responses/month",
      "25 team members",
      "Advanced analytics & exports",
      "AI survey generation",
      "Priority support + Slack",
      "Custom branding",
      "SSO / SAML",
      "API access",
    ],
    highlight: false,
  },
  {
    name: "Enterprise",
    key: "enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: [
      "Everything in Business",
      "Unlimited responses",
      "Unlimited team members",
      "HIPAA / SOC 2 compliance",
      "EHR / FHIR integration",
      "Dedicated account manager",
      "Custom SLA",
      "On-premise deployment",
      "Audit logs",
    ],
    highlight: false,
  },
];

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function BillingPage() {
  const supabase = createClient();
  const { orgId } = useUser();

  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState<OrgData | null>(null);
  const [surveyCount, setSurveyCount] = useState(0);
  const [responseCount, setResponseCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);

  const loadBillingData = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch org plan data
      const { data: org } = await supabase
        .from("organizations")
        .select(
          "plan, plan_expires_at, stripe_customer_id, stripe_subscription_id"
        )
        .eq("id", orgId)
        .single();

      if (org) {
        setOrgData(org as OrgData);
      }

      // Count surveys
      const { count: surveys } = await supabase
        .from("surveys")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId);

      setSurveyCount(surveys ?? 0);

      // Count responses for this org's surveys
      const { data: orgSurveys } = await supabase
        .from("surveys")
        .select("id")
        .eq("org_id", orgId);

      if (orgSurveys && orgSurveys.length > 0) {
        const surveyIds = orgSurveys.map((s: { id: string }) => s.id);
        const { count: responses } = await supabase
          .from("responses")
          .select("id", { count: "exact", head: true })
          .in("survey_id", surveyIds);

        setResponseCount(responses ?? 0);
      }

      // Count members
      const { count: members } = await supabase
        .from("org_members")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId);

      setMemberCount(members ?? 0);
    } finally {
      setLoading(false);
    }
  }, [orgId, supabase]);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  const currentPlan = orgData?.plan ?? "free";
  const limits = planLimits[currentPlan] ?? planLimits.free;

  const usageMeters: UsageMeter[] = [
    {
      label: "Active Surveys",
      used: surveyCount,
      limit: limits.surveys > 99999 ? surveyCount : limits.surveys,
      icon: FileText,
    },
    {
      label: "Total Responses",
      used: responseCount,
      limit: limits.responses > 99999 ? responseCount : limits.responses,
      icon: MessageSquare,
    },
    {
      label: "Team Members",
      used: memberCount,
      limit: limits.members > 99999 ? memberCount : limits.members,
      icon: Sparkles,
    },
    {
      label: "Storage",
      used: 0,
      limit: 0,
      unit: "N/A",
      icon: HardDrive,
    },
  ];

  const getCtaForPlan = (planKey: string): string => {
    if (planKey === currentPlan) return "Current Plan";
    const planOrder = ["free", "pro", "business", "enterprise"];
    const currentIdx = planOrder.indexOf(currentPlan);
    const planIdx = planOrder.indexOf(planKey);
    if (planKey === "enterprise") return "Contact Sales";
    return planIdx > currentIdx ? "Upgrade" : "Downgrade";
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading billing data...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Billing &amp; Plans
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your subscription, usage, and payment methods.
        </p>
      </div>

      {/* Current Plan Summary */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  {capitalize(currentPlan)} Plan
                </h2>
                <Badge>Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentPlan === "free"
                  ? "Free forever"
                  : orgData?.plan_expires_at
                    ? `Renews ${new Date(orgData.plan_expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                    : "Active subscription"}
              </p>
            </div>
          </div>
          {currentPlan !== "free" && (
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-accent">
              Manage Subscription
            </button>
          )}
        </div>
      </div>

      {/* Plan Comparison Grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Compare Plans
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isCurrent = plan.key === currentPlan;
            const cta = getCtaForPlan(plan.key);
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 ${
                  isCurrent
                    ? "border-primary bg-card shadow-md"
                    : "border-border bg-card"
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="shadow-sm">Current Plan</Badge>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-card-foreground">
                    {plan.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                <div className="mb-5">
                  <span className="text-3xl font-bold text-card-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>
                <ul className="mb-6 space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  disabled={isCurrent}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    isCurrent
                      ? "cursor-default border border-primary/30 bg-primary/5 text-primary"
                      : plan.highlight
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border bg-card text-card-foreground hover:bg-accent"
                  }`}
                >
                  {cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-card-foreground">
            Feature Comparison
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Feature
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Free
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Pro
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Business
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { feature: "Active Surveys", free: "3", pro: "25", business: "Unlimited", enterprise: "Unlimited" },
                { feature: "Responses / month", free: "100", pro: "5,000", business: "25,000", enterprise: "Unlimited" },
                { feature: "Team Members", free: "1", pro: "5", business: "25", enterprise: "Unlimited" },
                { feature: "AI Survey Generation", free: "-", pro: "check", business: "check", enterprise: "check" },
                { feature: "AI-Powered Insights", free: "-", pro: "check", business: "check", enterprise: "check" },
                { feature: "Custom Branding", free: "-", pro: "check", business: "check", enterprise: "check" },
                { feature: "API Access", free: "-", pro: "-", business: "check", enterprise: "check" },
                { feature: "SSO / SAML", free: "-", pro: "-", business: "check", enterprise: "check" },
                { feature: "HIPAA Compliance", free: "-", pro: "-", business: "-", enterprise: "check" },
                { feature: "EHR / FHIR Integration", free: "-", pro: "-", business: "-", enterprise: "check" },
                { feature: "Dedicated Support", free: "-", pro: "-", business: "-", enterprise: "check" },
                { feature: "Audit Logs", free: "-", pro: "-", business: "-", enterprise: "check" },
              ].map((row) => (
                <tr
                  key={row.feature}
                  className="transition-colors hover:bg-muted/50"
                >
                  <td className="px-6 py-3 font-medium text-card-foreground">
                    {row.feature}
                  </td>
                  {(["free", "pro", "business", "enterprise"] as const).map(
                    (plan) => (
                      <td key={plan} className="px-4 py-3 text-center">
                        {row[plan] === "check" ? (
                          <Check className="mx-auto h-4 w-4 text-primary" />
                        ) : row[plan] === "-" ? (
                          <span className="text-muted-foreground/40">
                            &mdash;
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {row[plan]}
                          </span>
                        )}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Meters */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Current Usage
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {usageMeters.map((meter) => {
            const isStorageNA = meter.unit === "N/A";
            const percentage =
              isStorageNA || meter.limit === 0
                ? 0
                : Math.min(
                    100,
                    Math.round((meter.used / meter.limit) * 100)
                  );
            const isHigh = percentage > 80 && !isStorageNA;
            const isUnlimited = meter.limit === meter.used && currentPlan === "enterprise";

            return (
              <div
                key={meter.label}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <meter.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-card-foreground">
                      {meter.label}
                    </span>
                  </div>
                  {isHigh && (
                    <Badge
                      variant="destructive"
                      className="px-1.5 py-0 text-[10px]"
                    >
                      {percentage}%
                    </Badge>
                  )}
                </div>
                <div className="mt-3">
                  <Progress
                    value={isStorageNA ? 0 : percentage}
                    className="h-2"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  {isStorageNA ? (
                    <>
                      <span>N/A</span>
                      <span>Storage tracking not available</span>
                    </>
                  ) : (
                    <>
                      <span>{meter.used.toLocaleString()} used</span>
                      <span>
                        {isUnlimited
                          ? "Unlimited"
                          : `${meter.limit.toLocaleString()} limit`}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Method */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="rounded-xl bg-primary/10 p-2">
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-card-foreground">
              Payment Method
            </h2>
            <p className="text-xs text-muted-foreground">
              Your default payment method for subscriptions
            </p>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            No payment method on file.
          </p>
        </div>
      </div>

      {/* Invoice History */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="rounded-xl bg-primary/10 p-2">
            <Receipt className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-card-foreground">
              Invoice History
            </h2>
            <p className="text-xs text-muted-foreground">
              Download past invoices and receipts
            </p>
          </div>
        </div>
        <div className="px-6 py-10 text-center text-sm text-muted-foreground">
          No invoices yet.
        </div>
      </div>
    </div>
  );
}
