import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth";
import {
  createMedicationSchema,
  medicationsQuerySchema,
} from "@/lib/validations/medications";
import { sanitizeText } from "@/lib/utils/sanitize";

export async function GET(request: NextRequest) {
  const { error: authError, supabase, user } = await withAuth();
  if (authError) return authError;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = medicationsQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { active } = parsed.data;

  let query = supabase
    .from("medications")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  if (active === "true") {
    query = query.is("ended_at", null);
  } else if (active === "false") {
    query = query.not("ended_at", "is", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Fetch medications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch medications" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const { error: authError, supabase, user } = await withAuth();
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createMedicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const { data: medication, error } = await supabase
    .from("medications")
    .insert({
      user_id: user.id,
      name: sanitizeText(data.name),
      dosage: data.dosage ? sanitizeText(data.dosage) : null,
      frequency: data.frequency ? sanitizeText(data.frequency) : null,
      started_at: data.started_at,
      notes: data.notes ? sanitizeText(data.notes) : null,
      reason: data.reason ? sanitizeText(data.reason) : null,
    })
    .select()
    .single();

  if (error) {
    console.error("Insert medication error:", error);
    return NextResponse.json(
      { error: "Failed to save medication" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: medication }, { status: 201 });
}
