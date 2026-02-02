import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SymptomTimeline } from "@/components/symptoms/timeline/symptom-timeline";

export const metadata = {
  title: "Timeline",
  description: "View and manage your symptom history.",
};

export default async function TimelinePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data, count } = await supabase
    .from("symptoms")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(0, 19);

  return (
    <SymptomTimeline
      initialSymptoms={data ?? []}
      initialTotal={count ?? 0}
    />
  );
}
