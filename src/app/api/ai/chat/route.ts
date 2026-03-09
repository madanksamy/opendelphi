import { NextRequest, NextResponse } from "next/server";
import {
  chatCompletion,
  getAvailableProvider,
  type AIProvider,
  type ChatMessage,
} from "@/lib/ai/providers";
import { SURVEY_CHAT_SYSTEM } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, model } = body as {
      messages: { role: string; content: string }[];
      model?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const providerMap: Record<string, AIProvider> = {
      claude: "claude",
      gpt: "gpt",
      kimi: "kimi",
      glm: "glm",
    };

    const provider = getAvailableProvider(providerMap[model ?? "claude"] ?? "claude");

    const chatMessages: ChatMessage[] = [
      { role: "system", content: SURVEY_CHAT_SYSTEM },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const result = await chatCompletion({
      provider,
      messages: chatMessages,
      maxTokens: 2048,
      temperature: 0.7,
    });

    return NextResponse.json({
      content: result.content,
      provider: result.provider,
      model: result.model,
    });
  } catch (err) {
    console.error("[AI Chat]", err);
    const message =
      err instanceof Error ? err.message : "Chat request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
