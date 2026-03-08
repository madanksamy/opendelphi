"use client";

import { useState } from "react";
import {
  CreditCard,
  Check,
  Zap,
  Building2,
  Sparkles,
  Download,
  ExternalLink,
  Receipt,
  BarChart3,
  HardDrive,
  MessageSquare,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const plans = [
  {
    name: "Free",
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
    current: false,
    cta: "Downgrade",
    highlight: false,
  },
  {
    name: "Pro",
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
    current: true,
    cta: "Current Plan",
    highlight: true,
  },
  {
    name: "Business",
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
    current: false,
    cta: "Upgrade",
    highlight: false,
  },
  {
    name: "Enterprise",
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
    current: false,
    cta: "Contact Sales",
    highlight: false,
  },
];

const usageMeters = [
  {
    label: "Active Surveys",
    used: 18,
    limit: 25,
    icon: FileText,
  },
  {
    label: "Responses This Month",
    used: 3247,
    limit: 5000,
    icon: MessageSquare,
  },
  {
    label: "Storage",
    used: 2.4,
    limit: 5,
    unit: "GB",
    icon: HardDrive,
  },
  {
    label: "AI Tokens",
    used: 42000,
    limit: 100000,
    icon: Sparkles,
  },
];

const invoices = [
  {
    id: "INV-2026-005",
    date: "2026-03-01",
    amount: "$29.00",
    status: "Paid",
    plan: "Pro",
  },
  {
    id: "INV-2026-004",
    date: "2026-02-01",
    amount: "$29.00",
    status: "Paid",
    plan: "Pro",
  },
  {
    id: "INV-2026-003",
    date: "2026-01-01",
    amount: "$29.00",
    status: "Paid",
    plan: "Pro",
  },
  {
    id: "INV-2025-012",
    date: "2025-12-01",
    amount: "$29.00",
    status: "Paid",
    plan: "Pro",
  },
  {
    id: "INV-2025-011",
    date: "2025-11-01",
    amount: "$0.00",
    status: "Paid",
    plan: "Free",
  },
];

function getStatusColor(status: string) {
  return status === "Paid"
    ? "bg-emerald-500/10 text-emerald-600"
    : "bg-amber-500/10 text-amber-600";
}

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Billing & Plans
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
                <h2 className="text-lg font-bold text-foreground">Pro Plan</h2>
                <Badge>Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                $29/month &middot; Billed monthly &middot; Renews Mar 28, 2026
              </p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-accent">
            Manage Subscription
          </button>
        </div>
      </div>

      {/* Plan Comparison Grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Compare Plans
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 ${
                plan.highlight
                  ? "border-primary bg-card shadow-md"
                  : "border-border bg-card"
              }`}
            >
              {plan.current && (
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
                disabled={plan.current}
                className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  plan.current
                    ? "cursor-default border border-primary/30 bg-primary/5 text-primary"
                    : plan.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border bg-card text-card-foreground hover:bg-accent"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
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
                <tr key={row.feature} className="transition-colors hover:bg-muted/50">
                  <td className="px-6 py-3 font-medium text-card-foreground">
                    {row.feature}
                  </td>
                  {(["free", "pro", "business", "enterprise"] as const).map(
                    (plan) => (
                      <td key={plan} className="px-4 py-3 text-center">
                        {row[plan] === "check" ? (
                          <Check className="mx-auto h-4 w-4 text-primary" />
                        ) : row[plan] === "-" ? (
                          <span className="text-muted-foreground/40">&mdash;</span>
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
            const percentage = Math.round((meter.used / meter.limit) * 100);
            const isHigh = percentage > 80;
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
                      className="text-[10px] px-1.5 py-0"
                    >
                      {percentage}%
                    </Badge>
                  )}
                </div>
                <div className="mt-3">
                  <Progress value={percentage} className="h-2" />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {meter.unit
                      ? `${meter.used} ${meter.unit}`
                      : meter.used.toLocaleString()}{" "}
                    used
                  </span>
                  <span>
                    {meter.unit
                      ? `${meter.limit} ${meter.unit}`
                      : meter.limit.toLocaleString()}{" "}
                    limit
                  </span>
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
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-20 items-center justify-center rounded-lg border border-border bg-gradient-to-br from-blue-600 to-blue-800">
              <span className="text-xs font-bold tracking-wider text-white">
                VISA
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">
                Visa ending in 4242
              </p>
              <p className="text-xs text-muted-foreground">Expires 12/2027</p>
            </div>
          </div>
          <button className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-accent">
            Update
          </button>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Invoice
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Plan
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Amount
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Download
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="transition-colors hover:bg-muted/50"
                >
                  <td className="px-6 py-3">
                    <span className="text-sm font-medium text-card-foreground">
                      {inv.id}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {new Date(inv.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {inv.plan}
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-card-foreground">
                    {inv.amount}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(inv.status)}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
