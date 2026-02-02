import { z } from "zod";

// --- API Request Schemas ---

export const analyzeInputSchema = z.object({
  description: z
    .string()
    .min(10, "Please describe your symptom in at least 10 characters")
    .max(2000, "Description must be under 2000 characters"),
});

const followUpAnswerSchema = z.object({
  question_id: z.string(),
  question: z.string(),
  answer: z.union([z.string(), z.number(), z.array(z.string())]),
});

export const processInputSchema = z.object({
  description: z.string().min(1),
  answers: z.array(followUpAnswerSchema),
  body_part: z.string().min(1),
  body_coordinates: z
    .object({
      x: z.number(),
      y: z.number(),
      view: z.enum(["front", "back"]),
    })
    .optional(),
  user_adjusted_location: z.boolean().default(false),
  photo_urls: z.array(z.string().url()).max(3).optional(),
});

export const createSymptomSchema = z.object({
  body_part: z.string().min(1, "Body part is required"),
  symptom_type: z.string().min(1, "Symptom type is required"),
  severity: z.number().int().min(1).max(10).optional(),
  duration: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  onset_date: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime()) && date <= new Date();
      },
      { message: "Date cannot be in the future" }
    ),
  triggers: z.array(z.string().max(200)).optional(),
  relief_factors: z.array(z.string().max(200)).optional(),
  medications: z.array(z.string().max(200)).optional(),
  photo_urls: z.array(z.string().url()).max(3).optional(),
  ai_conversation: z.any().optional(),
  ai_characteristics: z.any().optional(),
  body_coordinates: z.any().optional(),
  mapped_by_ai: z.boolean().optional(),
  user_adjusted_location: z.boolean().optional(),
});

export const updateSymptomSchema = createSymptomSchema.partial();

export const symptomsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(["newest", "oldest"]).default("newest"),
  search: z.string().max(200).optional(),
  body_part: z.string().optional(),
  symptom_type: z.string().optional(),
  severity_min: z.coerce.number().int().min(1).max(10).optional(),
  severity_max: z.coerce.number().int().min(1).max(10).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

// --- AI Response Types ---

export type FollowUpQuestion = {
  id: string;
  type: "multiple_choice" | "scale" | "text" | "date";
  question: string;
  options?: string[];
  required: boolean;
};

export type FollowUpAnswer = {
  question_id: string;
  question: string;
  answer: string | number | string[];
};

export type AnalyzeResponse = {
  questions: FollowUpQuestion[];
  suggested_location: {
    body_part: string;
    coordinates: { x: number; y: number };
    view: "front" | "back";
  };
  symptom_category: string;
};

export type ProcessedSymptom = {
  body_part: string;
  symptom_type: string;
  severity: number;
  duration: string;
  description: string;
  onset_date: string | null;
  triggers: string[];
  relief_factors: string[];
  ai_characteristics: Record<string, unknown>;
};

// --- Inferred Types ---

export type AnalyzeInput = z.infer<typeof analyzeInputSchema>;
export type ProcessInput = z.infer<typeof processInputSchema>;
export type CreateSymptomInput = z.infer<typeof createSymptomSchema>;
export type UpdateSymptomInput = z.infer<typeof updateSymptomSchema>;
export type SymptomsQuery = z.infer<typeof symptomsQuerySchema>;
