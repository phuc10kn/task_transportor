"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, StatePanel } from "../../../components/ui";
import { ApiClientError, apiFetch } from "../../../lib/api-client";
import { useProjectWorkspace } from "../../../lib/project-workspace";

type Issue = { id: string; project_id: number; project_name?: string; backlog_issue_key?: string | null; sync_status?: string; current_summary?: string | null; pending_translation_count?: number; open_anomaly_count?: number };
function messageFor(error: unknown, fallback: string) { return error instanceof ApiClientError ? error.message : error instanceof Error ? error.message : fallback; }

export default function CisIssuesPage() {
  const router = useRouter();
  const { activeProject } = useProjectWorkspace();
  const projectId = activeProject?.id || 0;
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ summary: "", description: "" });

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true); setError("");
    try { setIssues(await apiFetch<Issue[]>(`/api/v1/issues?project_id=${encodeURIComponent(String(projectId))}`)); }
    catch (loadError) { setError(messageFor(loadError, "CIS Issues could not be loaded.")); }
    finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); const refresh = () => void load(); window.addEventListener("cis-global-refresh", refresh); return () => { window.clearTimeout(timer); window.removeEventListener("cis-global-refresh", refresh); }; }, [load]);

  async function createIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setCreateError("");
    try { const response = await apiFetch<{ issue: Issue }>("/api/v1/issues", { method: "POST", body: { project_id: projectId, summary: form.summary, description: form.description } }); router.push(`/cis-issues/${encodeURIComponent(response.issue.id)}`); }
    catch (failure) { setCreateError(messageFor(failure, "CIS issue could not be created.")); }
    finally { setSubmitting(false); }
  }

  if (loading) return <section className="mx-auto max-w-7xl"><StatePanel title="Loading CIS Issues" message="Reading current issue state…" /></section>;
  if (error) return <section className="mx-auto max-w-7xl"><StatePanel title="CIS Issues unavailable" message={error} action={<Button onClick={() => void load()} variant="primary">Retry</Button>} /></section>;
  return <section className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow font-mono text-xs uppercase tracking-[0.2em]">CIS Issues</p><h1 className="text-primary mt-3 text-3xl font-semibold tracking-tight">Issue workspace</h1><p className="text-secondary mt-2 text-sm">Workspace: {activeProject?.name} · #{projectId}. Review canonical issues and open the full operational editor.</p></div><Badge>{issues.length} issues</Badge></div>
    <section className="surface rounded-xl border p-5" aria-labelledby="create-cis-heading"><h2 className="text-primary text-lg font-semibold" id="create-cis-heading">Create CIS issue</h2><p className="text-secondary mt-1 text-sm">Manual creation keeps the original form when validation fails.</p><form className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto] md:items-end" onSubmit={createIssue}><label className="text-secondary text-sm">Summary *<input aria-label="Issue summary" className="field-control mt-2 w-full rounded-lg border px-3 py-2" onChange={(event) => setForm({ ...form, summary: event.target.value })} required value={form.summary} /></label><label className="text-secondary text-sm">Description<input aria-label="Issue description" className="field-control mt-2 w-full rounded-lg border px-3 py-2" onChange={(event) => setForm({ ...form, description: event.target.value })} value={form.description} /></label><Button disabled={submitting} type="submit" variant="primary">{submitting ? "Creating…" : "Create issue"}</Button></form>{createError ? <p className="error-panel mt-4 rounded-lg border p-3 text-sm" role="alert">{createError}</p> : null}</section>
    <section className="surface rounded-xl border" aria-labelledby="cis-list-heading"><div className="border-b p-5" style={{ borderColor: "var(--border)" }}><h2 className="text-primary text-lg font-semibold" id="cis-list-heading">CIS issue list</h2><p className="text-secondary mt-1 text-sm">Backlog, Jira, review and anomaly evidence stays visible before opening an issue.</p></div>{issues.length ? <div className="overflow-x-auto"><table className="data-table cis-issue-table w-full min-w-[1120px] text-left text-sm"><thead className="text-subtle border-b text-xs uppercase tracking-wide"><tr><th>Backlog</th><th>Project</th><th>Status</th><th>Summary</th><th>Review</th><th>Anomaly</th><th /></tr></thead><tbody>{issues.map((issue) => <tr key={issue.id}><td className="text-primary font-mono text-xs">{issue.backlog_issue_key || "—"}</td><td className="text-secondary">{issue.project_name || issue.project_id}</td><td><Badge>{issue.sync_status || "unknown"}</Badge></td><td className="cis-issue-summary text-primary" title={issue.current_summary || "—"}>{issue.current_summary || "—"}</td><td className="text-secondary">{issue.pending_translation_count || 0}</td><td className="text-secondary">{issue.open_anomaly_count || 0}</td><td><Link className="ui-button ui-button--secondary whitespace-nowrap" href={`/cis-issues/${encodeURIComponent(issue.id)}`}>Open editor</Link></td></tr>)}</tbody></table></div> : <div className="p-8"><p className="text-primary font-semibold">No CIS issues found</p><p className="text-secondary mt-2 text-sm">Create an issue in this workspace.</p></div>}</section>
  </section>;
}
