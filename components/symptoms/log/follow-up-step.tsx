"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  getSeverityLabel,
  getSeverityTailwindClass,
} from "@/lib/utils/severity";
import { cn } from "@/lib/utils";
import type { FollowUpQuestion, FollowUpAnswer } from "@/lib/validations/symptoms";

interface FollowUpStepProps {
  questions: FollowUpQuestion[];
  onComplete: (answers: FollowUpAnswer[]) => void;
  onBack: () => void;
}

export function FollowUpStep({
  questions,
  onComplete,
  onBack,
}: FollowUpStepProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<FollowUpAnswer[]>([]);
  const [textValue, setTextValue] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [scaleValue, setScaleValue] = useState(5);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  const question = questions[currentIndex];
  const totalQuestions = questions.length;
  const today = new Date().toISOString().split("T")[0];

  const advanceToNext = useCallback(
    (answer: FollowUpAnswer) => {
      const updatedAnswers = [...answers, answer];
      setAnswers(updatedAnswers);

      if (currentIndex + 1 >= totalQuestions) {
        onComplete(updatedAnswers);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setTextValue("");
        setDateValue("");
        setScaleValue(5);
      }
    },
    [answers, currentIndex, totalQuestions, onComplete]
  );

  function handleMultipleChoiceSelect(option: string) {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
    }

    const answer: FollowUpAnswer = {
      question_id: question.id,
      question: question.question,
      answer: option,
    };

    advanceTimerRef.current = setTimeout(() => {
      advanceToNext(answer);
    }, 300);
  }

  function handleScaleConfirm() {
    advanceToNext({
      question_id: question.id,
      question: question.question,
      answer: scaleValue,
    });
  }

  function handleTextSubmit() {
    if (!textValue.trim()) return;
    advanceToNext({
      question_id: question.id,
      question: question.question,
      answer: textValue.trim(),
    });
  }

  function handleDateSubmit() {
    if (!dateValue) return;
    advanceToNext({
      question_id: question.id,
      question: question.question,
      answer: dateValue,
    });
  }

  if (!question) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Follow-up Questions</h2>
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{question.question}</CardTitle>
          {question.required && (
            <CardDescription>This question is required</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {question.type === "multiple_choice" && question.options && (
            <div className="flex flex-wrap gap-2">
              {question.options.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant="outline"
                  className="min-h-[44px]"
                  onClick={() => handleMultipleChoiceSelect(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {question.type === "scale" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">1</span>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-medium",
                    getSeverityTailwindClass(scaleValue)
                  )}
                >
                  {scaleValue} - {getSeverityLabel(scaleValue)}
                </span>
                <span className="text-sm text-muted-foreground">10</span>
              </div>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[scaleValue]}
                onValueChange={(val) => setScaleValue(val[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
                <span>Critical</span>
              </div>
              <Button
                size="lg"
                className="min-h-[44px] w-full"
                onClick={handleScaleConfirm}
              >
                Confirm
              </Button>
            </div>
          )}

          {question.type === "text" && (
            <div className="space-y-4">
              <Input
                placeholder="Type your answer..."
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                className="min-h-[44px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTextSubmit();
                }}
              />
              <Button
                size="lg"
                className="min-h-[44px] w-full"
                disabled={!textValue.trim()}
                onClick={handleTextSubmit}
              >
                Next
              </Button>
            </div>
          )}

          {question.type === "date" && (
            <div className="space-y-4">
              <Input
                type="date"
                value={dateValue}
                max={today}
                onChange={(e) => setDateValue(e.target.value)}
                className="min-h-[44px]"
              />
              <Button
                size="lg"
                className="min-h-[44px] w-full"
                disabled={!dateValue}
                onClick={handleDateSubmit}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
