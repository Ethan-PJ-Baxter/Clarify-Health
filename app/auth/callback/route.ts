import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_REDIRECTS = ["/", "/onboarding", "/reset-password"];

function getSafeRedirect(next: string | null): string {
  if (!next) return "/";
  // Must start with / and not // (prevents open redirect)
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  // Must match an allowed path prefix
  if (ALLOWED_REDIRECTS.some((path) => next === path || next.startsWith(path + "/"))) return next;
  return "/";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirect(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
