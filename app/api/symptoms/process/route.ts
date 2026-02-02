import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth";
import { processInputSchema } from "@/lib/validations/symptoms";
import { processSymptomEntry } from "@/lib/ai/gemini";
import { sanitizeText } from "@/lib/utils/sanitize";

export async function POST(request: Request) {
  const { error: authError } = await withAuth();
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = processInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { description, answers, body_part } = parsed.data;
  const sanitizedDescription = sanitizeText(description);

  const result = await processSymptomEntry(
    sanitizedDescription,
    answers.map((a) => ({
      question_id: a.question_id,
      question: a.question,
      answer: a.answer,
    })),
    body_part
  );

  if (!result) {
    // Return a basic structure so the client can still save
    return NextResponse.json({
      body_part,
      symptom_type: "unspecified",
      severity: 5,
      duration: "",
      description: sanitizedDescription,
      onset_date: null,
      triggers: [],
      relief_factors: [],
      ai_characteristics: {},
    });
  }

  return NextResponse.json(result);
}
