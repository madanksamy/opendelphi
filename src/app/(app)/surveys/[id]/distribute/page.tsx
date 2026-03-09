"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/providers/UserProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import {
  ArrowLeft,
  Mail,
  Smartphone,
  Link2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Code2,
  Send,
  Plus,
  X,
  Sheet,
  Crown,
  Loader2,
  Check as CheckIcon,
  ExternalLink as ExternalLinkIcon,
} from "lucide-react";

export default function DistributePage() {
  const params = useParams();
  const surveyId = params.id as string;
  const [slug, setSlug] = useState<string | null>(null);
  const { isGoogleUser, isPaidUser } = useUser();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("surveys")
      .select("slug")
      .eq("id", surveyId)
      .single()
      .then(({ data }: { data: { slug: string } | null }) => {
        if (data) setSlug(data.slug);
      });
  }, [surveyId, supabase]);

  const shareUrl = slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/s/${slug}`
    : "";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/surveys/${surveyId}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to survey
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            Distribute Survey
          </h1>
          <p className="text-muted-foreground mt-1">
            Share your survey through multiple channels
          </p>
        </div>

        <div className="space-y-6">
          {/* Share Link */}
          <ShareLinkSection url={shareUrl} />

          {/* Email Distribution */}
          <EmailSection />

          {/* SMS Section */}
          <SMSSection />

          {/* QR Code */}
          <QRCodeSection url={shareUrl} />

          {/* Embed Code */}
          <EmbedSection surveyId={surveyId} url={shareUrl} />

          {/* Google Sheets */}
          <GoogleSheetsSection
            surveyId={surveyId}
            isGoogleUser={isGoogleUser}
            isPaidUser={isPaidUser}
          />
        </div>
      </div>
    </div>
  );
}

// ── Share Link ─────────────────────────────────────────────────────

function ShareLinkSection({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
            <Link2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-base">Share Link</CardTitle>
            <CardDescription>
              Copy and share the direct link to your survey
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            value={url}
            readOnly
            className="font-mono text-sm bg-muted/50"
          />
          <Button
            variant="outline"
            onClick={handleCopy}
            className="min-w-[100px] shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </Button>
          <Link href={url} target="_blank">
            <Button variant="outline" size="icon" title="Open in new tab">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Email Distribution ─────────────────────────────────────────────

function EmailSection() {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [subject, setSubject] = useState(
    "We'd love your feedback - Customer Satisfaction Survey"
  );
  const [body, setBody] = useState(
    "Hi there,\n\nWe're reaching out to gather your feedback about your experience with our product. Your insights help us improve and build a better experience for everyone.\n\nThe survey takes about 5 minutes to complete. Click the link below to get started:\n\n{{survey_link}}\n\nThank you for your time!\n\nBest regards,\nThe OpenDelphi Team"
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const addRecipient = useCallback(() => {
    const email = emailInput.trim();
    if (!email) return;
    const emails = email.split(/[,;\s]+/).filter(Boolean);
    setRecipients((prev) => {
      const existing = new Set(prev);
      const newEmails = emails.filter((e) => !existing.has(e) && e.includes("@"));
      return [...prev, ...newEmails];
    });
    setEmailInput("");
  }, [emailInput]);

  const removeRecipient = useCallback((email: string) => {
    setRecipients((prev) => prev.filter((e) => e !== email));
  }, []);

  const handleSend = useCallback(async () => {
    setSending(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
            <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-base">Email Distribution</CardTitle>
            <CardDescription>
              Send survey invitations via email
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recipients */}
        <div className="space-y-2">
          <Label>Recipients</Label>
          <div className="flex gap-2">
            <Input
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addRecipient();
                }
              }}
              placeholder="Enter email addresses (comma separated)"
              className="flex-1"
            />
            <Button variant="outline" onClick={addRecipient}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          {recipients.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {recipients.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
                >
                  {email}
                  <button
                    onClick={() => removeRecipient(email)}
                    className="ml-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <span className="text-xs text-muted-foreground self-center ml-1">
                {recipients.length} recipient{recipients.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label>Subject Line</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Body */}
        <div className="space-y-2">
          <Label>Email Body</Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Use <code className="rounded bg-muted px-1">{"{{survey_link}}"}</code> to
            insert the survey link
          </p>
        </div>

        {/* Send button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSend}
            disabled={recipients.length === 0 || sending}
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Sending...
              </span>
            ) : sent ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Sent
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Send Invitations
              </>
            )}
          </Button>
          {recipients.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Add at least one recipient to send
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── SMS Section ────────────────────────────────────────────────────

function SMSSection() {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [phoneInput, setPhoneInput] = useState("");
  const [message, setMessage] = useState(
    "We'd love your feedback! Please take our quick survey: {{survey_link}}"
  );

  const addPhone = useCallback(() => {
    const phone = phoneInput.trim();
    if (!phone) return;
    setPhoneNumbers((prev) =>
      prev.includes(phone) ? prev : [...prev, phone]
    );
    setPhoneInput("");
  }, [phoneInput]);

  const removePhone = useCallback((phone: string) => {
    setPhoneNumbers((prev) => prev.filter((p) => p !== phone));
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
            <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <CardTitle className="text-base">SMS Distribution</CardTitle>
            <CardDescription>
              Send survey invitations via text message
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phone numbers */}
        <div className="space-y-2">
          <Label>Phone Numbers</Label>
          <div className="flex gap-2">
            <Input
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPhone();
                }
              }}
              placeholder="+1 (555) 000-0000"
              className="flex-1"
            />
            <Button variant="outline" onClick={addPhone}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          {phoneNumbers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {phoneNumbers.map((phone) => (
                <span
                  key={phone}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
                >
                  {phone}
                  <button
                    onClick={() => removePhone(phone)}
                    className="ml-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={160}
          />
          <p className="text-xs text-muted-foreground">
            {message.length}/160 characters. Use{" "}
            <code className="rounded bg-muted px-1">{"{{survey_link}}"}</code> for
            the survey link.
          </p>
        </div>

        <Button disabled={phoneNumbers.length === 0}>
          <Send className="h-4 w-4 mr-1" />
          Send SMS
        </Button>
      </CardContent>
    </Card>
  );
}

// ── QR Code ────────────────────────────────────────────────────────

function QRCodeSection({ url }: { url: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-2">
            <QrCode className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <CardTitle className="text-base">QR Code</CardTitle>
            <CardDescription>
              Generate a QR code for print materials or displays
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* QR Code placeholder - renders a stylized grid pattern */}
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <svg
              width="160"
              height="160"
              viewBox="0 0 160 160"
              className="text-foreground"
            >
              {/* Corner squares */}
              <rect x="8" y="8" width="40" height="40" rx="4" fill="currentColor" />
              <rect x="14" y="14" width="28" height="28" rx="2" fill="white" />
              <rect x="20" y="20" width="16" height="16" rx="1" fill="currentColor" />

              <rect x="112" y="8" width="40" height="40" rx="4" fill="currentColor" />
              <rect x="118" y="14" width="28" height="28" rx="2" fill="white" />
              <rect x="124" y="20" width="16" height="16" rx="1" fill="currentColor" />

              <rect x="8" y="112" width="40" height="40" rx="4" fill="currentColor" />
              <rect x="14" y="118" width="28" height="28" rx="2" fill="white" />
              <rect x="20" y="124" width="16" height="16" rx="1" fill="currentColor" />

              {/* Data modules - pattern */}
              {Array.from({ length: 8 }, (_, row) =>
                Array.from({ length: 8 }, (_, col) => {
                  const x = 56 + col * 8;
                  const y = 8 + row * 8;
                  const show = (row + col) % 3 !== 0;
                  if (!show) return null;
                  return (
                    <rect
                      key={`${row}-${col}`}
                      x={x}
                      y={y}
                      width="6"
                      height="6"
                      rx="1"
                      fill="currentColor"
                      opacity={0.8}
                    />
                  );
                })
              )}
              {Array.from({ length: 5 }, (_, row) =>
                Array.from({ length: 12 }, (_, col) => {
                  const x = 8 + col * 8 + (col > 5 ? 48 : 0);
                  const y = 56 + row * 8;
                  if (x > 48 && x < 112) {
                    const innerX = 56 + (col - 6) * 8;
                    const show = (row + col) % 2 !== 0;
                    if (!show) return null;
                    return (
                      <rect
                        key={`m-${row}-${col}`}
                        x={innerX}
                        y={y}
                        width="6"
                        height="6"
                        rx="1"
                        fill="currentColor"
                        opacity={0.8}
                      />
                    );
                  }
                  const show = (row * 3 + col) % 4 !== 0;
                  if (!show) return null;
                  return (
                    <rect
                      key={`s-${row}-${col}`}
                      x={x}
                      y={y}
                      width="6"
                      height="6"
                      rx="1"
                      fill="currentColor"
                      opacity={0.6}
                    />
                  );
                })
              )}
              {Array.from({ length: 5 }, (_, row) =>
                Array.from({ length: 6 }, (_, col) => {
                  const x = 56 + col * 8;
                  const y = 112 + row * 8;
                  const show = (row + col * 2) % 3 !== 0;
                  if (!show) return null;
                  return (
                    <rect
                      key={`b-${row}-${col}`}
                      x={x}
                      y={y}
                      width="6"
                      height="6"
                      rx="1"
                      fill="currentColor"
                      opacity={0.7}
                    />
                  );
                })
              )}
            </svg>
          </div>
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              Download the QR code and add it to print materials, posters,
              business cards, or display screens to let people scan and
              access the survey instantly.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" size="sm">
                Download PNG
              </Button>
              <Button variant="outline" size="sm">
                Download SVG
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Embed Code ─────────────────────────────────────────────────────

function EmbedSection({
  surveyId,
  url,
}: {
  surveyId: string;
  url: string;
}) {
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const iframeCode = `<iframe
  src="${url}"
  width="100%"
  height="700"
  style="border: none; border-radius: 8px;"
  title="Customer Satisfaction Survey"
