export const consoleRoutes = [
  { href: "/dashboard", label: "Dashboard", short: "Overview" },
  { href: "/projects", label: "Projects", short: "Projects" },
  { href: "/mappings", label: "Mappings", short: "Mappings" },
  { href: "/backlog-issues", label: "Backlog Issues", short: "Backlog" },
  { href: "/cis-issues", label: "CIS Issues", short: "CIS" },
  { href: "/translation-queue", label: "Translation Queue", short: "Queue" },
  { href: "/translation-glossary", label: "Translation Glossary", short: "Glossary" },
  { href: "/anomalies", label: "Anomalies", short: "Anomalies" },
  { href: "/sync-jobs", label: "Sync Jobs", short: "Jobs" },
  { href: "/journal", label: "Journal", short: "Journal" },
] as const;

export function isConsoleRoute(pathname: string) {
  return consoleRoutes.some((route) => pathname === route.href || pathname.startsWith(`${route.href}/`));
}
