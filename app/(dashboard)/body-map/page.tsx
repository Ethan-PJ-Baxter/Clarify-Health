import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BodyMapVisualization } from "@/components/body-map/body-map-visualization";

export const metadata = {
  title: "Body Map",
  description: "Visualize your symptoms on an interactive body diagram.",
};

export default async function BodyMapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("symptoms")
    .select(
      "id, body_part, body_coordinates, severity, symptom_type, created_at, description"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div className="container max-w-2xl py-6">
      <BodyMapVisualization initialSymptoms={data ?? []} />
    </div>
  );
}
