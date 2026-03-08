"use client";

import { useState } from "react";
import {
  Sparkles,
  Mic,
  MicOff,
  MessageCircle,
  Send,
  Wand2,
  ChevronRight,
  Bot,
  User,
  Copy,
  ArrowRight,
  Play,
  Square,
  Volume2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const examplePrompts = [
  "Create a patient satisfaction survey for a cardiology clinic",
  "Design a 10-question employee engagement survey",
  "Build a post-event feedback form with rating scales",
  "Generate a product-market fit survey for a B2B SaaS",
];

const mockGeneratedSurvey = {
  title: "Patient Satisfaction Survey — Cardiology Clinic",
  questions: [
    {
      type: "Rating",
      text: "How would you rate your overall experience at our cardiology clinic?",
      scale: "1-5 stars",
    },
    {
      type: "Multiple Choice",
      text: "How long did you wait before being seen by a healthcare provider?",
      options: [
        "Less than 15 minutes",
        "15-30 minutes",
        "30-60 minutes",
        "More than 1 hour",
      ],
    },
    {
      type: "Rating",
      text: "How well did your cardiologist explain your diagnosis and treatment options?",
      scale: "1-5 stars",
    },
    {
      type: "Multiple Choice",
      text: "Did the staff treat you with courtesy and respect?",
      options: ["Always", "Usually", "Sometimes", "Rarely", "Never"],
    },
    {
      type: "Open Text",
      text: "What could we do to improve your experience at our clinic?",
    },
  ],
};

const mockTranscript = [
  {
    speaker: "user",
    text: "I need a quick survey for our quarterly team retrospective.",
  },
  {
    speaker: "ai",
    text: "Got it! I will create a team retrospective survey. Let me ask a few questions. How many team members will be taking this survey?",
  },
  {
    speaker: "user",
    text: "About 12 people. I want to know what went well, what didn't, and suggestions for next quarter.",
  },
  {
    speaker: "ai",
    text: "Perfect. I have generated a 6-question retrospective survey with rating scales and open-ended questions. It covers wins, challenges, team collaboration, and forward-looking suggestions.",
  },
];

const mockChatMessages = [
  {
    role: "user" as const,
    content: "Hi, I have a question about our billing. We were charged $79 but we're on the Pro plan at $29/month.",
    time: "2:34 PM",
  },
  {
    role: "ai" as const,
    content:
      "I can help you with that! Let me look into your billing history. I see that on March 1st, your account was upgraded from Pro ($29/mo) to Business ($79/mo). This was initiated by your team admin Marcus Chen. Would you like me to help you revert to the Pro plan, or would you like more details about what changed?",
    time: "2:34 PM",
  },
  {
    role: "user" as const,
    content: "Oh I see, Marcus must have upgraded it. Can you show me what extra features we get with Business?",
    time: "2:35 PM",
  },
  {
    role: "ai" as const,
    content:
      "Of course! Here is what the Business plan ($79/mo) adds over Pro ($29/mo):\n\n- Unlimited surveys (vs 25)\n- 25,000 responses/month (vs 5,000)\n- 25 team members (vs 5)\n- SSO / SAML authentication\n- API access for custom integrations\n- Priority support with Slack channel\n\nGiven your team of 8 members and growing survey volume, the Business plan gives you room to scale. Would you like to keep it, or shall I help downgrade back to Pro?",
    time: "2:35 PM",
  },
];

const quickActions = [
  "How do I export survey data?",
  "Help me create a Delphi study",
  "What integrations are available?",
  "Show my usage this month",
];

export default function AiStudioPage() {
  const [activeTab, setActiveTab] = useState("generate");
  const [prompt, setPrompt] = useState("");
  const [showGenerated, setShowGenerated] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">AI Studio</h1>
          <Badge className="gap-1">
            <Sparkles className="h-3 w-3" />
            Beta
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate surveys, use voice input, and get AI-powered support.
        </p>
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
            Voice Mode
          </TabsTrigger>
          <TabsTrigger value="support" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            AI Support
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6">
          {/* Input Section */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-card-foreground">
                  Describe your survey
                </label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the survey you want to create..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-input bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
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
                  onClick={() => setShowGenerated(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Survey
                </button>
              </div>
            </div>
          </div>

          {/* Generated Preview */}
          {showGenerated && (
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
                      {mockGeneratedSurvey.questions.length} questions
                      &middot; Estimated 3 min to complete
                    </p>
                  </div>
                </div>
                <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="p-6">
                <h4 className="mb-4 text-base font-semibold text-card-foreground">
                  {mockGeneratedSurvey.title}
                </h4>
                <div className="space-y-4">
                  {mockGeneratedSurvey.questions.map((q, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border p-4"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {i + 1}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {q.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-card-foreground">{q.text}</p>
                      {q.options && (
                        <div className="mt-2 space-y-1">
                          {q.options.map((opt) => (
                            <div
                              key={opt}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                              <span className="h-3 w-3 rounded-full border border-border" />
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                      {q.scale && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Scale: {q.scale}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
                    Use This Survey
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Voice Mode Tab */}
        <TabsContent value="voice" className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="flex flex-col items-center">
              {/* Microphone Button */}
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />
                )}
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full transition-all ${
                    isRecording
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                      : "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
                  }`}
                >
                  {isRecording ? (
                    <Square className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </button>
              </div>
              <p className="mt-4 text-sm font-medium text-card-foreground">
                {isRecording
                  ? "Listening... tap to stop"
                  : "Tap to start recording"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Describe your survey using your voice
              </p>

              {/* Waveform Visualization */}
              {isRecording && (
                <div className="mt-6 flex h-16 w-full max-w-md items-center justify-center gap-1">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full bg-primary"
                      style={{
                        height: `${Math.random() * 100}%`,
                        animation: `pulse 0.5s ease-in-out ${i * 0.05}s infinite alternate`,
                        minHeight: "4px",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Transcript */}
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <div className="rounded-xl bg-primary/10 p-2">
                <Volume2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-card-foreground">
                  Transcript
                </h3>
                <p className="text-xs text-muted-foreground">
                  Voice conversation history
                </p>
              </div>
            </div>
            <div className="space-y-4 p-6">
              {mockTranscript.map((entry, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${entry.speaker === "ai" ? "" : "justify-end"}`}
                >
                  {entry.speaker === "ai" && (
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      entry.speaker === "ai"
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {entry.text}
                  </div>
                  {entry.speaker === "user" && (
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="bg-violet-500 text-[10px] font-bold text-white">
                        JC
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-border p-4">
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
                <Sparkles className="h-4 w-4" />
                Convert to Survey
              </button>
            </div>
          </div>

          <style jsx>{`
            @keyframes pulse {
              0% {
                transform: scaleY(0.3);
              }
              100% {
                transform: scaleY(1);
              }
            }
          `}</style>
        </TabsContent>

        {/* AI Support Tab */}
        <TabsContent value="support" className="space-y-0">
          <div className="flex h-[600px] flex-col rounded-2xl border border-border bg-card">
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                  AI
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-sm font-semibold text-card-foreground">
                  OpenDelphi Assistant
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {mockChatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                  >
                    {msg.role === "ai" && (
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                          AI
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="max-w-[75%]">
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm ${
                          msg.role === "ai"
                            ? "bg-muted text-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.content}</p>
                      </div>
                      <p
                        className={`mt-1 text-[10px] text-muted-foreground ${msg.role === "user" ? "text-right" : ""}`}
                      >
                        {msg.time}
                      </p>
                    </div>
                    {msg.role === "user" && (
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="bg-violet-500 text-[10px] font-bold text-white">
                          JC
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-border px-6 py-3">
              <div className="flex gap-2 overflow-x-auto">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => setChatInput(action)}
                    className="shrink-0 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-border p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask anything about OpenDelphi..."
                  className="flex-1 rounded-xl border border-input bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setChatInput("");
                    }
                  }}
                />
                <button
                  onClick={() => setChatInput("")}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
