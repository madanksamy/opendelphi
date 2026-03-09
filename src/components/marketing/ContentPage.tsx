"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ContentSection {
  title: string;
  content: string;
}

interface ContentPageProps {
  title: string;
  subtitle: string;
  sections: ContentSection[];
  ctaText?: string;
  ctaHref?: string;
}

export function ContentPage({
  title,
  subtitle,
  sections,
  ctaText = "Get Started Free",
  ctaHref = "/register",
}: ContentPageProps) {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/20 via-background to-accent/10 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Content sections */}
      {sections.map((section, i) => (
        <section
          key={section.title}
          className={`py-16 sm:py-20 ${i % 2 === 0 ? "bg-background" : "bg-muted/30"}`}
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
              {section.title}
            </h2>
            <div className="mt-6 text-base leading-7 text-muted-foreground whitespace-pre-line">
              {section.content}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="bg-primary/10 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join thousands of researchers, teams, and organizations using OpenDelphi.
          </p>
          <Link
            href={ctaHref}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            {ctaText}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
