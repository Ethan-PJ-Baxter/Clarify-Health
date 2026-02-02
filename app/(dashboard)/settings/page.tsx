import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsPage as SettingsPageClient } from "@/components/settings/settings-page";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("name, date_of_birth, gp_surgery, conditions")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <SettingsPageClient
      email={user.email ?? ""}
      profile={{
        name: profile?.name ?? "",
        date_of_birth: profile?.date_of_birth ?? "",
        gp_surgery: profile?.gp_surgery ?? "",
        conditions: profile?.conditions ?? [],
      }}
    />
  );
}
