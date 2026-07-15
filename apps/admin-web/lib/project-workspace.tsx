"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch, ApiClientError } from "./api-client";
import { Dialog, Button, StatePanel } from "../components/ui";
import { useAuth } from "./auth";

export const ACTIVE_PROJECT_KEY = "cis_active_project_id";

export function clearActiveProject() {
  clearStoredProject();
}

export type WorkspaceProject = {
  id: number;
  name: string;
  enabled?: boolean;
  [key: string]: unknown;
};

export type WorkspaceState = "loading" | "unselected" | "resolving" | "ready" | "invalid" | "disabled" | "unavailable";

type WorkspaceContextValue = {
  activeProject: WorkspaceProject | null;
  activeProjectId: number | null;
  projects: WorkspaceProject[];
  state: WorkspaceState;
  error: string;
  refreshProjects: () => Promise<void>;
  refreshWorkspace: () => Promise<void>;
  openWorkspace: (project: WorkspaceProject) => boolean;
  clearWorkspace: () => void;
  dirtySources: string[];
  setDirtySource: (id: string, dirty: boolean) => void;
  requestNavigation: (href: string) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function readActiveId() {
  if (typeof window === "undefined") return null;
  const parsed = Number.parseInt(window.sessionStorage.getItem(ACTIVE_PROJECT_KEY) || "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function clearStoredProject() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(ACTIVE_PROJECT_KEY);
}

function messageFor(error: unknown) {
  if (error instanceof ApiClientError && error.status === 401) return "Your session expired. Sign in again.";
  return error instanceof Error ? error.message : "Projects could not be loaded.";
}

export function ProjectWorkspaceProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [state, setState] = useState<WorkspaceState>("loading");
  const [error, setError] = useState("");
  const [dirtyMap, setDirtyMap] = useState<Record<string, boolean>>({});
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const requestId = useRef(0);

  const refreshProjects = useCallback(async () => {
    if (status !== "authenticated") return;
    const currentRequest = ++requestId.current;
    const storedId = readActiveId();
    setError("");
    setState(storedId ? "resolving" : "loading");
    try {
      const listed = await apiFetch<WorkspaceProject[]>("/api/v1/projects");
      if (currentRequest !== requestId.current) return;
      setProjects(listed || []);
      if (!storedId) {
        setActiveProjectId(null);
        setState("unselected");
        return;
      }
      const active = (listed || []).find((project) => project.id === storedId);
      if (!active) {
        clearStoredProject();
        setActiveProjectId(null);
        setState("invalid");
        return;
      }
      if (active.enabled === false) {
        clearStoredProject();
        setActiveProjectId(null);
        setState("disabled");
        return;
      }
      setActiveProjectId(active.id);
      setState("ready");
    } catch (loadError) {
      if (currentRequest !== requestId.current) return;
      setError(messageFor(loadError));
      setState(loadError instanceof ApiClientError && loadError.status === 401 ? "unselected" : "unavailable");
    }
  }, [status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (status === "authenticated") void refreshProjects();
      if (status === "unauthenticated") {
        clearStoredProject();
        setProjects([]);
        setActiveProjectId(null);
        setState("loading");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshProjects, status]);

  const activeProject = useMemo(() => projects.find((project) => project.id === activeProjectId) || null, [activeProjectId, projects]);
  const dirtySources = useMemo(() => Object.entries(dirtyMap).filter(([, dirty]) => dirty).map(([id]) => id), [dirtyMap]);

  const setDirtySource = useCallback((id: string, dirty: boolean) => {
    setDirtyMap((current) => ({ ...current, [id]: dirty }));
  }, []);

  const openWorkspace = useCallback((project: WorkspaceProject) => {
    if (!project.id || project.enabled === false) return false;
    requestId.current += 1;
    window.sessionStorage.setItem(ACTIVE_PROJECT_KEY, String(project.id));
    setActiveProjectId(project.id);
    setProjects((current) => current.some((item) => item.id === project.id) ? current : [...current, project]);
    setState("ready");
    return true;
  }, []);

  const clearWorkspace = useCallback(() => {
    requestId.current += 1;
    clearStoredProject();
    setActiveProjectId(null);
    setState("unselected");
  }, []);

  const requestNavigation = useCallback((href: string) => {
    if (dirtySources.length) {
      setPendingHref(href);
      return;
    }
    router.push(href);
  }, [dirtySources.length, router]);

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (!dirtySources.length || event.defaultPrevented || event.button !== 0) return;
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(target instanceof HTMLAnchorElement) || target.dataset.bypassDirty === "true") return;
      if (target.origin !== window.location.origin || target.target === "_blank") return;
      event.preventDefault();
      setPendingHref(target.href.replace(window.location.origin, "") || "/");
    }
    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, [dirtySources.length]);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirtySources.length) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirtySources.length]);

  const value = useMemo<WorkspaceContextValue>(() => ({
    activeProject,
    activeProjectId,
    projects,
    state,
    error,
    refreshProjects,
    refreshWorkspace: refreshProjects,
    openWorkspace,
    clearWorkspace,
    dirtySources,
    setDirtySource,
    requestNavigation,
  }), [activeProject, activeProjectId, clearWorkspace, dirtySources, error, openWorkspace, projects, refreshProjects, requestNavigation, setDirtySource, state]);

  const confirmDiscard = () => {
    setDirtyMap({});
    const next = pendingHref;
    setPendingHref(null);
    if (next) router.push(next);
  };

  return <WorkspaceContext.Provider value={value}>
    {children}
    {pendingHref ? <Dialog className="max-w-md rounded-xl p-5" label="Unsaved changes" onClose={() => setPendingHref(null)}>
      <h2 className="text-primary text-lg font-semibold">Leave with unsaved changes?</h2>
      <p className="text-secondary mt-2 text-sm">Your draft is still open in {dirtySources.join(", ")}.</p>
      <div className="mt-5 flex justify-end gap-2"><Button onClick={() => setPendingHref(null)} variant="secondary">Stay</Button><Button onClick={confirmDiscard} variant="danger">Discard and continue</Button></div>
    </Dialog> : null}
  </WorkspaceContext.Provider>;
}

