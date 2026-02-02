"use client";

import { Button } from "@/components/ui/button";
import type { ProfileData } from "./profile-step";
import type { MedicationEntry } from "./medications-step";

interface CompleteStepProps {
  profile: ProfileData;
  conditions: string[];
  medications: MedicationEntry[];
  onComplete: (goToLog: boolean) => void;
  isSaving: boolean;
}

export function CompleteStep({
  profile,
  conditions,
  medications,
  onComplete,
  isSaving,
}: CompleteStepProps) {
  const hasProfile = !!(
    profile.name ||
    profile.dateOfBirth ||
    profile.gpSurgery
  );
  const hasConditions = conditions.length > 0;
  const hasMedications = medications.length > 0;
  const hasSummary = hasProfile || hasConditions || hasMedications;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 12.75 6 6 9-13.5"
          />
        </svg>
      </div>

      <h1 className="mb-2 text-2xl font-bold tracking-tight">
        You&apos;re all set!
      </h1>
      <p className="mb-6 text-muted-foreground">
        Start tracking your symptoms to get the most out of Clarify.
      </p>

      {hasSummary && (
        <ul className="mb-8 w-full space-y-2 text-left">
          {hasProfile && (
            <li className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2.5 text-sm">
              <svg
                className="h-4 w-4 shrink-0 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              Profile saved
            </li>
          )}
          {hasConditions && (
            <li className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2.5 text-sm">
              <svg
                className="h-4 w-4 shrink-0 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              {conditions.length} condition{conditions.length !== 1 ? "s" : ""}{" "}
              added
            </li>
          )}
          {hasMedications && (
            <li className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2.5 text-sm">
              <svg
                className="h-4 w-4 shrink-0 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              {medications.length} medication
              {medications.length !== 1 ? "s" : ""} added
            </li>
          )}
        </ul>
      )}

      <div className="flex w-full flex-col gap-3">
        <Button
          onClick={() => onComplete(false)}
          disabled={isSaving}
          className="min-h-[44px] w-full text-base"
          size="lg"
        >
          {isSaving ? "Saving..." : "Go to Dashboard"}
        </Button>
        <Button
          variant="outline"
          onClick={() => onComplete(true)}
          disabled={isSaving}
          className="min-h-[44px] w-full text-base"
          size="lg"
        >
          Log Your First Symptom
        </Button>
      </div>
    </div>
  );
}
