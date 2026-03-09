"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function AcademicPage() {
  return (
    <ContentPage
      title="Academic Research Platform"
      subtitle="The research tool built for academia. From IRB-ready surveys to multi-round Delphi studies, OpenDelphi supports rigorous methodology."
      sections={[
        {
          title: "IRB-Ready Survey Design",
          content:
            "Build surveys that meet Institutional Review Board requirements out of the box. Include informed consent pages, participant ID management, and data anonymization. Export audit trails for ethics committee review.",
        },
        {
          title: "Delphi Studies Made Simple",
          content:
            "Run multi-round Delphi studies with automatic round management, convergence tracking, and panelist communication. The platform handles the complexity so you can focus on your research questions.",
        },
        {
          title: "Peer Review & Expert Consensus",
          content:
            "Facilitate structured peer review processes, curriculum development committees, or research priority setting exercises. Anonymous participation reduces bias while structured argumentation improves outcomes.",
        },
        {
          title: "Open Source & Free for Researchers",
          content:
            "OpenDelphi is open source and free for academic use. Self-host on your university infrastructure for complete data sovereignty, or use our managed platform with generous academic pricing.",
        },
      ]}
    />
  );
}
