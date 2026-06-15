/**
 * Formats an ISO timestamp as a short relative/absolute label for chat
 * lists and message bubbles, e.g. "2m", "3h", "Yesterday", "Mon", "12/03".
 */
export function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return "";

  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24 && date.getDate() === now.getDate()) return `${diffHr}h`;
  if (diffDay === 1 || (diffHr < 48 && date.getDate() !== now.getDate())) return "Yesterday";
  if (diffDay < 7) return date.toLocaleDateString(undefined, { weekday: "short" });

  return date.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" });
}

/**
 * Formats an ISO timestamp as a time-of-day label for message bubbles,
 * e.g. "9:41 AM".
 */
export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
