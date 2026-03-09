"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  FileText,
  Globe,
  LineChart,
  Shield,
  Check,
  Hexagon,
} from "lucide-react";
import { EditModeProvider } from "@/components/cms/EditModeProvider";
import { EditToolbar } from "@/components/cms/EditToolbar";
import { EditableText } from "@/components/cms/EditableText";
import { BackgroundPaths } from "@/components/ui/background-paths";

const features = [
  {
    id: "feature-form-builder",
    icon: FileText,
    title: "Form Builder",
    description:
      "Drag-and-drop survey builder with 20+ question types, branching logic, and real-time preview.",
  },
  {
    id: "feature-delphi",
    icon: Brain,
    title: "Delphi Consensus",
    description:
      "Multi-round expert panels with automated convergence detection and structured argumentation.",
  },
  {
    id: "feature-ai",
    icon: BarChart3,
    title: "AI Analysis",
    description:
      "GPT-powered sentiment analysis, theme extraction, and automated insight generation from responses.",
  },
  {
    id: "feature-distribution",
    icon: Globe,
    title: "Multi-Channel Distribution",
    description:
      "Share via link, email, embed, QR code, or SMS. Track response rates across every channel.",
  },
  {
    id: "feature-analytics",
    icon: LineChart,
    title: "Real-time Analytics",
    description:
      "Live dashboards with cross-tabulation, trend analysis, and exportable visual reports.",
  },
  {
    id: "feature-compliance",
    icon: Shield,
    title: "Enterprise Compliance",
    description:
      "SOC 2 Type II ready with GDPR/HIPAA compliance, audit logs, and data residency controls.",
  },
];

const stats = [
  { id: "stat-surveys", value: "10K+", label: "Surveys Created" },
  { id: "stat-responses", value: "1M+", label: "Responses Collected" },
  { id: "stat-orgs", value: "500+", label: "Organizations" },
  { id: "stat-uptime", value: "99.9%", label: "Uptime" },
];

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For individuals getting started with surveys.",
    features: [
      "3 active surveys",
      "100 responses per survey",
      "Basic question types",
      "Email distribution",
      "Basic analytics",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For professionals who need advanced features.",
    features: [
      "Unlimited surveys",
      "10,000 responses per survey",
      "All question types",
      "Branching logic",
      "AI-powered analysis",
      "Custom branding",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$79",
    period: "per month",
    description: "For teams collaborating on research.",
    features: [
      "Everything in Pro",
      "5 team members",
      "Delphi consensus panels",
      "Advanced analytics",
      "API access",
      "SSO integration",
      "Dedicated support",
    ],
    cta: "Start Team Trial",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For organizations with advanced needs.",
    features: [
      "Everything in Team",
      "Unlimited team members",
      "HIPAA/SOC 2 compliance",
      "Data residency controls",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <EditModeProvider>
      {/* Hero */}
      <BackgroundPaths title="OpenDelphi" />

      {/* Social Proof */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id} className="text-center">
                <div className="text-3xl font-bold text-foreground sm:text-4xl">
                  <EditableText
                    id={`${stat.id}-value`}
                    defaultContent={stat.value}
                    as="span"
                  />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  <EditableText
                    id={`${stat.id}-label`}
                    defaultContent={stat.label}
                    as="span"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              <EditableText
                id="features-heading"
                defaultContent="Everything you need to collect and analyze feedback"
                as="span"
              />
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              <EditableText
                id="features-subheading"
                defaultContent="A complete platform for surveys, consensus building, and data-driven decision making."
                as="span"
                multiline
              />
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  <EditableText
                    id={`${feature.id}-title`}
                    defaultContent={feature.title}
                    as="span"
                  />
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  <EditableText
                    id={`${feature.id}-desc`}
                    defaultContent={feature.description}
                    as="span"
                    multiline
                  />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free and scale as you grow. No hidden fees.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  tier.highlighted
                    ? "border-primary bg-card shadow-xl shadow-primary/10 ring-1 ring-primary"
                    : "border-border bg-card"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {tier.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                </div>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-card-foreground">
                    {tier.price}
                  </span>
                  <span className="ml-1 text-sm text-muted-foreground">
                    /{tier.period}
                  </span>
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-card-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-8 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    tier.highlighted
                      ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                      : "border border-border bg-background text-foreground hover:bg-accent"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <Hexagon className="h-6 w-6 text-primary" strokeWidth={2.5} />
              <span className="text-lg font-bold text-foreground">
                OpenDelphi
              </span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6">
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Documentation
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Support
              </Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} OpenDelphi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <EditToolbar />
    </EditModeProvider>
  );
}
