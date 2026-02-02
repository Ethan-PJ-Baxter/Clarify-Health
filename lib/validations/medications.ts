import { z } from "zod";

// --- API REQUEST SCHEMAS ---

export const createMedicationSchema = z.object({
  name: z
    .string()
    .min(1, "Medication name is required")
    .max(200, "Name must be under 200 characters"),
  dosage: z.string().max(200).optional(),
  frequency: z.string().max(200).optional(),
  started_at: z
    .string()
    .min(1, "Start date is required")
    .refine(
      (val) => !isNaN(new Date(val).getTime()),
      { message: "Invalid start date" }
    ),
  notes: z.string().max(2000).optional(),
  reason: z.string().max(500).optional(),
});

export const updateMedicationSchema = createMedicationSchema.partial().extend({
  ended_at: z
    .string()
    .refine(
      (val) => !isNaN(new Date(val).getTime()),
      { message: "Invalid end date" }
    )
    .optional()
    .nullable(),
});

export const medicationsQuerySchema = z.object({
  active: z.enum(["true", "false", "all"]).default("all"),
});

// --- INFERRED TYPES ---

export type CreateMedicationInput = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationInput = z.infer<typeof updateMedicationSchema>;
export type MedicationsQuery = z.infer<typeof medicationsQuerySchema>;
