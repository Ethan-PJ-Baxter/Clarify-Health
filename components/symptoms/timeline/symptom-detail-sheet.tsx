"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, Calendar, Clock, Activity } from "lucide-react";
import { getBodyPartLabel } from "@/components/symptoms/body-map";
import {
  getSeverityLabel,
  getSeverityTailwindClass,
} from "@/lib/utils/severity";
import type { Tables, Json } from "@/lib/supabase/types";

type Symptom = Tables<"symptoms">;

interface SymptomDetailSheetProps {
  symptom: Symptom | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Not recorded";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatShortDate(dateString: string | null): string {
  if (!dateString) return "Not recorded";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div>{children}</div>
    </div>
  );
}

function BadgeList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, index) => (
        <Badge key={`${item}-${index}`} variant="secondary" className="text-xs">
          {item}
        </Badge>
      ))}
    </div>
  );
}

function renderAiCharacteristics(data: Json | null) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;

  const entries = Object.entries(data as Record<string, Json>);
  if (entries.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {entries.map(([key, value]) => (
        <div key={key} className="flex justify-between gap-2 text-sm">
          <span className="text-muted-foreground capitalize">
            {key.replace(/_/g, " ")}
          </span>
          <span className="font-medium text-right">
            {typeof value === "string"
              ? value
              : typeof value === "number" || typeof value === "boolean"
                ? String(value)
                : JSON.stringify(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SymptomDetailSheet({
  symptom,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: SymptomDetailSheetProps) {
  if (!symptom) return null;

  const severity = symptom.severity ?? 0;
  const severityLabel = getSeverityLabel(severity);
  const severityClass = getSeverityTailwindClass(severity);
  const photos = symptom.photo_urls ?? [];
  const triggers = symptom.triggers ?? [];
  const reliefFactors = symptom.relief_factors ?? [];
  const medications = symptom.medications ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 sm:max-w-md">
        <SheetHeader className="px-6 pt-6 pb-0">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg">
                {getBodyPartLabel(symptom.body_part)}
              </SheetTitle>
              <SheetDescription className="mt-1">
                {symptom.symptom_type}
              </SheetDescription>
            </div>
            <Badge
              className={cn("text-xs font-medium border-0 shrink-0", severityClass)}
            >
              {severityLabel} &middot; {severity}/10
            </Badge>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-5 py-4">
            {/* Date created */}
            <DetailRow label="Recorded">
              <div className="flex items-center gap-1.5 text-sm">
                <Calendar className="size-3.5 text-muted-foreground" />
                {formatDate(symptom.created_at)}
              </div>
            </DetailRow>

            {/* Description */}
            {symptom.description && (
              <DetailRow label="Description">
                <p className="text-sm whitespace-pre-wrap">
                  {symptom.description}
                </p>
              </DetailRow>
            )}

            {/* Duration */}
            {symptom.duration && (
              <DetailRow label="Duration">
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="size-3.5 text-muted-foreground" />
                  {symptom.duration}
                </div>
              </DetailRow>
            )}

            {/* Onset date */}
            {symptom.onset_date && (
              <DetailRow label="Onset date">
                <p className="text-sm">{formatShortDate(symptom.onset_date)}</p>
              </DetailRow>
            )}

            <Separator />

            {/* Triggers */}
            {triggers.length > 0 && (
              <DetailRow label="Triggers">
                <BadgeList items={triggers} />
              </DetailRow>
            )}

            {/* Relief factors */}
            {reliefFactors.length > 0 && (
              <DetailRow label="Relief factors">
                <BadgeList items={reliefFactors} />
              </DetailRow>
            )}

            {/* Medications */}
            {medications.length > 0 && (
              <DetailRow label="Medications at time">
                <BadgeList items={medications} />
              </DetailRow>
            )}

            {(triggers.length > 0 ||
              reliefFactors.length > 0 ||
              medications.length > 0) && <Separator />}

            {/* Photos */}
            {photos.length > 0 && (
              <DetailRow label="Photos">
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square overflow-hidden rounded-lg border bg-muted"
                    >
                      <img
                        src={url}
                        alt={`Symptom photo ${index + 1}`}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    </a>
                  ))}
                </div>
              </DetailRow>
            )}

            {/* AI characteristics */}
            {symptom.ai_characteristics && (
              <DetailRow label="AI characteristics">
                <div className="rounded-lg border bg-muted/50 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Activity className="size-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      AI Analysis
                    </span>
                  </div>
                  {renderAiCharacteristics(symptom.ai_characteristics)}
                </div>
              </DetailRow>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="border-t px-6 py-4">
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 min-h-[44px] gap-1.5"
              onClick={onEdit}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="flex-1 min-h-[44px] gap-1.5"
              onClick={onDelete}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
