"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InteractiveSvg } from "./interactive-svg";
import { SeverityLegend } from "./severity-legend";
import { RegionSymptomList } from "./region-symptom-list";
import { SymptomMarkerTooltip } from "./symptom-marker-tooltip";
import { computeHeatmap, type BodyMapSymptom } from "./heatmap";

const DATE_RANGES = [
  { label: "7 days", value: "7d", days: 7 },
  { label: "30 days", value: "30d", days: 30 },
  { label: "90 days", value: "90d", days: 90 },
  { label: "All time", value: "all", days: 0 },
] as const;

function getDateFrom(days: number): string {
  if (days === 0) return "";
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

interface BodyMapVisualizationProps {
  initialSymptoms: BodyMapSymptom[];
}

export function BodyMapVisualization({
  initialSymptoms,
}: BodyMapVisualizationProps) {
  const router = useRouter();
  const [view, setView] = useState<"front" | "back">("front");
  const [dateRange, setDateRange] = useState("all");
  const [symptoms, setSymptoms] = useState<BodyMapSymptom[]>(initialSymptoms);
  const [loading, setLoading] = useState(false);

  // Region list state
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionListOpen, setRegionListOpen] = useState(false);

  // Marker tooltip state
  const [selectedMarker, setSelectedMarker] = useState<BodyMapSymptom | null>(
    null
  );
  const [markerTooltipOpen, setMarkerTooltipOpen] = useState(false);

  const hasLoadedRef = useRef(false);

  const heatmapData = useMemo(() => computeHeatmap(symptoms), [symptoms]);

  // Fetch symptoms when date range changes
  useEffect(() => {
    if (dateRange === "all" && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      return;
    }
    hasLoadedRef.current = true;

    const controller = new AbortController();
    async function fetchSymptoms() {
      setLoading(true);
      try {
        const days =
          DATE_RANGES.find((d) => d.value === dateRange)?.days ?? 0;
        const dateFrom = getDateFrom(days);
        const params = new URLSearchParams();
        if (dateFrom) params.set("date_from", dateFrom);

        const res = await fetch(`/api/symptoms/body-map?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setSymptoms(json.data);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Body map fetch error:", err);
          toast.error("Failed to load symptoms", {
            description: "Please try changing the date filter.",
          });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSymptoms();
    return () => controller.abort();
  }, [dateRange]);

  const handleRegionTap = useCallback((regionId: string) => {
    setSelectedRegion(regionId);
    setRegionListOpen(true);
  }, []);

  const handleMarkerTap = useCallback((symptom: BodyMapSymptom) => {
    setSelectedMarker(symptom);
    setMarkerTooltipOpen(true);
  }, []);

  const handleLongPressRegion = useCallback(
    (regionId: string) => {
      router.push(`/log?body_part=${regionId}&view=${view}`);
    },
    [router, view]
  );

  const handleLogNew = useCallback(
    (regionId: string) => {
      setRegionListOpen(false);
      router.push(`/log?body_part=${regionId}&view=${view}`);
    },
    [router, view]
  );

  const handleSymptomSelectFromList = useCallback(
    (symptom: BodyMapSymptom) => {
      setRegionListOpen(false);
      setSelectedMarker(symptom);
      setMarkerTooltipOpen(true);
    },
    []
  );

  const handleViewDetails = useCallback(
    (symptomId: string) => {
      setMarkerTooltipOpen(false);
      router.push(`/timeline?highlight=${symptomId}`);
    },
    [router]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Show:
        </span>
        {DATE_RANGES.map((range) => (
          <Button
            key={range.value}
            variant={dateRange === range.value ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange(range.value)}
          >
            {range.label}
          </Button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center gap-4">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-[420px] w-[240px] rounded-lg" />
          </div>
        ) : symptoms.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <InteractiveSvg
              symptoms={[]}
              heatmapData={new Map()}
              view={view}
              onViewChange={setView}
              onRegionTap={handleRegionTap}
              onMarkerTap={handleMarkerTap}
              onLongPressRegion={handleLongPressRegion}
            />
            <p className="text-sm text-muted-foreground">
              No symptoms logged yet. Tap a region or use the log button to get
              started.
            </p>
          </div>
        ) : (
          <InteractiveSvg
            symptoms={symptoms}
            heatmapData={heatmapData}
            view={view}
            onViewChange={setView}
            onRegionTap={handleRegionTap}
            onMarkerTap={handleMarkerTap}
            onLongPressRegion={handleLongPressRegion}
          />
        )}

        {/* Severity Legend */}
        <SeverityLegend className="mt-2" />

        {/* Summary Stats */}
        {symptoms.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {symptoms.length} symptom{symptoms.length !== 1 ? "s" : ""} across{" "}
            {heatmapData.size} body region{heatmapData.size !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Region Symptom List */}
      <RegionSymptomList
        regionId={selectedRegion}
        symptoms={symptoms}
        open={regionListOpen}
        onOpenChange={setRegionListOpen}
        onSymptomSelect={handleSymptomSelectFromList}
        onLogNew={handleLogNew}
      />

      {/* Marker Tooltip */}
      <SymptomMarkerTooltip
        symptom={selectedMarker}
        open={markerTooltipOpen}
        onOpenChange={setMarkerTooltipOpen}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}
