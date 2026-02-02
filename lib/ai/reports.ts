import { GoogleGenAI } from "@google/genai";
import type { ReportContent } from "@/lib/validations/reports";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const MODEL = "gemini-2.5-flash";

type SymptomRow = {
  body_part: string;
  symptom_type: string;
  severity: number | null;
  duration: string | null;
  description: string | null;
  onset_date: string | null;
  triggers: string[] | null;
  relief_factors: string[] | null;
  created_at: string | null;
};

type MedicationRow = {
  name: string;
  dosage: string | null;
  frequency: string | null;
  started_at: string;
  ended_at: string | null;
};

export async function generateSymptomReport(
  symptoms: SymptomRow[],
  medications: MedicationRow[],
  conditions: string[]
): Promise<ReportContent | null> {
  try {
    const symptomSummary = symptoms.map((s) => ({
      body_part: s.body_part,
      type: s.symptom_type,
      severity: s.severity,
      duration: s.duration,
      description: s.description,
      onset: s.onset_date,
      triggers: s.triggers,
      relief_factors: s.relief_factors,
      logged: s.created_at,
    }));

    const medicationSummary = medications.map((m) => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      started: m.started_at,
      ended: m.ended_at,
    }));

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `You are a medical report assistant for NHS patients. Generate a GP-ready symptom report.

Patient data:
- Symptoms logged: ${JSON.stringify(symptomSummary)}
- Current medications: ${JSON.stringify(medicationSummary)}
- Known conditions: ${JSON.stringify(conditions)}

Generate a comprehensive report with these sections:

1. executive_summary: 2-3 paragraph summary suitable for a GP appointment. Be factual, not diagnostic. Mention key symptom patterns, frequency, and severity trends.

2. symptom_breakdown: Statistical breakdown with:
   - by_type: array of { type, count, avg_severity } for each symptom type
   - by_body_part: array of { body_part, count, avg_severity } for each body part
   - total_count: total number of symptoms
   - avg_severity: overall average severity

3. patterns_detected: Array of { title, description, confidence } where confidence is "high", "medium", or "low". Look for:
   - Recurring symptoms in same body area
   - Severity trends (worsening/improving)
   - Temporal patterns (time-of-day, weekly)
   - Potential trigger correlations
   - Medication timing relationships

4. suggested_questions: 5-8 specific questions the patient could ask their GP based on the symptom data

5. nhs_links: 3-5 relevant NHS condition pages as { title, url, description }. URLs must be real nhs.uk pages (e.g., https://www.nhs.uk/conditions/...).

Return JSON only (no markdown, no code fences):
{
  "executive_summary": "string",
  "symptom_breakdown": { "by_type": [...], "by_body_part": [...], "total_count": number, "avg_severity": number },
  "patterns_detected": [{ "title": "string", "description": "string", "confidence": "high|medium|low" }],
  "suggested_questions": ["string"],
  "nhs_links": [{ "title": "string", "url": "string", "description": "string" }]
}

Important rules:
- Be factual and descriptive, NEVER diagnose
- Use medical terminology appropriately but keep language accessible
- Calculate statistics accurately from the provided data
- Only detect patterns that are genuinely supported by the data
- NHS links must be real, commonly known condition pages`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return null;

    const parsed = JSON.parse(text) as ReportContent;

    if (
      !parsed.executive_summary ||
      !parsed.symptom_breakdown ||
      !parsed.patterns_detected ||
      !parsed.suggested_questions
    ) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Gemini report generation error:", error);
    return null;
  }
}
