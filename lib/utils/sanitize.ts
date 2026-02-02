/**
 * Strip HTML tags and encode special characters to prevent XSS.
 * Used on all user text inputs before DB writes.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Sanitize an array of strings.
 */
export function sanitizeArray(arr: string[] | undefined): string[] | undefined {
  if (!arr) return undefined;
  return arr.map(sanitizeText);
}
