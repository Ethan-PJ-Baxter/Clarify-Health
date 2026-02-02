"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/lib/supabase/types";
import type {
  Pattern,
  NhsLink,
  SymptomBreakdown,
} from "@/lib/validations/reports";

type Report = Tables<"reports">;

interface ReportViewerProps {
  report: Report;
  onBack: () => void;
  onDelete: () => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getConfidenceBadgeVariant(
  confidence: string
): "default" | "secondary" | "outline" {
  switch (confidence) {
    case "high":
      return "default";
    case "medium":
      return "secondary";
    default:
      return "outline";
  }
}

export function ReportViewer({ report, onBack, onDelete }: ReportViewerProps) {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const breakdown = report.symptom_breakdown as SymptomBreakdown | null;
  const patterns = report.patterns_detected as Pattern[] | null;
  const nhsLinks = report.nhs_links as NhsLink[] | null;

  async function handleDownloadPdf() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/reports/pdf/${report.id}`);
      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clarify-report-${report.date_range_start}-${report.date_range_end}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete();
    } catch {
      setDeleting(false);
      toast.error("Failed to delete report");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={onBack}
          className="min-h-[44px]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Reports
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="min-h-[44px]"
          >
            <Download className="mr-2 h-4 w-4" />
            {downloading ? "Downloading..." : "Export PDF"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleDelete}
            disabled={deleting}
            className="min-h-[44px] text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Date Range */}
      <div className="text-sm text-muted-foreground">
        {formatDate(report.date_range_start)} —{" "}
        {formatDate(report.date_range_end)}
        {report.symptom_count != null && (
          <span className="ml-2">
            ({report.symptom_count} symptom
            {report.symptom_count !== 1 ? "s" : ""})
          </span>
        )}
      </div>

      {/* Executive Summary */}
      {report.executive_summary && (
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {report.executive_summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Symptom Breakdown */}
      {breakdown && (
        <Card>
          <CardHeader>
            <CardTitle>Symptom Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Total: {breakdown.total_count} symptoms | Average severity:{" "}
              {breakdown.avg_severity?.toFixed(1) ?? "N/A"}/10
            </p>

            {breakdown.by_type?.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">By Type</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4 font-medium">Type</th>
                        <th className="pb-2 pr-4 font-medium">Count</th>
                        <th className="pb-2 font-medium">Avg Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakdown.by_type.map((item) => (
                        <tr key={item.type} className="border-b last:border-0">
                          <td className="py-2 pr-4 capitalize">{item.type}</td>
                          <td className="py-2 pr-4">{item.count}</td>
                          <td className="py-2">
                            {item.avg_severity?.toFixed(1) ?? "N/A"}/10
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {breakdown.by_body_part?.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">By Body Part</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4 font-medium">Body Part</th>
                        <th className="pb-2 pr-4 font-medium">Count</th>
                        <th className="pb-2 font-medium">Avg Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakdown.by_body_part.map((item) => (
                        <tr
                          key={item.body_part}
                          className="border-b last:border-0"
                        >
                          <td className="py-2 pr-4 capitalize">
                            {item.body_part.replace(/_/g, " ")}
                          </td>
                          <td className="py-2 pr-4">{item.count}</td>
                          <td className="py-2">
                            {item.avg_severity?.toFixed(1) ?? "N/A"}/10
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Patterns Detected */}
      {patterns && patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Patterns Detected</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {patterns.map((pattern, i) => (
              <div key={i} className="rounded-lg border p-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-medium">{pattern.title}</span>
                  <Badge variant={getConfidenceBadgeVariant(pattern.confidence)}>
                    {pattern.confidence}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {pattern.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Suggested Questions */}
      {report.suggested_questions && report.suggested_questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions for Your GP</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              {report.suggested_questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* NHS Links */}
      {nhsLinks && nhsLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>NHS Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nhsLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
              >
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium text-primary">
                    {link.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {link.description}
                  </p>
                </div>
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
