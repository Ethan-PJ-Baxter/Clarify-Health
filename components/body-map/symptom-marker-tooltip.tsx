"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye } from "lucide-react";
import { getBodyPartLabel } from "@/components/symptoms/body-map";
import {
  getSeverityLabel,
  getSeverityTailwindClass,
} from "@/lib/utils/severity";
import type { BodyMapSymptom } from "./heatmap";

interface SymptomMarkerTooltipProps {
  symptom: BodyMapSymptom | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewDetails: (symptomId: string) => void;
}

export function SymptomMarkerTooltip({
  symptom,
  open,
  onOpenChange,
  onViewDetails,
}: SymptomMarkerTooltipProps) {
  if (!symptom) return null;

  const severity = symptom.severity ?? 5;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {symptom.symptom_type ?? "Symptom"}
            <Badge
              variant="secondary"
              className={getSeverityTailwindClass(severity)}
            >
              {getSeverityLabel(severity)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {symptom.body_part ? getBodyPartLabel(symptom.body_part) : "Unknown area"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {symptom.description && (
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {symptom.description}
            </p>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            {new Date(symptom.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>

          <Button
            variant="default"
            size="sm"
            className="w-full gap-2"
            onClick={() => onViewDetails(symptom.id)}
          >
            <Eye className="size-4" />
            View full details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
