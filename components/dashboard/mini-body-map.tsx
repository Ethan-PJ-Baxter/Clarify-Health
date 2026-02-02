"use client";

import Link from "next/link";
import { BODY_REGIONS } from "@/components/symptoms/body-map";

export interface RegionCount {
  count: number;
  avgSeverity: number;
}

interface MiniBodyMapProps {
  regionCounts: Record<string, RegionCount>;
}

function getSeverityHex(severity: number): string {
  if (severity <= 3) return "#22c55e";
  if (severity <= 5) return "#eab308";
  if (severity <= 7) return "#f97316";
  return "#ef4444";
}

export function MiniBodyMap({ regionCounts }: MiniBodyMapProps) {
  const hasData = Object.keys(regionCounts).length > 0;
  const maxCount = Math.max(
    1,
    ...Object.values(regionCounts).map((r) => r.count)
  );

  // Only show front-view regions for the mini map
  const frontRegions = BODY_REGIONS.filter(
    (r) => r.view === "front" || r.view === "both"
  );

  return (
    <Link
      href="/body-map"
      className="group flex flex-col items-center transition-opacity hover:opacity-80"
    >
      <svg
        viewBox="50 0 180 400"
        className="h-48 w-[120px] max-w-full"
        aria-label="Body map preview showing symptom hotspots"
        role="img"
      >
        {/* Body outline */}
        <g
          stroke="currentColor"
          strokeWidth={1}
          fill="none"
          className="text-muted-foreground/30"
        >
          <ellipse cx="140" cy="45" rx="25" ry="32" />
          <rect x="130" y="77" width="20" height="23" rx="4" />
          <path d="M 105,100 L 175,100 L 175,220 L 105,220 Z" />
          <path d="M 80,105 L 100,100 L 100,200 L 90,235 L 65,235 L 75,200 L 80,105 Z" />
          <path d="M 200,105 L 180,100 L 180,200 L 190,235 L 215,235 L 205,200 L 200,105 Z" />
          <path d="M 108,220 L 140,220 L 135,360 L 135,385 L 100,385 L 108,360 Z" />
          <path d="M 140,220 L 172,220 L 172,360 L 180,385 L 145,385 L 145,360 Z" />
        </g>

        {/* Heatmap fills for regions with data */}
        {hasData &&
          frontRegions.map((region) => {
            const data = regionCounts[region.id];
            if (!data) return null;
            const normalizedDensity = data.count / maxCount;
            return (
              <path
                key={region.id}
                d={region.path}
                fill={getSeverityHex(data.avgSeverity)}
                fillOpacity={0.15 + normalizedDensity * 0.5}
                className="pointer-events-none"
              />
            );
          })}
      </svg>

      {hasData ? (
        <p className="mt-2 text-xs text-muted-foreground group-hover:text-foreground">
          View full body map
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          No symptoms to display
        </p>
      )}
    </Link>
  );
}
