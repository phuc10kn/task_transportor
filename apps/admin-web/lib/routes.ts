const consoleRoutes = [
  "/dashboard",
  "/projects",
  "/mappings",
  "/backlog-issues",
  "/cis-issues",
  "/translation-queue",
  "/translation-glossary",
  "/anomalies",
  "/sync-jobs",
  "/journal",
];

export function isAllowedIntendedPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return false;
  let pathname = value;
  try {
    pathname = new URL(value, "http://cis.local").pathname;
  } catch {
    return false;
  }
  return consoleRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function safeIntendedPath(value: string | null | undefined) {
  if (!isAllowedIntendedPath(value) || value === "/dashboard" || value?.startsWith("/dashboard?")) return "/backlog-issues";
  return value!;
}
