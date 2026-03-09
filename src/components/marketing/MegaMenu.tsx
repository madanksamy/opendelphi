"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Hexagon,
  FileText,
  LayoutTemplate,
  GitBranch,
  Layers,
  BarChart3,
  Sparkles,
  Brain,
  FileDown,
  Heart,
  GraduationCap,
  TrendingUp,
  Users,
  FlaskConical,
  BookOpen,
  Building,
  Building2,
  BookText,
  Code2,
  Play,
  Newspaper,
  ExternalLink,
  MessageCircle,
  Handshake,
  Terminal,
  Menu,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils/cn";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface MenuItem {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

interface MenuColumn {
  heading: string;
  items: MenuItem[];
}

interface MenuSection {
  label: string;
  href?: string;
  columns?: MenuColumn[];
  featured?: React.ReactNode;
}

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

const MENUS: MenuSection[] = [
  {
    label: "Products",
    columns: [
      {
        heading: "Build",
        items: [
          {
            icon: FileText,
            title: "Form Builder",
            description: "Drag & drop 20+ field types",
            href: "/features/form-builder",
          },
          {
            icon: LayoutTemplate,
            title: "Survey Templates",
            description: "100+ ready-made templates",
            href: "/features/templates",
          },
          {
            icon: GitBranch,
            title: "Question Logic",
            description: "Branching & skip logic",
            href: "/features/form-builder",
          },
          {
            icon: Layers,
            title: "Multi-Step Forms",
            description: "Wizard-style surveys",
            href: "/features/form-builder",
          },
        ],
      },
      {
        heading: "Analyze",
        items: [
          {
            icon: BarChart3,
            title: "Real-Time Analytics",
            description: "Live dashboards & metrics",
            href: "/features/analytics",
          },
          {
            icon: Sparkles,
            title: "AI Insights",
            description: "GPT-powered sentiment analysis",
            href: "/features/ai-insights",
          },
          {
            icon: Brain,
            title: "Consensus Engine",
            description: "Delphi methodology built-in",
            href: "/features/consensus",
          },
          {
            icon: FileDown,
            title: "Export & Reports",
            description: "PDF, CSV, Excel exports",
            href: "/features/analytics",
          },
        ],
      },
    ],
    featured: <DashboardPreview />,
  },
  {
    label: "Solutions",
    columns: [
      {
        heading: "By Use Case",
        items: [
          {
            icon: Heart,
            title: "Healthcare Research",
            description: "HIPAA-ready patient studies",
            href: "/solutions/healthcare",
          },
          {
            icon: GraduationCap,
            title: "Academic Studies",
            description: "IRB-friendly research tools",
            href: "/solutions/academic",
          },
          {
            icon: TrendingUp,
            title: "Market Research",
            description: "Consumer insights at scale",
            href: "/solutions/market-research",
          },
          {
            icon: Users,
            title: "Employee Engagement",
            description: "Pulse surveys & feedback",
            href: "/solutions/employee-engagement",
          },
        ],
      },
      {
        heading: "By Industry",
        items: [
          {
            icon: FlaskConical,
            title: "Pharma & Biotech",
            description: "Clinical trial consensus",
            href: "/solutions/healthcare",
          },
          {
            icon: BookOpen,
            title: "Education & Universities",
            description: "Student & faculty research",
            href: "/solutions/academic",
          },
          {
            icon: Building,
            title: "Government & Policy",
            description: "Public opinion & policy studies",
            href: "/solutions/enterprise",
          },
          {
            icon: Building2,
            title: "Enterprise & SaaS",
            description: "Product feedback loops",
            href: "/solutions/enterprise",
          },
        ],
      },
    ],
    featured: <StatsPreview />,
  },
  {
    label: "Resources",
    columns: [
      {
        heading: "Learn",
        items: [
          {
            icon: BookText,
            title: "Documentation",
            description: "Guides & reference docs",
            href: "/docs",
          },
          {
            icon: Code2,
            title: "API Reference",
            description: "REST & webhook docs",
            href: "/docs/api",
          },
          {
            icon: Play,
            title: "Tutorials & Guides",
            description: "Step-by-step walkthroughs",
            href: "/tutorials",
          },
          {
            icon: Newspaper,
            title: "Blog",
            description: "Updates & thought leadership",
            href: "/blog",
          },
        ],
      },
      {
        heading: "Community",
        items: [
          {
            icon: ExternalLink,
            title: "Open Source",
            description: "Contribute on GitHub",
            href: "https://github.com/opendelphi",
          },
          {
            icon: MessageCircle,
            title: "Community Forum",
            description: "Ask questions & share tips",
            href: "/community",
          },
          {
            icon: Handshake,
            title: "Partner Program",
            description: "Integrations & resellers",
            href: "/partners",
          },
          {
            icon: Terminal,
            title: "Developer Hub",
            description: "SDKs, CLI & tooling",
            href: "/developers",
          },
        ],
      },
    ],
    featured: <GettingStartedCard />,
  },
  { label: "Pricing", href: "#pricing" },
  { label: "Enterprise", href: "/contact" },
];

