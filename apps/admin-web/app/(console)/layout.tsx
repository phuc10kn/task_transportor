"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { AuthGuard, useAuth } from "../../lib/auth";
import { consoleRoutes } from "../../lib/route-registry";
import { Button } from "../../components/ui";
import { ThemeToggle } from "../../components/theme-toggle";
import { ProjectWorkspaceGate, ProjectWorkspaceProvider, useProjectWorkspace } from "../../lib/project-workspace";

function NavIcon({ href }: { href: string }) {
  const common = { fill: "none", height: 20, viewBox: "0 0 24 24", width: 20 };
  const paths: Record<string, React.ReactNode> = {
    "/dashboard": <><rect height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" width="7" x="3" y="3" /><rect height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" width="7" x="14" y="3" /><rect height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" width="7" x="3" y="14" /><rect height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" width="7" x="14" y="14" /></>,
    "/projects": <path d="M3.5 7.5h6l1.8 2H20.5v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7.5Zm0 0V6a2 2 0 0 1 2-2h3l2 2h8a2 2 0 0 1 2 2v1.5" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />,
    "/mappings": <><path d="M4 7h12m0 0-3-3m3 3-3 3M20 17H8m0 0 3-3m-3 3 3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></>,
    "/backlog-issues": <><path d="M12 3v10m0 0 4-4m-4 4L8 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /><path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></>,
    "/cis-issues": <><ellipse cx="12" cy="5.5" rx="7.5" ry="2.5" stroke="currentColor" strokeWidth="1.7" /><path d="M4.5 5.5v6c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-6m-15 6v6c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-6" stroke="currentColor" strokeWidth="1.7" /></>,
    "/translation-queue": <><path d="M4 5h16v11H9l-5 4V5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" /><path d="M8 9h8m-8 3h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></>,
    "/translation-glossary": <><path d="M5 4.5h5.5A2.5 2.5 0 0 1 13 7v13H7a2 2 0 0 1-2-2V4.5Zm14 0h-3.5A2.5 2.5 0 0 0 13 7v13h4a2 2 0 0 0 2-2V4.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" /></>,
    "/anomalies": <><path d="M12 3.5 21 19H3L12 3.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" /><path d="M12 9v4.5m0 2.5v.1" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></>,
    "/sync-jobs": <><rect height="14" rx="2" stroke="currentColor" strokeWidth="1.7" width="16" x="4" y="5" /><path d="M8 9h8M8 12h5m-5 3h7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></>,
    "/journal": <><path d="M6 4h9l3 3v13H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" /><path d="M15 4v4h4M8 12h8m-8 3h8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></>,
  };
  return <svg aria-hidden="true" {...common}>{paths[href]}</svg>;
}

function Navigation({ pathname, mobile = false }: { pathname: string; mobile?: boolean }) {
  const { state } = useProjectWorkspace();
  return <nav aria-label={mobile ? "Mobile primary" : "Primary"} className="space-y-1">
    {consoleRoutes.map((route) => {
      const active = pathname === route.href || pathname.startsWith(`${route.href}/`);
      const disabled = route.href === "/dashboard" || (route.href !== "/projects" && state !== "ready");
      const reason = route.href === "/dashboard" ? "Chờ BE project scope" : "Chọn Project để mở workspace";
      if (disabled) return <span aria-current={active ? "page" : undefined} aria-disabled="true" className={`nav-link nav-link--disabled ${active ? "nav-link--active" : ""}`} key={route.href} title={reason}><NavIcon href={route.href} /><span>{route.label}</span><small className="sr-only">{reason}</small></span>;
      return <Link aria-current={active ? "page" : undefined} className={`nav-link ${active ? "nav-link--active" : ""}`} href={route.href} key={route.href}>
        <NavIcon href={route.href} />
        <span>{route.label}</span>
      </Link>;
    })}
  </nav>;
}

function ConsoleShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const { admin, logout } = useAuth();
  const { activeProject, state } = useProjectWorkspace();
  const [refreshing, setRefreshing] = React.useState(false);
  const currentRoute = consoleRoutes.find((route) => pathname === route.href) || consoleRoutes.find((route) => pathname.startsWith(`${route.href}/`));

  function refresh() {
    if (state !== "ready" || pathname === "/dashboard") return;
    setRefreshing(true);
    window.dispatchEvent(new CustomEvent("cis-global-refresh", { detail: { pathname } }));
    window.setTimeout(() => setRefreshing(false), 450);
  }

  return <div className="app-shell min-h-screen">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <div className="app-frame flex min-h-screen">
      <aside className="app-sidebar hidden w-[264px] shrink-0 border-r lg:flex lg:flex-col">
        <div className="app-brand flex items-center gap-3 px-6 py-6">
          <span aria-hidden="true" className="app-brand__mark">C</span>
          <div><p className="text-primary text-base font-semibold tracking-tight">CIS Console</p><p className="text-subtle mt-0.5 text-xs">Central Sync Hub</p></div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <p className="app-nav-heading mb-3 px-3">Workspace</p>
          <Navigation pathname={pathname} />
        </div>
        <div className="app-sidebar__footer m-4 rounded-lg p-3">
          <p className="text-subtle text-[11px] font-medium uppercase tracking-[0.12em]">Data flow</p>
          <div className="data-flow mt-2"><span>System</span><b>→</b><strong>CIS</strong><b>→</b><span>System</span></div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="app-header sticky top-0 z-30 border-b px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center gap-3">
            <details className="console-mobile-nav lg:hidden">
              <summary aria-label="Open navigation" className="ui-button ui-button--icon list-none">
                <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></svg>
              </summary>
              <div className="console-mobile-nav__panel"><div className="mb-3 px-3"><p className="text-primary font-semibold">CIS Console</p><p className="text-subtle text-xs">Central Sync Hub</p></div><Navigation mobile pathname={pathname} /></div>
            </details>
            <div className="min-w-0"><p className="text-primary truncate text-base font-semibold">{currentRoute?.label || "CIS Operations"}</p><p className="text-subtle mt-0.5 hidden text-xs sm:block">Operator workspace</p></div>
            <div className="ml-auto flex items-center gap-2">
              {activeProject ? <Link aria-label="Change active Project" className="workspace-chip inline-flex max-w-40 truncate sm:max-w-56" href="/projects">{activeProject.name} <span>· #{activeProject.id}</span></Link> : <Link className="workspace-chip workspace-chip--empty inline-flex" href="/projects">Chọn Project</Link>}
              <ThemeToggle />
              <Button aria-label="Refresh current route" className="header-action whitespace-nowrap" disabled={refreshing || state !== "ready" || pathname === "/dashboard"} onClick={refresh}>{refreshing ? "Refreshing…" : "Refresh"}</Button>
              <div className="admin-identity hidden items-center gap-2 pl-2 md:flex"><span aria-hidden="true" className="admin-avatar">{admin?.email?.slice(0, 1).toUpperCase() || "A"}</span><span className="text-secondary max-w-40 truncate text-xs">{admin?.email}</span></div>
              <Button className="header-action whitespace-nowrap" onClick={logout} variant="ghost">Sign out</Button>
            </div>
          </div>
        </header>
        <main id="main-content" className="app-content mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  </div>;
}

export default function ConsoleLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthGuard><ProjectWorkspaceProvider><ConsoleShell><ProjectWorkspaceGate>{children}</ProjectWorkspaceGate></ConsoleShell></ProjectWorkspaceProvider></AuthGuard>;
}
