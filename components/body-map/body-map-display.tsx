"use client";

import { BodyMapSvg } from "./body-map-svg";
import type { BodyMapSymptom, HeatmapRegionData } from "./heatmap";

interface BodyMapDisplayProps {
  symptoms: BodyMapSymptom[];
  heatmapData: Map<string, HeatmapRegionData>;
  view: "front" | "back";
  onViewChange: (view: "front" | "back") => void;
  onRegionTap: (regionId: string) => void;
  onMarkerTap: (symptom: BodyMapSymptom) => void;
  onLongPressRegion: (regionId: string) => void;
}

function BodyMapDisplay({
  symptoms,
  heatmapData,
  view,
  onViewChange,
  onRegionTap,
  onMarkerTap,
  onLongPressRegion,
}: BodyMapDisplayProps) {
  return (
    <>
      <BodyMapSvg
        mode="visualization"
        symptoms={symptoms}
        heatmapData={heatmapData}
        view={view}
        onViewChange={onViewChange}
        onRegionTap={onRegionTap}
        onMarkerTap={onMarkerTap}
        onLongPressRegion={onLongPressRegion}
      />
      {symptoms.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No symptoms logged yet. Tap a region or use the log button to get
          started.
        </p>
      )}
    </>
  );
}

export default BodyMapDisplay;
