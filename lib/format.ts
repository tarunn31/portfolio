/** "Oct 7, 2026". Fixed locale and UTC so the server and the browser always agree. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}
