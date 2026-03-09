"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy Policy"
      subtitle="Your privacy matters. Here's how we collect, use, and protect your data."
      sections={[
        {
          title: "Data We Collect",
          content:
            "We collect information you provide when creating an account (name, email, organization), survey content you create, and anonymized usage analytics to improve our platform. We use cookies for authentication and session management. We do not track you across third-party websites.",
        },
        {
          title: "How We Use Your Data",
          content:
            "Your data is used to provide and improve our services, send you essential account notifications, and generate aggregate platform analytics. We never sell your personal data or survey responses to third parties. Survey response data belongs to the survey creator and is processed only as directed.",
        },
        {
          title: "Data Security",
          content:
            "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use Supabase for data storage with enterprise-grade security, row-level security policies, and regular backups. Our infrastructure is hosted on SOC 2 compliant providers. We conduct regular security audits and penetration testing.",
        },
        {
          title: "Your Rights",
          content:
            "You can access, export, correct, or delete your data at any time from your account settings. If you're covered by GDPR, CCPA, or similar regulations, we honor all applicable data subject rights including the right to be forgotten, data portability, and objection to processing. Contact privacy@opendelphi.com for any privacy-related requests.",
        },
        {
          title: "Data Retention",
          content:
            "Active account data is retained for the duration of your account. Deleted surveys and responses are purged within 30 days. Account data is removed within 90 days of account deletion. Anonymized aggregate analytics may be retained indefinitely.",
        },
      ]}
      ctaText="Questions? Contact Us"
      ctaHref="/contact"
    />
  );
}
