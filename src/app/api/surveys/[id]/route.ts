import { NextRequest, NextResponse } from "next/server";
import { findSurveyById } from "@/lib/mock-data";
import { surveySchema } from "@/lib/schema/survey";
import type { Survey } from "@/lib/schema/survey";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ── GET /api/surveys/[id] ───────────────────────────────────────────
export async function GET(
  _request: NextRequest,
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

  return NextResponse.json({ data: survey });
}

// ── PUT /api/surveys/[id] ───────────────────────────────────────────
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const existing = findSurveyById(id);

  if (!existing) {
    return NextResponse.json(
      { error: "Survey not found" },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();

    // Merge with existing and validate the full survey
    const merged = {
      ...existing,
      ...body,
      id: existing.id, // prevent id override
      updatedAt: new Date().toISOString(),
      version: existing.version + 1,
    };

    const parsed = surveySchema.safeParse(merged);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    // Track publish timestamp
    const updated: Survey = {
      ...parsed.data,
      publishedAt:
        parsed.data.status === "published" && !existing.publishedAt
          ? new Date().toISOString()
          : existing.publishedAt,
    };

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// ── DELETE /api/surveys/[id] ────────────────────────────────────────
// Soft delete — sets status to "archived"
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const existing = findSurveyById(id);

  if (!existing) {
    return NextResponse.json(
      { error: "Survey not found" },
      { status: 404 }
    );
  }

  const archived: Survey = {
    ...existing,
    status: "archived",
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({
    data: archived,
    message: "Survey archived successfully",
  });
}
