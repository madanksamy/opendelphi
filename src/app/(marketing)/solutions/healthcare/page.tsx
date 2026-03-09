"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function HealthcarePage() {
  return (
    <ContentPage
      title="Healthcare Research Solutions"
      subtitle="Trusted by hospitals, research institutions, and public health organizations to collect sensitive data securely and compliantly."
      sections={[
        {
          title: "Patient Surveys & Experience",
          content:
            "Measure patient satisfaction, track outcomes, and gather feedback across the care continuum. Our accessible forms meet WCAG standards and work on any device, ensuring every patient can participate.",
        },
        {
          title: "Clinical Trial Data Collection",
          content:
            "Streamline participant screening, consent, and follow-up with structured digital forms. Multi-round Delphi panels help clinical teams reach consensus on protocols, endpoints, and treatment guidelines.",
        },
        {
          title: "HIPAA-Compliant Infrastructure",
          content:
            "Data is encrypted at rest and in transit. Role-based access controls, audit logs, and BAA agreements ensure your research meets the strictest regulatory requirements. Self-hosting options available for maximum control.",
        },
        {
          title: "Public Health & Epidemiology",
          content:
            "Deploy rapid-response surveys for disease surveillance, vaccination attitudes, or community health assessments. Reach populations through multiple channels and analyze results with built-in statistical tools.",
        },
      ]}
    />
  );
}
