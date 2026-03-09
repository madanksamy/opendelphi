"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Mic,
  MicOff,
  MessageCircle,
  Wand2,
  Copy,
  ArrowRight,
  Loader2,
  AlertCircle,
  Send,
  Bot,
  User as UserIcon,
  Square,
  Volume2,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EditableText } from "@/components/cms/EditableText";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/providers/UserProvider";

// ── Types ─────────────────────────────────────────────────────────────

interface GeneratedField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  description?: string;
  options?: Array<{ id: string; label: string; value: string }>;
  properties?: Record<string, unknown>;
  validation?: Record<string, unknown>;
}

interface GeneratedSurvey {
  title: string;
  description: string;
  fields: GeneratedField[];
  settings: {
    allowAnonymous: boolean;
    showProgressBar: boolean;
    showQuestionNumbers: boolean;
    confirmationMessage: string;
  };
  generatedAt: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ── Static data ───────────────────────────────────────────────────────

const examplePrompts = [
  "Create a patient satisfaction survey for a cardiology clinic",
  "Design a 10-question employee engagement survey",
  "Build a post-event feedback form with rating scales",
  "Generate a product-market fit survey for a B2B SaaS",
];

const chatSuggestions = [
  "How do I improve my survey response rate?",
  "What's the best way to phrase rating questions?",
  "Help me analyze NPS scores",
  "Suggest follow-up questions for low satisfaction",
];

// ── AI Chat responses (local, no API key needed) ──────────────────────

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("response rate") || lower.includes("more responses")) {
    return `Here are proven strategies to improve survey response rates:

**1. Keep it short** — Aim for 5-10 questions. Each additional question drops completion by ~5%.

**2. Optimize timing** — Send surveys within 24 hours of the experience. Tuesdays and Thursdays at 10am get the best open rates.

**3. Personalize the invitation** — Use the respondent's name and reference their specific interaction.

**4. Mobile-first design** — 60%+ of responses come from mobile. Ensure your survey renders well on small screens.

**5. Set expectations** — Tell people how long it takes ("This 2-minute survey...").

**6. Follow up** — Send one reminder 2-3 days after the initial invite. Don't send more than two.

**7. Incentivize wisely** — Small incentives (gift cards, discounts) can boost rates 10-15% without biasing results.

Would you like me to help you optimize a specific survey?`;
  }

  if (lower.includes("rating") || lower.includes("scale")) {
    return `Great question! Here are best practices for rating questions:

**Use odd-numbered scales** (5 or 7 point) to allow a neutral middle option.

**Label all points**, not just endpoints. "1 = Very Dissatisfied, 2 = Dissatisfied, 3 = Neutral, 4 = Satisfied, 5 = Very Satisfied"

**Be consistent** — Use the same scale direction throughout. Don't mix "1=best" and "1=worst".

**Avoid double-barreled questions** — "How satisfied are you with speed and quality?" should be two separate questions.

**Consider NPS for loyalty** — The 0-10 "would you recommend" scale is standardized and benchmarkable.

**For frequency**, use specific anchors: "Never, Rarely, Sometimes, Often, Always" instead of numeric scales.

Want me to generate some sample rating questions for your survey topic?`;
  }

  if (lower.includes("nps") || lower.includes("net promoter")) {
    return `**NPS (Net Promoter Score) Analysis Guide:**

**Scoring:**
- **Promoters (9-10):** Loyal enthusiasts who will fuel growth
- **Passives (7-8):** Satisfied but unenthusiastic, vulnerable to competitors
- **Detractors (0-6):** Unhappy customers who can damage your brand

**NPS = % Promoters - % Detractors** (ranges from -100 to +100)

**Benchmarks by industry:**
- SaaS: 30-40 is good, 50+ is excellent
- Healthcare: 38 average, 60+ is top tier
- Education: 50+ is good

**Key follow-up questions to add:**
1. "What is the primary reason for your score?" (open text)
2. "What could we do to improve?" (for detractors)
3. "What do you value most?" (for promoters)

**Pro tip:** Track NPS over time rather than obsessing over a single score. Trend matters more than absolute number.

Should I help you set up an NPS survey with proper follow-up logic?`;
  }

  if (lower.includes("follow-up") || lower.includes("low satisfaction") || lower.includes("negative")) {
    return `For low satisfaction or negative feedback, here are effective follow-up strategies:

**Immediate follow-up questions (in-survey):**
1. "We're sorry to hear that. What specifically disappointed you?" (open text)
2. "Which area needs the most improvement?" (multi-select: Quality, Communication, Speed, Price, Support)
3. "Would you like someone to reach out to discuss your experience?" (yes/no)

**Post-survey actions:**
- **Auto-alert** your team when scores drop below threshold
- **Segment responses** by score range for targeted outreach
- **Close the loop** — contact detractors within 48 hours

**Question phrasing tips for sensitive topics:**
- Start with "Help us understand..." instead of "Why were you..."
- Use "What could we improve?" rather than "What went wrong?"
- Always offer a "Prefer not to answer" option

Want me to generate a recovery survey template for dissatisfied customers?`;
  }

  if (lower.includes("generate") || lower.includes("create") || lower.includes("build") || lower.includes("make")) {
    return `I'd love to help you create a survey! Here's what I need:

1. **Topic/Purpose** — What are you trying to learn? (e.g., customer satisfaction, employee feedback, event evaluation)
2. **Audience** — Who will take this survey? (e.g., patients, employees, students, customers)
3. **Length** — How many questions? (I recommend 5-10 for best completion rates)
4. **Key metrics** — What specific things do you want to measure?

**Quick start:** Head to the **"Generate with AI"** tab and describe your survey in one sentence. I'll create a complete questionnaire with the right mix of question types.

Or tell me more details here and I'll suggest the perfect structure!`;
  }

  if (lower.includes("question type") || lower.includes("what type")) {
    return `Here's a guide to choosing the right question types:

| Type | Best For | Example |
|------|----------|---------|
| **Rating (1-5 stars)** | Quick satisfaction | "Rate your experience" |
| **NPS (0-10)** | Loyalty measurement | "How likely to recommend?" |
| **Scale (Likert)** | Agreement/frequency | "I feel valued at work" |
| **Multiple choice** | Categorization | "How did you find us?" |
| **Multi-select** | Multiple answers | "Which features do you use?" |
| **Open text** | Qualitative insights | "What could we improve?" |
| **Ranking** | Prioritization | "Rank features by importance" |
| **Matrix** | Multi-item evaluation | "Rate each department" |

**Rule of thumb:** Start with quantitative (rating/scale), end with qualitative (open text). Mix 70% closed / 30% open questions.

Need help choosing question types for your specific survey?`;
  }

  if (lower.includes("best practice") || lower.includes("tip") || lower.includes("advice")) {
    return `**Survey Design Best Practices:**

**Structure:**
- Start with easy, engaging questions
- Group related questions together
- Put sensitive/demographic questions at the end
- End with an open-ended "anything else?" question

**Writing:**
- Use simple, clear language (8th grade reading level)
- One concept per question — no double-barreled questions
- Avoid leading or loaded questions
- Provide balanced response options

**Design:**
- Show a progress bar for surveys > 5 questions
- Use conditional logic to skip irrelevant questions
- Test on mobile before sending
- Include a clear "Thank you" page with next steps

**Distribution:**
- Personalize the invitation email
- Send at optimal times (Tue-Thu, 10am)
- Keep reminder emails brief and friendly
- Set a clear deadline

Would you like me to review a specific survey you're working on?`;
  }

  // Default response
  return `That's a great question! Here are some thoughts:

I can help you with:
- **Survey design** — Question types, structure, and best practices
- **Analysis guidance** — How to interpret NPS, satisfaction scores, and open-ended responses
- **Response optimization** — Tips to boost completion rates
- **Survey generation** — Describe what you need and I'll create it

For quick survey creation, try the **"Generate with AI"** tab — just describe your topic and I'll build a complete survey.

What specific aspect of survey design would you like to explore?`;
}

