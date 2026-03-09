import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ── GET /api/surveys ────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
  const statusFilter = searchParams.get("status");
  const typeFilter = searchParams.get("type");
  const search = searchParams.get("search");

  // Get user's org
  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) {
    return NextResponse.json({ data: [], pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false } });
  }

  let query = supabase
    .from("surveys")
    .select("*", { count: "exact" })
    .eq("org_id", membership.org_id)
    .order("updated_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }
  if (typeFilter) {
    query = query.eq("type", typeFilter);
  }
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's org
  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No organization found" }, { status: 400 });
  }

  try {
    const body = await request.json();

    const slug = (body.title || "untitled")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60)
      + "-" + Date.now().toString(36);

    const { data, error } = await supabase
      .from("surveys")
      .insert({
        org_id: membership.org_id,
        created_by: user.id,
        title: body.title,
        description: body.description || null,
        slug,
        type: body.type || "standard",
        status: body.status || "draft",
        schema: body.schema || [],
        settings: body.settings || {},
        is_anonymous: body.is_anonymous ?? true,
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
