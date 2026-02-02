import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth";
import { z } from "zod";

const bodyMapQuerySchema = z.object({
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { error: authError, supabase, user } = await withAuth();
  if (authError) return authError;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = bodyMapQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { date_from, date_to } = parsed.data;

  let query = supabase
    .from("symptoms")
    .select(
      "id, body_part, body_coordinates, severity, symptom_type, created_at, description"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(500);

  if (date_from) {
    query = query.gte("created_at", date_from);
  }
  if (date_to) {
    query = query.lte("created_at", `${date_to}T23:59:59.999Z`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Fetch body map symptoms error:", error);
    return NextResponse.json(
      { error: "Failed to fetch symptoms" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: data ?? [] });
}
