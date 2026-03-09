"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  FileText,
  Globe,
  LineChart,
  Shield,
  Check,
  Sparkles,
  Zap,
  Send,
  PieChart,
  Star,
  MessageSquare,
  Download,
  Users,
  Building2,
  Activity,
  Table,
  FileSpreadsheet,
  Layers,
} from "lucide-react";
import { BackgroundPaths } from "@/components/ui/background-paths";

/* ───────────────────────── DATA ───────────────────────── */

const features = [
  {
    id: "feature-form-builder",
    icon: FileText,
    title: "Form Builder",
    description:
      "Drag-and-drop survey builder with 20+ question types, branching logic, and real-time preview.",
    gradient: "from-violet-500/20 to-purple-500/20",
  },
  {
    id: "feature-delphi",
    icon: Brain,
    title: "Delphi Consensus",
    description:
      "Multi-round expert panels with automated convergence detection and structured argumentation.",
    gradient: "from-pink-500/20 to-rose-500/20",
  },
  {
    id: "feature-ai",
    icon: BarChart3,
    title: "AI Analysis",
    description:
      "GPT-powered sentiment analysis, theme extraction, and automated insight generation from responses.",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    id: "feature-distribution",
    icon: Globe,
    title: "Multi-Channel Distribution",
    description:
      "Share via link, email, embed, QR code, or SMS. Track response rates across every channel.",
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
  {
    id: "feature-analytics",
    icon: LineChart,
    title: "Real-time Analytics",
    description:
      "Live dashboards with cross-tabulation, trend analysis, and exportable visual reports.",
    gradient: "from-emerald-500/20 to-green-500/20",
  },
  {
    id: "feature-compliance",
    icon: Shield,
    title: "Enterprise Compliance",
    description:
      "SOC 2 Type II ready with GDPR/HIPAA compliance, audit logs, and data residency controls.",
    gradient: "from-slate-500/20 to-gray-500/20",
  },
];

const stats = [
  { id: "stat-responses", value: 2000000, suffix: "+", display: "2M+", label: "Responses Collected", icon: MessageSquare },
  { id: "stat-surveys", value: 15000, suffix: "+", display: "15K+", label: "Surveys Created", icon: FileText },
  { id: "stat-orgs", value: 500, suffix: "+", display: "500+", label: "Organizations", icon: Building2 },
  { id: "stat-uptime", value: 99.9, suffix: "%", display: "99.9%", label: "Uptime", icon: Activity },
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

const logos = [
  "Stanford Medicine",
  "WHO",
  "McKinsey",
  "Deloitte",
  "Harvard",
  "Pfizer",
  "Google Health",
  "NHS",
];

const steps = [
  {
    number: "01",
    icon: Layers,
    title: "Create",
    description: "Build your survey in minutes with drag-and-drop",
  },
  {
    number: "02",
    icon: Send,
    title: "Distribute",
    description: "Share via email, link, SMS, QR code, or embed",
  },
  {
    number: "03",
    icon: Activity,
    title: "Collect",
    description: "Responses flow in real-time with live analytics",
  },
  {
    number: "04",
    icon: Sparkles,
    title: "Analyze",
    description: "AI-powered insights, consensus, and export reports",
  },
];

const testimonials = [
  {
    quote:
      "OpenDelphi transformed how we build consensus across our research teams. The Delphi method automation alone saved us months of manual coordination.",
    author: "Dr. Sarah Chen",
    role: "Director of Research",
    org: "Stanford Medicine",
    stars: 5,
  },
  {
    quote:
      "The depth of analysis and ease of distribution make this indispensable for academic surveys. Response rates increased 40% after switching.",
    author: "Prof. James Mitchell",
    role: "Department Head",
    org: "Harvard Kennedy School",
    stars: 5,
  },
  {
    quote:
      "We evaluated every survey platform on the market. OpenDelphi's AI-powered analysis and real-time dashboards are genuinely best-in-class.",
    author: "Lisa Park",
    role: "VP of Strategy",
    org: "McKinsey & Company",
    stars: 5,
  },
];

const integrations = [
  { name: "Google Sheets", desc: "Auto-sync responses to Sheets", icon: Table },
  { name: "Slack", desc: "Get notified on new responses", icon: MessageSquare },
  { name: "Zapier", desc: "Connect 5,000+ apps", icon: Zap },
  { name: "AciWriter.com", desc: "Export consensus data directly to AciWriter.com to write research papers based on your findings", icon: FileText, highlight: true },
  { name: "Excel", desc: "One-click XLSX export", icon: FileSpreadsheet },
  { name: "PDF", desc: "Branded PDF reports", icon: Download },
  { name: "SPSS", desc: "Statistical analysis export", icon: BarChart3 },
  { name: "Tableau", desc: "Visual analytics connector", icon: PieChart },
];

/* ───────────────────────── HELPERS ───────────────────────── */

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0, 0, 0.2, 1] as const } },
};

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={sectionVariants}
      className={`scroll-mt-20 ${className}`}
    >
      {children}
    </motion.section>
  );
}

