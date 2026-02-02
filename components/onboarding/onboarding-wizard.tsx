"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WelcomeStep } from "./welcome-step";
import { ProfileStep, type ProfileData } from "./profile-step";
import { ConditionsStep } from "./conditions-step";
import { MedicationsStep, type MedicationEntry } from "./medications-step";
import { CompleteStep } from "./complete-step";

const TOTAL_STEPS = 5;

interface OnboardingWizardProps {
  userId: string;
}

export function OnboardingWizard({ userId }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    dateOfBirth: "",
    gpSurgery: "",
  });
  const [conditions, setConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<MedicationEntry[]>([]);

  const progressValue = ((currentStep + 1) / TOTAL_STEPS) * 100;

  const goNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
  }, []);

  const goBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  async function handleComplete(goToLog: boolean) {
    setIsSaving(true);
    try {
      const supabase = createClient();

      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          name: profile.name || null,
          date_of_birth: profile.dateOfBirth || null,
          gp_surgery: profile.gpSurgery || null,
          conditions: conditions.length > 0 ? conditions : null,
          onboarding_complete: true,
        })
        .eq("id", userId);

      if (profileError) {
        throw profileError;
      }

      if (medications.length > 0) {
        const medicationRows = medications.map((med) => ({
          user_id: userId,
          name: med.name,
          dosage: med.dosage || null,
          frequency: med.frequency || null,
          started_at: new Date().toISOString().split("T")[0],
        }));

        const { error: medsError } = await supabase
          .from("medications")
          .insert(medicationRows);

        if (medsError) {
          throw medsError;
        }
      }

      toast.success("Profile saved successfully!");

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Onboarding save error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleProfileNext(data: ProfileData) {
    setProfile(data);
    goNext();
  }

  function handleConditionsNext(data: string[]) {
    setConditions(data);
    goNext();
  }

  function handleMedicationsNext(data: MedicationEntry[]) {
    setMedications(data);
    goNext();
  }

  return (
    <Card className="border-0 shadow-lg sm:border">
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {TOTAL_STEPS}
            </span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        {currentStep === 0 && <WelcomeStep onNext={goNext} />}

        {currentStep === 1 && (
          <ProfileStep
            data={profile}
            onNext={handleProfileNext}
            onSkip={goNext}
          />
        )}

        {currentStep === 2 && (
          <ConditionsStep
            data={conditions}
            onNext={handleConditionsNext}
            onSkip={goNext}
          />
        )}

        {currentStep === 3 && (
          <MedicationsStep
            data={medications}
            onNext={handleMedicationsNext}
            onSkip={goNext}
          />
        )}

        {currentStep === 4 && (
          <CompleteStep
            profile={profile}
            conditions={conditions}
            medications={medications}
            onComplete={handleComplete}
            isSaving={isSaving}
          />
        )}

        {currentStep > 0 && currentStep < 4 && (
          <div className="mt-4">
            <Button
              variant="ghost"
              onClick={goBack}
              className="min-h-[44px] text-muted-foreground"
              size="lg"
            >
              <svg
                className="mr-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
              Back
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
