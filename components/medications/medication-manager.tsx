"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pill, Plus, ChevronDown, ChevronUp, Trash2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MedicationFormDialog } from "./medication-form-dialog";
import { StopMedicationDialog } from "./stop-medication-dialog";

type Medication = {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  started_at: string;
  ended_at: string | null;
  notes: string | null;
  reason: string | null;
  created_at: string | null;
};

interface MedicationManagerProps {
  initialMedications: Medication[];
}

export function MedicationManager({
  initialMedications,
}: MedicationManagerProps) {
  const [medications, setMedications] =
    useState<Medication[]>(initialMedications);
  const [addOpen, setAddOpen] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [stopTarget, setStopTarget] = useState<Medication | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const active = medications.filter((m) => !m.ended_at);
  const past = medications.filter((m) => m.ended_at);

  function handleCreated(med: Medication) {
    setMedications((prev) => [med, ...prev]);
    setAddOpen(false);
  }

  function handleStopped(updated: Medication) {
    setMedications((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
    setStopTarget(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/medications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMedications((prev) => prev.filter((m) => m.id !== id));
      toast.success("Medication deleted");
    } catch {
      toast.error("Failed to delete medication");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Medications</h2>
          <p className="text-sm text-muted-foreground">
            Track your current and past medications
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="min-h-[44px]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Medication
        </Button>
      </div>

      {/* Active Medications */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Active ({active.length})
        </h3>
        {active.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Pill className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mb-1 text-sm font-medium">
                No active medications
              </p>
              <p className="text-xs text-muted-foreground">
                Add a medication to start tracking
              </p>
            </CardContent>
          </Card>
        ) : (
          active.map((med) => (
            <Card key={med.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{med.name}</CardTitle>
                    {med.dosage && (
                      <CardDescription>{med.dosage}</CardDescription>
                    )}
                  </div>
                  <Badge variant="default" className="shrink-0">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {med.frequency && <span>{med.frequency}</span>}
                  <span>Started {formatDate(med.started_at)}</span>
                  {med.reason && <span>For: {med.reason}</span>}
                </div>
                {med.notes && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {med.notes}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-[44px]"
                    onClick={() => setStopTarget(med)}
                  >
                    <Square className="mr-1.5 h-3.5 w-3.5" />
                    Stop
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-[44px] text-destructive hover:text-destructive"
                    onClick={() => handleDelete(med.id)}
                    disabled={deletingId === med.id}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Past Medications */}
      {past.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowPast(!showPast)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPast ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Past Medications ({past.length})
          </button>
          {showPast &&
            past.map((med) => (
              <Card key={med.id} className="opacity-75">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{med.name}</CardTitle>
                      {med.dosage && (
                        <CardDescription>{med.dosage}</CardDescription>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      Stopped
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {med.frequency && <span>{med.frequency}</span>}
                    <span>
                      {formatDate(med.started_at)} —{" "}
                      {med.ended_at ? formatDate(med.ended_at) : "Present"}
                    </span>
                  </div>
                  <div className="mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-[44px] text-destructive hover:text-destructive"
                      onClick={() => handleDelete(med.id)}
                      disabled={deletingId === med.id}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      <MedicationFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={handleCreated}
      />

      {stopTarget && (
        <StopMedicationDialog
          medication={stopTarget}
          open={!!stopTarget}
          onOpenChange={(open) => !open && setStopTarget(null)}
          onStopped={handleStopped}
        />
      )}
    </div>
  );
}
