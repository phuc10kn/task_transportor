"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge, Button, StatePanel } from "../../../components/ui";
import { ApiClientError, apiFetch } from "../../../lib/api-client";
import { useProjectWorkspace } from "../../../lib/project-workspace";

type Project = { id: number; name: string; backlog_project_key?: string; backlog_issue_key_prefix?: string };
type FilterOption = { id: number; name: string };
type ActionReadiness = { enabled: boolean; execution_mode?: string; consumer_ready?: boolean; disabled_reasons?: string[] };
type Readiness = { actions: { browse: ActionReadiness; pull_one?: ActionReadiness; pull_project?: ActionReadiness; sync_to_cis?: ActionReadiness } };
type FilterOptions = { project_id: number; statuses: FilterOption[]; assignees: FilterOption[] };
type Candidate = {
  backlog_issue_key: string;
  summary: string;
  status: string | null;
  assignee: { id: number; name: string } | null;
  created_at_source: string | null;
  updated_at_source: string | null;
};
type BrowseMeta = {
  requested_limit: number;
  returned_count: number;
  source_rows_scanned: number;
  excluded_existing_cis_count: number;
  pages_scanned: number;
  source_exhausted: boolean;
  scan_limit_reached: boolean;
  deadline_reached: boolean;
  stop_reason: string | null;
  provider_error_code: string | null;
};
type BrowseResult = { candidates: Candidate[]; meta: BrowseMeta; filters: { created_from: string; created_to: string; limit: number; status_ids: number[]; assignee_ids: number[]; not_closed: boolean } };
type BrowseForm = { createdFrom: string; createdTo: string; limit: string; notClosed: boolean; statusIds: string[]; assigneeIds: string[] };
type SyncJob = { id: string; status: string; last_error?: string | null; issue_id?: string | null; payload_json?: Record<string, unknown> };
type CandidateAction = { mode: "sync" | "sync_translate" | "sync_without_translation"; job: SyncJob };

function todayDate() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function formFromSearch(search: URLSearchParams): BrowseForm {
  return {
    createdFrom: search.get("created_from") || todayDate(),
    createdTo: search.get("created_to") || todayDate(),
    limit: search.get("limit") || "20",
    notClosed: search.get("not_closed") === "true",
    statusIds: search.getAll("status_id"),
    assigneeIds: search.getAll("assignee_id"),
  };
}

function snapshotFor(form: BrowseForm) {
  return JSON.stringify({
    created_from: form.createdFrom,
    created_to: form.createdTo,
    limit: Number(form.limit),
    status_ids: [...form.statusIds].sort((left, right) => Number(left) - Number(right)),
    assignee_ids: [...form.assigneeIds].sort((left, right) => Number(left) - Number(right)),
    not_closed: form.notClosed,
  });
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : error instanceof Error ? error.message : fallback;
}

function readinessReasons(readiness: Readiness | null) {
  return readiness?.actions.browse.disabled_reasons || [];
}

function formatSourceDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(date);
  const valueFor = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${valueFor("year")}-${valueFor("month")}-${valueFor("day")} ${valueFor("hour")}:${valueFor("minute")}`;
}

function OptionPicker({ disabled, helper, label, onChange, options, selected }: { disabled?: boolean; helper: string; label: string; onChange: (values: string[]) => void; options: FilterOption[]; selected: string[] }) {
  const selectedSet = new Set(selected);
  function toggle(value: string) {
    const next = selectedSet.has(value) ? selected.filter((item) => item !== value) : [...selected, value];
    onChange(next);
  }

  return <fieldset aria-label={label} className="backlog-option-panel rounded-xl border p-4" disabled={disabled}>
    <legend className="text-primary px-1 text-sm font-semibold">{label}</legend>
    <div className="backlog-option-list mt-2" role="group" aria-label={`${label} options`}>
      {options.length ? options.map((option) => <label className={`backlog-option-row ${selectedSet.has(String(option.id)) ? "backlog-option-row--selected" : ""}`} key={option.id}><input aria-label={`${label}: ${option.name}`} checked={selectedSet.has(String(option.id))} onChange={() => toggle(String(option.id))} type="checkbox" /><span>{option.name}</span></label>) : <p className="text-subtle px-2 py-3 text-xs">No saved {label.toLowerCase()} values.</p>}
    </div>
    <span className="text-subtle mt-2 block text-xs">{helper}</span>
  </fieldset>;
}

export default function BacklogIssuesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeProject } = useProjectWorkspace();
  const searchString = searchParams.toString();
  const projectId = activeProject?.id || 0;
  const [form, setForm] = useState<BrowseForm>(() => formFromSearch(new URLSearchParams(searchString)));
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [contextError, setContextError] = useState("");
  const [optionsError, setOptionsError] = useState("");
  const [browseError, setBrowseError] = useState("");
  const [result, setResult] = useState<BrowseResult | null>(null);
  const [submittedSnapshot, setSubmittedSnapshot] = useState("");
  const [retryForm, setRetryForm] = useState<BrowseForm | null>(null);
  const [actionState, setActionState] = useState<Record<string, CandidateAction>>({});
  const [rowActionErrors, setRowActionErrors] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState("");
  const [pullOneKey, setPullOneKey] = useState("");
  const [pullOneState, setPullOneState] = useState<SyncJob | null>(null);
  const pollTimers = useRef<Record<string, number>>({});
  const actionGeneration = useRef(0);
  const lastSubmittedQuery = useRef("");
  const initializedSearch = useRef(false);

  const selectedProject = activeProject as Project | null;

  const clearResult = useCallback(() => {
    setResult(null);
    setSubmittedSnapshot("");
    setBrowseError("");
    setRetryForm(null);
  }, []);

  const loadProjectContext = useCallback(async (selectedId: number) => {
    setContextLoading(true);
    setContextError("");
    setOptionsError("");
    setReadiness(null);
    setFilterOptions(null);
    try {
      const [readinessResponse, optionsResponse] = await Promise.allSettled([
        apiFetch<Readiness>(`/api/v1/projects/${selectedId}/backlog/issues/action-readiness`),
        apiFetch<FilterOptions>(`/api/v1/projects/${selectedId}/backlog/issues/filter-options`),
      ]);
      if (readinessResponse.status === "fulfilled") setReadiness(readinessResponse.value);
      else setContextError(errorMessage(readinessResponse.reason, "Backlog readiness could not be loaded."));
      if (optionsResponse.status === "fulfilled") setFilterOptions(optionsResponse.value);
      else setOptionsError(errorMessage(optionsResponse.reason, "Saved Status and Assignee options could not be loaded."));
    } finally {
      setContextLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    const timer = window.setTimeout(() => void loadProjectContext(selectedProject.id), 0);
    const refresh = () => void loadProjectContext(selectedProject.id);
    window.addEventListener("cis-global-refresh", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("cis-global-refresh", refresh);
    };
  }, [loadProjectContext, selectedProject]);

  useEffect(() => () => {
    actionGeneration.current += 1;
    Object.values(pollTimers.current).forEach((timer) => window.clearTimeout(timer));
    pollTimers.current = {};
  }, []);

  const invalidateActionTracking = useCallback(() => {
    actionGeneration.current += 1;
    Object.values(pollTimers.current).forEach((timer) => {
      if (timer >= 0) window.clearTimeout(timer);
    });
    pollTimers.current = {};
    setActionState({});
    setRowActionErrors({});
  }, []);

  useEffect(() => {
    if (!initializedSearch.current) {
      initializedSearch.current = true;
      return;
    }
    if (lastSubmittedQuery.current === searchString) {
      lastSubmittedQuery.current = "";
      return;
    }
    setForm(formFromSearch(new URLSearchParams(searchString)));
    clearResult();
  }, [clearResult, searchString]);

  function updateForm(next: Partial<BrowseForm>) {
    lastSubmittedQuery.current = "";
    setForm((current) => ({ ...current, ...next }));
    clearResult();
  }

  const pollJob = useCallback(async (jobId: string, onUpdate: (job: SyncJob) => void, onTerminal: (job: SyncJob) => void, generation = actionGeneration.current) => {
    if (pollTimers.current[jobId] !== undefined) return;
    pollTimers.current[jobId] = -1;
    const startedAt = Date.now();
    const tick = async () => {
      if (generation !== actionGeneration.current) {
        delete pollTimers.current[jobId];
        return;
      }
      try {
        const job = await apiFetch<SyncJob>(`/api/v1/sync-jobs/${encodeURIComponent(jobId)}`);
        if (generation !== actionGeneration.current) {
          delete pollTimers.current[jobId];
          return;
        }
        onUpdate(job);
        if (["success", "failed", "cancelled"].includes(job.status)) {
          onTerminal(job);
          delete pollTimers.current[jobId];
          return;
        }
        if (Date.now() - startedAt >= 60000) {
          onUpdate({ ...job, status: "timeout" });
          delete pollTimers.current[jobId];
          return;
        }
        pollTimers.current[jobId] = window.setTimeout(() => void tick(), 2000);
      } catch (error) {
        if (generation === actionGeneration.current) setActionError(errorMessage(error, `Unable to read job ${jobId}.`));
        delete pollTimers.current[jobId];
      }
    };
    await tick();
  }, []);

  async function pullOne() {
    const issueKey = pullOneKey.trim() || (selectedProject?.backlog_issue_key_prefix ? `${selectedProject.backlog_issue_key_prefix}-1` : "");
    if (!selectedProject || !readiness?.actions.pull_one?.enabled || !issueKey) return;
    setActionError("");
    setPullOneState(null);
    try {
      const response = await apiFetch<SyncJob>(`/api/v1/projects/${selectedProject.id}/backlog/issues/${encodeURIComponent(issueKey)}/pull`, { method: "POST" });
      setPullOneState(response);
      if (!["success", "failed", "cancelled"].includes(response.status)) void pollJob(response.id, setPullOneState, setPullOneState);
    } catch (error) {
      setActionError(errorMessage(error, "Issue pull could not be queued."));
    }
  }

  async function syncCandidate(key: string, withTranslation: boolean) {
    if (!selectedProject || !readiness?.actions.sync_to_cis?.enabled || actionState[key]) return;
    setActionError("");
    setRowActionErrors((current) => ({ ...current, [key]: "" }));
    const generation = actionGeneration.current;
    try {
      const response = await apiFetch<{ outcome: string; issue_id?: string | null; job: SyncJob | null; with_translation?: boolean }>(`/api/v1/projects/${selectedProject.id}/backlog/issues/${encodeURIComponent(key)}/sync-to-cis`, {
        method: "POST",
        body: withTranslation ? { with_translation: true } : undefined,
      });
      if (response.outcome === "already_in_cis") {
        if (generation !== actionGeneration.current) return;
        await runBrowse(form);
        return;
      }
      if (generation !== actionGeneration.current) return;
      if (!response.job) {
        setActionError("Sync response did not include a job evidence.");
        return;
      }
      const mode = withTranslation ? "sync_translate" : "sync";
      setActionState((current) => ({ ...current, [key]: { mode, job: response.job! } }));
      void pollJob(response.job.id, (job) => setActionState((current) => ({ ...current, [key]: { mode, job } })), async (job) => {
        if (job.status === "success") await runBrowse(form, { invalidateActions: false });
      });
    } catch (error) {
      if (generation !== actionGeneration.current) return;
      if (error instanceof ApiClientError && error.code === "BACKLOG_SYNC_RUNNING_WITHOUT_TRANSLATION" && error.details && typeof error.details === "object") {
        const details = error.details as { job_id?: string; status?: string };
        if (details.job_id) {
          const job = { id: details.job_id, status: details.status || "running" };
          setActionState((current) => ({ ...current, [key]: { mode: "sync_without_translation", job } }));
          void pollJob(details.job_id, (next) => setActionState((current) => ({ ...current, [key]: { mode: "sync_without_translation", job: next } })), async (next) => {
            if (next.status === "success") await runBrowse(form, { invalidateActions: false });
          });
          return;
        }
      }
      const message = errorMessage(error, "Candidate sync could not be queued.");
      setRowActionErrors((current) => ({ ...current, [key]: `${key}: ${message}` }));
      setActionError(message);
    }
  }

  async function runBrowse(nextForm: BrowseForm, options: { invalidateActions?: boolean } = {}) {
    if (!selectedProject) return;
    if (options.invalidateActions !== false) invalidateActionTracking();
    const query = new URLSearchParams({
      project_id: String(selectedProject.id),
      created_from: nextForm.createdFrom,
      created_to: nextForm.createdTo,
      limit: nextForm.limit,
    });
    if (nextForm.notClosed) query.set("not_closed", "true");
    nextForm.statusIds.forEach((id) => query.append("status_id", id));
    nextForm.assigneeIds.forEach((id) => query.append("assignee_id", id));
    lastSubmittedQuery.current = query.toString();
    setRetryForm({ ...nextForm, statusIds: [...nextForm.statusIds], assigneeIds: [...nextForm.assigneeIds] });
    router.push(`/backlog-issues?${query.toString()}`);
    setLoadingResults(true);
    setBrowseError("");
    try {
      const response = await apiFetch<BrowseResult>(`/api/v1/projects/${selectedProject.id}/backlog/issues/candidates?${query.toString()}`);
      setResult(response);
      setSubmittedSnapshot(snapshotFor(nextForm));
    } catch (error) {
      setResult(null);
      setSubmittedSnapshot("");
      setBrowseError(errorMessage(error, "Backlog issues could not be searched."));
    } finally {
      setLoadingResults(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runBrowse(form);
  }

  const browseEnabled = Boolean(selectedProject && readiness?.actions.browse.enabled && !contextLoading);
  const pullOneReady = Boolean(selectedProject && readiness?.actions.pull_one?.enabled && !contextLoading);
  const syncReady = Boolean(selectedProject && readiness?.actions.sync_to_cis?.enabled && !contextLoading);
  const currentSnapshot = snapshotFor(form);
  const hasCurrentResult = Boolean(result && submittedSnapshot && submittedSnapshot === currentSnapshot);
  const reasons = readinessReasons(readiness);

  if (!selectedProject) return <section className="mx-auto max-w-7xl"><StatePanel title="No active workspace" message="Choose an enabled Project before browsing Backlog issues." action={<Link className="ui-button ui-button--primary" href="/projects">Open Project Config</Link>} /></section>;

  return <section className="backlog-page mx-auto max-w-7xl space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow font-mono text-xs uppercase tracking-[0.2em]">Backlog inbound</p>
        <h1 className="text-primary mt-3 text-3xl font-semibold tracking-tight">Backlog Issues</h1>
        <p className="text-secondary mt-2 max-w-2xl text-sm leading-6">Search saved Backlog fields for issues not yet present in CIS. Results stay tied to the filters you submitted.</p>
      </div>
      <div className="backlog-route-mark" aria-hidden="true"><span>BACKLOG</span><strong>→ CIS</strong></div>
    </div>

    <section className="backlog-filter-card surface rounded-xl border p-5" aria-labelledby="backlog-search-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="text-primary text-lg font-semibold" id="backlog-search-heading">Find issue candidates</h2><p className="text-secondary mt-1 text-sm">Project and dates are required. Status and Assignee come only from the saved Mapping directory.</p></div>
        <Badge tone={browseEnabled ? "good" : "warn"}>{browseEnabled ? "Browse ready" : "Browse blocked"}</Badge>
      </div>

      <form className="mt-5 space-y-5" onSubmit={submit}>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_repeat(2,minmax(0,1fr))_8rem]">
          <div className="text-secondary text-sm">Workspace<span className="field-control mt-2 block w-full rounded-lg border px-3 py-2">{selectedProject?.name || "—"} · #{selectedProject?.id || "—"}</span></div>
          <label className="text-secondary text-sm">Created from *<input aria-label="Created from" className="field-control mt-2 w-full rounded-lg border px-3 py-2" onChange={(event) => updateForm({ createdFrom: event.target.value })} required type="date" value={form.createdFrom} /></label>
          <label className="text-secondary text-sm">Created to *<input aria-label="Created to" className="field-control mt-2 w-full rounded-lg border px-3 py-2" onChange={(event) => updateForm({ createdTo: event.target.value })} required type="date" value={form.createdTo} /></label>
          <label className="text-secondary text-sm">Display *<input aria-label="Display limit" className="field-control mt-2 w-full rounded-lg border px-3 py-2" max="100" min="1" onChange={(event) => updateForm({ limit: event.target.value })} required type="number" value={form.limit} /></label>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(12rem,0.7fr)]">
          <OptionPicker disabled={Boolean(optionsError) || contextLoading} helper="No selection = all saved statuses." label="Status" onChange={(statusIds) => updateForm({ statusIds })} options={filterOptions?.statuses || []} selected={form.statusIds} />
          <OptionPicker disabled={Boolean(optionsError) || contextLoading} helper="No selection = all saved assignees." label="Assignee" onChange={(assigneeIds) => updateForm({ assigneeIds })} options={filterOptions?.assignees || []} selected={form.assigneeIds} />
          <div className="backlog-search-side flex flex-col justify-between gap-4 rounded-lg border p-3"><label className="policy-choice flex items-start gap-3 rounded-lg border p-3 text-sm"><input checked={form.notClosed} onChange={(event) => updateForm({ notClosed: event.target.checked })} type="checkbox" /><span><span className="text-primary font-semibold">Not closed</span><span className="text-subtle mt-1 block text-xs">Uses saved Status and excludes Closed/Close.</span></span></label><Button disabled={!browseEnabled || loadingResults} type="submit" variant="primary">{loadingResults ? "Finding…" : "Find issues"}</Button></div>
        </div>
      </form>

      {contextLoading ? <p className="text-secondary mt-4 text-sm" role="status">Loading readiness and saved filter options…</p> : null}
      {contextError ? <div className="error-panel mt-4 rounded-lg border p-3 text-sm" role="alert"><p>{contextError}</p><Button className="mt-3" onClick={() => selectedProject && void loadProjectContext(selectedProject.id)} variant="secondary">Retry readiness</Button></div> : null}
      {optionsError ? <div className="warning-panel mt-4 rounded-lg border p-3 text-sm" role="status"><p>Status and Assignee filters are unavailable: {optionsError}</p><Link className="mt-2 inline-flex font-semibold underline" href={`/mappings?project_id=${selectedProject.id}`}>Open Mappings to pull Backlog fields</Link></div> : null}
      {reasons.length ? <p className="text-secondary mt-4 text-xs">Browse is blocked by: {reasons.join(", ")}.</p> : null}
    </section>

    <section className="surface rounded-xl border p-5" aria-labelledby="backlog-action-heading">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow font-mono text-xs uppercase tracking-[0.16em]">Actions</p><h2 className="text-primary mt-2 text-lg font-semibold" id="backlog-action-heading">Backlog → CIS</h2><p className="text-secondary mt-1 text-sm">Pull one issue directly. Project-wide pull is temporarily disabled.</p></div><Badge tone={pullOneReady ? "good" : "warn"}>{pullOneReady ? "Actions ready" : "Actions blocked"}</Badge></div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="surface-muted rounded-lg border p-4"><div className="flex items-center justify-between gap-3"><div><h3 className="text-primary font-semibold">Pull project</h3><p className="text-secondary mt-1 text-xs">Temporarily disabled during UI replatforming.</p></div><Button disabled title="Temporarily disabled during UI replatforming." variant="primary">Pull project</Button></div></div>
        <div className="surface-muted rounded-lg border p-4"><div className="flex items-end gap-3"><label className="text-secondary min-w-0 flex-1 text-sm">Issue key<input aria-label="Pull one issue key" className="field-control mt-2 w-full rounded-lg border px-3 py-2" onChange={(event) => setPullOneKey(event.target.value)} value={pullOneKey || (selectedProject.backlog_issue_key_prefix ? `${selectedProject.backlog_issue_key_prefix}-1` : "")} /></label><Button disabled={!pullOneReady || !(pullOneKey || selectedProject.backlog_issue_key_prefix)} onClick={() => void pullOne()} variant="primary">Pull one</Button></div>{pullOneState ? <p className="text-secondary mt-3 text-xs" role="status">Job {pullOneState.id}: {pullOneState.status}{pullOneState.last_error ? ` — ${pullOneState.last_error}` : ""}</p> : null}</div>
      </div>
      {actionError ? <p className="error-panel mt-4 rounded-lg border p-3 text-sm" role="alert">{actionError}</p> : null}
    </section>

    {browseError ? <div className="error-panel rounded-lg border p-4 text-sm" role="alert"><p>{browseError}</p>{retryForm ? <Button className="mt-3" disabled={loadingResults} onClick={() => void runBrowse(retryForm)} variant="secondary">Retry search</Button> : null}</div> : null}

    {hasCurrentResult && result ? <section className="backlog-results surface rounded-xl border" aria-labelledby="candidate-results-heading">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b p-5" style={{ borderColor: "var(--border)" }}><div><p className="eyebrow font-mono text-xs uppercase tracking-[0.16em]">Candidate scan</p><h2 className="text-primary mt-2 text-lg font-semibold" id="candidate-results-heading">Issues not in CIS</h2><p className="text-secondary mt-1 text-sm">Showing {result.meta.returned_count} of {result.meta.requested_limit} requested candidates.</p><p className="text-subtle mt-1 text-xs">Next phase</p></div><Badge tone={result.meta.provider_error_code ? "warn" : "neutral"}>{result.meta.provider_error_code ? "Partial result" : result.meta.stop_reason || "Complete"}</Badge></div>
      <div className="backlog-evidence-grid border-b p-5" style={{ borderColor: "var(--border)" }}><div className="backlog-evidence-card"><span>Scanned</span><strong>{result.meta.source_rows_scanned}</strong></div><div className="backlog-evidence-card"><span>Excluded existing CIS</span><strong>{result.meta.excluded_existing_cis_count}</strong></div><div className="backlog-evidence-card"><span>Pages</span><strong>{result.meta.pages_scanned}</strong></div><div className="backlog-evidence-card"><span>Source exhausted</span><strong>{result.meta.source_exhausted ? "Yes" : "No"}</strong></div></div>
      {result.meta.provider_error_code ? <p className="warning-panel m-5 rounded-lg border p-3 text-sm" role="status">The provider stopped the scan with {result.meta.provider_error_code}; review the partial result before searching again.</p> : null}
      {result.candidates.length ? <div className="overflow-x-auto"><table className="backlog-candidate-table w-full min-w-[1060px] text-left text-sm"><thead className="text-subtle text-xs uppercase tracking-wide"><tr><th>Backlog</th><th>Summary</th><th>Status</th><th>Assignee</th><th>Created</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{result.candidates.map((candidate) => { const action = actionState[candidate.backlog_issue_key]; const busy = Boolean(action && !["success", "failed", "cancelled", "timeout"].includes(action.job.status)); return <tr key={candidate.backlog_issue_key}><td className="text-primary font-mono text-xs font-semibold">{candidate.backlog_issue_key}</td><td className="backlog-summary-cell text-primary">{candidate.summary || "—"}</td><td><Badge>{candidate.status || "—"}</Badge></td><td className="text-secondary">{candidate.assignee?.name || "Unassigned"}</td><td className="text-subtle whitespace-nowrap font-mono text-xs">{formatSourceDate(candidate.created_at_source)}</td><td className="text-subtle whitespace-nowrap font-mono text-xs">{formatSourceDate(candidate.updated_at_source)}</td><td><div className="flex min-w-[15rem] flex-col gap-2"><Button disabled={!syncReady || busy} onClick={() => void syncCandidate(candidate.backlog_issue_key, false)} variant="primary">{busy ? `${action?.job.status}…` : "Sync to CIS"}</Button><Button disabled={!syncReady || busy} onClick={() => void syncCandidate(candidate.backlog_issue_key, true)} variant="secondary">{busy ? "Action locked" : "Sync to CIS + Translate"}</Button><span className="text-subtle text-xs">Next phase: review CIS and Translation Queue</span>{action ? <span className="text-subtle text-xs" role="status">Job {action.job.id}: {action.job.status}{action.mode === "sync_translate" && action.job.status === "success" ? " · CIS sync completed; review Translation Queue" : ""}</span> : null}{action?.mode === "sync_without_translation" ? <span className="warning-panel rounded border p-2 text-xs" role="status">Translation was not queued. Open Issue Editor → Translate for this item.</span> : null}{rowActionErrors[candidate.backlog_issue_key] ? <span className="error-panel rounded border p-2 text-xs" role="alert">{rowActionErrors[candidate.backlog_issue_key]}</span> : null}</div></td></tr>; })}</tbody></table></div> : <div className="p-8"><p className="text-primary font-semibold">No new candidates found</p><p className="text-secondary mt-2 text-sm">Try a wider date range or remove one of the optional filters.</p></div>}
    </section> : !loadingResults && !browseError ? <StatePanel title="No search submitted" message="Choose filters and press Find issues. Mounting this route never browses Backlog automatically." /> : null}
  </section>;
}
