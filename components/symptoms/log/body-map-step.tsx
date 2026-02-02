"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BodyMap, getBodyPartLabel } from "@/components/symptoms/body-map";

interface BodyMapStepProps {
  suggestedPart: string;
  suggestedCoords: { x: number; y: number };
  suggestedView: "front" | "back";
  onComplete: (data: {
    bodyPart: string;
    coordinates: { x: number; y: number; view: "front" | "back" };
    userAdjusted: boolean;
  }) => void;
  onBack: () => void;
}

export function BodyMapStep({
  suggestedPart,
  suggestedCoords,
  suggestedView,
  onComplete,
  onBack,
}: BodyMapStepProps) {
  const [selectedPart, setSelectedPart] = useState<string | undefined>(
    undefined
  );
  const [selectedCoords, setSelectedCoords] = useState<{
    x: number;
    y: number;
    view: "front" | "back";
  }>({ ...suggestedCoords, view: suggestedView });
  const [view, setView] = useState<"front" | "back">(suggestedView);

  const handleSelect = useCallback(
    (part: string, coords: { x: number; y: number; view: "front" | "back" }) => {
      setSelectedPart(part);
      setSelectedCoords(coords);
    },
    []
  );

  const handleViewChange = useCallback((newView: "front" | "back") => {
    setView(newView);
  }, []);

  function handleConfirm() {
    const finalPart = selectedPart || suggestedPart;
    const finalCoords = selectedPart
      ? selectedCoords
      : { ...suggestedCoords, view: suggestedView };
    const userAdjusted = !!selectedPart && selectedPart !== suggestedPart;

    onComplete({
      bodyPart: finalPart,
      coordinates: finalCoords,
      userAdjusted,
    });
  }

  const displayPart = selectedPart || suggestedPart;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Symptom Location</h2>
        <p className="text-sm text-muted-foreground">
          Confirm or adjust where you are experiencing this symptom. Tap a body
          region to select it.
        </p>
      </div>

      <BodyMap
        selectedPart={selectedPart}
        suggestedPart={suggestedPart}
        view={view}
        onViewChange={handleViewChange}
        onSelect={handleSelect}
      />

      {displayPart && (
        <div className="flex items-center justify-center gap-2 text-sm font-medium">
          <MapPin className="size-4 text-primary" />
          <span>{getBodyPartLabel(displayPart)}</span>
          {!selectedPart && (
            <span className="text-muted-foreground">(AI suggested)</span>
          )}
        </div>
      )}

      <Button
        size="lg"
        className="min-h-[44px] w-full"
        onClick={handleConfirm}
      >
        Confirm Location
      </Button>

      <Button
        variant="ghost"
        onClick={onBack}
        className="min-h-[44px] text-muted-foreground"
        size="lg"
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>
    </div>
  );
}
