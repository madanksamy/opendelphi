"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function DevelopersPage() {
  return (
    <ContentPage
      title="Developer Hub"
      subtitle="Everything you need to build on OpenDelphi. Explore our APIs, SDKs, and developer tools to integrate survey intelligence into your applications."
      sections={[
        {
          title: "REST API",
          content:
            "Our RESTful API provides full programmatic access to surveys, responses, and account management. All endpoints return JSON, support pagination, and are versioned for backward compatibility. Comprehensive OpenAPI specs are available for code generation.",
        },
        {
          title: "JavaScript SDK",
          content:
            "The official JavaScript SDK works in Node.js and the browser. It provides type-safe methods for every API endpoint, built-in error handling, and automatic token refresh. Install via npm and start making API calls in minutes.",
        },
        {
          title: "Webhooks & Events",
          content:
            "React to real-time events in your application with webhooks. Subscribe to response submissions, survey state changes, and quota alerts. Every webhook payload includes a signature for verification and a unique event ID for idempotent processing.",
        },
        {
          title: "CLI Tools",
          content:
            "Manage surveys, export data, and automate workflows from your terminal. The OpenDelphi CLI supports scripting, CI/CD integration, and environment-based configuration. Install globally with npm and authenticate with your API key.",
        },
      ]}
    />
  );
}
