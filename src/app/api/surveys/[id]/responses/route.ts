import { NextRequest, NextResponse } from "next/server";
import { findSurveyById, generateMockResponses } from "@/lib/mock-data";
import { responseSchema } from "@/lib/schema/survey";
import type { SurveyResponse } from "@/lib/schema/survey";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ── GET /api/surveys/[id]/responses ─────────────────────────────────
// Query params: page, limit, status
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const survey = findSurveyById(id);

  if (!survey) {
    return NextResponse.json(
      { error: "Survey not found" },
      { status: 404 }
    );
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const statusFilter = searchParams.get("status") as SurveyResponse["status"] | null;

  // Generate deterministic mock responses (seeded by survey index)
  const seedBase = parseInt(survey.id.replace(/[^0-9a-f]/g, "").slice(0, 8), 16) || 42;
  let responses = generateMockResponses(survey, 50, seedBase);

  if (statusFilter) {
    responses = responses.filter((r) => r.status === statusFilter);
  }

  const total = responses.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const data = responses.slice(offset, offset + limit);

  // Compute basic stats
  const completed = responses.filter((r) => r.status === "completed").length;
  const avgDuration =
    responses.reduce((sum, r) => sum + (r.metadata?.duration ?? 0), 0) /
    (responses.length || 1);

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    stats: {
      totalResponses: total,
      completed,
      inProgress: total - completed,
      averageDuration: Math.round(avgDuration),
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    },
  });
}

// ── POST /api/surveys/[id]/responses ────────────────────────────────
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const survey = findSurveyById(id);

  if (!survey) {
    return NextResponse.json(
      { error: "Survey not found" },
      { status: 404 }
    );
  }

  if (survey.status !== "published") {
    return NextResponse.json(
      { error: "Survey is not accepting responses", surveyStatus: survey.status },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    const now = new Date().toISOString();
    const responseData = {
      id: crypto.randomUUID(),
      surveyId: id,
      respondentId: body.respondentId,
      answers: body.answers ?? {},
      metadata: {
        userAgent: request.headers.get("user-agent") ?? undefined,
        startedAt: body.metadata?.startedAt ?? now,
        completedAt: now,
        duration: body.metadata?.duration,
      },
      status: body.status ?? "completed",
      createdAt: now,
      updatedAt: now,
    };

    const parsed = responseSchema.safeParse(responseData);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    // Validate that all required fields have answers
    const requiredFields = survey.schema.filter((f) => f.required);
    const missingFields = requiredFields.filter(
      (f) =>
        f.type !== "statement" &&
        f.type !== "section_break" &&
        (parsed.data.answers[f.id] === undefined || parsed.data.answers[f.id] === null || parsed.data.answers[f.id] === "")
    );

    if (missingFields.length > 0 && parsed.data.status === "completed") {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields: missingFields.map((f) => ({
            id: f.id,
            label: f.label,
          })),
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ data: parsed.data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
