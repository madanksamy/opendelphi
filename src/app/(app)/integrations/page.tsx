"use client";

import { useState } from "react";
import {
  Link2,
  Check,
  Clock,
  ExternalLink,
  Settings2,
  RefreshCw,
  Sheet,
  MessageSquare,
  Webhook,
  HeartPulse,
  Zap,
  Users,
  BarChart3,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type IntegrationStatus = "connected" | "available" | "coming_soon";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof Sheet;
  iconColor: string;
  iconBg: string;
  status: IntegrationStatus;
  lastSync?: string;
  detail?: string;
  badge?: string;
}

const integrations: Integration[] = [
  {
    id: "google-sheets",
    name: "Google Sheets",
    description:
      "Automatically sync survey responses to Google Sheets in real time.",
    icon: Sheet,
    iconColor: "text-green-600",
    iconBg: "bg-green-500/10",
    status: "connected",
    lastSync: "2 minutes ago",
    detail: "Syncing to \"Survey Responses 2026\" spreadsheet",
  },
  {
    id: "slack",
    name: "Slack",
    description:
      "Get real-time notifications in your Slack channels when responses come in.",
    icon: MessageSquare,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-500/10",
    status: "connected",
    lastSync: "5 minutes ago",
    detail: "Posting to #survey-notifications",
  },
  {
    id: "webhook",
    name: "Webhooks",
    description:
      "Send survey events to any URL. Build custom integrations with your stack.",
    icon: Webhook,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-500/10",
    status: "available",
  },
  {
    id: "ehr-fhir",
    name: "EHR / FHIR",
    description:
      "Connect to Electronic Health Record systems via FHIR R4 protocol for clinical surveys.",
    icon: HeartPulse,
    iconColor: "text-red-600",
    iconBg: "bg-red-500/10",
    status: "available",
    badge: "Enterprise",
  },
  {
    id: "zapier",
    name: "Zapier",
    description:
      "Connect OpenDelphi to 5,000+ apps through Zapier automation workflows.",
    icon: Zap,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-500/10",
    status: "coming_soon",
  },
  {
    id: "ms-teams",
    name: "Microsoft Teams",
    description:
      "Receive survey notifications and manage responses directly in Teams channels.",
    icon: Users,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-500/10",
    status: "coming_soon",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description:
      "Sync survey data with Salesforce contacts and opportunities for CRM insights.",
    icon: BarChart3,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-500/10",
    status: "coming_soon",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description:
      "Feed survey responses into HubSpot for marketing automation and lead scoring.",
    icon: Globe,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-400/10",
    status: "coming_soon",
  },
];

function StatusBadge({ status }: { status: IntegrationStatus }) {
  switch (status) {
    case "connected":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Connected
        </span>
      );
    case "available":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600">
          Available
        </span>
      );
    case "coming_soon":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-500/10 px-2.5 py-0.5 text-xs font-medium text-gray-500">
          <Clock className="h-3 w-3" />
          Coming Soon
        </span>
      );
  }
}

export default function IntegrationsPage() {
  const connectedCount = integrations.filter(
    (i) => i.status === "connected"
  ).length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect OpenDelphi with your favorite tools and services.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <Link2 className="h-3.5 w-3.5" />
          {connectedCount} connected
        </Badge>
      </div>

      {/* Connected Integrations */}
      {connectedCount > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Connected
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {integrations
              .filter((i) => i.status === "connected")
              .map((integration) => (
                <div
                  key={integration.id}
                  className="rounded-2xl border border-emerald-500/20 bg-card p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-xl p-2.5 ${integration.iconBg}`}
                      >
                        <integration.icon
                          className={`h-5 w-5 ${integration.iconColor}`}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-card-foreground">
                          {integration.name}
                        </h3>
                        <StatusBadge status={integration.status} />
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {integration.description}
                  </p>
                  {integration.detail && (
                    <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2">
                      <p className="text-xs text-muted-foreground">
                        {integration.detail}
                      </p>
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <RefreshCw className="h-3 w-3" />
                      Last sync: {integration.lastSync}
                    </span>
                    <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-card-foreground transition-colors hover:bg-accent">
                      <Settings2 className="h-3 w-3" />
                      Configure
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Available Integrations */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Available
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations
            .filter((i) => i.status === "available")
            .map((integration) => (
              <div
                key={integration.id}
                className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2.5 ${integration.iconBg}`}>
                      <integration.icon
                        className={`h-5 w-5 ${integration.iconColor}`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-card-foreground">
                          {integration.name}
                        </h3>
                        {integration.badge && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {integration.badge}
                          </Badge>
                        )}
                      </div>
                      <StatusBadge status={integration.status} />
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {integration.description}
                </p>
                <div className="mt-4">
                  <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                    <Link2 className="h-4 w-4" />
                    Connect
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Coming Soon */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Coming Soon
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {integrations
            .filter((i) => i.status === "coming_soon")
            .map((integration) => (
              <div
                key={integration.id}
                className="rounded-2xl border border-border bg-card p-5 opacity-75"
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2.5 ${integration.iconBg}`}>
                    <integration.icon
                      className={`h-5 w-5 ${integration.iconColor}`}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-card-foreground">
                      {integration.name}
                    </h3>
                    <StatusBadge status={integration.status} />
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {integration.description}
                </p>
                <div className="mt-4">
                  <button
                    disabled
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground opacity-50"
                  >
                    Notify Me
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
