import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/ai/transcribe
 * Accepts audio blob, sends to Deepgram for transcription.
 * Supports multiple languages with auto-detection.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Deepgram API key not configured" },
        { status: 500 }
      );
    }

    const contentType = request.headers.get("content-type") ?? "";
    let audioBuffer: Buffer;
    let language = "en";
    let mimeType = "audio/webm";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("audio") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "No audio file provided" },
          { status: 400 }
        );
      }
      audioBuffer = Buffer.from(await file.arrayBuffer());
      language = (formData.get("language") as string) ?? "en";
      mimeType = file.type || "audio/webm";
    } else {
      audioBuffer = Buffer.from(await request.arrayBuffer());
      language =
        request.headers.get("x-language") ??
        new URL(request.url).searchParams.get("language") ??
        "en";
    }

    // Deepgram API call
    const dgParams = new URLSearchParams({
      model: "nova-2",
      smart_format: "true",
      punctuate: "true",
      diarize: "false",
      language: language === "auto" ? "" : language,
      ...(language === "auto" ? { detect_language: "true" } : {}),
    });

    const dgResponse = await fetch(
      `https://api.deepgram.com/v1/listen?${dgParams}`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": mimeType,
        },
        body: new Uint8Array(audioBuffer),
      }
    );

    if (!dgResponse.ok) {
      const errText = await dgResponse.text();
      console.error("[Deepgram]", dgResponse.status, errText);
      return NextResponse.json(
        { error: `Deepgram error: ${dgResponse.status}` },
        { status: 502 }
      );
    }

    const dgResult = await dgResponse.json();
    const channel = dgResult.results?.channels?.[0];
    const transcript =
      channel?.alternatives?.[0]?.transcript ?? "";
    const detectedLanguage =
      channel?.detected_language ?? language;
    const confidence =
      channel?.alternatives?.[0]?.confidence ?? 0;

    return NextResponse.json({
      transcript,
      language: detectedLanguage,
      confidence,
      duration: dgResult.metadata?.duration ?? 0,
    });
  } catch (err) {
    console.error("[Transcribe]", err);
    const message =
      err instanceof Error ? err.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
