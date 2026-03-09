"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Link2,
  Clock,
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
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/providers/UserProvider";

// ── Types ─────────────────────────────────────────────────────────────

type IntegrationType = "google_sheets" | "ehr" | "slack" | "webhook";

interface DbIntegration {
  id: string;
  org_id: string;
  type: IntegrationType;
  config: Record<string, unknown>;
  status: "active" | "inactive" | "error";
  last_synced_at: string | null;
  created_at: string;
}

type DisplayStatus = "connected" | "available" | "coming_soon";

interface IntegrationDef {
  key: string;
  dbType?: IntegrationType;
  name: string;
  description: string;
  icon: typeof Sheet;
  iconColor: string;
  iconBg: string;
  displayStatus: DisplayStatus;
  badge?: string;
}

// ── Static definitions ────────────────────────────────────────────────

const INTEGRATION_DEFS: IntegrationDef[] = [
  {
    key: "google-sheets",
    dbType: "google_sheets",
    name: "Google Sheets",
    description:
      "Automatically sync survey responses to Google Sheets in real time.",
    icon: Sheet,
    iconColor: "text-green-600",
    iconBg: "bg-green-500/10",
    displayStatus: "available",
  },
  {
    key: "slack",
    dbType: "slack",
    name: "Slack",
    description:
      "Get real-time notifications in your Slack channels when responses come in.",
    icon: MessageSquare,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-500/10",
    displayStatus: "available",
  },
  {
    key: "webhook",
    dbType: "webhook",
    name: "Webhooks",
    description:
      "Send survey events to any URL. Build custom integrations with your stack.",
    icon: Webhook,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-500/10",
    displayStatus: "available",
  },
  {
    key: "ehr-fhir",
    dbType: "ehr",
    name: "EHR / FHIR",
    description:
      "Connect to Electronic Health Record systems via FHIR R4 protocol for clinical surveys.",
    icon: HeartPulse,
    iconColor: "text-red-600",
    iconBg: "bg-red-500/10",
    displayStatus: "available",
    badge: "Enterprise",
  },
  {
    key: "zapier",
    name: "Zapier",
    description:
      "Connect OpenDelphi to 5,000+ apps through Zapier automation workflows.",
    icon: Zap,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-500/10",
    displayStatus: "coming_soon",
  },
  {
    key: "ms-teams",
    name: "Microsoft Teams",
    description:
      "Receive survey notifications and manage responses directly in Teams channels.",
    icon: Users,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-500/10",
    displayStatus: "coming_soon",
  },
  {
    key: "salesforce",
    name: "Salesforce",
    description:
      "Sync survey data with Salesforce contacts and opportunities for CRM insights.",
    icon: BarChart3,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-500/10",
    displayStatus: "coming_soon",
  },
  {
    key: "hubspot",
    name: "HubSpot",
    description:
      "Feed survey responses into HubSpot for marketing automation and lead scoring.",
    icon: Globe,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-400/10",
    displayStatus: "coming_soon",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────

function formatTimestamp(ts: string | null): string {
  if (!ts) return "Never";
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function StatusBadge({ status }: { status: DisplayStatus }) {
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

// ── Component ─────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const { orgId } = useUser();
  const [dbIntegrations, setDbIntegrations] = useState<DbIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchIntegrations = useCallback(async () => {
    if (!orgId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("integrations")
      .select("*")
      .eq("org_id", orgId);
    setDbIntegrations((data as DbIntegration[]) ?? []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  // Build a lookup: dbType -> DbIntegration (active ones)
  const activeMap = new Map<string, DbIntegration>();
  for (const row of dbIntegrations) {
    if (row.status === "active") {
      activeMap.set(row.type, row);
    }
  }

  const connected = INTEGRATION_DEFS.filter(
    (d) => d.dbType && activeMap.has(d.dbType)
  );
  const available = INTEGRATION_DEFS.filter(
    (d) => d.dbType && !activeMap.has(d.dbType) && d.displayStatus !== "coming_soon"
  );
  const comingSoon = INTEGRATION_DEFS.filter(
    (d) => d.displayStatus === "coming_soon"
  );

  async function handleConnect(def: IntegrationDef) {
    if (!orgId || !def.dbType) return;
    setActionLoading(def.key);
    try {
      const supabase = createClient();
      // Check if there's an inactive row to reactivate
      const existing = dbIntegrations.find(
        (r) => r.type === def.dbType && r.status === "inactive"
      );
      if (existing) {
        await supabase
          .from("integrations")
          .update({ status: "active", last_synced_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase.from("integrations").insert({
          org_id: orgId,
          type: def.dbType,
          config: {},
          status: "active",
          last_synced_at: new Date().toISOString(),
        });
      }
      await fetchIntegrations();
    } catch (err) {
      console.error("Failed to connect integration:", err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDisconnect(def: IntegrationDef) {
    if (!def.dbType) return;
    const row = activeMap.get(def.dbType);
    if (!row) return;
    setActionLoading(def.key);
    try {
      const supabase = createClient();
      await supabase
        .from("integrations")
        .update({ status: "inactive" })
        .eq("id", row.id);
      await fetchIntegrations();
    } catch (err) {
      console.error("Failed to disconnect integration:", err);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
          {connected.length} connected
        </Badge>
      </div>

      {/* Connected Integrations */}
      {connected.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Connected
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {connected.map((def) => {
              const dbRow = activeMap.get(def.dbType!);
              const isLoading = actionLoading === def.key;
              return (
                <div
                  key={def.key}
                  className="rounded-2xl border border-emerald-500/20 bg-card p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl p-2.5 ${def.iconBg}`}>
                        <def.icon
                          className={`h-5 w-5 ${def.iconColor}`}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-card-foreground">
                          {def.name}
                        </h3>
                        <StatusBadge status="connected" />
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {def.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <RefreshCw className="h-3 w-3" />
                      Last sync: {formatTimestamp(dbRow?.last_synced_at ?? null)}
                    </span>
                    <button
                      disabled={isLoading}
                      onClick={() => handleDisconnect(def)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-card-foreground transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Settings2 className="h-3 w-3" />
                      )}
                      Disconnect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Integrations */}
      {available.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Available
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((def) => {
              const isLoading = actionLoading === def.key;
              return (
                <div
                  key={def.key}
                  className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl p-2.5 ${def.iconBg}`}>
                        <def.icon
                          className={`h-5 w-5 ${def.iconColor}`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-card-foreground">
                            {def.name}
                          </h3>
                          {def.badge && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {def.badge}
                            </Badge>
                          )}
                        </div>
                        <StatusBadge status="available" />
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {def.description}
                  </p>
                  <div className="mt-4">
                    <button
                      disabled={isLoading}
                      onClick={() => handleConnect(def)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Link2 className="h-4 w-4" />
                      )}
                      Connect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Coming Soon */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Coming Soon
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {comingSoon.map((def) => (
            <div
              key={def.key}
              className="rounded-2xl border border-border bg-card p-5 opacity-75"
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2.5 ${def.iconBg}`}>
                  <def.icon
                    className={`h-5 w-5 ${def.iconColor}`}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-card-foreground">
                    {def.name}
                  </h3>
                  <StatusBadge status="coming_soon" />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {def.description}
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
