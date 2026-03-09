"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function BlogPage() {
  return (
    <ContentPage
      title="Blog"
      subtitle="Stay up to date with the latest news, product updates, and insights from the OpenDelphi team and community."
      sections={[
        {
          title: "Latest Updates",
          content:
            "Read about new features, platform improvements, and important announcements. We ship updates weekly and share detailed release notes so you always know what's changed and how it affects your workflows.",
        },
        {
          title: "Research Insights",
          content:
            "Explore best practices for survey design, data collection methodology, and statistical analysis. Our research team publishes deep dives into topics like response bias, sampling techniques, and panel management.",
        },
        {
          title: "Product News",
          content:
            "Get a behind-the-scenes look at what we're building and why. Product news covers upcoming features, design decisions, and the technical challenges we solve to make OpenDelphi faster and more reliable.",
        },
        {
          title: "Community Spotlight",
          content:
            "Discover how researchers, teams, and organizations around the world are using OpenDelphi. Community spotlights highlight creative use cases, integration stories, and contributions from our open-source ecosystem.",
        },
      ]}
    />
  );
}
