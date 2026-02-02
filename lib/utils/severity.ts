export function getSeverityColor(severity: number): string {
  if (severity <= 3) return "var(--severity-low)";
  if (severity <= 5) return "var(--severity-medium)";
  if (severity <= 7) return "var(--severity-high)";
  return "var(--severity-critical)";
}

export function getSeverityLabel(severity: number): string {
  if (severity <= 3) return "Mild";
  if (severity <= 5) return "Moderate";
  if (severity <= 7) return "Severe";
  return "Critical";
}

export function getSeverityTailwindClass(severity: number): string {
  if (severity <= 3) return "bg-green-500/15 text-green-700 dark:text-green-400";
  if (severity <= 5) return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400";
  if (severity <= 7) return "bg-orange-500/15 text-orange-700 dark:text-orange-400";
  return "bg-red-500/15 text-red-700 dark:text-red-400";
}
