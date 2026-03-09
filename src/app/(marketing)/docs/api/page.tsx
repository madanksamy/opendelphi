"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function ApiReferencePage() {
  return (
    <ContentPage
      title="API Reference"
      subtitle="Complete documentation for the OpenDelphi REST API. Build powerful integrations with predictable, resource-oriented endpoints and consistent JSON responses."
      sections={[
        {
          title: "Authentication",
          content:
            "All API requests require a Bearer token passed in the Authorization header. Generate API keys from your dashboard under Settings. Keys can be scoped to specific projects and revoked at any time.",
        },
        {
          title: "Surveys API",
          content:
            "Create, update, list, and delete surveys programmatically. The Surveys API supports full CRUD operations, branching logic configuration, and template management. Responses are paginated by default with configurable page sizes.",
        },
        {
          title: "Responses API",
          content:
            "Retrieve individual or aggregated survey responses with flexible filtering and sorting options. Export data in JSON or CSV format, and use real-time streaming for live dashboards. Supports partial responses and session resumption.",
        },
        {
          title: "Webhooks",
          content:
            "Subscribe to real-time events such as response submissions, survey completions, and quota thresholds. Webhooks are delivered with HMAC signatures for verification and include automatic retries with exponential backoff.",
        },
      ]}
    />
  );
}
