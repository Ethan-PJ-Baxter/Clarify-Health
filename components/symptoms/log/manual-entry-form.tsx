"use client";

import { useState, useCallback } from "react";
import { Loader2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { BodyMapSvg } from "@/components/body-map/body-map-svg";
import { getBodyPartLabel } from "@/components/body-map/region-data";
import {
  getSeverityLabel,
  getSeverityTailwindClass,
} from "@/lib/utils/severity";
import { cn } from "@/lib/utils";

interface ManualEntryFormProps {
  onSave: (data: Record<string, unknown>) => void;
  isSaving: boolean;
}

export function ManualEntryForm({ onSave, isSaving }: ManualEntryFormProps) {
  const [bodyPart, setBodyPart] = useState("");
  const [bodyCoordinates, setBodyCoordinates] = useState<{
    x: number;
    y: number;
    view: "front" | "back";
  } | null>(null);
  const [bodyMapView, setBodyMapView] = useState<"front" | "back">("front");
  const [symptomType, setSymptomType] = useState("");
  const [severity, setSeverity] = useState(5);
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [onsetDate, setOnsetDate] = useState("");
  const [triggers, setTriggers] = useState<string[]>([]);
  const [triggerInput, setTriggerInput] = useState("");
  const [reliefFactors, setReliefFactors] = useState<string[]>([]);
  const [reliefInput, setReliefInput] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const isValid = bodyPart.trim() !== "" && symptomType.trim() !== "";

  const handleBodyPartSelect = useCallback(
    (regionId: string) => {
      setBodyPart(regionId);
      setBodyCoordinates({ x: 0, y: 0, view: bodyMapView });
    },
    [bodyMapView]
  );

  const handleViewChange = useCallback((view: "front" | "back") => {
    setBodyMapView(view);
  }, []);

  function addTrigger() {
    const value = triggerInput.trim();
    if (value && !triggers.includes(value)) {
      setTriggers((prev) => [...prev, value]);
      setTriggerInput("");
    }
  }

  function removeTrigger(trigger: string) {
    setTriggers((prev) => prev.filter((t) => t !== trigger));
  }

  function addReliefFactor() {
    const value = reliefInput.trim();
    if (value && !reliefFactors.includes(value)) {
      setReliefFactors((prev) => [...prev, value]);
      setReliefInput("");
    }
  }

  function removeReliefFactor(factor: string) {
    setReliefFactors((prev) => prev.filter((f) => f !== factor));
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTrigger();
    }
  }

  function handleReliefKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addReliefFactor();
    }
  }

  function handleSubmit() {
    if (!isValid) return;

    onSave({
      body_part: bodyPart,
      symptom_type: symptomType,
      severity,
      duration: duration || undefined,
      description: description || undefined,
      onset_date: onsetDate || undefined,
      triggers: triggers.length > 0 ? triggers : undefined,
      relief_factors: reliefFactors.length > 0 ? reliefFactors : undefined,
      body_coordinates: bodyCoordinates || undefined,
      mapped_by_ai: false,
      user_adjusted_location: false,
    });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Log Symptom Manually</h2>
        <p className="text-sm text-muted-foreground">
          Fill in the details about your symptom below.
        </p>
      </div>

      {/* Body Map */}
      <div className="space-y-2">
        <Label>Body Location *</Label>
        <BodyMapSvg
          mode="selection"
          selectedPart={bodyPart || undefined}
          view={bodyMapView}
          onViewChange={handleViewChange}
          onRegionTap={handleBodyPartSelect}
        />
        {bodyPart && (
          <p className="text-center text-sm font-medium text-primary">
            Selected: {getBodyPartLabel(bodyPart)}
          </p>
        )}
      </div>

      {/* Symptom Type */}
      <div className="space-y-2">
        <Label htmlFor="symptom-type">Symptom Type *</Label>
        <Input
          id="symptom-type"
          placeholder="e.g., Sharp pain, Dull ache, Tingling..."
          value={symptomType}
          onChange={(e) => setSymptomType(e.target.value)}
          className="min-h-[44px]"
        />
      </div>

      {/* Severity */}
      <div className="space-y-4">
        <Label>Severity</Label>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">1</span>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium",
              getSeverityTailwindClass(severity)
            )}
          >
            {severity} - {getSeverityLabel(severity)}
          </span>
          <span className="text-sm text-muted-foreground">10</span>
        </div>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[severity]}
          onValueChange={(val) => setSeverity(val[0])}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Mild</span>
          <span>Moderate</span>
          <span>Severe</span>
          <span>Critical</span>
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label htmlFor="duration">Duration</Label>
        <Input
          id="duration"
          placeholder="e.g., 2 days, A few hours, Since last week..."
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="min-h-[44px]"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your symptom in more detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="min-h-[100px] resize-none"
        />
      </div>

      {/* Onset Date */}
      <div className="space-y-2">
        <Label htmlFor="onset-date">Onset Date</Label>
        <Input
          id="onset-date"
          type="date"
          max={today}
          value={onsetDate}
          onChange={(e) => setOnsetDate(e.target.value)}
          className="min-h-[44px]"
        />
      </div>

      {/* Triggers */}
      <div className="space-y-2">
        <Label htmlFor="triggers">Triggers</Label>
        <div className="flex gap-2">
          <Input
            id="triggers"
            placeholder="Type a trigger and press Enter..."
            value={triggerInput}
            onChange={(e) => setTriggerInput(e.target.value)}
            onKeyDown={handleTriggerKeyDown}
            className="min-h-[44px] flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="min-h-[44px] shrink-0"
            onClick={addTrigger}
            disabled={!triggerInput.trim()}
            aria-label="Add trigger"
          >
            <Plus className="size-4" />
          </Button>
        </div>
        {triggers.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {triggers.map((trigger) => (
              <Badge
                key={trigger}
                variant="secondary"
                className="gap-1 pr-1"
              >
                {trigger}
                <button
                  type="button"
                  onClick={() => removeTrigger(trigger)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                  aria-label={`Remove trigger: ${trigger}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Relief Factors */}
      <div className="space-y-2">
        <Label htmlFor="relief-factors">Relief Factors</Label>
        <div className="flex gap-2">
          <Input
            id="relief-factors"
            placeholder="Type a relief factor and press Enter..."
            value={reliefInput}
            onChange={(e) => setReliefInput(e.target.value)}
            onKeyDown={handleReliefKeyDown}
            className="min-h-[44px] flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="min-h-[44px] shrink-0"
            onClick={addReliefFactor}
            disabled={!reliefInput.trim()}
            aria-label="Add relief factor"
          >
            <Plus className="size-4" />
          </Button>
        </div>
        {reliefFactors.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {reliefFactors.map((factor) => (
              <Badge
                key={factor}
                variant="secondary"
                className="gap-1 pr-1"
              >
                {factor}
                <button
                  type="button"
                  onClick={() => removeReliefFactor(factor)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                  aria-label={`Remove relief factor: ${factor}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <Button
        size="lg"
        className="min-h-[44px] w-full"
        onClick={handleSubmit}
        disabled={!isValid || isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Symptom"
        )}
      </Button>
    </div>
  );
}
