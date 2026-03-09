"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function TermsPage() {
  return (
    <ContentPage
      title="Terms of Service"
      subtitle="By using OpenDelphi, you agree to these terms. Please read them carefully."
      sections={[
        {
          title: "Acceptance of Terms",
          content:
            "By accessing or using OpenDelphi, you agree to be bound by these Terms of Service. If you are using OpenDelphi on behalf of an organization, you represent that you have authority to bind that organization to these terms.",
        },
        {
          title: "Account Responsibilities",
          content:
            "You are responsible for maintaining the security of your account credentials and for all activities that occur under your account. You must provide accurate registration information and keep it up to date. You must not use the platform for any illegal purpose or to distribute harmful, abusive, or misleading content.",
        },
        {
          title: "Your Content & Data",
          content:
            "You retain all rights to the surveys you create and the responses you collect. By using our platform, you grant us a limited license to store, process, and display your content as necessary to provide our services. You are responsible for obtaining appropriate consent from survey respondents and complying with applicable data protection laws.",
        },
        {
          title: "Acceptable Use",
          content:
            "You may not use OpenDelphi to collect data illegally, conduct phishing or fraud, distribute malware, violate intellectual property rights, or engage in any activity that disrupts the platform or other users. We reserve the right to suspend accounts that violate these policies.",
        },
        {
          title: "Service Availability & Modifications",
          content:
            "We strive for 99.9% uptime but do not guarantee uninterrupted service. We may modify, suspend, or discontinue features with reasonable notice. Free tier limitations may change. Paid plans are governed by their specific subscription terms.",
        },
        {
          title: "Limitation of Liability",
          content:
            "OpenDelphi is provided 'as is' without warranties of any kind. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages. Our total liability is limited to the amount you paid us in the 12 months preceding the claim.",
        },
      ]}
      ctaText="Questions? Contact Us"
      ctaHref="/contact"
    />
  );
}
