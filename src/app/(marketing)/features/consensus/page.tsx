"use client";

import { ContentPage } from "@/components/marketing/ContentPage";

export default function ConsensusPage() {
  return (
    <ContentPage
      title="Delphi Consensus Engine"
      subtitle="Harness the wisdom of experts with structured, multi-round consensus building. The gold standard for group decision-making."
      sections={[
        {
          title: "Multi-Round Expert Panels",
          content:
            "Run Delphi studies with any number of rounds. In each round, panelists review aggregated feedback from previous rounds, refine their positions, and converge toward consensus. The platform handles all the logistics automatically.",
        },
        {
          title: "Automated Convergence Detection",
          content:
            "Our algorithms continuously monitor agreement levels across your panel. Statistical measures like interquartile range, coefficient of variation, and Kendall's W tell you exactly when consensus has been reached — no guesswork required.",
        },
        {
          title: "Structured Argumentation",
          content:
            "Panelists don't just rate — they explain their reasoning. The platform organizes arguments for and against each position, surfaces the strongest rationales, and helps the group move toward well-reasoned agreement.",
        },
        {
          title: "Anonymous & Transparent",
          content:
            "Maintain panelist anonymity to prevent groupthink and authority bias while keeping the process fully transparent. Every round is documented, every shift in opinion is tracked, and every decision is defensible.",
        },
      ]}
    />
  );
}
