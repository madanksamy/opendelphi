"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function CommunityPage() {
  return (
    <ContentPage
      title="Community"
      subtitle="Join a growing network of researchers, developers, and organizations building the future of survey intelligence together."
      sections={[
        {
          title: "Forum",
          content:
            "Ask questions, share tips, and connect with other OpenDelphi users in our community forum. Topics range from survey design best practices to advanced API integrations. Our team actively participates and responds to questions.",
        },
        {
          title: "Open Source",
          content:
            "OpenDelphi is built on open-source foundations. Explore our public repositories, report issues, and submit pull requests on GitHub. We welcome contributions of all sizes, from documentation fixes to new features.",
        },
        {
          title: "Events",
          content:
            "Join us at virtual meetups, webinars, and conferences throughout the year. Events cover product demos, research methodology workshops, and networking opportunities with fellow community members.",
        },
        {
          title: "Contributors",
          content:
            "Meet the people who make OpenDelphi better every day. Our contributor program recognizes community members who contribute code, documentation, translations, and support. Top contributors receive exclusive perks and early access to new features.",
        },
      ]}
    />
  );
}
