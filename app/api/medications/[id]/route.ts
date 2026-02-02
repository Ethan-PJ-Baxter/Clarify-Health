import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth";
import { updateMedicationSchema } from "@/lib/validations/medications";
import { sanitizeText } from "@/lib/utils/sanitize";

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

  const parsed = updateMedicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};
  const data = parsed.data;

  if (data.name !== undefined) updates.name = sanitizeText(data.name);
  if (data.dosage !== undefined)
    updates.dosage = data.dosage ? sanitizeText(data.dosage) : null;
  if (data.frequency !== undefined)
    updates.frequency = data.frequency ? sanitizeText(data.frequency) : null;
  if (data.started_at !== undefined) updates.started_at = data.started_at;
  if (data.notes !== undefined)
    updates.notes = data.notes ? sanitizeText(data.notes) : null;
  if (data.reason !== undefined)
    updates.reason = data.reason ? sanitizeText(data.reason) : null;
  if (data.ended_at !== undefined) updates.ended_at = data.ended_at;

  const { data: updated, error } = await supabase
    .from("medications")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Update medication error:", error);
    return NextResponse.json(
      { error: "Failed to update medication" },
      { status: 500 }
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: "Medication not found" },
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

  const { error } = await supabase
    .from("medications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Delete medication error:", error);
    return NextResponse.json(
      { error: "Failed to delete medication" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
