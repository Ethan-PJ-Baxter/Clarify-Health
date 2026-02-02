"use client";

import { useMediaQuery } from "@/lib/utils/use-media-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar } from "lucide-react";
import {
  getBodyPartLabel,
  getSubRegions,
  getParentRegionId,
} from "./region-data";
import {
  getSeverityLabel,
  getSeverityTailwindClass,
} from "@/lib/utils/severity";
import type { BodyMapSymptom } from "./heatmap";

interface RegionSymptomListProps {
  regionId: string | null;
  symptoms: BodyMapSymptom[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSymptomSelect: (symptom: BodyMapSymptom) => void;
  onLogNew: (regionId: string) => void;
}

function filterSymptomsForRegion(
  symptoms: BodyMapSymptom[],
  regionId: string | null
): BodyMapSymptom[] {
  return symptoms.filter((s) => {
    if (!s.body_part || !regionId) return false;
    // Exact match
    if (s.body_part === regionId) return true;
    // Symptom's parent region matches the selected region
    if (getParentRegionId(s.body_part) === regionId) return true;
    // Selected region is a sub-region, and symptom is on the parent
    const subRegions = getSubRegions(s.body_part);
    if (subRegions.some((r) => r.id === regionId)) return true;
    return false;
  });
}

function SymptomListContent({
  regionId,
  symptoms,
  onSymptomSelect,
  onLogNew,
}: Omit<RegionSymptomListProps, "open" | "onOpenChange">) {
  const regionSymptoms = filterSymptomsForRegion(symptoms, regionId);

  return (
    <div className="flex flex-col gap-3">
      {regionSymptoms.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No symptoms logged for this area
        </p>
      ) : (
        <ScrollArea className="max-h-[300px]">
          <div className="flex flex-col gap-2 pr-3">
            {regionSymptoms.map((symptom) => {
              const severity = symptom.severity ?? 5;
              return (
                <button
                  key={symptom.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/50"
                  onClick={() => onSymptomSelect(symptom)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {symptom.symptom_type ?? "Unknown"}
                      </span>
                      <Badge
                        variant="secondary"
                        className={getSeverityTailwindClass(severity)}
                      >
                        {getSeverityLabel(severity)}
                      </Badge>
                    </div>
                    {symptom.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {symptom.description}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="size-3" />
                      {new Date(symptom.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {regionId && (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => onLogNew(regionId)}
        >
          <PlusCircle className="size-4" />
          Log symptom here
        </Button>
      )}
    </div>
  );
}

export function RegionSymptomList({
  regionId,
  symptoms,
  open,
  onOpenChange,
  onSymptomSelect,
  onLogNew,
}: RegionSymptomListProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const label = regionId ? getBodyPartLabel(regionId) : "";
  const count = filterSymptomsForRegion(symptoms, regionId).length;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              {count} symptom{count !== 1 ? "s" : ""} in this area
            </DialogDescription>
          </DialogHeader>
          <SymptomListContent
            regionId={regionId}
            symptoms={symptoms}
            onSymptomSelect={onSymptomSelect}
            onLogNew={onLogNew}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[70vh]">
        <SheetHeader>
          <SheetTitle>{label}</SheetTitle>
          <SheetDescription>
            {count} symptom{count !== 1 ? "s" : ""} in this area
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          <SymptomListContent
            regionId={regionId}
            symptoms={symptoms}
            onSymptomSelect={onSymptomSelect}
            onLogNew={onLogNew}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
