import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ── GET /api/surveys/[id] ───────────────────────────────────────────
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("surveys")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Survey not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data });
}

// ── PUT /api/surveys/[id] ───────────────────────────────────────────
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const supabase = await createClient();

  try {
    const body = await request.json();

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.schema !== undefined) updates.schema = body.schema;
    if (body.settings !== undefined) updates.settings = body.settings;
    if (body.theme !== undefined) updates.theme = body.theme;
    if (body.status !== undefined) {
      updates.status = body.status;
      if (body.status === "published") {
        updates.published_at = new Date().toISOString();
      }
    }
    if (body.multi_step !== undefined) updates.multi_step = body.multi_step;

    const { data, error } = await supabase
      .from("surveys")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Survey not found" },
        { status: error ? 400 : 404 }
      );
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// ── DELETE /api/surveys/[id] ────────────────────────────────────────
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("surveys")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Survey not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data,
    message: "Survey archived successfully",
  });
}
