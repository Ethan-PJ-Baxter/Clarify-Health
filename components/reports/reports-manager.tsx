"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReportGenerationProgress } from "./report-generation-progress";
import { ReportViewer } from "./report-viewer";
import { ReportCard } from "./report-card";
import type { Tables } from "@/lib/supabase/types";

type Report = Tables<"reports">;

interface ReportsManagerProps {
  initialReports: Report[];
}

export function ReportsManager({ initialReports }: ReportsManagerProps) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [generating, setGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState<Report | null>(null);

  // Default date range: last 30 days
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  async function handleGenerate() {
    if (!startDate || !endDate) {
      toast.error("Please select a date range");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date_range_start: startDate,
          date_range_end: endDate,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate report");
      }

      const { data: report } = await res.json();
      setReports((prev) => [report, ...prev]);
      setActiveReport(report);
      toast.success("Report generated successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate report"
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (activeReport?.id === id) setActiveReport(null);
      toast.success("Report deleted");
    } catch {
      toast.error("Failed to delete report");
    }
  }

  if (activeReport) {
    return (
      <ReportViewer
        report={activeReport}
        onBack={() => setActiveReport(null)}
        onDelete={() => handleDelete(activeReport.id)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Generate Report Section */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>
            Create a GP-ready report from your symptom data. At least 3 symptoms
            in the date range are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generating ? (
            <ReportGenerationProgress />
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleGenerate}
                className="min-h-[44px] w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Reports Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Past Reports ({reports.length})
        </h3>
        {reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mb-1 text-sm font-medium">No reports yet</p>
              <p className="text-xs text-muted-foreground">
                Generate your first report to share with your GP
              </p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onClick={() => setActiveReport(report)}
            />
          ))
        )}
      </div>
    </div>
  );
}
