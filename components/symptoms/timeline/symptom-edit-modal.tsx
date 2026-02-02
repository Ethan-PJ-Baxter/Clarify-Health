"use client";

import { useState, useEffect, useCallback, type KeyboardEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  getSeverityLabel,
  getSeverityTailwindClass,
} from "@/lib/utils/severity";
import { cn } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";

type Symptom = Tables<"symptoms">;

interface SymptomEditModalProps {
  symptom: Symptom | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: Symptom) => void;
}

function MultiTagInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  const [inputValue, setInputValue] = useState("");

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (!values.includes(trimmed)) {
        onChange([...values, trimmed]);
      }
      setInputValue("");
    }
  }

  function handleRemove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((item, index) => (
            <Badge key={index} variant="secondary" className="gap-1 text-xs">
              {item}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="ml-0.5 rounded-full hover:bg-muted-foreground/20 min-h-[44px] min-w-[20px] inline-flex items-center justify-center"
                aria-label={`Remove ${item}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[44px]"
      />
      <p className="text-xs text-muted-foreground">
        Type and press Enter to add
      </p>
    </div>
  );
}

export function SymptomEditModal({
  symptom,
  open,
  onOpenChange,
  onSaved,
}: SymptomEditModalProps) {
  const [saving, setSaving] = useState(false);
  const [bodyPart, setBodyPart] = useState("");
  const [symptomType, setSymptomType] = useState("");
  const [severity, setSeverity] = useState(5);
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [onsetDate, setOnsetDate] = useState("");
  const [triggers, setTriggers] = useState<string[]>([]);
  const [reliefFactors, setReliefFactors] = useState<string[]>([]);

  // Reset form when symptom changes
  useEffect(() => {
    if (symptom) {
      setBodyPart(symptom.body_part);
      setSymptomType(symptom.symptom_type);
      setSeverity(symptom.severity ?? 5);
      setDuration(symptom.duration ?? "");
      setDescription(symptom.description ?? "");
      setOnsetDate(symptom.onset_date ?? "");
      setTriggers(symptom.triggers ?? []);
      setReliefFactors(symptom.relief_factors ?? []);
    }
  }, [symptom]);

  const handleSave = useCallback(async () => {
    if (!symptom) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/symptoms/${symptom.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body_part: bodyPart,
          symptom_type: symptomType,
          severity,
          duration: duration || null,
          description: description || null,
          onset_date: onsetDate || null,
          triggers: triggers.length > 0 ? triggers : null,
          relief_factors: reliefFactors.length > 0 ? reliefFactors : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update symptom");
      }

      const json = await response.json();
      const data = json.data;
      if (!data) {
        throw new Error("Invalid response from server");
      }
      toast("Symptom updated");
      onSaved(data);
      onOpenChange(false);
    } catch {
      toast.error("Failed to update symptom. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [
    symptom,
    bodyPart,
    symptomType,
    severity,
    duration,
    description,
    onsetDate,
    triggers,
    reliefFactors,
    onSaved,
    onOpenChange,
  ]);

  if (!symptom) return null;

  const today = new Date().toISOString().split("T")[0];
  const severityLabel = getSeverityLabel(severity);
  const severityClass = getSeverityTailwindClass(severity);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Edit Symptom</DialogTitle>
          <DialogDescription>
            Update the details for this symptom entry.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-5 py-4">
            {/* Body part */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-body-part">Body part</Label>
              <Input
                id="edit-body-part"
                value={bodyPart}
                onChange={(e) => setBodyPart(e.target.value)}
                className="min-h-[44px]"
              />
            </div>

            {/* Symptom type */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-symptom-type">Symptom type</Label>
              <Input
                id="edit-symptom-type"
                value={symptomType}
                onChange={(e) => setSymptomType(e.target.value)}
                className="min-h-[44px]"
              />
            </div>

            {/* Severity slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Severity</Label>
                <Badge
                  className={cn("text-xs font-medium border-0", severityClass)}
                >
                  {severityLabel} &middot; {severity}/10
                </Badge>
              </div>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[severity]}
                onValueChange={([val]) => setSeverity(val)}
                aria-label="Severity"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 - Mild</span>
                <span>10 - Critical</span>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-duration">Duration</Label>
              <Input
                id="edit-duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 2 hours, 3 days"
                className="min-h-[44px]"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="min-h-[44px]"
              />
            </div>

            {/* Onset date */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-onset-date">Onset date</Label>
              <Input
                id="edit-onset-date"
                type="date"
                value={onsetDate}
                max={today}
                onChange={(e) => setOnsetDate(e.target.value)}
                className="min-h-[44px]"
              />
            </div>

            {/* Triggers */}
            <MultiTagInput
              label="Triggers"
              values={triggers}
              onChange={setTriggers}
              placeholder="Add a trigger..."
            />

            {/* Relief factors */}
            <MultiTagInput
              label="Relief factors"
              values={reliefFactors}
              onChange={setReliefFactors}
              placeholder="Add a relief factor..."
            />
          </div>
        </ScrollArea>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            variant="outline"
            size="lg"
            className="min-h-[44px]"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            className="min-h-[44px] gap-1.5"
            onClick={handleSave}
            disabled={saving || !bodyPart.trim() || !symptomType.trim()}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
