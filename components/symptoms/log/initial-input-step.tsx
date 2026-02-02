"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyzeResponse } from "@/lib/validations/symptoms";

interface InitialInputStepProps {
  onComplete: (data: {
    description: string;
    analyzeResponse: AnalyzeResponse;
  }) => void;
  onFallback: () => void;
}

export function InitialInputStep({
  onComplete,
  onFallback,
}: InitialInputStepProps) {
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const charCount = description.length;
  const isValid = charCount >= 10;

  async function handleAnalyze() {
    if (!isValid) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/symptoms/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze symptoms");
      }

      const data = await response.json();

      if (data.fallback) {
        onFallback();
        return;
      }

      onComplete({ description, analyzeResponse: data as AnalyzeResponse });
    } catch {
      toast.error("Could not analyze your symptoms. Switching to manual entry.");
      onFallback();
    } finally {
      setIsAnalyzing(false);
    }
  }

  if (isAnalyzing) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Describe Your Symptom</h2>
          <p className="text-sm text-muted-foreground">
            Analyzing your symptoms...
          </p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="size-4 animate-pulse text-primary" />
          <span>Analyzing your symptoms...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Describe Your Symptom</h2>
        <p className="text-sm text-muted-foreground">
          Tell us what you are experiencing in your own words. The more detail
          you provide, the better we can help document it.
        </p>
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Describe what you're experiencing..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={6}
          className="min-h-[120px] resize-none"
        />
        <div className="flex justify-end">
          <span
            className={`text-xs ${
              charCount > 1900
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {charCount}/2000
          </span>
        </div>
      </div>

      <Button
        size="lg"
        className="min-h-[44px] w-full"
        disabled={!isValid}
        onClick={handleAnalyze}
      >
        <Sparkles className="size-4" />
        Analyze with AI
      </Button>

      {!isValid && charCount > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Please enter at least 10 characters to continue
        </p>
      )}
    </div>
  );
}
