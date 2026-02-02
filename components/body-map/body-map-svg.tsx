"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import {
  BODY_REGIONS,
  getRegionsForView,
  type BodyRegion,
} from "./region-data";
import {
  type BodyMapSymptom,
  type HeatmapRegionData,
  getMarkerColor,
  getFallbackPosition,
} from "./heatmap";

interface BodyMapSvgBaseProps {
  view: "front" | "back";
  onViewChange: (v: "front" | "back") => void;
  onRegionTap: (regionId: string) => void;
  className?: string;
}

interface VisualizationModeProps extends BodyMapSvgBaseProps {
  mode: "visualization";
  symptoms: BodyMapSymptom[];
  heatmapData: Map<string, HeatmapRegionData>;
  onMarkerTap: (s: BodyMapSymptom) => void;
  onLongPressRegion: (regionId: string) => void;
  selectedPart?: never;
  suggestedPart?: never;
}

interface SelectionModeProps extends BodyMapSvgBaseProps {
  mode: "selection";
  selectedPart?: string;
  suggestedPart?: string;
  symptoms?: never;
  heatmapData?: never;
  onMarkerTap?: never;
  onLongPressRegion?: never;
}

export type BodyMapSvgProps = VisualizationModeProps | SelectionModeProps;

// ── Touch helpers ───────────────────────────────────────────────

