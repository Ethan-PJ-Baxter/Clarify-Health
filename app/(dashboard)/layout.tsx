import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id, name, onboarding_complete")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Profile row missing (trigger may have failed) — send to onboarding
    // which will handle the case gracefully
    redirect("/onboarding");
  }

  if (!profile.onboarding_complete) {
    redirect("/onboarding");
  }

  const profileData = {
    id: profile.id,
    name: profile.name,
  };

  return (
    <div className="flex h-dvh">
      <Sidebar profile={profileData} className="hidden md:flex" />
      <div className="flex flex-1 flex-col min-w-0">
        <Header profile={profileData} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        <MobileNav className="md:hidden" />
      </div>
    </div>
  );
}
