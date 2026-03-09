"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function CareersPage() {
  return (
    <ContentPage
      title="Careers"
      subtitle="Join the team building the next generation of survey and research tools. We're looking for curious, driven people who care about making data collection better for everyone."
      sections={[
        {
          title: "Our Culture",
          content:
            "We believe great products come from diverse, collaborative teams. At OpenDelphi, you'll work alongside engineers, researchers, and designers who value transparency, ownership, and continuous learning. We ship fast, iterate often, and celebrate both successes and lessons.",
        },
        {
          title: "Open Positions",
          content:
            "We're hiring across engineering, product, design, and operations. Current openings include full-stack engineers, data scientists, and developer advocates. All roles are remote-friendly with flexible working hours.",
        },
        {
          title: "Benefits",
          content:
            "Competitive salary and equity, comprehensive health coverage, and a generous home office stipend. We offer unlimited PTO, a yearly learning budget for conferences and courses, and regular team retreats to connect in person.",
        },
        {
          title: "How to Apply",
          content:
            "Browse our open roles and submit your application online. Our hiring process includes an initial screen, a take-home exercise relevant to the role, and a final round with the team. We aim to move quickly and provide feedback at every stage.",
        },
      ]}
    />
  );
}
