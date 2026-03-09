"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function DocsPage() {
  return (
    <ContentPage
      title="Documentation"
      subtitle="Comprehensive guides and references to help you get the most out of OpenDelphi. Whether you're just getting started or building advanced integrations, we've got you covered."
      sections={[
        {
          title: "Getting Started",
          content:
            "New to OpenDelphi? Our quickstart guide walks you through creating your first survey in under five minutes. Learn the core concepts, set up your account, and start collecting responses right away.",
        },
        {
          title: "API Reference",
          content:
            "Explore the full OpenDelphi REST API with detailed endpoint documentation, request and response schemas, and practical code examples. Every endpoint is versioned and designed for reliability at scale.",
        },
        {
          title: "SDKs & Libraries",
          content:
            "Official client libraries are available for JavaScript, Python, and Go. Each SDK provides type-safe wrappers around our API, handles authentication automatically, and includes built-in retry logic.",
        },
        {
          title: "FAQ",
          content:
            "Find answers to commonly asked questions about billing, data privacy, rate limits, and more. If you can't find what you're looking for, our support team is always happy to help.",
        },
      ]}
    />
  );
}
