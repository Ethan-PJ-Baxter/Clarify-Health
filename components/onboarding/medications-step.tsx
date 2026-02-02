"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface MedicationEntry {
  name: string;
  dosage?: string;
  frequency?: string;
}

interface MedicationsStepProps {
  data: MedicationEntry[];
  onNext: (medications: MedicationEntry[]) => void;
  onSkip: () => void;
}

export function MedicationsStep({
  data,
  onNext,
  onSkip,
}: MedicationsStepProps) {
  const [medications, setMedications] = useState<MedicationEntry[]>(data);
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");

  function handleAdd() {
    const trimmedName = medName.trim();
    if (!trimmedName) return;

    setMedications((prev) => [
      ...prev,
      {
        name: trimmedName,
        dosage: dosage.trim() || undefined,
        frequency: frequency.trim() || undefined,
      },
    ]);
    setMedName("");
    setDosage("");
    setFrequency("");
  }

  function handleRemove(index: number) {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="flex flex-col">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">
        Any current medications?
      </h1>
      <p className="mb-6 text-muted-foreground">
        We&apos;ll track these alongside your symptoms. You can always update
        later.
      </p>

      <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
        <div className="space-y-2">
          <Label htmlFor="med-name">Medication name</Label>
          <Input
            id="med-name"
            type="text"
            placeholder="e.g. Ibuprofen"
            value={medName}
            onChange={(e) => setMedName(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={100}
            className="min-h-[44px]"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="med-dosage">Dosage</Label>
            <Input
              id="med-dosage"
              type="text"
              placeholder="e.g. 500mg"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={50}
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="med-frequency">Frequency</Label>
            <Input
              id="med-frequency"
              type="text"
              placeholder="e.g. Twice daily"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={50}
              className="min-h-[44px]"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleAdd}
          disabled={!medName.trim()}
          className="min-h-[44px] w-full"
          size="lg"
        >
          Add Medication
        </Button>
      </div>

      {medications.length > 0 && (
        <ul className="mt-4 space-y-2">
          {medications.map((med, index) => (
            <li
              key={index}
              className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
            >
              <div>
                <p className="font-medium">{med.name}</p>
                {(med.dosage || med.frequency) && (
                  <p className="text-sm text-muted-foreground">
                    {[med.dosage, med.frequency].filter(Boolean).join(" - ")}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="ml-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove ${med.name}`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex gap-3">
        <Button
          variant="outline"
          onClick={onSkip}
          className="min-h-[44px] flex-1"
          size="lg"
        >
          Skip
        </Button>
        <Button
          onClick={() => onNext(medications)}
          className="min-h-[44px] flex-1"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
