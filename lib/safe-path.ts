export function safeInternalPath(value: string | null | undefined, fallback: string) {
  const path = String(value || "").trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\") || /[\r\n]/.test(path)) return fallback;
  return path;
}
