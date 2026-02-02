import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SymptomLogWizard } from "@/components/symptoms/log/symptom-log-wizard";

export const metadata = {
  title: "Log Symptom",
  description: "Record a new symptom entry.",
};

export default async function LogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <SymptomLogWizard />;
}
