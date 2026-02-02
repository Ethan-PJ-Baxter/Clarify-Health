import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().max(200).optional(),
  date_of_birth: z
    .string()
    .refine(
      (val) => !val || !isNaN(new Date(val).getTime()),
      { message: "Invalid date" }
    )
    .optional()
    .nullable(),
  gp_surgery: z.string().max(500).optional().nullable(),
  conditions: z.array(z.string().max(200)).optional().nullable(),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const exportDataSchema = z.object({
  format: z.enum(["json", "csv"]),
});

// --- INFERRED TYPES ---

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type ExportDataInput = z.infer<typeof exportDataSchema>;
