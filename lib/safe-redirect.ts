/**
 * Allow only same-origin relative paths after auth (blocks open redirects).
 */
export function safeAuthRedirectPath(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "/wall";
  let path: string;
  try {
    path = decodeURIComponent(raw.trim());
  } catch {
    return "/wall";
  }
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return "/wall";
  }
  return path;
}
