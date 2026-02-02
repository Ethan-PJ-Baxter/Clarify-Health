import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth";
import {
  generateReportSchema,
  reportQuerySchema,
} from "@/lib/validations/reports";
import { generateSymptomReport } from "@/lib/ai/reports";

export async function GET(request: NextRequest) {
  const { error: authError, supabase, user } = await withAuth();
  if (authError) return authError;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = reportQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { page, limit } = parsed.data;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from("reports")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Fetch reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
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

export async function POST(request: Request) {
  const { error: authError, supabase, user } = await withAuth();
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = generateReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { date_range_start, date_range_end } = parsed.data;

  // Fetch symptoms in date range
  const { data: symptoms, error: symptomsError } = await supabase
    .from("symptoms")
    .select(
      "body_part, symptom_type, severity, duration, description, onset_date, triggers, relief_factors, created_at"
    )
    .eq("user_id", user.id)
    .gte("created_at", date_range_start)
    .lte("created_at", `${date_range_end}T23:59:59.999Z`)
    .order("created_at", { ascending: true });

  if (symptomsError) {
    console.error("Fetch symptoms for report error:", symptomsError);
    return NextResponse.json(
      { error: "Failed to fetch symptoms" },
      { status: 500 }
    );
  }

  if (!symptoms || symptoms.length < 3) {
    return NextResponse.json(
      {
        error:
          "At least 3 symptoms are required to generate a report. Log more symptoms in the selected date range.",
      },
      { status: 400 }
    );
  }

  // Fetch active medications
  const { data: medications } = await supabase
    .from("medications")
    .select("name, dosage, frequency, started_at, ended_at")
    .eq("user_id", user.id);

  // Fetch user conditions
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("conditions")
    .eq("id", user.id)
    .single();

  const conditions = profile?.conditions ?? [];

  // Generate AI report
  const reportContent = await generateSymptomReport(
    symptoms,
    medications ?? [],
    conditions
  );

  if (!reportContent) {
    return NextResponse.json(
      { error: "Failed to generate report. Please try again." },
      { status: 500 }
    );
  }

  // Save report to DB
  const { data: report, error: insertError } = await supabase
    .from("reports")
    .insert({
      user_id: user.id,
      date_range_start,
      date_range_end,
      executive_summary: reportContent.executive_summary,
      symptom_breakdown: reportContent.symptom_breakdown as unknown as Record<string, unknown>,
      patterns_detected: reportContent.patterns_detected as unknown as Record<string, unknown>[],
      suggested_questions: reportContent.suggested_questions,
      nhs_links: reportContent.nhs_links as unknown as Record<string, unknown>[],
      symptom_count: symptoms.length,
      ai_model: "gemini-2.5-flash",
    })
    .select()
    .single();

  if (insertError) {
    console.error("Insert report error:", insertError);
    return NextResponse.json(
      { error: "Failed to save report" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: report }, { status: 201 });
}
