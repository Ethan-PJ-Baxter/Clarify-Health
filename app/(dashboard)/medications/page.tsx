import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MedicationManager } from "@/components/medications/medication-manager";

export default async function MedicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: medications } = await supabase
    .from("medications")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  return <MedicationManager initialMedications={medications ?? []} />;
}
