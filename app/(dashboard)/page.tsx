import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import type { RegionCount } from "@/components/dashboard/mini-body-map";

function computeRegionCounts(
  symptoms: { body_part: string | null; severity: number | null }[]
): Record<string, RegionCount> {
  const counts: Record<string, { total: number; totalSeverity: number }> = {};
  for (const s of symptoms) {
    if (!s.body_part) continue;
    if (!counts[s.body_part]) {
      counts[s.body_part] = { total: 0, totalSeverity: 0 };
    }
    counts[s.body_part].total++;
    counts[s.body_part].totalSeverity += s.severity ?? 5;
  }
  const result: Record<string, RegionCount> = {};
  for (const [key, val] of Object.entries(counts)) {
    result[key] = {
      count: val.total,
      avgSeverity: val.totalSeverity / val.total,
    };
  }
  return result;
}

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

  const { data: recentSymptoms } = await supabase
    .from("symptoms")
    .select("body_part, severity")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const regionCounts = computeRegionCounts(recentSymptoms ?? []);

  return (
    <DashboardHome
      profileName={profile?.name ?? null}
      symptomCount={symptomCount ?? 0}
      medicationCount={medicationCount ?? 0}
      regionCounts={regionCounts}
    />
  );
}
