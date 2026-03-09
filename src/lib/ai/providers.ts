/**
 * Unified AI provider abstraction.
 * Supports: Claude Sonnet 4.6, GPT 5.3 (fallback GPT-4o), Kimi 2.5, GLM 5.
 * All providers use the OpenAI-compatible chat completions format where possible.
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

// ── Provider types ──────────────────────────────────────────────────

export type AIProvider = "claude" | "gpt" | "kimi" | "glm";

export interface AIModelConfig {
  provider: AIProvider;
  modelId: string;
  displayName: string;
  available: boolean;
}

export const AI_MODELS: Record<AIProvider, AIModelConfig> = {
  claude: {
    provider: "claude",
    modelId: "claude-sonnet-4-6-20250514",
    displayName: "Claude Sonnet 4.6",
    available: !!process.env.ANTHROPIC_API_KEY,
  },
  gpt: {
    provider: "gpt",
    modelId: "gpt-4o",  // Will upgrade to gpt-5.3 when available
    displayName: "GPT-4o",
    available: !!process.env.OPENAI_API_KEY,
  },
  kimi: {
    provider: "kimi",
    modelId: "moonshot-v1-128k",  // Will upgrade to kimi-2.5 when available
    displayName: "Kimi 2.5",
    available: !!process.env.KIMI_API_KEY,
  },
  glm: {
    provider: "glm",
    modelId: "glm-4-flash",  // Will upgrade to glm-5 when available
    displayName: "GLM 5",
    available: !!process.env.GLM_API_KEY,
  },
};

// ── Client singletons ───────────────────────────────────────────────

let anthropicClient: Anthropic | null = null;
let openaiClient: OpenAI | null = null;
let kimiClient: OpenAI | null = null;
let glmClient: OpenAI | null = null;

function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return anthropicClient;
}

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return openaiClient;
}

function getKimi(): OpenAI {
  if (!kimiClient) {
    kimiClient = new OpenAI({
      apiKey: process.env.KIMI_API_KEY!,
      baseURL: "https://api.moonshot.cn/v1",
    });
  }
  return kimiClient;
}

function getGLM(): OpenAI {
  if (!glmClient) {
    glmClient = new OpenAI({
      apiKey: process.env.GLM_API_KEY!,
      baseURL: "https://open.bigmodel.cn/api/paas/v4",
    });
  }
  return glmClient;
}

// ── Unified chat completion ─────────────────────────────────────────

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionOptions {
  provider: AIProvider;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}

export interface CompletionResult {
  content: string;
  provider: AIProvider;
  model: string;
  tokensUsed?: number;
}

/**
 * Get the first available provider, preferring the requested one.
 */
export function getAvailableProvider(preferred: AIProvider): AIProvider {
  if (AI_MODELS[preferred].available) return preferred;
  // Fallback order: claude > gpt > kimi > glm
  const fallbackOrder: AIProvider[] = ["claude", "gpt", "kimi", "glm"];
  for (const p of fallbackOrder) {
    if (AI_MODELS[p].available) return p;
  }
  throw new Error("No AI provider is configured. Add API keys to .env.local.");
}

export async function chatCompletion(
  opts: CompletionOptions
): Promise<CompletionResult> {
  const provider = getAvailableProvider(opts.provider);
  const model = AI_MODELS[provider];
  const maxTokens = opts.maxTokens ?? 4096;
  const temperature = opts.temperature ?? 0.7;

  if (provider === "claude") {
    const client = getAnthropic();
    const systemMsg = opts.messages.find((m) => m.role === "system");
    const userMessages = opts.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const response = await client.messages.create({
      model: model.modelId,
      max_tokens: maxTokens,
      temperature,
      system: systemMsg?.content,
      messages: userMessages,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    return {
      content: textBlock?.text ?? "",
      provider,
      model: model.modelId,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  }

  // OpenAI-compatible providers (GPT, Kimi, GLM)
  const client =
    provider === "gpt"
      ? getOpenAI()
      : provider === "kimi"
        ? getKimi()
        : getGLM();

  const response = await client.chat.completions.create({
    model: model.modelId,
    messages: opts.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    max_tokens: maxTokens,
    temperature,
    ...(opts.jsonMode ? { response_format: { type: "json_object" as const } } : {}),
  });

  return {
    content: response.choices[0]?.message?.content ?? "",
    provider,
    model: model.modelId,
    tokensUsed: response.usage?.total_tokens,
  };
}
