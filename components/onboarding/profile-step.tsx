"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ProfileData {
  name: string;
  dateOfBirth: string;
  gpSurgery: string;
}

interface ProfileStepProps {
  data: ProfileData;
  onNext: (data: ProfileData) => void;
  onSkip: () => void;
}

export function ProfileStep({ data, onNext, onSkip }: ProfileStepProps) {
  const [name, setName] = useState(data.name);
  const [dateOfBirth, setDateOfBirth] = useState(data.dateOfBirth);
  const [gpSurgery, setGpSurgery] = useState(data.gpSurgery);

  function handleContinue() {
    onNext({ name, dateOfBirth, gpSurgery });
  }

  return (
    <div className="flex flex-col">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">
        Tell us about yourself
      </h1>
      <p className="mb-6 text-muted-foreground">
        This helps personalise your experience. All fields are optional.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="min-h-[44px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob">Date of birth</Label>
          <Input
            id="dob"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="min-h-[44px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gp-surgery">GP Surgery</Label>
          <Input
            id="gp-surgery"
            type="text"
            placeholder="e.g. Riverside Medical Centre"
            value={gpSurgery}
            onChange={(e) => setGpSurgery(e.target.value)}
            maxLength={200}
            className="min-h-[44px]"
          />
        </div>
      </div>

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
          onClick={handleContinue}
          className="min-h-[44px] flex-1"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