function getDistance(t1: React.Touch, t2: React.Touch): number {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getMidpoint(
  t1: React.Touch,
  t2: React.Touch
): { x: number; y: number } {
  return {
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  };
}

// ── Body outline (decorative, stroke-only) ──────────────────────

function BodyOutline() {
  return (
    <g
      stroke="currentColor"
      strokeWidth={1}
      fill="none"
      className="text-muted-foreground/30"
    >
      {/* Head */}
      <ellipse cx="140" cy="45" rx="25" ry="32" />
      {/* Neck */}
      <rect x="130" y="77" width="20" height="23" rx="4" />
      {/* Torso */}
      <path d="M 105,100 L 175,100 L 175,220 L 105,220 Z" />
      {/* Left arm */}
      <path d="M 80,105 L 100,100 L 100,200 L 90,235 L 65,235 L 75,200 L 80,105 Z" />
      {/* Right arm */}
      <path d="M 200,105 L 180,100 L 180,200 L 190,235 L 215,235 L 205,200 L 200,105 Z" />
      {/* Left leg */}
      <path d="M 108,220 L 140,220 L 135,360 L 135,385 L 100,385 L 108,360 Z" />
      {/* Right leg */}
      <path d="M 140,220 L 172,220 L 172,360 L 180,385 L 145,385 L 145,360 Z" />
    </g>
  );
}

// ── Main component ──────────────────────────────────────────────

function BodyMapSvgInner(props: BodyMapSvgProps) {
  const { mode, view, onViewChange, onRegionTap, className } = props;

  const [transform, setTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number | null>(null);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressRegion = useRef<string | null>(null);
  const lastTapTime = useRef(0);
  const touchedInteractive = useRef(false);

  const visibleRegions = useMemo(() => getRegionsForView(view), [view]);

  const regionMap = useMemo(() => {
    const map = new Map<string, BodyRegion>();
    for (const r of BODY_REGIONS) {
      map.set(r.id, r);
    }
    return map;
  }, []);

  // Visualization mode: group markers by region for fallback positioning
  const markersForView = useMemo(() => {
    if (mode !== "visualization" || !props.symptoms) return [];
    const regionIndexes = new Map<string, number>();
    return props.symptoms
      .filter((s) => {
        if (!s.body_part) return false;
        const region = regionMap.get(s.body_part);
        if (!region) return false;
        if (region.view !== view) return false;
        return true;
      })
      .map((s) => {
        const coords = s.body_coordinates as {
          x: number;
          y: number;
          view: string;
        } | null;
        const region = regionMap.get(s.body_part!)!;

        if (coords && coords.view === view) {
          return { symptom: s, x: coords.x, y: coords.y };
        }

        const idx = regionIndexes.get(s.body_part!) ?? 0;
        regionIndexes.set(s.body_part!, idx + 1);
        const pos = getFallbackPosition(s.id, region, idx);
        return { symptom: s, x: pos.x, y: pos.y };
      });
  }, [mode, props.symptoms, view, regionMap]);

  const resetZoom = useCallback(() => {
    setTransform({ scale: 1, translateX: 0, translateY: 0 });
  }, []);

  // Reset zoom on view change
  useEffect(() => {
    resetZoom();
  }, [view, resetZoom]);

  // ── Pinch zoom ──────────────────────────────────────────────

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        touchedInteractive.current = false;
        lastTouchDistance.current = getDistance(e.touches[0], e.touches[1]);
        lastTouchCenter.current = getMidpoint(e.touches[0], e.touches[1]);
      }
      if (e.touches.length === 1) {
        const target = e.target as SVGElement;
        const regionId = target.dataset?.regionId;
        const isMarker = target.tagName === "circle";
        touchedInteractive.current = !!(regionId || isMarker);

        if (regionId && mode === "visualization" && props.onLongPressRegion) {
          longPressRegion.current = regionId;
          longPressTimer.current = setTimeout(() => {
            if (longPressRegion.current) {
              props.onLongPressRegion!(longPressRegion.current);
              longPressRegion.current = null;
            }
          }, 500);
        }
      }
    },
    [mode, props.onLongPressRegion]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function onTouchMove(e: TouchEvent) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
        longPressRegion.current = null;
      }

      if (e.touches.length === 2 && lastTouchDistance.current !== null) {
        e.preventDefault();
        const newDist = getDistance(
          e.touches[0] as unknown as React.Touch,
          e.touches[1] as unknown as React.Touch
        );
        const scaleDelta = newDist / lastTouchDistance.current;
        const newCenter = getMidpoint(
          e.touches[0] as unknown as React.Touch,
          e.touches[1] as unknown as React.Touch
        );

        setTransform((prev) => {
          const newScale = Math.max(1, Math.min(4, prev.scale * scaleDelta));
          const dx = newCenter.x - (lastTouchCenter.current?.x ?? 0);
          const dy = newCenter.y - (lastTouchCenter.current?.y ?? 0);
          return {
            scale: newScale,
            translateX: prev.translateX + dx,
            translateY: prev.translateY + dy,
          };
        });

        lastTouchDistance.current = newDist;
        lastTouchCenter.current = newCenter;
      }
    }

    container.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => container.removeEventListener("touchmove", onTouchMove);
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = null;
    lastTouchCenter.current = null;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    longPressRegion.current = null;

    if (!touchedInteractive.current) {
      const now = Date.now();
      if (now - lastTapTime.current < 300 && transform.scale > 1) {
        resetZoom();
      }
      lastTapTime.current = now;
    }
    touchedInteractive.current = false;
  }, [transform.scale, resetZoom]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setTransform((prev) => {
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(1, Math.min(4, prev.scale * delta));
      return { ...prev, scale: newScale };
    });
  }, []);

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={view === "front" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange("front")}
        >
          Front
        </Button>
        <Button
          type="button"
          variant={view === "back" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange("back")}
        >
          Back
        </Button>
      </div>

      {/* Zoomable SVG Container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden touch-none rounded-lg border border-border bg-background"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <svg
          viewBox="50 0 180 400"
          className="h-[420px] w-[240px] max-w-full"
          style={{
            transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
            transformOrigin: "center center",
            transition: "transform 0.1s ease-out",
          }}
          aria-label={`Body map ${mode === "visualization" ? "visualization" : "selection"} - ${view} view`}
          role="img"
        >
          {/* 1. Decorative body outline */}
          <BodyOutline />

          {/* 2. Heatmap fills (visualization mode only) */}
          {mode === "visualization" &&
            props.heatmapData &&
            visibleRegions.map((region) => {
              const data = props.heatmapData!.get(region.id);
              if (!data) return null;
              return (
                <path
                  key={`heatmap-${region.id}`}
                  d={region.path}
                  fill={data.fillColor}
                  fillOpacity={data.fillOpacity}
                  className="pointer-events-none transition-opacity duration-300"
                />
              );
            })}

          {/* 3. Clickable region paths */}
          {visibleRegions.map((region) => {
            if (mode === "visualization") {
              const data = props.heatmapData?.get(region.id);
              return (
                <g key={region.id}>
                  <path
                    d={region.path}
                    className={cn(
                      "cursor-pointer fill-transparent stroke-transparent transition-all duration-150",
                      hoveredRegion === region.id
                        ? "fill-primary/10 stroke-primary/30"
                        : "hover:fill-primary/10 hover:stroke-primary/30"
                    )}
                    strokeWidth={1}
                    onClick={() => onRegionTap(region.id)}
                    onMouseEnter={() => setHoveredRegion(region.id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    data-region-id={region.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${region.label}${data ? ` - ${data.count} symptom${data.count > 1 ? "s" : ""}` : ""}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRegionTap(region.id);
                      }
                    }}
                  />
                  {data && (
                    <text
                      x={region.center.x}
                      y={region.center.y - 10}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="pointer-events-none text-[7px] font-medium fill-foreground/60"
                    >
                      {data.count}
                    </text>
                  )}
                </g>
              );
            }

            // Selection mode
            const isSelected = props.selectedPart === region.id;
            const isSuggested =
              props.suggestedPart === region.id && !isSelected;

            return (
              <g key={region.id}>
                <path
                  d={region.path}
                  className={cn(
                    "cursor-pointer transition-all duration-150",
                    isSelected
                      ? "fill-primary/40 stroke-primary"
                      : isSuggested
                        ? "fill-blue-400/30 stroke-blue-500"
                        : hoveredRegion === region.id
                          ? "fill-primary/15 stroke-primary/40"
                          : "fill-transparent stroke-transparent hover:fill-primary/15 hover:stroke-primary/40"
                  )}
                  strokeWidth={isSelected || isSuggested ? 2 : 1}
                  onClick={() => onRegionTap(region.id)}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  data-region-id={region.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${region.label}${isSelected ? " (selected)" : isSuggested ? " (suggested)" : ""}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRegionTap(region.id);
                    }
                  }}
                />
                {(isSelected || isSuggested) && (
                  <text
                    x={region.center.x}
                    y={region.center.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={cn(
                      "pointer-events-none text-[8px] font-medium",
                      isSelected ? "fill-primary" : "fill-blue-500"
                    )}
                  >
                    {region.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* 4. Symptom marker dots (visualization only) */}
          {mode === "visualization" &&
            markersForView.map(({ symptom, x, y }) => {
              const severity = symptom.severity ?? 5;
              return (
                <circle
                  key={symptom.id}
                  cx={x}
                  cy={y}
                  r={4}
                  fill={getMarkerColor(severity)}
                  stroke="white"
                  strokeWidth={1}
                  className="cursor-pointer transition-transform duration-150 hover:scale-150"
                  style={{ transformOrigin: `${x}px ${y}px` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    props.onMarkerTap!(symptom);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${symptom.symptom_type ?? "Symptom"}, severity ${severity}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      props.onMarkerTap!(symptom);
                    }
                  }}
                />
              );
            })}
        </svg>

        {/* Reset zoom button */}
        {transform.scale > 1 && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute right-2 top-2 gap-1"
            onClick={resetZoom}
          >
            <RotateCcw className="size-3" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}

export const BodyMapSvg = React.memo(BodyMapSvgInner);
