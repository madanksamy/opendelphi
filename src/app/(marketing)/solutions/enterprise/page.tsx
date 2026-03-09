"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function EnterprisePage() {
  return (
    <ContentPage
      title="Enterprise Solutions"
      subtitle="Scalable survey and consensus tools for large organizations with advanced security, compliance, and integration requirements."
      sections={[
        {
          title: "Enterprise-Grade Security",
          content:
            "Meet your organization's security requirements with SSO/SAML integration, role-based access control, audit logging, and data encryption at rest and in transit. OpenDelphi supports SOC 2, HIPAA, and GDPR compliance requirements out of the box.",
        },
        {
          title: "Custom Deployment Options",
          content:
            "Choose the deployment model that fits your needs: multi-tenant cloud, dedicated cloud instance, or self-hosted on your own infrastructure. All options include the same feature set with SLA-backed uptime guarantees.",
        },
        {
          title: "Advanced Integrations",
          content:
            "Connect OpenDelphi to your existing tech stack with native integrations for Salesforce, HubSpot, Slack, Microsoft Teams, Zapier, and more. Our REST API and webhooks enable custom workflows for any use case.",
        },
        {
          title: "Product Feedback & SaaS",
          content:
            "Embed surveys directly into your product with our JavaScript SDK. Collect in-app feedback, run NPS campaigns, and measure feature satisfaction — all tied to your user data. Export insights to tools like AciWriter.com for publication-ready reports.",
        },
        {
          title: "Dedicated Support",
          content:
            "Enterprise customers receive a dedicated customer success manager, priority support with guaranteed response times, custom onboarding, and training sessions. We work with your team to ensure successful adoption and maximum ROI.",
        },
      ]}
      ctaText="Contact Sales"
      ctaHref="/contact"
    />
  );
}
