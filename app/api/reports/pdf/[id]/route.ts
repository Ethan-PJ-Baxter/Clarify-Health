import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth";
import { buildReportPdf } from "@/lib/pdf/report-pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError, supabase, user } = await withAuth();
  if (authError) return authError;

  const { id } = await params;

  const { data: report, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  try {
    const pdfBuffer = buildReportPdf(report);
    const startDate = new Date(report.date_range_start)
      .toISOString()
      .split("T")[0];
    const endDate = new Date(report.date_range_end)
      .toISOString()
      .split("T")[0];

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="clarify-report-${startDate}-${endDate}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
