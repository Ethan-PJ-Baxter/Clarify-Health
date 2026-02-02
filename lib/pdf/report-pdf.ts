import { jsPDF } from "jspdf";
import type { ReportContent } from "@/lib/validations/reports";

type ReportData = {
  id: string;
  date_range_start: string;
  date_range_end: string;
  created_at: string | null;
  executive_summary: string | null;
  symptom_breakdown: ReportContent["symptom_breakdown"] | null;
  patterns_detected: ReportContent["patterns_detected"] | null;
  suggested_questions: string[] | null;
  nhs_links: ReportContent["nhs_links"] | null;
  symptom_count: number | null;
};

const PAGE_WIDTH = 210;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 6;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildReportPdf(report: ReportData): ArrayBuffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = MARGIN;

  function checkPage(needed: number) {
    if (y + needed > 280) {
      doc.addPage();
      y = MARGIN;
    }
  }

  function addHeading(text: string, size: number = 14) {
    checkPage(12);
    doc.setFontSize(size);
    doc.setFont("helvetica", "bold");
    doc.text(text, MARGIN, y);
    y += size * 0.5 + 2;
  }

  function addBody(text: string) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
    for (const line of lines) {
      checkPage(LINE_HEIGHT);
      doc.text(line, MARGIN, y);
      y += LINE_HEIGHT;
    }
  }

  function addSpacer(size: number = 6) {
    y += size;
  }

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.text("Clarify Health Report", MARGIN, y);
  y += 10;

  // Date range
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(
    `${formatDate(report.date_range_start)} — ${formatDate(report.date_range_end)}`,
    MARGIN,
    y
  );
  y += 6;
  doc.text(
    `Generated: ${report.created_at ? formatDate(report.created_at) : "N/A"}`,
    MARGIN,
    y
  );
  y += 4;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  doc.setTextColor(0, 0, 0);

  // Executive Summary
  if (report.executive_summary) {
    addHeading("Executive Summary");
    addBody(report.executive_summary);
    addSpacer(8);
  }

  // Symptom Breakdown
  const breakdown = report.symptom_breakdown as ReportContent["symptom_breakdown"] | null;
  if (breakdown) {
    addHeading("Symptom Breakdown");

    addBody(
      `Total symptoms: ${breakdown.total_count} | Average severity: ${breakdown.avg_severity?.toFixed(1) ?? "N/A"}/10`
    );
    addSpacer(4);

    // By Type table
    if (breakdown.by_type?.length) {
      addHeading("By Type", 11);
      for (const item of breakdown.by_type) {
        checkPage(LINE_HEIGHT);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(
          `• ${item.type}: ${item.count} occurrence${item.count !== 1 ? "s" : ""}, avg severity ${item.avg_severity?.toFixed(1) ?? "N/A"}/10`,
          MARGIN + 2,
          y
        );
        y += LINE_HEIGHT;
      }
      addSpacer(4);
    }

    // By Body Part table
    if (breakdown.by_body_part?.length) {
      addHeading("By Body Part", 11);
      for (const item of breakdown.by_body_part) {
        checkPage(LINE_HEIGHT);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(
          `• ${item.body_part}: ${item.count} occurrence${item.count !== 1 ? "s" : ""}, avg severity ${item.avg_severity?.toFixed(1) ?? "N/A"}/10`,
          MARGIN + 2,
          y
        );
        y += LINE_HEIGHT;
      }
      addSpacer(8);
    }
  }

  // Patterns Detected
  const patterns = report.patterns_detected as ReportContent["patterns_detected"] | null;
  if (patterns?.length) {
    addHeading("Patterns Detected");
    for (const pattern of patterns) {
      checkPage(LINE_HEIGHT * 3);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(
        `${pattern.title} [${pattern.confidence} confidence]`,
        MARGIN + 2,
        y
      );
      y += LINE_HEIGHT;
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(pattern.description, CONTENT_WIDTH - 4);
      for (const line of descLines) {
        checkPage(LINE_HEIGHT);
        doc.text(line, MARGIN + 4, y);
        y += LINE_HEIGHT;
      }
      addSpacer(2);
    }
    addSpacer(6);
  }

  // Suggested Questions
  if (report.suggested_questions?.length) {
    addHeading("Questions for Your GP");
    report.suggested_questions.forEach((q, i) => {
      checkPage(LINE_HEIGHT * 2);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const qLines = doc.splitTextToSize(`${i + 1}. ${q}`, CONTENT_WIDTH - 4);
      for (const line of qLines) {
        checkPage(LINE_HEIGHT);
        doc.text(line, MARGIN + 2, y);
        y += LINE_HEIGHT;
      }
    });
    addSpacer(8);
  }

  // NHS Links
  const nhsLinks = report.nhs_links as ReportContent["nhs_links"] | null;
  if (nhsLinks?.length) {
    addHeading("Relevant NHS Resources");
    for (const link of nhsLinks) {
      checkPage(LINE_HEIGHT * 3);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`• ${link.title}`, MARGIN + 2, y);
      y += LINE_HEIGHT;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 64, 175);
      doc.text(link.url, MARGIN + 4, y);
      y += LINE_HEIGHT;
      doc.setTextColor(0, 0, 0);
      if (link.description) {
        const dLines = doc.splitTextToSize(link.description, CONTENT_WIDTH - 6);
        for (const line of dLines) {
          checkPage(LINE_HEIGHT);
          doc.text(line, MARGIN + 4, y);
          y += LINE_HEIGHT;
        }
      }
      addSpacer(2);
    }
    addSpacer(6);
  }

  // Disclaimer footer
  checkPage(20);
  doc.setDrawColor(200, 200, 200);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 6;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(120, 120, 120);
  const disclaimer =
    "Disclaimer: This report is generated by AI to assist in documenting symptoms for your GP. " +
    "It is not a medical diagnosis. Always consult a qualified healthcare professional for medical advice. " +
    "Generated by Clarify Health — clarifyhealth.app";
  const disclaimerLines = doc.splitTextToSize(disclaimer, CONTENT_WIDTH);
  for (const line of disclaimerLines) {
    checkPage(4);
    doc.text(line, MARGIN, y);
    y += 4;
  }

  return doc.output("arraybuffer");
}
