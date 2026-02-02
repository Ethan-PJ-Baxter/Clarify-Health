"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Camera } from "lucide-react";
import { getBodyPartLabel } from "@/components/symptoms/body-map";
import {
  getSeverityLabel,
  getSeverityTailwindClass,
} from "@/lib/utils/severity";
import type { Tables } from "@/lib/supabase/types";

type Symptom = Tables<"symptoms">;

interface SymptomCardProps {
  symptom: Symptom;
  onClick: () => void;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function SymptomCardInner({ symptom, onClick }: SymptomCardProps) {
  const severity = symptom.severity ?? 0;
  const severityLabel = getSeverityLabel(severity);
  const severityClass = getSeverityTailwindClass(severity);
  const photoCount = symptom.photo_urls?.length ?? 0;

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent/50 active:bg-accent/70"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${getBodyPartLabel(symptom.body_part)} - ${symptom.symptom_type}, severity ${severity} out of 10`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardContent className="flex items-start gap-3 p-4 min-h-[44px]">
        {/* Left: date and body part */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">
              {getBodyPartLabel(symptom.body_part)}
            </span>
            <Badge
              className={cn("text-xs font-medium border-0", severityClass)}
            >
              {severityLabel} &middot; {severity}/10
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            {symptom.symptom_type}
          </p>

          {symptom.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {symptom.description}
            </p>
          )}

          <div className="flex items-center gap-3 pt-0.5">
            <time
              className="text-xs text-muted-foreground"
              dateTime={symptom.created_at ?? undefined}
            >
              {formatDate(symptom.created_at)}
            </time>

            {photoCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Camera className="size-3" />
                {photoCount}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const SymptomCard = memo(SymptomCardInner);
