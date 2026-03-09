"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForm({ name: "", email: "", company: "", message: "" });
  };

  const update =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/20 via-background to-accent/10 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Have a question, want a demo, or need help choosing the right plan?
            We would love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact form + info */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={update("name")}
                className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={update("email")}
                className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-foreground">
                Company
              </label>
              <input
                id="company"
                type="text"
                value={form.company}
                onChange={update("company")}
                className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Your company (optional)"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={form.message}
                onChange={update("message")}
                className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="How can we help?"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Send Message
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-foreground">Get in touch</h2>
            <p className="mt-4 text-muted-foreground">
              Our team typically responds within one business day. For enterprise
              inquiries or demo requests, mention it in your message and we will
              prioritize your request.
            </p>
            <div className="mt-8 flex items-center gap-3 text-muted-foreground">
              <Mail className="h-5 w-5 text-primary" />
              <a
                href="mailto:hello@opendelphi.com"
                className="text-sm transition-colors hover:text-foreground"
              >
                hello@opendelphi.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/10 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Create your free account and launch your first survey in minutes.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
