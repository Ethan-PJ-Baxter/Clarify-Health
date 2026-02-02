import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

type AuthResult =
  | { error: NextResponse; supabase: null; user: null }
  | { error: null; supabase: SupabaseClient; user: User };

export async function withAuth(): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      supabase: null,
      user: null,
    };
  }

  return { error: null, supabase, user };
}
