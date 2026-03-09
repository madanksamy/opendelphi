"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function FormBuilderPage() {
  return (
    <ContentPage
      title="Powerful Form Builder"
      subtitle="Create beautiful, intelligent forms and surveys in minutes with our intuitive drag-and-drop builder. No coding required."
      sections={[
        {
          title: "Drag-and-Drop Simplicity",
          content:
            "Build complex forms effortlessly with our visual editor. Drag question types onto your canvas, reorder with a click, and preview changes in real time. The builder works the way you think — no learning curve, no frustration.",
        },
        {
          title: "20+ Question Types",
          content:
            "From multiple choice and rating scales to matrix questions, file uploads, and signature capture — we support every question type you need. Each type is optimized for mobile and desktop, ensuring a smooth experience for every respondent.",
        },
        {
          title: "Smart Branching Logic",
          content:
            "Create dynamic surveys that adapt to each respondent. Use conditional logic to show or hide questions, skip sections, or redirect to different paths based on previous answers. Build sophisticated flows without writing a single line of code.",
        },
        {
          title: "Multi-Step Forms",
          content:
            "Break long surveys into manageable steps with progress indicators. Multi-step forms improve completion rates by reducing cognitive load. Customize transitions, add section introductions, and save partial responses automatically.",
        },
        {
          title: "Custom Themes & Branding",
          content:
            "Make every form match your brand. Customize colors, fonts, logos, and backgrounds. Apply CSS overrides for pixel-perfect control, or choose from our library of professionally designed themes.",
        },
      ]}
    />
  );
}
