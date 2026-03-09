"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function AboutPage() {
  return (
    <ContentPage
      title="About OpenDelphi"
      subtitle="We're building the future of data collection, consensus, and research — open, transparent, and accessible to all."
      sections={[
        {
          title: "Our Mission",
          content:
            "OpenDelphi was born from a simple belief: every researcher, organization, and team deserves access to world-class survey and consensus tools — without the enterprise price tag. We combine the rigor of the Delphi methodology with modern AI and intuitive design to make expert consensus and data analysis available to everyone.",
        },
        {
          title: "What We Do",
          content:
            "We provide an integrated platform that covers the entire research lifecycle: design surveys with our drag-and-drop builder, distribute them globally, collect and analyze responses in real time, run multi-round Delphi studies to reach expert consensus, and generate publication-ready reports. From a simple feedback form to a complex multi-site clinical study, OpenDelphi scales with your needs.",
        },
        {
          title: "Open Source & Community",
          content:
            "OpenDelphi is open source at its core. We believe transparency and community contribution make better software. Our codebase is publicly available, our roadmap is community-driven, and we welcome contributions from developers, researchers, and practitioners worldwide.",
        },
        {
          title: "Our Values",
          content:
            "Privacy First — Your data belongs to you. We never sell respondent data and offer full data sovereignty options.\n\nAccessibility — Every feature is designed to be usable by everyone, regardless of technical skill or ability.\n\nRigor — We follow established research methodologies and statistical best practices, so you can trust your results.\n\nTransparency — Open source, open pricing, open roadmap. No hidden fees, no surprises.",
        },
      ]}
      ctaText="Join Our Community"
      ctaHref="/register"
    />
  );
}
