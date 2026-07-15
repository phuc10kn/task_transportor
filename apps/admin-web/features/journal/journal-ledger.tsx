"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, StatePanel } from "../../components/ui";
import { apiFetch, ApiClientError } from "../../lib/api-client";
import { useProjectWorkspace } from "../../lib/project-workspace";

type JournalEntry = {
  id: number;
  sync_job_id?: string | null;
  project_id: number;
  project_name?: string | null;
  source_issue_key?: string | null;
  target_issue_key?: string | null;
  action: string;
  status: string;
  direction_from: string;
  direction_to: string;
  created_at?: string | null;
  success_at?: string | null;
  message?: string | null;
  error_message?: string | null;
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

export function JournalLedger() {
  const searchParams = useSearchParams();
  const { activeProject } = useProjectWorkspace();
  const projectId = String(activeProject?.id || "");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true); setError("");
    const query = projectId ? `?project_id=${encodeURIComponent(projectId)}` : "";
    try {
      const nextEntries = await apiFetch<JournalEntry[]>(`/api/v1/sync-journal${query}`);
      if (current !== requestId.current) return;
      setEntries(nextEntries || []);
    } catch (requestError) {
      if (current === requestId.current) setError(messageFor(requestError, "Sync journal could not be loaded."));
    } finally { if (current === requestId.current) setLoading(false); }
  }, [projectId]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  useEffect(() => { const refresh = () => void load(); window.addEventListener("cis-global-refresh", refresh); return () => window.removeEventListener("cis-global-refresh", refresh); }, [load]);

  const failureCount = entries.filter((entry) => entry.status === "failed").length;
  const successCount = entries.filter((entry) => entry.status === "success").length;

  return <section className="operations-page mx-auto max-w-7xl space-y-6">
    <div className="page-heading flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow font-mono text-xs uppercase tracking-[0.2em]">Operations ledger</p><h1 className="text-primary mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Sync journal</h1><p className="text-secondary mt-3 max-w-2xl text-sm leading-6">Read-only audit evidence for decisions, execution attempts and final outcomes.</p></div><div className="operation-summary" aria-label="Sync journal summary"><div><span>Visible</span><strong>{entries.length}</strong></div><div><span>Success</span><strong>{successCount}</strong></div><div data-danger={failureCount > 0}><span>Failed</span><strong>{failureCount}</strong></div></div></div>
    <section className="surface operation-filter-bar rounded-xl border" aria-label="Sync journal filters"><div className="text-secondary block max-w-md text-sm">Workspace<span className="field-control mt-2 block rounded-lg border px-3 py-2">{activeProject?.name} · #{activeProject?.id}</span></div>{error && entries.length ? <p className="error-panel mt-4 rounded-lg border p-3 text-sm" role="alert">{error} <button className="font-semibold underline" onClick={() => void load()} type="button">Retry</button></p> : null}</section>
    {loading && !entries.length ? <StatePanel title="Loading sync journal" message="Reading current audit evidence…" /> : null}
    {!loading && error && !entries.length ? <StatePanel title="Sync journal unavailable" message={error} action={<Button onClick={() => void load()} variant="primary">Retry</Button>} /> : null}
    {!loading && !error && !entries.length ? <StatePanel title="No journal entries found" message="No audit entries match the selected Project." /> : null}
    {entries.length ? <section className="surface operation-table-card rounded-xl border" aria-labelledby="journal-heading"><div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4" style={{ borderColor: "var(--border)" }}><div><h2 className="text-primary font-semibold" id="journal-heading">Audit ledger</h2><p className="text-secondary mt-1 text-sm">Read-only event evidence; no mutation is available on this route.</p></div>{loading ? <span className="text-subtle text-xs" role="status">Refreshing…</span> : <span className="result-count">{entries.length}<span> entries</span></span>}</div><div className="overflow-x-auto"><table className="data-table operations-table operations-journal-table w-full text-left text-sm"><thead><tr><th>ID</th><th>Job</th><th>Project</th><th>Source issue</th><th>Target issue</th><th>Action</th><th>Status</th><th>Direction</th><th>Created</th><th>Succeeded</th><th>Message / error</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id}><td data-label="ID"><code>#{entry.id}</code></td><td data-label="Job"><code>{entry.sync_job_id || "—"}</code></td><td data-label="Project">{entry.project_name || entry.project_id}</td><td data-label="Source issue"><code>{entry.source_issue_key || "—"}</code></td><td data-label="Target issue"><code>{entry.target_issue_key || "—"}</code></td><td data-label="Action">{labelFor(entry.action)}</td><td data-label="Status"><span className={`operation-status operation-status--${toneFor(entry.status)}`}>{entry.status}</span></td><td data-label="Direction"><Direction from={entry.direction_from} to={entry.direction_to} /></td><td data-label="Created"><code>{entry.created_at || "—"}</code></td><td data-label="Succeeded"><code>{entry.success_at || "—"}</code></td><td data-label="Message / error" className="operation-message">{entry.message || entry.error_message || "—"}</td></tr>)}</tbody></table></div></section> : null}
  </section>;
}
