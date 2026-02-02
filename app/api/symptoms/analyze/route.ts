import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth";
import { analyzeInputSchema } from "@/lib/validations/symptoms";
import { analyzeSymptomDescription } from "@/lib/ai/gemini";
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

  const parsed = analyzeInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const description = sanitizeText(parsed.data.description);
  const result = await analyzeSymptomDescription(description);

  if (!result) {
    return NextResponse.json({ fallback: true }, { status: 200 });
  }

  return NextResponse.json(result);
}
