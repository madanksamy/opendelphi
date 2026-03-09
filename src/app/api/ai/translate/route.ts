import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/ai/translate
 * Translate text using Google Cloud Translation API.
 * Accepts { text, targetLang, sourceLang? }.
 * Supports both single strings and arrays of strings.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { text, targetLang, sourceLang } = body as {
      text: string | string[];
      targetLang: string;
      sourceLang?: string;
    };

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: "text and targetLang are required" },
        { status: 400 }
      );
    }

    const texts = Array.isArray(text) ? text : [text];

    const params = new URLSearchParams({ key: apiKey });

    const gResponse = await fetch(
      `https://translation.googleapis.com/language/translate/v2?${params}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: texts,
          target: targetLang,
          ...(sourceLang ? { source: sourceLang } : {}),
          format: "text",
        }),
      }
    );

    if (!gResponse.ok) {
      const errText = await gResponse.text();
      console.error("[Google Translate]", gResponse.status, errText);
      return NextResponse.json(
        { error: `Translation error: ${gResponse.status}` },
        { status: 502 }
      );
    }

    const result = await gResponse.json();
    const translations = result.data?.translations ?? [];

    if (Array.isArray(text)) {
      return NextResponse.json({
        translations: translations.map(
          (t: { translatedText: string; detectedSourceLanguage?: string }) => ({
            text: t.translatedText,
            detectedLanguage: t.detectedSourceLanguage,
          })
        ),
        targetLang,
      });
    }

    return NextResponse.json({
      translation: translations[0]?.translatedText ?? "",
      detectedLanguage: translations[0]?.detectedSourceLanguage,
      targetLang,
    });
  } catch (err) {
    console.error("[Translate]", err);
    const message =
      err instanceof Error ? err.message : "Translation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
