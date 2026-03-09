"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function MarketResearchPage() {
  return (
    <ContentPage
      title="Market Research Tools"
      subtitle="Understand your customers, test your products, and outpace the competition with powerful research tools built for speed."
      sections={[
        {
          title: "Consumer Insights",
          content:
            "Capture the voice of your customer with targeted surveys, concept tests, and brand tracking studies. Segment audiences by demographics, behavior, or custom attributes and uncover what drives their decisions.",
        },
        {
          title: "Product Feedback & Testing",
          content:
            "Validate product ideas before you build them. Run concept tests, feature prioritization surveys, and usability studies. AI-powered analysis surfaces the most important feedback instantly.",
        },
        {
          title: "Competitive Analysis",
          content:
            "Benchmark your brand against competitors with standardized survey instruments. Track awareness, perception, and preference over time with automated longitudinal studies.",
        },
        {
          title: "Fast Turnaround",
          content:
            "Launch surveys in minutes, not days. Multi-channel distribution reaches respondents wherever they are. Real-time analytics mean you can act on insights as soon as they emerge.",
        },
      ]}
    />
  );
}
