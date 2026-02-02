import type { BodyRegion } from "@/components/symptoms/body-map";

export interface HeatmapRegionData {
  regionId: string;
  count: number;
  avgSeverity: number;
  maxSeverity: number;
  normalizedDensity: number;
  fillColor: string;
  fillOpacity: number;
}

export interface BodyMapSymptom {
  id: string;
  body_part: string | null;
  body_coordinates: { x: number; y: number; view: string } | null;
  severity: number | null;
  symptom_type: string | null;
  created_at: string;
  description: string | null;
}

function getSeverityHex(severity: number): string {
  if (severity <= 3) return "#22c55e";
  if (severity <= 5) return "#eab308";
  if (severity <= 7) return "#f97316";
  return "#ef4444";
}

export function computeHeatmap(
  symptoms: BodyMapSymptom[]
): Map<string, HeatmapRegionData> {
  const regionMap = new Map<
    string,
    { count: number; totalSeverity: number; maxSeverity: number }
  >();

  for (const symptom of symptoms) {
    if (!symptom.body_part) continue;
    const existing = regionMap.get(symptom.body_part);
    const severity = symptom.severity ?? 5;
    if (existing) {
      existing.count++;
      existing.totalSeverity += severity;
      existing.maxSeverity = Math.max(existing.maxSeverity, severity);
    } else {
      regionMap.set(symptom.body_part, {
        count: 1,
        totalSeverity: severity,
        maxSeverity: severity,
      });
    }
  }

  const maxCount = Math.max(1, ...Array.from(regionMap.values()).map((r) => r.count));

  const result = new Map<string, HeatmapRegionData>();

  for (const [regionId, data] of regionMap) {
    const avgSeverity = data.totalSeverity / data.count;
    const normalizedDensity = data.count / maxCount;
    result.set(regionId, {
      regionId,
      count: data.count,
      avgSeverity,
      maxSeverity: data.maxSeverity,
      normalizedDensity,
      fillColor: getSeverityHex(avgSeverity),
      fillOpacity: 0.15 + normalizedDensity * 0.5,
    });
  }

  return result;
}

export function getMarkerColor(severity: number): string {
  return getSeverityHex(severity);
}

/**
 * For symptoms without body_coordinates, place them at the region center
 * with a small deterministic offset to avoid stacking.
 */
export function getFallbackPosition(
  symptomId: string,
  region: BodyRegion,
  index: number
): { x: number; y: number } {
  const angle = (index * 137.5 * Math.PI) / 180; // golden angle spiral
  const radius = 4 + index * 3;
  return {
    x: region.center.x + Math.cos(angle) * Math.min(radius, 15),
    y: region.center.y + Math.sin(angle) * Math.min(radius, 15),
  };
}
