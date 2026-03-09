"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function PartnersPage() {
  return (
    <ContentPage
      title="Partner Program"
      subtitle="Grow your business with OpenDelphi. Our partner ecosystem connects technology providers, consultants, and resellers with organizations that need powerful survey solutions."
      sections={[
        {
          title: "Integration Partners",
          content:
            "Build native integrations between OpenDelphi and your platform. Integration partners receive dedicated API support, co-marketing opportunities, and listing in our marketplace. We provide sandbox environments and technical documentation to accelerate development.",
        },
        {
          title: "Reseller Program",
          content:
            "Offer OpenDelphi to your clients with competitive margins and volume discounts. Reseller partners get access to a dedicated partner portal, sales enablement materials, and priority support for their accounts.",
        },
        {
          title: "Technology Partners",
          content:
            "Collaborate with us on joint solutions that combine your technology with OpenDelphi's survey platform. Technology partnerships include joint go-to-market planning, shared roadmap input, and access to our engineering team.",
        },
        {
          title: "Become a Partner",
          content:
            "Ready to join? Fill out our partner application to get started. Our partnerships team reviews applications within five business days and will schedule an introductory call to discuss how we can work together.",
        },
      ]}
    />
  );
}
