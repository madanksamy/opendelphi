"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function TemplatesPage() {
  return (
    <ContentPage
      title="100+ Survey Templates"
      subtitle="Start faster with professionally designed templates for every industry and use case. Customize any template to fit your needs."
      sections={[
        {
          title: "Templates for Every Industry",
          content:
            "Whether you work in healthcare, education, market research, HR, or nonprofits, we have templates built by experts in your field. Each template follows best practices for question design, response scales, and survey flow.",
        },
        {
          title: "Ready-to-Use Research Instruments",
          content:
            "Access validated instruments like NPS, CSAT, SUS, and more. Our research-grade templates include proper scoring logic, benchmarks, and interpretation guides so you can launch a study in minutes, not days.",
        },
        {
          title: "Fully Customizable",
          content:
            "Every template is a starting point. Add, remove, or modify any question. Change the theme, logic, and branding to make it yours. Templates save you time without limiting your creativity.",
        },
        {
          title: "Community Contributions",
          content:
            "Browse templates shared by the OpenDelphi community. Share your own templates to help others, and discover creative approaches to common research challenges from peers around the world.",
        },
      ]}
    />
  );
}
