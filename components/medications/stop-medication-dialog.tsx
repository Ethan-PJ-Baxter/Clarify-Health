"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

interface StopMedicationDialogProps {
  medication: Medication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStopped: (medication: Medication) => void;
}

export function StopMedicationDialog({
  medication,
  open,
  onOpenChange,
  onStopped,
}: StopMedicationDialogProps) {
  const [stopping, setStopping] = useState(false);

  async function handleStop() {
    setStopping(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/medications/${medication.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ended_at: today }),
      });

      if (!res.ok) throw new Error();

      const { data: updated } = await res.json();
      toast.success(`${medication.name} marked as stopped`);
      onStopped(updated);
    } catch {
      toast.error("Failed to stop medication");
    } finally {
      setStopping(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Stop Medication</DialogTitle>
          <DialogDescription>
            Are you sure you want to mark <strong>{medication.name}</strong> as
            stopped? This will set the end date to today.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStop}
            disabled={stopping}
            className="min-h-[44px]"
          >
            {stopping ? "Stopping..." : "Stop Medication"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