/* -------------------------------------------------------------------------- */
/*  Featured panels                                                            */
/* -------------------------------------------------------------------------- */

function DashboardPreview() {
  const bars = [40, 65, 50, 80, 60, 90, 72];
  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-border/50 bg-accent/30 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Featured
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">
          Dashboard Preview
        </p>
      </div>
      <div className="mt-4 flex items-end gap-1.5">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-primary/70 transition-all hover:bg-primary"
            style={{ height: `${h}%`, minHeight: 8, maxHeight: 64 }}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Real-time response tracking
      </p>
    </div>
  );
}

function StatsPreview() {
  const points = [20, 35, 28, 50, 45, 65, 60, 78, 72, 90, 85, 100];
  const maxY = 100;
  const w = 200;
  const h = 80;
  const pathD = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (p / maxY) * h;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-border/50 bg-accent/30 p-5">
      <div>
        <p className="text-3xl font-bold text-foreground">1M+</p>
        <p className="text-sm text-muted-foreground">responses collected</p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 w-full" fill="none">
        <path d={pathD} stroke="hsl(var(--primary))" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <path
          d={`${pathD} L${w},${h} L0,${h} Z`}
          fill="hsl(var(--primary))"
          opacity={0.1}
        />
      </svg>
      <p className="mt-2 text-xs text-muted-foreground">
        Growing 40% month-over-month
      </p>
    </div>
  );
}

function GettingStartedCard() {
  return (
    <div className="flex h-full flex-col justify-between rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent p-5">
      <div>
        <p className="text-sm font-semibold text-foreground">
          Getting Started
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Set up your first Delphi study in under 5 minutes with our quick-start
          guide.
        </p>
      </div>
      <Link
        href="/docs/quickstart"
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
      >
        Start Building
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Desktop dropdown                                                           */
/* -------------------------------------------------------------------------- */

function DesktopDropdown({
  section,
  isOpen,
  onEnter,
  onLeave,
}: {
  section: MenuSection;
  isOpen: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button
        className={cn(
          "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isOpen
            ? "text-foreground bg-accent"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        )}
      >
        {section.label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-1/2 top-full z-50 pt-2 -translate-x-1/2"
          >
            <div className="w-[720px] rounded-2xl border border-border bg-popover/95 p-2 shadow-xl backdrop-blur-xl">
              <div className="grid grid-cols-3 gap-1">
                {section.columns?.map((col) => (
                  <div key={col.heading} className="p-3">
                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {col.heading}
                    </p>
                    <ul className="space-y-0.5">
                      {col.items.map((item) => (
                        <li key={item.title}>
                          <Link
                            href={item.href}
                            className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-accent"
                          >
                            <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary/70 transition-colors group-hover:text-primary" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {item.title}
                              </p>
                              <p className="text-xs leading-snug text-muted-foreground">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {section.featured && (
                  <div className="p-2">{section.featured}</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mobile accordion                                                           */
/* -------------------------------------------------------------------------- */

function MobileAccordion({ section }: { section: MenuSection }) {
  const [open, setOpen] = useState(false);

  if (!section.columns) {
    return (
      <Link
        href={section.href ?? "#"}
        className="block rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
      >
        {section.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
      >
        {section.label}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 px-4 pb-3 pt-1">
              {section.columns.map((col) => (
                <div key={col.heading}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {col.heading}
                  </p>
                  <ul className="space-y-0.5">
                    {col.items.map((item) => (
                      <li key={item.title}>
                        <Link
                          href={item.href}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <item.icon className="h-4 w-4 shrink-0 text-primary/70" />
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  MegaMenu                                                                   */
/* -------------------------------------------------------------------------- */

export function MegaMenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = useCallback((label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(label);
  }, []);

  const closeMenu = useCallback(() => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 150);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Hexagon className="h-7 w-7 text-primary" strokeWidth={2.5} />
          <span className="text-xl font-bold tracking-tight text-foreground">
            OpenDelphi
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {MENUS.map((section) =>
            section.columns ? (
              <DesktopDropdown
                key={section.label}
                section={section}
                isOpen={activeMenu === section.label}
                onEnter={() => openMenu(section.label)}
                onLeave={closeMenu}
              />
            ) : (
              <Link
                key={section.label}
                href={section.href ?? "#"}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/50"
              >
                {section.label}
              </Link>
            )
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Get Started Free
          </Link>

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm overflow-y-auto">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>

              <div className="mb-6 flex items-center gap-2.5">
                <Hexagon className="h-6 w-6 text-primary" strokeWidth={2.5} />
                <span className="text-lg font-bold tracking-tight text-foreground">
                  OpenDelphi
                </span>
              </div>

              <nav className="space-y-1">
                {MENUS.map((section) => (
                  <MobileAccordion key={section.label} section={section} />
                ))}
              </nav>

              <div className="mt-8 space-y-3">
                <Link
                  href="/login"
                  className="block rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="block rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Get Started Free
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default MegaMenu;
