"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Building2,
  Globe,
  Clock,
  Bell,
  BellOff,
  Save,
  AlertTriangle,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EditableText } from "@/components/cms/EditableText";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/providers/UserProvider";

interface OrgSettings {
  default_language?: string;
  timezone?: string;
  notifications?: NotificationPreferences;
}

interface NotificationPreferences {
  surveyResponses: boolean;
  weeklyDigest: boolean;
  teamInvites: boolean;
  surveyCompletion: boolean;
  productUpdates: boolean;
  securityAlerts: boolean;
}

const defaultNotifications: NotificationPreferences = {
  surveyResponses: true,
  weeklyDigest: true,
  teamInvites: true,
  surveyCompletion: true,
  productUpdates: false,
  securityAlerts: true,
};

type SaveStatus = "idle" | "saving" | "success" | "error";

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const { user, profile, org, orgId } = useUser();

  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Organization fields
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Settings fields
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("America/New_York");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const [notifications, setNotifications] =
    useState<NotificationPreferences>(defaultNotifications);

  const loadData = useCallback(async () => {
    if (!orgId || !user) {
      // Still populate from UserProvider data if available
      if (profile) {
        setFullName(profile.full_name ?? "");
        setEmail(profile.email ?? "");
        setPhone(profile.phone ?? "");
      }
      if (org) {
        setOrgName(org.name ?? "");
        setOrgSlug(org.slug ?? "");
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Load organization details (including settings JSONB)
      const { data: orgData, error: orgErr } = await supabase
        .from("organizations")
        .select("name, slug, settings")
        .eq("id", orgId)
        .single();

      if (orgErr) {
        // Fallback to UserProvider data
        if (org) {
          setOrgName(org.name ?? "");
          setOrgSlug(org.slug ?? "");
        }
      } else if (orgData) {
        setOrgName(orgData.name ?? "");
        setOrgSlug(orgData.slug ?? "");
        const settings = (orgData.settings ?? {}) as OrgSettings;
        if (settings.default_language) setLanguage(settings.default_language);
        if (settings.timezone) setTimezone(settings.timezone);
        if (settings.notifications) {
          setNotifications({ ...defaultNotifications, ...settings.notifications });
        }
      }

      // Load profile
      const { data: profileData, error: profErr } = await supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", user.id)
        .single();

      if (profErr) {
        // Fallback to UserProvider data
        if (profile) {
          setFullName(profile.full_name ?? "");
          setEmail(profile.email ?? "");
          setPhone(profile.phone ?? "");
        }
      } else if (profileData) {
        setFullName(profileData.full_name ?? "");
        setEmail(profileData.email ?? "");
        setPhone(profileData.phone ?? "");
      }
    } finally {
      setLoading(false);
    }
  }, [orgId, user, profile, org, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleNotification = (key: keyof NotificationPreferences) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaveStatus("saving");
    setSaveError(null);

    const errors: string[] = [];

    try {
      // Update organization (if we have orgId)
      if (orgId) {
        const settings: OrgSettings = {
          default_language: language,
          timezone,
          notifications,
        };

        const { error: orgError } = await supabase
          .from("organizations")
          .update({ name: orgName, slug: orgSlug, settings })
          .eq("id", orgId);

        if (orgError) errors.push(`Organization: ${orgError.message}`);
      }

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone })
        .eq("id", user.id);

      if (profileError) errors.push(`Profile: ${profileError.message}`);

      if (errors.length > 0) {
        setSaveError(errors.join("; "));
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 5000);
      } else {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save settings";
      setSaveError(message);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 5000);
    }
  };

  const notificationItems = [
    {
      key: "surveyResponses" as const,
      label: "New survey responses",
      description: "Get notified when someone submits a response",
      icon: Bell,
    },
    {
      key: "weeklyDigest" as const,
      label: "Weekly digest",
      description: "Summary of survey activity every Monday",
      icon: Bell,
    },
    {
      key: "teamInvites" as const,
      label: "Team invitations",
      description: "When someone joins or is invited to your org",
      icon: Bell,
    },
    {
      key: "surveyCompletion" as const,
      label: "Survey completion",
      description: "When a survey reaches its response target",
      icon: Bell,
    },
    {
      key: "productUpdates" as const,
      label: "Product updates",
      description: "New features and platform announcements",
      icon: BellOff,
    },
    {
      key: "securityAlerts" as const,
      label: "Security alerts",
      description: "Unusual login activity and security events",
      icon: Bell,
    },
  ];

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading settings...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <EditableText
          id="settings-heading"
          defaultContent="General Settings"
          as="h1"
          className="text-2xl font-bold text-foreground"
        />
        <EditableText
          id="settings-subheading"
          defaultContent="Manage your organization settings and preferences."
          as="p"
          className="mt-1 text-sm text-muted-foreground"
        />
      </div>

      {/* Profile Info */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="rounded-xl bg-primary/10 p-2">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-card-foreground">
              Your Profile
            </h2>
            <p className="text-xs text-muted-foreground">
              Personal account details
            </p>
          </div>
        </div>
        <div className="space-y-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              disabled
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">
              Email is managed through your authentication provider.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
      </div>

      {/* Organization Info */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="rounded-xl bg-primary/10 p-2">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-card-foreground">
              Organization
            </h2>
            <p className="text-xs text-muted-foreground">
              Basic organization details
            </p>
          </div>
        </div>
        <div className="space-y-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization name</Label>
            <Input
              id="org-name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Your organization name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-slug">Organization slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                opendelphi.com/
              </span>
              <Input
                id="org-slug"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                placeholder="your-org"
                className="max-w-[200px]"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Used in public survey URLs and API endpoints.
            </p>
          </div>
        </div>
      </div>

      {/* Default Survey Settings */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="rounded-xl bg-primary/10 p-2">
            <Globe className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-card-foreground">
              Default Survey Settings
            </h2>
            <p className="text-xs text-muted-foreground">
              Defaults applied to newly created surveys
            </p>
          </div>
        </div>
        <div className="space-y-5 p-6">
          <div className="space-y-2">
            <Label>Default language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="max-w-[260px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
                <SelectItem value="zh">Chinese (Simplified)</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="max-w-[260px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">
                  Eastern Time (ET)
                </SelectItem>
                <SelectItem value="America/Chicago">
                  Central Time (CT)
                </SelectItem>
                <SelectItem value="America/Denver">
                  Mountain Time (MT)
                </SelectItem>
                <SelectItem value="America/Los_Angeles">
                  Pacific Time (PT)
                </SelectItem>
                <SelectItem value="Europe/London">
                  Greenwich Mean Time (GMT)
                </SelectItem>
                <SelectItem value="Europe/Berlin">
                  Central European Time (CET)
                </SelectItem>
                <SelectItem value="Asia/Tokyo">
                  Japan Standard Time (JST)
                </SelectItem>
                <SelectItem value="Asia/Shanghai">
                  China Standard Time (CST)
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>All survey schedules and analytics use this timezone</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="rounded-xl bg-primary/10 p-2">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-card-foreground">
              Email Notifications
            </h2>
            <p className="text-xs text-muted-foreground">
              Choose which emails you want to receive
            </p>
          </div>
        </div>
        <div className="divide-y divide-border">
          {notificationItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-card-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <Switch
                checked={notifications[item.key]}
                onCheckedChange={() => toggleNotification(item.key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button + Status */}
      <div className="flex items-center justify-end gap-3">
        {saveStatus === "success" && (
          <div className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Settings saved successfully
          </div>
        )}
        {saveStatus === "error" && (
          <div className="flex items-center gap-1.5 text-sm text-destructive">
            <XCircle className="h-4 w-4" />
            {saveError ?? "Failed to save"}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveStatus === "saving" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saveStatus === "saving" ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-destructive/30 bg-card">
        <div className="flex items-center gap-3 border-b border-destructive/30 px-6 py-4">
          <div className="rounded-xl bg-destructive/10 p-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-destructive">
              Danger Zone
            </h2>
            <p className="text-xs text-muted-foreground">
              Irreversible actions — proceed with caution
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-card-foreground">
              Delete organization
            </p>
            <p className="text-xs text-muted-foreground">
              Permanently delete this organization and all its data. This cannot
              be undone.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Organization</DialogTitle>
                <DialogDescription>
                  This action is permanent and cannot be undone. All surveys,
                  responses, and team members will be permanently removed.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4">
                <div className="rounded-lg bg-destructive/5 p-3 text-sm text-destructive">
                  <p className="font-medium">
                    This will permanently delete &ldquo;{orgName}&rdquo; and all
                    associated data including surveys, responses, and team
                    memberships.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delete-confirm">
                    Type <span className="font-mono font-bold">{orgSlug}</span>{" "}
                    to confirm
                  </Label>
                  <Input
                    id="delete-confirm"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder={orgSlug}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <button className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-accent">
                    Cancel
                  </button>
                </DialogClose>
                <button
                  disabled={deleteConfirm !== orgSlug}
                  className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Delete Organization
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
