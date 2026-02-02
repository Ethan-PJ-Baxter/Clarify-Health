"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

const STAGES = [
  "Gathering symptoms...",
  "Analysing patterns...",
  "Generating summary...",
  "Finalising report...",
];

export function ReportGenerationProgress() {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        const increment = Math.random() * 3 + 1;
        const next = Math.min(prev + increment, 95);

        // Advance stage at thresholds
        if (next > 75 && stage < 3) setStage(3);
        else if (next > 50 && stage < 2) setStage(2);
        else if (next > 25 && stage < 1) setStage(1);

        return next;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [stage]);

  return (
    <div className="space-y-4 py-4">
      <Progress value={progress} className="h-2" />
      <div className="space-y-2">
        {STAGES.map((label, i) => (
          <div
            key={label}
            className={`flex items-center gap-2 text-sm transition-opacity ${
              i <= stage ? "opacity-100" : "opacity-30"
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full ${
                i < stage
                  ? "bg-primary"
                  : i === stage
                    ? "bg-primary animate-pulse"
                    : "bg-muted"
              }`}
            />
            <span
              className={
                i <= stage ? "text-foreground" : "text-muted-foreground"
              }
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
