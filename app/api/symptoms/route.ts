import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth";
import {
  createSymptomSchema,
  symptomsQuerySchema,
} from "@/lib/validations/symptoms";
import { sanitizeText, sanitizeArray } from "@/lib/utils/sanitize";

export async function POST(request: Request) {
  const { error: authError, supabase, user } = await withAuth();
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSymptomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const { data: symptom, error } = await supabase
    .from("symptoms")
    .insert({
      user_id: user.id,
      body_part: sanitizeText(data.body_part),
      symptom_type: sanitizeText(data.symptom_type),
      severity: data.severity,
      duration: data.duration ? sanitizeText(data.duration) : null,
      description: data.description ? sanitizeText(data.description) : null,
      onset_date: data.onset_date || null,
      triggers: sanitizeArray(data.triggers) || null,
      relief_factors: sanitizeArray(data.relief_factors) || null,
      medications: sanitizeArray(data.medications) || null,
      photo_urls: data.photo_urls || null,
      ai_conversation: data.ai_conversation || null,
      ai_characteristics: data.ai_characteristics || null,
      body_coordinates: data.body_coordinates || null,
      mapped_by_ai: data.mapped_by_ai || false,
      user_adjusted_location: data.user_adjusted_location || false,
    })
    .select()
    .single();

  if (error) {
    console.error("Insert symptom error:", error);
    return NextResponse.json(
      { error: "Failed to save symptom" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: symptom }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { error: authError, supabase, user } = await withAuth();
  if (authError) return authError;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = symptomsQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    page,
    limit,
    sort,
    search,
    body_part,
    symptom_type,
    severity_min,
    severity_max,
    date_from,
    date_to,
  } = parsed.data;

  let query = supabase
    .from("symptoms")
    .select("*", { count: "exact" })
    .eq("user_id", user.id);

  if (search) {
    query = query.or(
      `description.ilike.%${search}%,body_part.ilike.%${search}%,symptom_type.ilike.%${search}%`
    );
  }
  if (body_part) {
    query = query.eq("body_part", body_part);
  }
  if (symptom_type) {
    query = query.eq("symptom_type", symptom_type);
  }
  if (severity_min !== undefined) {
    query = query.gte("severity", severity_min);
  }
  if (severity_max !== undefined) {
    query = query.lte("severity", severity_max);
  }
  if (date_from) {
    query = query.gte("created_at", date_from);
  }
  if (date_to) {
    query = query.lte("created_at", `${date_to}T23:59:59.999Z`);
  }

  query = query.order("created_at", {
    ascending: sort === "oldest",
  });

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Fetch symptoms error:", error);
    return NextResponse.json(
      { error: "Failed to fetch symptoms" },
      { status: 500 }
    );
  }

  const total = count ?? 0;
  return NextResponse.json({
    data: data ?? [],
    total,
    page,
    limit,
    hasMore: from + limit < total,
  });
}
