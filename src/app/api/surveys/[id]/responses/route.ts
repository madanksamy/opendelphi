import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ── GET /api/surveys/[id]/responses ─────────────────────────────────
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const supabase = await createClient();

  // Verify survey exists
  const { data: survey } = await supabase
    .from("surveys")
    .select("id, status")
    .eq("id", id)
    .single();

  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const statusFilter = searchParams.get("status");

  let query = supabase
    .from("responses")
    .select("*", { count: "exact" })
    .eq("survey_id", id)
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    data: data ?? [],
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    stats: {
      totalResponses: total,
      completed: (data ?? []).filter((r: { status: string }) => r.status === "complete").length,
      inProgress: (data ?? []).filter((r: { status: string }) => r.status === "in_progress").length,
    },
  });
}

// ── POST /api/surveys/[id]/responses ────────────────────────────────
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const supabase = await createClient();

  // Verify survey is published
  const { data: survey } = await supabase
    .from("surveys")
    .select("id, status, version")
    .eq("id", id)
    .single();

  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  if (survey.status !== "published") {
    return NextResponse.json(
      { error: "Survey is not accepting responses" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("responses")
      .insert({
        survey_id: id,
        survey_version: survey.version || 1,
        answers: body.answers || {},
        status: body.status || "complete",
        started_at: body.started_at || new Date().toISOString(),
        completed_at: body.status === "complete" ? new Date().toISOString() : null,
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
