import { NextRequest, NextResponse } from "next/server";
import { MOCK_SURVEYS } from "@/lib/mock-data";
import { createSurveySchema } from "@/lib/schema/survey";
import type { Survey } from "@/lib/schema/survey";

// ── GET /api/surveys ────────────────────────────────────────────────
// Query params: page, limit, status, type, search
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
  const statusFilter = searchParams.get("status") as Survey["status"] | null;
  const typeFilter = searchParams.get("type") as Survey["type"] | null;
  const search = searchParams.get("search")?.toLowerCase();

  let filtered = [...MOCK_SURVEYS];

  if (statusFilter) {
    filtered = filtered.filter((s) => s.status === statusFilter);
  }

  if (typeFilter) {
    filtered = filtered.filter((s) => s.type === typeFilter);
  }

  if (search) {
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(search) ||
        s.description?.toLowerCase().includes(search) ||
        s.slug.toLowerCase().includes(search)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const data = filtered.slice(offset, offset + limit);

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
  });
}

// ── POST /api/surveys ───────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createSurveySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newSurvey: Survey = {
      ...parsed.data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      publishedAt: parsed.data.status === "published" ? now : undefined,
      version: 1,
    };

    // In a real app, this would persist to a database.
    // For mock purposes, we return the created survey.
    return NextResponse.json({ data: newSurvey }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
