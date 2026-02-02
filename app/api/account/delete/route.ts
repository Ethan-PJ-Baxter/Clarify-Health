import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/auth";
import { deleteAccountSchema } from "@/lib/validations/settings";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const { error: authError, supabase, user } = await withAuth();
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!user.email) {
    return NextResponse.json(
      { error: "Email required for account deletion" },
      { status: 400 }
    );
  }

  // Re-authenticate to confirm identity
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.password,
  });

  if (signInError) {
    return NextResponse.json(
      { error: "Incorrect password" },
      { status: 401 }
    );
  }

  // Delete all user data from all tables
  const deleteResults = await Promise.all([
    supabase.from("reports").delete().eq("user_id", user.id),
    supabase.from("symptoms").delete().eq("user_id", user.id),
    supabase.from("medications").delete().eq("user_id", user.id),
    supabase.from("user_profiles").delete().eq("id", user.id),
  ]);

  const failures = deleteResults.filter((r) => r.error);
  if (failures.length > 0) {
    console.error("Account deletion data failure:", failures);
    return NextResponse.json(
      { error: "Failed to delete account data. Please try again or contact support." },
      { status: 500 }
    );
  }

  // Delete auth user via admin client
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(
    user.id
  );

  if (deleteUserError) {
    console.error("Delete auth user error:", deleteUserError);
    return NextResponse.json(
      { error: "Failed to delete account. Please contact support." },
      { status: 500 }
    );
  }

  // Sign out
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
