import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth";
import { exportDataSchema } from "@/lib/validations/settings";

export async function GET(request: NextRequest) {
  const { error: authError, supabase, user } = await withAuth();
  if (authError) return authError;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = exportDataSchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid format. Use ?format=json or ?format=csv" },
      { status: 400 }
    );
  }

  const { format } = parsed.data;

  // Fetch all user data
  const [symptomsRes, medicationsRes, reportsRes, profileRes] =
    await Promise.all([
      supabase
        .from("symptoms")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("medications")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false }),
      supabase
        .from("reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("user_profiles")
        .select("name, date_of_birth, gp_surgery, conditions, created_at")
        .eq("id", user.id)
        .single(),
    ]);

  if (symptomsRes.error) console.error("Export: symptoms fetch error", symptomsRes.error);
  if (medicationsRes.error) console.error("Export: medications fetch error", medicationsRes.error);
  if (reportsRes.error) console.error("Export: reports fetch error", reportsRes.error);
  if (profileRes.error) console.error("Export: profile fetch error", profileRes.error);

  const exportData = {
    exported_at: new Date().toISOString(),
    profile: profileRes.data ?? null,
    symptoms: symptomsRes.data ?? [],
    medications: medicationsRes.data ?? [],
    reports: reportsRes.data ?? [],
  };

  if (format === "json") {
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="clarify-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  }

  // CSV format - flatten all data into separate CSV sections
  const lines: string[] = [];

  // Profile section
  lines.push("# Profile");
  if (exportData.profile) {
    lines.push("name,date_of_birth,gp_surgery,conditions,created_at");
    const p = exportData.profile;
    lines.push(
      [
        csvEscape(p.name),
        csvEscape(p.date_of_birth),
        csvEscape(p.gp_surgery),
        csvEscape(p.conditions?.join("; ")),
        csvEscape(p.created_at),
      ].join(",")
    );
  }
  lines.push("");

  // Symptoms section
  lines.push("# Symptoms");
  if (exportData.symptoms.length > 0) {
    lines.push(
      "id,body_part,symptom_type,severity,duration,description,onset_date,triggers,relief_factors,created_at"
    );
    for (const s of exportData.symptoms) {
      lines.push(
        [
          csvEscape(s.id),
          csvEscape(s.body_part),
          csvEscape(s.symptom_type),
          s.severity ?? "",
          csvEscape(s.duration),
          csvEscape(s.description),
          csvEscape(s.onset_date),
          csvEscape(s.triggers?.join("; ")),
          csvEscape(s.relief_factors?.join("; ")),
          csvEscape(s.created_at),
        ].join(",")
      );
    }
  }
  lines.push("");

  // Medications section
  lines.push("# Medications");
  if (exportData.medications.length > 0) {
    lines.push(
      "id,name,dosage,frequency,started_at,ended_at,notes,reason,created_at"
    );
    for (const m of exportData.medications) {
      lines.push(
        [
          csvEscape(m.id),
          csvEscape(m.name),
          csvEscape(m.dosage),
          csvEscape(m.frequency),
          csvEscape(m.started_at),
          csvEscape(m.ended_at),
          csvEscape(m.notes),
          csvEscape(m.reason),
          csvEscape(m.created_at),
        ].join(",")
      );
    }
  }
  lines.push("");

  // Reports section
  lines.push("# Reports");
  if (exportData.reports.length > 0) {
    lines.push(
      "id,date_range_start,date_range_end,symptom_count,executive_summary,created_at"
    );
    for (const r of exportData.reports) {
      lines.push(
        [
          csvEscape(r.id),
          csvEscape(r.date_range_start),
          csvEscape(r.date_range_end),
          r.symptom_count ?? "",
          csvEscape(r.executive_summary),
          csvEscape(r.created_at),
        ].join(",")
      );
    }
  }

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="clarify-export-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

function csvEscape(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
