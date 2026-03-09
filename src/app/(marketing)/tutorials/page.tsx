"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function TutorialsPage() {
  return (
    <ContentPage
      title="Tutorials & Guides"
      subtitle="Step-by-step tutorials to help you learn OpenDelphi from the ground up. Go from zero to production-ready surveys at your own pace."
      sections={[
        {
          title: "Quick Start",
          content:
            "Get up and running in minutes with our quickstart tutorial. You'll create an account, build a simple survey, distribute it via link, and view your first responses. No coding required.",
        },
        {
          title: "Building Your First Survey",
          content:
            "Learn how to design effective surveys with multiple question types, custom branding, and respondent-friendly layouts. This guide covers best practices for question wording, page structure, and completion rates.",
        },
        {
          title: "Advanced Logic",
          content:
            "Master conditional branching, skip logic, and piping to create dynamic surveys that adapt to each respondent. Advanced logic lets you build complex questionnaires that feel simple and personalized to the people taking them.",
        },
        {
          title: "Data Analysis",
          content:
            "Turn raw responses into actionable insights using OpenDelphi's built-in analytics. Learn how to filter, segment, cross-tabulate, and export your data. We also cover integrating with external tools like spreadsheets and BI platforms.",
        },
      ]}
    />
  );
}
