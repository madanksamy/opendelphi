import { NextRequest, NextResponse } from "next/server";
import {
  chatCompletion,
  getAvailableProvider,
  type AIProvider,
} from "@/lib/ai/providers";
import { SURVEY_GENERATOR_SYSTEM } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, description, fieldCount, model } = body;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "topic is required and must be a string" },
        { status: 400 }
      );
    }

    // Map frontend model names to provider keys
    const providerMap: Record<string, AIProvider> = {
      claude: "claude",
      "gpt-4o": "gpt",
      gpt: "gpt",
      kimi: "kimi",
      glm: "glm",
      gemini: "gpt", // fallback
    };

    const requestedProvider = providerMap[model] ?? "claude";
    const provider = getAvailableProvider(requestedProvider);

    const userPrompt = [
      `Create a survey about: ${topic}`,
      description ? `Additional details: ${description}` : "",
      fieldCount ? `Number of questions: ${fieldCount}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const result = await chatCompletion({
      provider,
      messages: [
        { role: "system", content: SURVEY_GENERATOR_SYSTEM },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 4096,
      temperature: 0.7,
      jsonMode: provider !== "claude", // Claude doesn't support json_mode directly
    });

    // Parse the JSON from the response
    let surveyData;
    try {
      // Extract JSON from potential markdown code blocks
      let jsonStr = result.content;
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      surveyData = JSON.parse(jsonStr.trim());
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response as valid survey JSON" },
        { status: 500 }
      );
    }

    // Ensure required fields exist
    if (!surveyData.title || !surveyData.fields) {
      return NextResponse.json(
        { error: "AI response missing required fields (title, fields)" },
        { status: 500 }
      );
    }

    surveyData.generatedAt = new Date().toISOString();
    surveyData.generatedBy = {
      provider: result.provider,
      model: result.model,
    };

    return NextResponse.json({ data: surveyData }, { status: 201 });
  } catch (err) {
    console.error("[AI Generate]", err);
    const message =
      err instanceof Error ? err.message : "Failed to generate survey";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