></iframe>`;

  const scriptCode = `<div id="opendelphi-survey-${surveyId}"></div>
<script src="${typeof window !== "undefined" ? window.location.origin : ""}/embed.js"
  data-survey-id="${surveyId}"
  data-theme="auto"
  async>
</script>`;

  const [embedType, setEmbedType] = useState<"iframe" | "script">("iframe");
  const code = embedType === "iframe" ? iframeCode : scriptCode;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  }, [code]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-cyan-100 dark:bg-cyan-900/30 p-2">
            <Code2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <CardTitle className="text-base">Embed Code</CardTitle>
            <CardDescription>
              Embed the survey directly on your website
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Embed type toggle */}
        <div className="flex gap-1.5">
          {(
            [
              { key: "iframe", label: "iFrame" },
              { key: "script", label: "JavaScript" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setEmbedType(opt.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                embedType === opt.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Code block */}
        <div className="relative">
          <pre className="rounded-lg bg-muted/50 border p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
            {code}
          </pre>
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleCopy}
          >
            {copiedEmbed ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          {embedType === "iframe"
            ? "Paste this code into your HTML where you want the survey to appear. Adjust width and height as needed."
            : "Add this script to your page. The survey will render automatically with theme detection."}
        </p>
      </CardContent>
    </Card>
  );
}

// ── Google Sheets ──────────────────────────────────────────────────

function GoogleSheetsSection({
  surveyId,
  isGoogleUser,
  isPaidUser,
}: {
  surveyId: string;
  isGoogleUser: boolean;
  isPaidUser: boolean;
}) {
  const [mode, setMode] = useState<"own" | "managed" | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [managedSheetUrl, setManagedSheetUrl] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const canUseOwnSheet = isGoogleUser && isPaidUser;

  const handleConnectOwnSheet = useCallback(async () => {
    setConnecting(true);
    try {
      const supabase = createClient();
      await supabase.from("integrations").upsert(
        {
          survey_id: surveyId,
          type: "google_sheets",
          config: { mode: "own", sheet_url: sheetUrl },
          status: "active",
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: "survey_id,type" }
      );
      setConnected(true);
    } catch (err) {
      console.error("Failed to connect sheet:", err);
    } finally {
      setConnecting(false);
    }
  }, [surveyId, sheetUrl]);

  const handleCreateManagedSheet = useCallback(async () => {
    setCreating(true);
    try {
      const supabase = createClient();
      // Create a managed sheet record — backend would create the actual sheet
      const { data } = await supabase
        .from("integrations")
        .upsert(
          {
            survey_id: surveyId,
            type: "google_sheets",
            config: { mode: "managed" },
            status: "active",
            last_synced_at: new Date().toISOString(),
          },
          { onConflict: "survey_id,type" }
        )
        .select("config")
        .single();

      // In production the backend would return the sheet URL
      const url =
        (data?.config as Record<string, string>)?.sheet_url ??
        `https://docs.google.com/spreadsheets/d/managed-${surveyId.slice(0, 8)}`;
      setManagedSheetUrl(url);
      setConnected(true);
    } catch (err) {
      console.error("Failed to create managed sheet:", err);
    } finally {
      setCreating(false);
    }
  }, [surveyId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
            <Sheet className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">Google Sheets</CardTitle>
            <CardDescription>
              Sync survey responses to a spreadsheet automatically
            </CardDescription>
          </div>
          {connected && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Connected
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected && !mode && (
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Option 1: Use own Google Sheet (paid + Google users) */}
            <button
              onClick={() => canUseOwnSheet && setMode("own")}
              disabled={!canUseOwnSheet}
              className={cn(
                "relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all",
                canUseOwnSheet
                  ? "border-border hover:border-primary/50 hover:shadow-md cursor-pointer"
                  : "border-border opacity-60 cursor-not-allowed"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="text-sm font-semibold text-card-foreground">
                    Your Google Sheet
                  </span>
                </div>
                {!canUseOwnSheet && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                    <Crown className="h-3 w-3" />
                    Pro
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {canUseOwnSheet
                  ? "Connect your own Google Sheet. Responses sync directly to your spreadsheet."
                  : !isGoogleUser
                    ? "Sign in with Google and upgrade to Pro to use your own sheets."
                    : "Upgrade to Pro to connect your own Google Sheets."}
              </p>
            </button>

            {/* Option 2: OpenDelphi managed sheet (all users) */}
            <button
              onClick={() => setMode("managed")}
              className="flex flex-col items-start gap-2 rounded-xl border-2 border-border p-4 text-left transition-all hover:border-primary/50 hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sheet className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-card-foreground">
                  OpenDelphi Sheet
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                  Free
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                We create and manage a Google Sheet for this survey. View and download responses anytime.
              </p>
            </button>
          </div>
        )}

        {/* Own sheet form */}
        {!connected && mode === "own" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <button
                onClick={() => setMode(null)}
                className="text-primary hover:underline"
              >
                Back
              </button>
              <span>/</span>
              <span>Connect your Google Sheet</span>
            </div>
            <div className="space-y-2">
              <Label>Google Sheet URL</Label>
              <Input
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
              <p className="text-xs text-muted-foreground">
                Paste the URL of an existing Google Sheet. Make sure it&apos;s shared with edit access.
              </p>
            </div>
            <Button
              onClick={handleConnectOwnSheet}
              disabled={connecting || !sheetUrl.includes("docs.google.com/spreadsheets")}
            >
              {connecting ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Sheet className="h-4 w-4 mr-1" />
              )}
              Connect Sheet
            </Button>
          </div>
        )}

        {/* Managed sheet */}
        {!connected && mode === "managed" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <button
                onClick={() => setMode(null)}
                className="text-primary hover:underline"
              >
                Back
              </button>
              <span>/</span>
              <span>OpenDelphi managed sheet</span>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm text-card-foreground">
                We&apos;ll create a Google Sheet for this survey and automatically sync all responses.
                You can view, download, or share it anytime.
              </p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                  Auto-synced in real time
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                  One sheet per survey
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                  Download as CSV or Excel anytime
                </li>
              </ul>
            </div>
            <Button onClick={handleCreateManagedSheet} disabled={creating}>
              {creating ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Sheet className="h-4 w-4 mr-1" />
              )}
              Create Sheet
            </Button>
          </div>
        )}

        {/* Connected state */}
        {connected && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <CheckIcon className="h-5 w-5 text-emerald-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-card-foreground">
                  {mode === "own" ? "Your Google Sheet is connected" : "Managed sheet created"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Responses will be synced automatically as they come in.
                </p>
              </div>
            </div>
            {(sheetUrl || managedSheetUrl) && (
              <a
                href={sheetUrl || managedSheetUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                Open in Google Sheets
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
