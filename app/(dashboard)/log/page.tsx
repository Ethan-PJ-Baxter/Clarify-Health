import { SymptomLogWizard } from "@/components/symptoms/log/symptom-log-wizard";

export const metadata = {
  title: "Log Symptom",
  description: "Record a new symptom entry.",
};

export default function LogPage() {
  return <SymptomLogWizard />;
}
