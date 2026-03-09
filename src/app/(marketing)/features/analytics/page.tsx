"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function AnalyticsPage() {
  return (
    <ContentPage
      title="Real-Time Analytics"
      subtitle="Watch responses flow in live. Visualize data instantly with interactive dashboards, charts, and cross-tabulation tools."
      sections={[
        {
          title: "Live Dashboards",
          content:
            "See responses the moment they arrive. Our real-time dashboards update automatically, giving you an instant pulse on your data. Monitor completion rates, drop-off points, and response trends as they happen.",
        },
        {
          title: "Interactive Charts & Visualizations",
          content:
            "Explore your data with bar charts, pie charts, word clouds, heatmaps, and trend lines. Filter by any dimension, compare segments, and drill down into individual responses. Every visualization is interactive and presentation-ready.",
        },
        {
          title: "Cross-Tabulation & Segmentation",
          content:
            "Slice your data by demographics, response patterns, or custom variables. Cross-tabulation reveals hidden relationships between answers, helping you uncover insights that simple summaries miss.",
        },
        {
          title: "Export & Share",
          content:
            "Export raw data to CSV, Excel, or SPSS. Generate PDF reports with your branding. Share live dashboard links with stakeholders so everyone stays informed without waiting for manual updates.",
        },
      ]}
    />
  );
}
