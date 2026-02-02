"use client";

import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface BodyRegion {
  id: string;
  label: string;
  view: "front" | "back" | "both";
  path: string;
  center: { x: number; y: number };
}

const BODY_REGIONS: BodyRegion[] = [
  // Front view regions
  { id: "head", label: "Head", view: "both", path: "M 140,15 C 140,15 120,15 115,35 C 110,55 115,75 140,80 C 165,75 170,55 165,35 C 160,15 140,15 140,15 Z", center: { x: 140, y: 45 } },
  { id: "neck", label: "Neck", view: "both", path: "M 130,80 L 130,100 L 150,100 L 150,80 Z", center: { x: 140, y: 90 } },
  { id: "left_shoulder", label: "Left Shoulder", view: "front", path: "M 95,100 L 130,100 L 130,120 L 100,125 Z", center: { x: 112, y: 112 } },
  { id: "right_shoulder", label: "Right Shoulder", view: "front", path: "M 150,100 L 185,100 L 180,125 L 150,120 Z", center: { x: 168, y: 112 } },
  { id: "chest", label: "Chest", view: "front", path: "M 110,100 L 170,100 L 175,160 L 105,160 Z", center: { x: 140, y: 130 } },
  { id: "abdomen", label: "Abdomen", view: "front", path: "M 105,160 L 175,160 L 170,220 L 110,220 Z", center: { x: 140, y: 190 } },
  { id: "left_arm", label: "Left Arm", view: "front", path: "M 80,125 L 100,125 L 95,200 L 75,200 Z", center: { x: 88, y: 162 } },
  { id: "right_arm", label: "Right Arm", view: "front", path: "M 180,125 L 200,125 L 205,200 L 185,200 Z", center: { x: 192, y: 162 } },
  { id: "left_hand", label: "Left Hand", view: "front", path: "M 70,200 L 95,200 L 90,235 L 65,235 Z", center: { x: 80, y: 218 } },
  { id: "right_hand", label: "Right Hand", view: "front", path: "M 185,200 L 210,200 L 215,235 L 190,235 Z", center: { x: 200, y: 218 } },
  { id: "left_hip", label: "Left Hip", view: "front", path: "M 110,220 L 140,220 L 135,255 L 110,255 Z", center: { x: 124, y: 238 } },
  { id: "right_hip", label: "Right Hip", view: "front", path: "M 140,220 L 170,220 L 170,255 L 145,255 Z", center: { x: 156, y: 238 } },
  { id: "left_leg", label: "Left Leg", view: "front", path: "M 108,255 L 138,255 L 132,360 L 112,360 Z", center: { x: 122, y: 308 } },
  { id: "right_leg", label: "Right Leg", view: "front", path: "M 142,255 L 172,255 L 168,360 L 148,360 Z", center: { x: 158, y: 308 } },
  { id: "left_foot", label: "Left Foot", view: "front", path: "M 108,360 L 135,360 L 135,385 L 100,385 Z", center: { x: 118, y: 372 } },
  { id: "right_foot", label: "Right Foot", view: "front", path: "M 145,360 L 172,360 L 180,385 L 145,385 Z", center: { x: 162, y: 372 } },
  // Back view regions
  { id: "upper_back", label: "Upper Back", view: "back", path: "M 110,100 L 170,100 L 175,160 L 105,160 Z", center: { x: 140, y: 130 } },
  { id: "lower_back", label: "Lower Back", view: "back", path: "M 105,160 L 175,160 L 170,220 L 110,220 Z", center: { x: 140, y: 190 } },
];

interface BodyMapProps {
  selectedPart?: string;
  suggestedPart?: string;
  view: "front" | "back";
  onViewChange: (view: "front" | "back") => void;
  onSelect: (part: string, coords: { x: number; y: number; view: "front" | "back" }) => void;
  className?: string;
}

function BodyMapInner({
  selectedPart,
  suggestedPart,
  view,
  onViewChange,
  onSelect,
  className,
}: BodyMapProps) {
  const visibleRegions = BODY_REGIONS.filter(
    (r) => r.view === view || r.view === "both"
  );

  const handleRegionClick = useCallback(
    (region: BodyRegion) => {
      onSelect(region.id, { ...region.center, view });
    },
    [onSelect, view]
  );

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

      {/* Body SVG */}
      <svg
        viewBox="50 0 180 400"
        className="h-[400px] w-[220px] max-w-full"
        aria-label={`Body map - ${view} view. Tap a body region to select it.`}
        role="img"
      >
        {/* Body outline */}
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
          <path d="M 105,100 L 175,100 L 175,220 L 105,220 Z" rx="8" />
          {/* Left arm */}
          <path d="M 80,105 L 100,100 L 100,200 L 90,235 L 65,235 L 75,200 L 80,105 Z" />
          {/* Right arm */}
          <path d="M 200,105 L 180,100 L 180,200 L 190,235 L 215,235 L 205,200 L 200,105 Z" />
          {/* Left leg */}
          <path d="M 108,220 L 140,220 L 135,360 L 135,385 L 100,385 L 108,360 Z" />
          {/* Right leg */}
          <path d="M 140,220 L 172,220 L 172,360 L 180,385 L 145,385 L 145,360 Z" />
        </g>

        {/* Clickable hit regions */}
        {visibleRegions.map((region) => {
          const isSelected = selectedPart === region.id;
          const isSuggested = suggestedPart === region.id && !isSelected;

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
                      : "fill-transparent stroke-transparent hover:fill-primary/15 hover:stroke-primary/40"
                )}
                strokeWidth={isSelected || isSuggested ? 2 : 1}
                onClick={() => handleRegionClick(region)}
                role="button"
                tabIndex={0}
                aria-label={`${region.label}${isSelected ? " (selected)" : isSuggested ? " (suggested)" : ""}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRegionClick(region);
                  }
                }}
              />
              {/* Label for selected/suggested */}
              {(isSelected || isSuggested) && (
                <text
                  x={region.center.x}
                  y={region.center.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={cn(
                    "pointer-events-none text-[9px] font-medium",
                    isSelected ? "fill-primary" : "fill-blue-500"
                  )}
                >
                  {region.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Selected label */}
      {selectedPart && (
        <p className="text-sm font-medium text-primary">
          Selected:{" "}
          {BODY_REGIONS.find((r) => r.id === selectedPart)?.label || selectedPart}
        </p>
      )}
      {!selectedPart && suggestedPart && (
        <p className="text-sm text-muted-foreground">
          AI suggests:{" "}
          {BODY_REGIONS.find((r) => r.id === suggestedPart)?.label || suggestedPart}
          {" — tap to confirm or select a different area"}
        </p>
      )}
    </div>
  );
}

export const BodyMap = React.memo(BodyMapInner);

export function getBodyPartLabel(id: string): string {
  return BODY_REGIONS.find((r) => r.id === id)?.label || id;
}
