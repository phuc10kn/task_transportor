"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, StatePanel } from "../../components/ui";
import { apiFetch, ApiClientError } from "../../lib/api-client";
import { useProjectWorkspace } from "../../lib/project-workspace";

type SyncJob = {
  id: string;
  project_id: number;
  project_name?: string | null;
  source_issue_key?: string | null;
  target_issue_key?: string | null;
  job_type: string;
  direction_from: string;
  direction_to: string;
  status: string;
  created_at?: string | null;
  success_at?: string | null;
  last_error?: string | null;
};

function labelFor(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function messageFor(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback;
}

function toneFor(status: string) {
  if (status === "success") return "good";
  if (status === "failed" || status === "cancelled") return "danger";
  if (status === "pending" || status === "running") return "warn";
  return "neutral";
}

function Direction({ from, to }: { from: string; to: string }) {
  return <span className="operation-direction"><span>{from || "—"}</span><b>→</b><span>{to || "—"}</span></span>;
}

export function SyncJobsWorkbench() {
  const searchParams = useSearchParams();
  const { activeProject } = useProjectWorkspace();
  const projectId = String(activeProject?.id || "");
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingId, setPendingId] = useState("");
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true); setError("");
    const query = projectId ? `?project_id=${encodeURIComponent(projectId)}` : "";
    try {
      const nextJobs = await apiFetch<SyncJob[]>(`/api/v1/sync-jobs${query}`);
      if (current !== requestId.current) return;
      setJobs(nextJobs || []);
    } catch (requestError) {
      if (current === requestId.current) setError(messageFor(requestError, "Sync jobs could not be loaded."));
    } finally { if (current === requestId.current) setLoading(false); }
  }, [projectId]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  useEffect(() => { const refresh = () => void load(); window.addEventListener("cis-global-refresh", refresh); return () => window.removeEventListener("cis-global-refresh", refresh); }, [load]);

  async function runAction(job: SyncJob, action: "retry" | "cancel") {
    if (pendingId) return;
    setPendingId(job.id); setActionError(""); setNotice("");
    try {
      await apiFetch<SyncJob>(`/api/v1/sync-jobs/${encodeURIComponent(job.id)}/${action}`, { method: "POST" });
      await load();
      setNotice(`Job ${job.id} ${action === "retry" ? "queued for retry" : "cancelled"}.`);
    } catch (requestError) { setActionError(`Job ${job.id}: ${messageFor(requestError, `Could not ${action} this job.`)}`); }
    finally { setPendingId(""); }
  }

  const failedCount = jobs.filter((job) => job.status === "failed").length;
  const activeCount = jobs.filter((job) => job.status === "pending" || job.status === "running").length;

  return <section className="operations-page mx-auto max-w-7xl space-y-6">
    <div className="page-heading flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow font-mono text-xs uppercase tracking-[0.2em]">Operations ledger</p><h1 className="text-primary mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Sync job queue</h1><p className="text-secondary mt-3 max-w-2xl text-sm leading-6">Inspect execution state, then retry or cancel only when the current server rule allows it.</p></div><div className="operation-summary" aria-label="Sync job summary"><div><span>Visible</span><strong>{jobs.length}</strong></div><div><span>Active</span><strong>{activeCount}</strong></div><div data-danger={failedCount > 0}><span>Failed</span><strong>{failedCount}</strong></div></div></div>
    <section className="surface operation-filter-bar rounded-xl border" aria-label="Sync job filters"><div className="text-secondary block max-w-md text-sm">Workspace<span className="field-control mt-2 block rounded-lg border px-3 py-2">{activeProject?.name} · #{activeProject?.id}</span></div>{error && jobs.length ? <p className="error-panel mt-4 rounded-lg border p-3 text-sm" role="alert">{error} <button className="font-semibold underline" onClick={() => void load()} type="button">Retry</button></p> : null}</section>
    {notice ? <p className="success-panel rounded-lg border p-3 text-sm" role="status">{notice}</p> : null}
    {actionError ? <p className="error-panel rounded-lg border p-3 text-sm" role="alert">{actionError}</p> : null}
    {loading && !jobs.length ? <StatePanel title="Loading sync jobs" message="Reading current execution evidence…" /> : null}
    {!loading && error && !jobs.length ? <StatePanel title="Sync jobs unavailable" message={error} action={<Button onClick={() => void load()} variant="primary">Retry</Button>} /> : null}
    {!loading && !error && !jobs.length ? <StatePanel title="No sync jobs found" message="No jobs match the selected Project." /> : null}
    {jobs.length ? <section className="surface operation-table-card rounded-xl border" aria-labelledby="jobs-heading"><div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4" style={{ borderColor: "var(--border)" }}><div><h2 className="text-primary font-semibold" id="jobs-heading">Execution ledger</h2><p className="text-secondary mt-1 text-sm">Actions remain available until the server accepts or rejects the request.</p></div>{loading ? <span className="text-subtle text-xs" role="status">Refreshing…</span> : <span className="result-count">{jobs.length}<span> jobs</span></span>}</div><div className="overflow-x-auto"><table className="data-table operations-table operations-jobs-table w-full text-left text-sm"><thead><tr><th>ID</th><th>Project</th><th>Source issue</th><th>Target issue</th><th>Type</th><th>Direction</th><th>Status</th><th>Created</th><th>Succeeded</th><th>Error</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{jobs.map((job) => <tr key={job.id}><td data-label="ID"><code>{job.id}</code></td><td data-label="Project">{job.project_name || job.project_id}</td><td data-label="Source issue"><code>{job.source_issue_key || "—"}</code></td><td data-label="Target issue"><code>{job.target_issue_key || "—"}</code></td><td data-label="Type">{labelFor(job.job_type)}</td><td data-label="Direction"><Direction from={job.direction_from} to={job.direction_to} /></td><td data-label="Status"><span className={`operation-status operation-status--${toneFor(job.status)}`}>{job.status}</span></td><td data-label="Created"><code>{job.created_at || "—"}</code></td><td data-label="Succeeded"><code>{job.success_at || "—"}</code></td><td data-label="Error" className="operation-message">{job.last_error || "—"}</td><td data-label="Actions"><div className="operation-actions"><Button disabled={Boolean(pendingId)} onClick={() => void runAction(job, "retry")} variant="secondary">{pendingId === job.id ? "Working…" : "Retry"}</Button><Button disabled={Boolean(pendingId)} onClick={() => void runAction(job, "cancel")} variant="ghost">Cancel</Button></div></td></tr>)}</tbody></table></div></section> : null}
  </section>;
}
