"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { InitialInputStep } from "./initial-input-step";
import { FollowUpStep } from "./follow-up-step";
import { BodyMapStep } from "./body-map-step";
import { PhotoUploadStep } from "./photo-upload-step";
import { ReviewStep } from "./review-step";
import { ManualEntryForm } from "./manual-entry-form";
import type { AnalyzeResponse, FollowUpAnswer } from "@/lib/validations/symptoms";

const STEP_TITLES = ["Describe", "Questions", "Location", "Photos", "Review"];
const TOTAL_STEPS = STEP_TITLES.length;

export function SymptomLogWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isManual, setIsManual] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Accumulated wizard data
  const [description, setDescription] = useState("");
  const [analyzeResponse, setAnalyzeResponse] =
    useState<AnalyzeResponse | null>(null);
  const [answers, setAnswers] = useState<FollowUpAnswer[]>([]);
  const [bodyPart, setBodyPart] = useState("");
  const [bodyCoordinates, setBodyCoordinates] = useState<{
    x: number;
    y: number;
    view: "front" | "back";
  }>({ x: 0, y: 0, view: "front" });
  const [userAdjusted, setUserAdjusted] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const progressValue = ((currentStep + 1) / TOTAL_STEPS) * 100;

  // Step 1 complete: AI analysis succeeded
  const handleInitialComplete = useCallback(
    (data: { description: string; analyzeResponse: AnalyzeResponse }) => {
      setDescription(data.description);
      setAnalyzeResponse(data.analyzeResponse);
      setCurrentStep(1);
    },
    []
  );

  // Step 1 fallback: AI analysis failed, switch to manual
  const handleFallback = useCallback(() => {
    setIsManual(true);
  }, []);

  // Step 2 complete: follow-up questions answered
  const handleFollowUpComplete = useCallback(
    (completedAnswers: FollowUpAnswer[]) => {
      setAnswers(completedAnswers);
      setCurrentStep(2);
    },
    []
  );

  // Step 3 complete: body location confirmed
  const handleBodyMapComplete = useCallback(
    (data: {
      bodyPart: string;
      coordinates: { x: number; y: number; view: "front" | "back" };
      userAdjusted: boolean;
    }) => {
      setBodyPart(data.bodyPart);
      setBodyCoordinates(data.coordinates);
      setUserAdjusted(data.userAdjusted);
      setCurrentStep(3);
    },
    []
  );

  // Step 4 complete: photos uploaded (or skipped)
  const handlePhotoComplete = useCallback((urls: string[]) => {
    setPhotoUrls(urls);
    setCurrentStep(4);
  }, []);

  // Step 5 / Manual: save the symptom
  async function handleSave(symptomData: Record<string, unknown>) {
    setIsSaving(true);
    try {
      const response = await fetch("/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(symptomData),
      });

      if (!response.ok) {
        throw new Error("Failed to save symptom");
      }

      toast.success("Symptom logged successfully!");
      router.push("/timeline");
    } catch {
      toast.error("Failed to save your symptom. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  // Back navigation for each step
  function goBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }

  // Manual entry mode
  if (isManual) {
    return (
      <Card className="border-0 shadow-lg sm:border">
        <CardContent className="p-6 sm:p-8">
          <ManualEntryForm onSave={handleSave} isSaving={isSaving} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg sm:border">
      <CardContent className="p-6 sm:p-8">
        {/* Progress header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {TOTAL_STEPS}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {STEP_TITLES[currentStep]}
            </span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        {/* Step content */}
        {currentStep === 0 && (
          <InitialInputStep
            onComplete={handleInitialComplete}
            onFallback={handleFallback}
          />
        )}

        {currentStep === 1 && analyzeResponse && (
          <FollowUpStep
            questions={analyzeResponse.questions}
            onComplete={handleFollowUpComplete}
            onBack={goBack}
          />
        )}

        {currentStep === 2 && analyzeResponse && (
          <BodyMapStep
            suggestedPart={analyzeResponse.suggested_location.body_part}
            suggestedCoords={analyzeResponse.suggested_location.coordinates}
            suggestedView={analyzeResponse.suggested_location.view}
            onComplete={handleBodyMapComplete}
            onBack={goBack}
          />
        )}

        {currentStep === 3 && (
          <PhotoUploadStep onComplete={handlePhotoComplete} onBack={goBack} />
        )}

        {currentStep === 4 && analyzeResponse && (
          <ReviewStep
            description={description}
            answers={answers}
            bodyPart={bodyPart}
            coordinates={bodyCoordinates}
            photoUrls={photoUrls}
            userAdjusted={userAdjusted}
            symptomCategory={analyzeResponse.symptom_category}
            onSave={handleSave}
            onBack={goBack}
            isSaving={isSaving}
          />
        )}
      </CardContent>
    </Card>
  );
}
