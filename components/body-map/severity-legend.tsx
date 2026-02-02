"use client";

import { cn } from "@/lib/utils";

const LEGEND_ITEMS = [
  { label: "Mild", color: "#22c55e", range: "1-3" },
  { label: "Moderate", color: "#eab308", range: "4-5" },
  { label: "Severe", color: "#f97316", range: "6-7" },
  { label: "Critical", color: "#ef4444", range: "8-10" },
];

interface SeverityLegendProps {
  className?: string;
}

export function SeverityLegend({ className }: SeverityLegendProps) {
  return (
    <div className={cn("flex items-center gap-3 text-xs text-muted-foreground", className)}>
      <span className="font-medium">Severity:</span>
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1">
          <div
            className="size-3 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
