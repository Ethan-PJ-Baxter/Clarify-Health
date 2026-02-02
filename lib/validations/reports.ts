import { z } from "zod";

// --- API REQUEST SCHEMAS ---

export const generateReportSchema = z.object({
  date_range_start: z
    .string()
    .min(1, "Start date is required")
    .refine(
      (val) => !isNaN(new Date(val).getTime()),
      { message: "Invalid start date" }
    ),
  date_range_end: z
    .string()
    .min(1, "End date is required")
    .refine(
      (val) => !isNaN(new Date(val).getTime()),
      { message: "Invalid end date" }
    ),
}).refine(
  (data) => new Date(data.date_range_start) <= new Date(data.date_range_end),
  { message: "Start date must be before end date", path: ["date_range_start"] }
);

export const reportQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// --- REPORT CONTENT TYPES ---

export type SymptomBreakdown = {
  by_type: { type: string; count: number; avg_severity: number }[];
  by_body_part: { body_part: string; count: number; avg_severity: number }[];
  total_count: number;
  avg_severity: number;
};

export type Pattern = {
  title: string;
  description: string;
  confidence: "high" | "medium" | "low";
};

export type NhsLink = {
  title: string;
  url: string;
  description: string;
};

export type ReportContent = {
  executive_summary: string;
  symptom_breakdown: SymptomBreakdown;
  patterns_detected: Pattern[];
  suggested_questions: string[];
  nhs_links: NhsLink[];
};

// --- INFERRED TYPES ---

export type GenerateReportInput = z.infer<typeof generateReportSchema>;
export type ReportQuery = z.infer<typeof reportQuerySchema>;
