"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function AIInsightsPage() {
  return (
    <ContentPage
      title="AI-Powered Insights"
      subtitle="Let artificial intelligence do the heavy lifting. Automatically analyze responses, detect sentiment, extract themes, and generate reports."
      sections={[
        {
          title: "GPT-Powered Analysis",
          content:
            "Our AI engine reads every open-ended response and produces structured summaries, key findings, and actionable recommendations. What used to take days of manual coding now happens in seconds.",
        },
        {
          title: "Sentiment Detection",
          content:
            "Automatically classify responses as positive, negative, or neutral. Track sentiment trends over time, across demographics, or between survey rounds. Spot dissatisfaction before it becomes a problem.",
        },
        {
          title: "Theme Extraction",
          content:
            "AI identifies recurring themes and topics across hundreds or thousands of responses. See what people are really talking about without reading every answer. Themes are ranked by frequency and sentiment.",
        },
        {
          title: "Automated Reports",
          content:
            "Generate executive summaries, detailed reports, and presentation-ready slides with one click. Reports include key metrics, visualizations, and AI-written narratives that explain what the data means.",
        },
      ]}
    />
  );
}
