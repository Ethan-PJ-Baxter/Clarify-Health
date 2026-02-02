import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth";
import { updateSymptomSchema } from "@/lib/validations/symptoms";
import { sanitizeText, sanitizeArray } from "@/lib/utils/sanitize";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError, supabase, user } = await withAuth();
  if (authError) return authError;

  const { id } = await params;

  const { data, error } = await supabase
    .from("symptoms")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Symptom not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError, supabase, user } = await withAuth();
  if (authError) return authError;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateSymptomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};
  const data = parsed.data;

  if (data.body_part !== undefined) updates.body_part = sanitizeText(data.body_part);
  if (data.symptom_type !== undefined) updates.symptom_type = sanitizeText(data.symptom_type);
  if (data.severity !== undefined) updates.severity = data.severity;
  if (data.duration !== undefined) updates.duration = data.duration ? sanitizeText(data.duration) : null;
  if (data.description !== undefined) updates.description = data.description ? sanitizeText(data.description) : null;
  if (data.onset_date !== undefined) updates.onset_date = data.onset_date || null;
  if (data.triggers !== undefined) updates.triggers = sanitizeArray(data.triggers) || null;
  if (data.relief_factors !== undefined) updates.relief_factors = sanitizeArray(data.relief_factors) || null;
  if (data.medications !== undefined) updates.medications = sanitizeArray(data.medications) || null;
  if (data.photo_urls !== undefined) updates.photo_urls = data.photo_urls || null;
  if (data.body_coordinates !== undefined) updates.body_coordinates = data.body_coordinates || null;

  const { data: updated, error } = await supabase
    .from("symptoms")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Update symptom error:", error);
    return NextResponse.json(
      { error: "Failed to update symptom" },
      { status: 500 }
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: "Symptom not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError, supabase, user } = await withAuth();
  if (authError) return authError;

  const { id } = await params;

  // First fetch the symptom to get photo URLs for cleanup
  const { data: symptom } = await supabase
    .from("symptoms")
    .select("photo_urls")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  // Delete associated photos from storage
  if (symptom?.photo_urls?.length) {
    const paths = symptom.photo_urls
      .map((url: string) => {
        // Extract path from URL: {user_id}/{filename}
        const match = url.match(/symptom-photos\/(.+?)(?:\?|$)/);
        return match?.[1];
      })
      .filter(Boolean) as string[];

    if (paths.length > 0) {
      await supabase.storage.from("symptom-photos").remove(paths);
    }
  }

  const { error } = await supabase
    .from("symptoms")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete symptom" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
