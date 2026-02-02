"use client";

import { FileText, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Tables } from "@/lib/supabase/types";

type Report = Tables<"reports">;

interface ReportCardProps {
  report: Report;
  onClick: () => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ReportCard({ report, onClick }: ReportCardProps) {
  const summary = report.executive_summary ?? "";
  const truncated =
    summary.length > 150 ? summary.slice(0, 150) + "..." : summary;

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent/30"
      onClick={onClick}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">
              {formatDate(report.date_range_start)} —{" "}
              {formatDate(report.date_range_end)}
            </p>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
          <div className="mt-0.5 flex gap-2 text-xs text-muted-foreground">
            {report.symptom_count != null && (
              <span>
                {report.symptom_count} symptom
                {report.symptom_count !== 1 ? "s" : ""}
              </span>
            )}
            {report.created_at && (
              <span>Generated {formatDate(report.created_at)}</span>
            )}
          </div>
          {truncated && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {truncated}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