export function useProjectWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useProjectWorkspace must be used inside ProjectWorkspaceProvider.");
  return context;
}

function GateAction({ href = "/projects", label = "Open Projects" }: { href?: string; label?: string }) {
  return <Link className="ui-button ui-button--primary inline-flex" href={href}>{label}</Link>;
}

export function WorkspaceGate({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, error, refreshProjects } = useProjectWorkspace();
  const isProjects = pathname === "/projects" || pathname.startsWith("/projects/");
  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const projectScopedList = ["/mappings", "/backlog-issues", "/cis-issues", "/translation-queue", "/translation-glossary", "/anomalies", "/sync-jobs", "/journal"];
  const isProjectScopedList = projectScopedList.some((route) => pathname === route);
  const { activeProjectId } = useProjectWorkspace();

  useEffect(() => {
    if (state !== "ready" || !activeProjectId || !isProjectScopedList) return;
    if (searchParams.get("project_id") === String(activeProjectId)) return;
    const query = new URLSearchParams(searchParams.toString());
    query.set("project_id", String(activeProjectId));
    router.replace(`${pathname}?${query.toString()}`);
  }, [activeProjectId, isProjectScopedList, pathname, router, searchParams, state]);

  if (isProjects || isDashboard) return <>{children}</>;
  if (state === "loading" || state === "resolving") return <StatePanel title="Preparing workspace" message="Confirming the active Project before loading operations…" />;
  if (state === "unavailable") return <StatePanel title="Workspace unavailable" message={error || "Project authority could not be reached."} action={<Button onClick={() => void refreshProjects()} variant="primary">Retry</Button>} />;
  if (state === "invalid") return <StatePanel title="Project no longer exists" message="Choose another Project to continue." action={<GateAction label="Choose Project" />} />;
  if (state === "disabled") return <StatePanel title="Project is disabled" message="Re-enable this Project in Projects before opening an operations workspace." action={<GateAction label="Open Projects" />} />;
  if (state === "ready") return <>{children}</>;
  const next = typeof window === "undefined" ? pathname : `${pathname}${window.location.search}`;
  return <StatePanel title="Choose a Project first" message="Operations stay scoped to one Project. Select or create it in Projects to continue." action={<GateAction href={`/projects?next=${encodeURIComponent(next)}`} label="Choose or create Project" />} />;
}

export const ProjectWorkspaceGate = WorkspaceGate;
