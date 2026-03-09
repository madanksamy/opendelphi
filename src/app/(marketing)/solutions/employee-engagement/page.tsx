"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function EmployeeEngagementPage() {
  return (
    <ContentPage
      title="Employee Engagement Surveys"
      subtitle="Build a thriving workplace culture with regular pulse surveys, 360-degree feedback, and actionable engagement insights."
      sections={[
        {
          title: "Pulse Surveys",
          content:
            "Check in with your team regularly with short, focused pulse surveys. Track engagement, morale, and satisfaction trends over time. Automated scheduling ensures consistent measurement without manual effort.",
        },
        {
          title: "360-Degree Feedback",
          content:
            "Collect multi-rater feedback from managers, peers, and direct reports. Anonymous responses encourage honest input. AI-generated summaries highlight strengths and development areas for each individual.",
        },
        {
          title: "Culture Assessment",
          content:
            "Measure organizational culture with validated frameworks. Identify gaps between current and desired culture, benchmark against industry peers, and track the impact of culture initiatives over time.",
        },
        {
          title: "Manager Dashboards",
          content:
            "Give managers real-time visibility into their team's engagement scores. Drill down by department, location, or tenure. Automated alerts flag concerning trends before they become retention problems.",
        },
      ]}
    />
  );
}
