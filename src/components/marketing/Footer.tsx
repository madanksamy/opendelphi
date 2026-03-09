"use client";

import Link from "next/link";
import {
  Hexagon,
  Twitter,
  Github,
  Linkedin,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

const footerLinks = {
  Product: [
    { label: "Form Builder", href: "/features/form-builder" },
    { label: "Survey Templates", href: "/features/templates" },
    { label: "Analytics Dashboard", href: "/features/analytics" },
    { label: "Delphi Consensus", href: "/features/consensus" },
    { label: "AI Insights", href: "/features/ai-insights" },
  ],
  Solutions: [
    { label: "Healthcare Research", href: "/solutions/healthcare" },
    { label: "Academic Studies", href: "/solutions/academic" },
    { label: "Market Research", href: "/solutions/market-research" },
    { label: "Employee Engagement", href: "/solutions/employee-engagement" },
    { label: "Enterprise", href: "/solutions/enterprise" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/docs/api" },
    { label: "Blog", href: "/blog" },
    { label: "Community", href: "/community" },
    { label: "Partner Program", href: "/partners" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socialLinks: { label: string; icon: LucideIcon; href: string }[] = [
  { label: "Twitter", icon: Twitter, href: "https://twitter.com/opendelphi" },
  { label: "GitHub", icon: Github, href: "https://github.com/opendelphi" },
  { label: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/opendelphi" },
  { label: "YouTube", icon: Youtube, href: "https://youtube.com/@opendelphi" },
];

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Top: Logo + tagline + newsletter */}
        <div className="flex flex-col gap-8 pb-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <Hexagon className="h-7 w-7 text-primary-foreground" strokeWidth={2.5} />
              <span className="text-xl font-bold tracking-tight">OpenDelphi</span>
            </Link>
            <p className="mt-4 text-sm leading-6 opacity-70">
              The ultimate platform for surveys, consensus, and data analysis.
            </p>
          </div>

          {/* Newsletter */}
          <div className="max-w-sm">
            <h3 className="text-sm font-semibold">Subscribe to our newsletter</h3>
            <p className="mt-2 text-sm opacity-70">
              Get the latest updates, tips, and product news.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEmail("");
              }}
              className="mt-4 flex gap-2"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="min-w-0 flex-1 rounded-lg border border-background/20 bg-background/10 px-3 py-2 text-sm text-background placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 gap-8 border-t border-background/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold">{category}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm opacity-70 transition-opacity hover:opacity-100"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 sm:flex-row">
          <p className="text-sm opacity-60">
            &copy; {new Date().getFullYear()} OpenDelphi. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="opacity-60 transition-opacity hover:opacity-100"
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