// ── Component ─────────────────────────────────────────────────────────

export default function AiStudioPage() {
  const router = useRouter();
  const { user, orgId } = useUser();
  const supabase = useMemo(() => createClient(), []);

  const [activeTab, setActiveTab] = useState("generate");

  // ── Generate state ──────────────────────────────────────────────────
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [generating, setGenerating] = useState(false);
  const [generatedSurvey, setGeneratedSurvey] = useState<GeneratedSurvey | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [creatingSurvey, setCreatingSurvey] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Voice state ─────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── Chat state ──────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI survey assistant. I can help you design better surveys, analyze responses, and improve completion rates. What would you like to work on?",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Generate handlers ───────────────────────────────────────────────

  async function handleGenerate(inputPrompt?: string) {
    const text = inputPrompt || prompt;
    if (!text.trim()) return;
    setGenerating(true);
    setGenerateError(null);
    setGeneratedSurvey(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: text, model: selectedModel }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Generation failed (${res.status})`);
      }

      const json = await res.json();
      // API returns { data: GeneratedSurvey }
      const data: GeneratedSurvey = json.data ?? json;
      setGeneratedSurvey(data);
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleCreateSurvey() {
    if (!generatedSurvey || !user || !orgId) return;
    setCreatingSurvey(true);

    try {
      const slug = `${generatedSurvey.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-+$/, "")}-${Date.now().toString(36)}`;

      const { data, error } = await supabase
        .from("surveys")
        .insert({
          org_id: orgId,
          created_by: user.id,
          title: generatedSurvey.title,
          description: generatedSurvey.description,
          slug,
          type: "standard",
          status: "draft",
          schema: { fields: generatedSurvey.fields },
          settings: generatedSurvey.settings,
          theme: {},
          multi_step: false,
          version: 1,
        })
        .select("id")
        .single();

      if (error) throw error;
      router.push(`/surveys/${data.id}/edit`);
    } catch (err) {
      console.error("Failed to create survey:", err);
      setCreatingSurvey(false);
    }
  }

  function handleCopy() {
    if (!generatedSurvey) return;
    navigator.clipboard.writeText(JSON.stringify(generatedSurvey, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Voice handlers ──────────────────────────────────────────────────

  const stopAudioVisualization = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  const startAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      function tick() {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(avg / 255);
        animFrameRef.current = requestAnimationFrame(tick);
      }
      tick();
    } catch {
      // Microphone access denied — visualization won't work but recording still may
    }
  }, []);

  const startRecording = useCallback(() => {
    setVoiceError(null);
    setTranscript("");
    setRecordingTime(0);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        "Speech recognition is not supported in this browser. Try Chrome or Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        setVoiceError("Microphone access denied. Please allow microphone access and try again.");
      } else if (event.error !== "aborted") {
        setVoiceError(`Recognition error: ${event.error}`);
      }
      setIsRecording(false);
      stopAudioVisualization();
      if (timerRef.current) clearInterval(timerRef.current);
    };

    recognition.onend = () => {
      setIsRecording(false);
      stopAudioVisualization();
      if (timerRef.current) clearInterval(timerRef.current);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    // Start audio visualization
    startAudioVisualization();
  }, [startAudioVisualization, stopAudioVisualization]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    stopAudioVisualization();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [stopAudioVisualization]);

  const handleVoiceGenerate = useCallback(() => {
    if (!transcript.trim()) return;
    setPrompt(transcript.trim());
    setActiveTab("generate");
    // Auto-generate after tab switch
    setTimeout(() => handleGenerate(transcript.trim()), 100);
  }, [transcript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      stopAudioVisualization();
    };
  }, [stopAudioVisualization]);

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // ── Chat handlers ───────────────────────────────────────────────────

  const handleSendChat = useCallback(
    async (text?: string) => {
      const message = text || chatInput.trim();
      if (!message) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, userMsg]);
      setChatInput("");
      setChatLoading(true);

      // Simulate slight delay for natural feel
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

      const response = getAIResponse(message);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
      setChatLoading(false);
    },
    [chatInput]
  );

  const clearChat = useCallback(() => {
    setChatMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi! I'm your AI survey assistant. I can help you design better surveys, analyze responses, and improve completion rates. What would you like to work on?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <EditableText
            id="ai-studio-heading"
            defaultContent="AI Studio"
            as="h1"
            className="text-2xl font-bold text-foreground"
          />
          <Badge className="gap-1">
            <Sparkles className="h-3 w-3" />
            Beta
          </Badge>
        </div>
        <EditableText
          id="ai-studio-subheading"
          defaultContent="Generate surveys, use voice input, and get AI-powered support."
          as="p"
          className="mt-1 text-sm text-muted-foreground"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="gap-2">
            <Wand2 className="h-4 w-4" />
            Generate with AI
          </TabsTrigger>
          <TabsTrigger value="voice" className="gap-2">
            <Mic className="h-4 w-4" />
            Voice Builder
          </TabsTrigger>
          <TabsTrigger value="support" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            AI Chat
          </TabsTrigger>
        </TabsList>

        {/* ── Generate Tab ─────────────────────────────────────────── */}
        <TabsContent value="generate" className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-card-foreground">
                  Describe your survey
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the survey you want to create..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-input bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleGenerate();
                    }
                  }}
                />
              </div>

              {/* Example Prompts */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Try an example:
                </p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example) => (
                    <button
                      key={example}
                      onClick={() => setPrompt(example)}
                      className="rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model + Generate */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Model:</span>
                  <div className="flex rounded-lg border border-border">
                    {["gpt-4o", "claude", "gemini"].map((model) => (
                      <button
                        key={model}
                        onClick={() => setSelectedModel(model)}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                          selectedModel === model
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {model === "gpt-4o"
                          ? "GPT-4o"
                          : model === "claude"
                            ? "Claude"
                            : "Gemini"}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleGenerate()}
                  disabled={generating || !prompt.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Survey
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {generateError && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
              <p className="text-sm text-red-700 dark:text-red-400">
                {generateError}
              </p>
            </div>
          )}

          {/* Generated Preview */}
          {generatedSurvey && (
            <div className="rounded-2xl border border-primary/20 bg-card">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-card-foreground">
                      Generated Survey
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {generatedSurvey.fields.length} question
                      {generatedSurvey.fields.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCopy}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                  title="Copy JSON"
                >
                  {copied ? (
                    <span className="text-xs text-emerald-600">Copied!</span>
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="p-6">
                <h4 className="mb-1 text-base font-semibold text-card-foreground">
                  {generatedSurvey.title}
                </h4>
                {generatedSurvey.description && (
                  <p className="mb-4 text-sm text-muted-foreground">
                    {generatedSurvey.description}
                  </p>
                )}
                <div className="space-y-4">
                  {generatedSurvey.fields.map((field, i) => (
                    <div
                      key={field.id}
                      className="rounded-xl border border-border p-4"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {i + 1}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {field.type}
                        </Badge>
                        {field.required && (
                          <Badge variant="secondary" className="text-[10px]">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-card-foreground">
                        {field.label}
                      </p>
                      {field.options && (
                        <div className="mt-2 space-y-1">
                          {field.options.map((opt) => (
                            <div
                              key={opt.id}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                              <span className="h-3 w-3 rounded-full border border-border" />
                              {opt.label}
                            </div>
                          ))}
                        </div>
                      )}
                      {field.properties &&
                        "maxRating" in field.properties && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Scale: 1-{String(field.properties.maxRating)} stars
                          </p>
                        )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleCreateSurvey}
                    disabled={creatingSurvey || !user || !orgId}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {creatingSurvey ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Survey
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Voice Builder Tab ─────────────────────────────────────── */}
        <TabsContent value="voice" className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="flex flex-col items-center text-center">
              {/* Microphone visualization */}
              <div className="relative mb-6">
                {/* Pulsing rings when recording */}
                {isRecording && (
                  <>
                    <div
                      className="absolute inset-0 rounded-full bg-primary/20 animate-ping"
                      style={{
                        transform: `scale(${1 + audioLevel * 0.5})`,
                        animationDuration: "1.5s",
                      }}
                    />
                    <div
                      className="absolute -inset-3 rounded-full border-2 border-primary/30 transition-transform duration-100"
                      style={{
                        transform: `scale(${1 + audioLevel * 0.3})`,
                      }}
                    />
                    <div
                      className="absolute -inset-6 rounded-full border border-primary/15 transition-transform duration-100"
                      style={{
                        transform: `scale(${1 + audioLevel * 0.2})`,
                      }}
                    />
                  </>
                )}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing}
                  className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full transition-all ${
                    isRecording
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600"
                      : "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
                  } disabled:opacity-50`}
                >
                  {isRecording ? (
                    <Square className="h-8 w-8" />
                  ) : isTranscribing ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </button>
              </div>

              <h3 className="text-lg font-semibold text-card-foreground">
                {isRecording
                  ? "Listening..."
                  : isTranscribing
                    ? "Processing..."
                    : "Voice Survey Builder"}
              </h3>

              {isRecording && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-mono text-muted-foreground">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              )}

              {!isRecording && !transcript && (
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Click the microphone and describe the survey you want to
                  build. Speak naturally — mention the topic, audience, and
                  types of questions you need.
                </p>
              )}

              {voiceError && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                  <MicOff className="h-4 w-4 shrink-0" />
                  {voiceError}
                </div>
              )}
            </div>

            {/* Transcript display */}
            {transcript && (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-card-foreground">
                        Transcript
                      </span>
                    </div>
                    {isRecording && (
                      <span className="text-xs text-muted-foreground animate-pulse">
                        listening...
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-card-foreground leading-relaxed">
                    {transcript}
                  </p>
                </div>

                {!isRecording && (
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTranscript("");
                        setRecordingTime(0);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                    <Button onClick={handleVoiceGenerate}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Survey from Voice
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Tips */}
            {!isRecording && !transcript && (
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    title: "Describe the topic",
                    example: '"I need a patient satisfaction survey for our dental clinic"',
                  },
                  {
                    title: "Mention the audience",
                    example: '"It\'s for employees in the marketing department"',
                  },
                  {
                    title: "Specify question types",
                    example: '"Include rating scales, multiple choice, and one open-ended"',
                  },
                ].map((tip) => (
                  <div
                    key={tip.title}
                    className="rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <p className="text-xs font-medium text-card-foreground">
                      {tip.title}
                    </p>
                    <p className="mt-1 text-xs italic text-muted-foreground">
                      {tip.example}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── AI Chat Tab ──────────────────────────────────────────── */}
        <TabsContent value="support" className="space-y-0">
          <div className="flex h-[600px] flex-col rounded-2xl border border-border bg-card">
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Survey Assistant
                  </p>
                  <p className="text-xs text-emerald-600">Online</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-muted-foreground"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Clear
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      msg.role === "assistant"
                        ? "bg-primary/10"
                        : "bg-muted"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-card-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_strong]:text-card-foreground [&_table]:text-xs"
                        dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            .replace(/\n\n/g, "</p><p>")
                            .replace(/\n- /g, "</p><li>")
                            .replace(/\n\d+\. /g, "</p><li>")
                            .replace(
                              /\|(.+)\|/g,
                              (match) => `<code>${match}</code>`
                            )
                            .replace(/^/, "<p>")
                            .replace(/$/, "</p>"),
                        }}
                      />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="rounded-2xl bg-muted/50 px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Suggestions */}
            {chatMessages.length <= 1 && (
              <div className="border-t border-border px-4 py-3">
                <p className="mb-2 text-xs text-muted-foreground">
                  Suggested questions:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {chatSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSendChat(suggestion)}
                      className="rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border p-3">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  placeholder="Ask about survey design, analysis, or best practices..."
                  className="flex-1 rounded-xl border border-input bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  disabled={chatLoading}
                />
                <Button
                  onClick={() => handleSendChat()}
                  disabled={chatLoading || !chatInput.trim()}
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-xl"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
