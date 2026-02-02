import { GoogleGenAI } from "@google/genai";
import type {
  AnalyzeResponse,
  FollowUpAnswer,
  ProcessedSymptom,
} from "@/lib/validations/symptoms";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const MODEL = "gemini-2.5-flash";

export async function analyzeSymptomDescription(
  description: string
): Promise<AnalyzeResponse | null> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `You are a medical symptom documentation assistant. Your job is to help patients accurately describe their symptoms for their doctor - you do NOT diagnose.

Patient described: "${description}"

Generate 3-5 follow-up questions to gather complete symptom information. Questions should cover:
- Location precision (if not clear)
- Characteristics (size, appearance, sensation, quality)
- Severity (1-10 scale)
- Timeline (when started, duration, changes over time)
- Triggers and relief factors

Also suggest the body location and symptom category.

Return JSON only (no markdown, no code fences):
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice" | "scale" | "text" | "date",
      "question": "string",
      "options": ["array", "of", "options"] | null,
      "required": true
    }
  ],
  "suggested_location": {
    "body_part": "string (one of: head, neck, chest, abdomen, upper_back, lower_back, left_shoulder, right_shoulder, left_arm, right_arm, left_hand, right_hand, left_hip, right_hip, left_leg, right_leg, left_foot, right_foot)",
    "coordinates": { "x": number, "y": number },
    "view": "front" | "back"
  },
  "symptom_category": "string"
}

Important rules:
- Always include exactly one question with type "scale" for severity (1-10)
- Always include exactly one question with type "date" for when it started
- The rest should be "multiple_choice" or "text"
- For multiple_choice, always provide 3-5 options
- Generate between 3 and 5 questions total`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return null;

    const parsed = JSON.parse(text) as AnalyzeResponse;

    // Validate structure minimally
    if (!parsed.questions?.length || !parsed.suggested_location?.body_part) {
      return null;
    }

    // Ensure all questions have IDs
    parsed.questions = parsed.questions.map((q, i) => ({
      ...q,
      id: q.id || `q${i + 1}`,
      required: q.required ?? true,
    }));

    return parsed;
  } catch (error) {
    console.error("Gemini analyze error:", error);
    return null;
  }
}

export async function processSymptomEntry(
  description: string,
  answers: FollowUpAnswer[],
  bodyPart: string
): Promise<ProcessedSymptom | null> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Structure this symptom conversation into a medical entry format.

Initial description: "${description}"
Follow-up Q&A: ${JSON.stringify(answers)}
Selected body part: "${bodyPart}"

Return JSON only (no markdown, no code fences):
{
  "body_part": "string",
  "symptom_type": "string (e.g., pain, rash, swelling, fatigue, numbness, etc.)",
  "severity": number (1-10),
  "duration": "string (e.g., 3 days, 2 weeks)",
  "description": "string - concise medical-style summary of the symptom",
  "onset_date": "YYYY-MM-DD string or null if unknown",
  "triggers": ["array of trigger strings"] or [],
  "relief_factors": ["array of relief factor strings"] or [],
  "ai_characteristics": {
    "size": "string or null",
    "appearance": "string or null",
    "color": "string or null",
    "texture": "string or null",
    "sensation": "string or null",
    "pattern": "string or null",
    "changes_over_time": "string or null"
  }
}

Rules:
- Use the body_part from the selected location
- Severity must be an integer 1-10
- Description should be a professional medical-style summary, 1-3 sentences
- onset_date must be in YYYY-MM-DD format or null
- Be thorough but concise`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return null;

    const parsed = JSON.parse(text) as ProcessedSymptom;

    // Validate required fields
    if (!parsed.body_part || !parsed.symptom_type) {
      return null;
    }

    // Clamp severity
    if (parsed.severity) {
      parsed.severity = Math.max(1, Math.min(10, Math.round(parsed.severity)));
    }

    return parsed;
  } catch (error) {
    console.error("Gemini process error:", error);
    return null;
  }
}
