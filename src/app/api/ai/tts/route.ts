import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/ai/tts
 * Text-to-speech via ElevenLabs.
 * Accepts { text, voice?, language? } and returns audio/mpeg stream.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { text, voice, language } = body as {
      text: string;
      voice?: string;
      language?: string;
    };

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }

    // ElevenLabs voice IDs — defaults to Rachel (neutral, professional)
    const voiceMap: Record<string, string> = {
      rachel: "21m00Tcm4TlvDq8ikWAM",
      adam: "pNInz6obpgDQGcFmaJgB",
      sam: "yoZ06aMxZJJ28mfd3POQ",
      bella: "EXAVITQu4vr4xnSDxMaL",
      elli: "MF3mGyEYCl7XYWbV9V6O",
      josh: "TxGEqnHWrfWFTfGW9XjX",
    };

    const voiceId = voiceMap[voice ?? "rachel"] ?? voiceMap.rachel;

    // Multilingual v2 model supports 29 languages
    const modelId = language && language !== "en"
      ? "eleven_multilingual_v2"
      : "eleven_monolingual_v1";

    const elResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!elResponse.ok) {
      const errText = await elResponse.text();
      console.error("[ElevenLabs]", elResponse.status, errText);
      return NextResponse.json(
        { error: `ElevenLabs error: ${elResponse.status}` },
        { status: 502 }
      );
    }

    // Stream audio back
    const audioBuffer = await elResponse.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
      },
    });
  } catch (err) {
    console.error("[TTS]", err);
    const message =
      err instanceof Error ? err.message : "Text-to-speech failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
