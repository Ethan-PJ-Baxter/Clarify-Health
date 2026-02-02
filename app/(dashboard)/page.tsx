import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHome } from "@/components/dashboard/dashboard-home";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  const { count: symptomCount } = await supabase
    .from("symptoms")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: medicationCount } = await supabase
    .from("medications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("ended_at", null);

  return (
    <DashboardHome
      profileName={profile?.name ?? null}
      symptomCount={symptomCount ?? 0}
      medicationCount={medicationCount ?? 0}
    />
  );
}