function AnimatedCounter({
  target,
  suffix,
  decimals = 0,
}: {
  target: number;
  suffix: string;
  decimals?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (target >= 1000000) return `${(v / 1000000).toFixed(decimals > 0 ? 0 : 0)}M`;
    if (target >= 1000) return `${(v / 1000).toFixed(decimals > 0 ? 0 : 0)}K`;
    return v.toFixed(decimals);
  });

  useEffect(() => {
    if (inView) {
      animate(count, target, { duration: 2, ease: "easeOut" });
    }
  }, [inView, count, target]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

/* ───────────────────────── PAGE ───────────────────────── */

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"builder" | "analytics" | "insights">("builder");

  return (
    <div className="overflow-x-hidden">
      {/* ─── 1. HERO ─── */}
      <div className="relative">
        <BackgroundPaths title="OpenDelphi" />

        {/* Overlay demo card on hero */}
        <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-1/2">
          <div className="mx-auto max-w-xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl p-6 shadow-2xl shadow-primary/10"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">
                Try it now — instant preview
              </p>
              <div className="space-y-3">
                {[
                  "How satisfied are you with our service?",
                  "What feature would you most like to see?",
                  "How likely are you to recommend us?",
                ].map((q, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/60 px-4 py-2.5 text-sm text-muted-foreground"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    {q}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-col items-center gap-2">
                <Link
                  href="/s/demo"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
                >
                  Try a Live Survey
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-xs text-muted-foreground">
                  No signup required
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Spacer for the overlapping card */}
      <div className="h-32 sm:h-40" />

      {/* ─── 2. SOCIAL PROOF / LOGOS BAR ─── */}
      <Section className="border-y border-border bg-muted/20 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-10 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by leading organizations
          </p>
          <div className="relative overflow-hidden">
            {/* Fade edges */}
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-muted/20 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-muted/20 to-transparent" />
            <motion.div
              className="flex gap-6"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                x: { repeat: Infinity, repeatType: "loop", duration: 30, ease: "linear" },
              }}
            >
              {[...logos, ...logos].map((name, i) => (
                <div
                  key={i}
                  className="flex shrink-0 items-center rounded-full border border-border/60 bg-card/80 px-6 py-2.5 text-sm font-semibold text-foreground/80 shadow-sm backdrop-blur-sm"
                >
                  {name}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ─── 3. STATS ─── */}
      <Section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-accent/5 p-8 text-center transition-all hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground sm:text-4xl">
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.id === "stat-uptime" ? 1 : 0}
                  />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── 4. FEATURES ─── */}
      <Section id="features" className="bg-muted/20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to collect and analyze feedback
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A complete platform for surveys, consensus building, and
              data-driven decision making.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl border border-border bg-card p-8 transition-shadow hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
              >
                {/* Decorative mini-chart */}
                <div className="absolute right-6 top-6 flex items-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {[40, 65, 50, 80, 60].map((h, j) => (
                    <div
                      key={j}
                      className={`w-1.5 rounded-full bg-gradient-to-t ${feature.gradient}`}
                      style={{ height: `${h * 0.3}px` }}
                    />
                  ))}
                </div>
                <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3`}>
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── 5. HOW IT WORKS ─── */}
      <Section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From creation to actionable insights in four simple steps.
            </p>
          </div>
          <div className="relative mt-20">
            {/* Connecting line */}
            <div className="absolute left-0 right-0 top-10 hidden h-0.5 border-t-2 border-dashed border-primary/20 lg:block" />
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="relative text-center"
                >
                  <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-card shadow-lg shadow-primary/5">
                    <step.icon className="h-8 w-8 text-primary" />
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ─── 6. INTERACTIVE DEMO ─── */}
      <Section id="demo" className="bg-muted/20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              See It In Action
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Explore the platform without signing up.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-5xl">
            {/* Tabs */}
            <div className="mb-8 flex justify-center gap-2">
              {(
                [
                  { key: "builder", label: "Survey Builder" },
                  { key: "analytics", label: "Live Analytics" },
                  { key: "insights", label: "AI Insights" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="grid gap-8 lg:grid-cols-2">
              <AnimatePresence mode="wait">
                {activeTab === "builder" && (
                  <motion.div
                    key="builder"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="rounded-2xl border border-border bg-card p-6 shadow-lg lg:col-span-2"
                  >
                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Form mockup */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <FileText className="h-4 w-4 text-primary" />
                          Survey Builder
                        </div>
                        <div className="space-y-3">
                          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                            <p className="text-xs font-medium text-primary mb-2">Multiple Choice</p>
                            <p className="text-sm text-foreground">How did you hear about us?</p>
                            <div className="mt-3 space-y-2">
                              {["Social Media", "Word of Mouth", "Search Engine", "Conference"].map((opt) => (
                                <div key={opt} className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <div className="h-3.5 w-3.5 rounded-full border border-border" />
                                  {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-lg border border-border/60 bg-background/60 p-4">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Rating Scale</p>
                            <p className="text-sm text-foreground">Rate your experience</p>
                            <div className="mt-3 flex gap-2">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <div key={n} className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium ${n === 4 ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
                                  {n}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Analytics mockup */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          Live Preview
                        </div>
                        <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                          <div className="flex items-end gap-2">
                            {[45, 72, 58, 86, 63, 91, 77].map((h, i) => (
                              <div key={i} className="flex-1">
                                <div
                                  className="rounded-t bg-gradient-to-t from-primary/60 to-primary/30"
                                  style={{ height: `${h}px` }}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg border border-border/60 bg-background/50 p-3 text-center">
                            <p className="text-xl font-bold text-foreground">847</p>
                            <p className="text-[10px] text-muted-foreground">Responses</p>
                          </div>
                          <div className="rounded-lg border border-border/60 bg-background/50 p-3 text-center">
                            <p className="text-xl font-bold text-foreground">73%</p>
                            <p className="text-[10px] text-muted-foreground">Completion</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "analytics" && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="rounded-2xl border border-border bg-card p-6 shadow-lg lg:col-span-2"
                  >
                    <div className="grid gap-6 lg:grid-cols-3">
                      <div className="rounded-xl border border-border/60 bg-background/50 p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-3">Response Breakdown</p>
                        <div className="space-y-2">
                          {[
                            { label: "Very Satisfied", pct: 42, color: "bg-emerald-500" },
                            { label: "Satisfied", pct: 31, color: "bg-primary" },
                            { label: "Neutral", pct: 15, color: "bg-amber-500" },
                            { label: "Dissatisfied", pct: 12, color: "bg-rose-500" },
                          ].map((row) => (
                            <div key={row.label}>
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>{row.label}</span><span>{row.pct}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-muted">
                                <div className={`h-2 rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-background/50 p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-3">Response Trend</p>
                        <div className="flex h-32 items-end gap-1.5">
                          {[20, 35, 28, 45, 55, 48, 62, 70, 58, 75, 82, 90].map((h, i) => (
                            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary to-primary/40" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-background/50 p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-3">Demographics</p>
                        <div className="flex items-center justify-center">
                          <div className="relative h-28 w-28">
                            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/30" />
                              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="100" className="text-primary" />
                              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="175" className="text-accent" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">1,247</div>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-center gap-4 text-[10px]">
                          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />18-34</span>
                          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent" />35-54</span>
                          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-muted" />55+</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "insights" && (
                  <motion.div
                    key="insights"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="rounded-2xl border border-border bg-card p-6 shadow-lg lg:col-span-2"
                  >
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Sparkles className="h-4 w-4 text-primary" />
                          AI-Generated Summary
                        </div>
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                          <p className="text-sm leading-relaxed text-foreground">
                            <span className="font-semibold">Key Finding:</span> 73% of respondents indicate strong preference for asynchronous communication tools. Sentiment is overwhelmingly positive (4.2/5 avg) with quality and speed cited as primary drivers.
                          </p>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Extracted Themes</p>
                          <div className="flex flex-wrap gap-2">
                            {["Remote Work", "Collaboration", "Efficiency", "Communication", "Flexibility", "Work-Life Balance"].map((t) => (
                              <span key={t} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Brain className="h-4 w-4 text-primary" />
                          Consensus Score
                        </div>
                        <div className="rounded-lg border border-border/60 bg-background/50 p-4 text-center">
                          <div className="mx-auto h-24 w-24">
                            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="263.9" strokeDashoffset="47.5" className="text-emerald-500" strokeLinecap="round" />
                            </svg>
                            <p className="relative -mt-16 text-2xl font-bold text-foreground">82%</p>
                          </div>
                          <p className="mt-4 text-xs text-muted-foreground">Strong consensus reached after 3 rounds</p>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Sentiment Analysis</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 space-y-1.5">
                              <div className="flex justify-between text-[10px] text-muted-foreground"><span>Positive</span><span>68%</span></div>
                              <div className="h-1.5 rounded-full bg-muted"><div className="h-1.5 rounded-full bg-emerald-500" style={{ width: "68%" }} /></div>
                              <div className="flex justify-between text-[10px] text-muted-foreground"><span>Neutral</span><span>22%</span></div>
                              <div className="h-1.5 rounded-full bg-muted"><div className="h-1.5 rounded-full bg-amber-500" style={{ width: "22%" }} /></div>
                              <div className="flex justify-between text-[10px] text-muted-foreground"><span>Negative</span><span>10%</span></div>
                              <div className="h-1.5 rounded-full bg-muted"><div className="h-1.5 rounded-full bg-rose-500" style={{ width: "10%" }} /></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── 7. TESTIMONIALS ─── */}
      <Section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Loved by researchers and teams worldwide
            </h2>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-border pt-4">
                  <p className="text-sm font-semibold text-foreground">{t.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.role}, {t.org}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── 8. INTEGRATIONS & EXPORT ─── */}
      <Section id="integrations" className="bg-muted/20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Connect &amp; Export Everywhere
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Seamlessly integrate with the tools your team already uses.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {integrations.map((int, i) => (
              <motion.div
                key={int.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className={`rounded-2xl border p-6 transition-all hover:shadow-lg ${
                  int.highlight
                    ? "border-primary/40 bg-gradient-to-br from-primary/10 via-card to-accent/10 ring-1 ring-primary/20"
                    : "border-border bg-card"
                }`}
              >
                <div className={`mb-3 inline-flex rounded-xl p-2.5 ${int.highlight ? "bg-primary/15" : "bg-muted/50"}`}>
                  <int.icon className={`h-5 w-5 ${int.highlight ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{int.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{int.desc}</p>
                {int.highlight && (
                  <span className="mt-3 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                    Featured
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── 9. EMAIL COLLECTION / LEAD GEN ─── */}
      <Section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-card to-accent/5 p-8 sm:p-12 shadow-xl shadow-primary/5">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Reach Your Target Audience
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Find the right respondents from our curated demographic databases.
                  Get quality data from verified professionals across industries.
                </p>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Access 10M+ verified professional emails",
                  "Filter by industry, role, location, demographics",
                  "GDPR-compliant data sourcing",
                  "Integrated survey distribution",
                ].map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-foreground">{feat}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <input
                  type="email"
                  placeholder="Enter your work email"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:max-w-xs"
                />
                <Link
                  href="/register"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md sm:w-auto"
                >
                  Get Early Access
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Join 500+ researchers on the waitlist
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── 10. PRICING ─── */}
      <Section id="pricing" className="bg-muted/20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free and scale as you grow. No hidden fees.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`relative flex flex-col rounded-2xl border p-8 transition-shadow hover:shadow-lg ${
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
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── 11. CTA ─── */}
      <Section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-accent p-12 text-center shadow-2xl sm:p-20">
            {/* Decorative */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
                Start Collecting Better Data Today
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-lg text-primary-foreground/80">
                Create your first survey in under 2 minutes — no credit card required.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-primary shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-primary-foreground/30 px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:border-primary-foreground/60 hover:bg-primary-foreground/10"
                >
                  Book a Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

    </div>
  );
}
