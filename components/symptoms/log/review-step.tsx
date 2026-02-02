"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, MapPin, Clock, Calendar, Zap, Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBodyPartLabel } from "@/components/symptoms/body-map";
import {
  getSeverityLabel,
  getSeverityTailwindClass,
} from "@/lib/utils/severity";
import { cn } from "@/lib/utils";
import type { FollowUpAnswer, ProcessedSymptom } from "@/lib/validations/symptoms";

interface ReviewStepProps {
  description: string;
  answers: FollowUpAnswer[];
  bodyPart: string;
  coordinates: { x: number; y: number; view: "front" | "back" };
  photoUrls: string[];
  userAdjusted: boolean;
  symptomCategory: string;
  onSave: (symptomData: Record<string, unknown>) => void;
  onBack: () => void;
  isSaving: boolean;
}

export function ReviewStep({
  description,
  answers,
  bodyPart,
  coordinates,
  photoUrls,
  userAdjusted,
  symptomCategory,
  onSave,
  onBack,
  isSaving,
}: ReviewStepProps) {
  const [processed, setProcessed] = useState<ProcessedSymptom | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function processSymptom() {
      setIsProcessing(true);
      try {
        const response = await fetch("/api/symptoms/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description,
            answers,
            body_part: bodyPart,
            body_coordinates: coordinates,
            user_adjusted_location: userAdjusted,
            photo_urls: photoUrls.length > 0 ? photoUrls : undefined,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to process symptom");
        }

        const data: ProcessedSymptom = await response.json();
        if (!cancelled) {
          setProcessed(data);
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to process your symptom data. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setIsProcessing(false);
        }
      }
    }

    processSymptom();
    return () => {
      cancelled = true;
    };
  }, [description, answers, bodyPart, coordinates, userAdjusted, photoUrls]);

  function handleSave() {
    if (!processed) return;

    onSave({
      body_part: processed.body_part,
      symptom_type: processed.symptom_type,
      severity: processed.severity,
      duration: processed.duration,
      description: processed.description,
      onset_date: processed.onset_date,
      triggers: processed.triggers,
      relief_factors: processed.relief_factors,
      ai_characteristics: processed.ai_characteristics,
      ai_conversation: {
        original_description: description,
        follow_up_answers: answers,
        symptom_category: symptomCategory,
      },
      body_coordinates: coordinates,
      mapped_by_ai: true,
      user_adjusted_location: userAdjusted,
      photo_urls: photoUrls.length > 0 ? photoUrls : undefined,
    });
  }

  if (isProcessing) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Processing Your Symptom</h2>
          <p className="text-sm text-muted-foreground">
            Organizing your symptom information...
          </p>
        </div>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!processed) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Review Your Symptom</h2>
          <p className="text-sm text-destructive">
            Something went wrong while processing your symptom. Please go back
            and try again.
          </p>
        </div>
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Review Your Symptom</h2>
        <p className="text-sm text-muted-foreground">
          Please review the information below before saving.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              {getBodyPartLabel(processed.body_part)}
            </span>
            <Badge
              className={cn(
                "pointer-events-none",
                getSeverityTailwindClass(processed.severity)
              )}
            >
              {processed.severity}/10 - {getSeverityLabel(processed.severity)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Symptom Type */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Symptom Type
            </p>
            <p className="text-sm">{processed.symptom_type}</p>
          </div>

          {/* Duration */}
          {processed.duration && (
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Duration
                </p>
                <p className="text-sm">{processed.duration}</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Description
            </p>
            <p className="text-sm leading-relaxed">{processed.description}</p>
          </div>

          {/* Onset Date */}
          {processed.onset_date && (
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Onset Date
                </p>
                <p className="text-sm">{processed.onset_date}</p>
              </div>
            </div>
          )}

          {/* Triggers */}
          {processed.triggers.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Zap className="size-3" />
                Triggers
              </p>
              <div className="flex flex-wrap gap-1.5">
                {processed.triggers.map((trigger) => (
                  <Badge key={trigger} variant="outline">
                    {trigger}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Relief Factors */}
          {processed.relief_factors.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Heart className="size-3" />
                Relief Factors
              </p>
              <div className="flex flex-wrap gap-1.5">
                {processed.relief_factors.map((factor) => (
                  <Badge key={factor} variant="outline">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Photos */}
          {photoUrls.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Photos
              </p>
              <div className="grid grid-cols-3 gap-2">
                {photoUrls.map((url, index) => (
                  <div
                    key={url}
                    className="aspect-square overflow-hidden rounded-lg border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Symptom photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="min-h-[44px] w-full"
        onClick={handleSave}
        disabled={isSaving}
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

      <Button
        variant="ghost"
        onClick={onBack}
        className="min-h-[44px] text-muted-foreground"
        size="lg"
        disabled={isSaving}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>
    </div>
  );
}
