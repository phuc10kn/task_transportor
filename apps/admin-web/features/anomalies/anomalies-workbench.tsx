"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, Dialog, StatePanel } from "../../components/ui";
import { apiFetch, ApiClientError } from "../../lib/api-client";

type Project = { id: number; name: string };
type Anomaly = {
  id: number;
  project_id: number;
  issue_id?: string | null;
  anomaly_type: string;
  severity: string;
  status: string;
  details_json: Record<string, unknown>;
  ai_analysis?: string | null;
  created_at?: string | null;
  resolved_at?: string | null;
  resolved_by?: number | null;
};

const anomalyTypes = ["routing_mismatch", "mapping_gap", "translation_low_conf", "unusual_field_change", "sync_failure_chain"];
const anomalyStatuses = ["open", "investigating", "resolved", "ignored"];

function labelFor(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function messageFor(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback;
}

function severityTone(severity: string) {
  if (severity === "critical") return "critical";
  if (severity === "warning") return "warning";
  return "info";
}

function statusTone(status: string): "good" | "warn" | "neutral" {
  if (status === "resolved" || status === "ignored") return "good";
  if (status === "open" || status === "investigating") return "warn";
  return "neutral";
}

function readableValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value, null, 2);
}

function DetailsEvidence({ details, compact = false }: { details: Record<string, unknown>; compact?: boolean }) {
  const entries = Object.entries(details || {});
  if (!entries.length) return <span className="text-subtle text-sm">No structured details</span>;
  const visible = compact ? entries.slice(0, 2) : entries;
  return <dl className={compact ? "anomaly-evidence anomaly-evidence--compact" : "anomaly-evidence"}>
    {visible.map(([key, value]) => <div key={key}><dt>{labelFor(key)}</dt><dd>{readableValue(value)}</dd></div>)}
    {compact && entries.length > visible.length ? <div><dt>More evidence</dt><dd>+{entries.length - visible.length} fields</dd></div> : null}
  </dl>;
}

function DetailDialog({ anomaly, error, pending, projectName, onAction, onClose }: {
  anomaly: Anomaly;
  error: string;
  pending: "resolve" | "ignore" | "";
  projectName: string;
  onAction: (action: "resolve" | "ignore") => void;
  onClose: () => void;
}) {
  const actionable = anomaly.status === "open" || anomaly.status === "investigating";
  return <Dialog className="anomaly-dialog max-w-4xl rounded-xl" label={`Anomaly ${anomaly.id} details`} onClose={onClose}>
    <div className="anomaly-dialog__header flex flex-wrap items-start justify-between gap-4">
      <div><p className="eyebrow font-mono text-xs uppercase tracking-[0.18em]">Anomaly #{anomaly.id}</p><h2 className="text-primary mt-2 text-xl font-semibold">{labelFor(anomaly.anomaly_type)}</h2><p className="text-secondary mt-1 text-sm">{projectName} · operator decision surface</p></div>
      <div className="flex items-center gap-2"><span className={`anomaly-severity anomaly-severity--${severityTone(anomaly.severity)}`}>{anomaly.severity}</span><Badge tone={statusTone(anomaly.status)}>{anomaly.status}</Badge></div>
    </div>
    <div className="anomaly-dialog__body grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="anomaly-risk-rail" aria-label="Risk triage rail">
        <div className="anomaly-risk-step anomaly-risk-step--active"><span>01</span><div><small>Signal</small><strong>{labelFor(anomaly.severity)} severity</strong></div></div>
        <div className="anomaly-risk-step anomaly-risk-step--active"><span>02</span><div><small>Evidence</small><strong>{Object.keys(anomaly.details_json || {}).length} fields captured</strong></div></div>
        <div className={`anomaly-risk-step ${actionable ? "anomaly-risk-step--active" : ""}`}><span>03</span><div><small>Decision</small><strong>{actionable ? "Operator action required" : labelFor(anomaly.status)}</strong></div></div>
      </aside>
      <div className="anomaly-dialog__content space-y-6">
        {error ? <p className="error-panel rounded-lg border p-3 text-sm" role="alert">{error}</p> : null}
        <dl className="anomaly-meta-grid">
          <div><dt>Project</dt><dd>{projectName}</dd></div>
          <div><dt>CIS issue</dt><dd>{anomaly.issue_id ? <Link className="anomaly-issue-link" href={`/cis-issues/${encodeURIComponent(anomaly.issue_id)}`}>{anomaly.issue_id}</Link> : "Not linked"}</dd></div>
          <div><dt>Created</dt><dd>{anomaly.created_at || "—"}</dd></div>
          <div><dt>Resolved</dt><dd>{anomaly.resolved_at || "—"}</dd></div>
        </dl>
        <section aria-labelledby="anomaly-evidence-heading"><div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-primary font-semibold" id="anomaly-evidence-heading">Captured evidence</h3><span className="text-subtle font-mono text-xs">server truth</span></div><DetailsEvidence details={anomaly.details_json} /></section>
        {anomaly.ai_analysis ? <section className="surface-muted rounded-lg border p-4"><h3 className="text-primary text-sm font-semibold">AI analysis</h3><p className="text-secondary mt-2 whitespace-pre-wrap text-sm leading-6">{anomaly.ai_analysis}</p></section> : null}
      </div>
    </div>
    <div className="anomaly-dialog__actions flex flex-wrap items-center justify-end gap-2">
      <p className="text-subtle mr-auto text-xs">Keep open closes this surface without changing server status.</p>
      <Button disabled={Boolean(pending)} onClick={onClose} variant="secondary">Keep open</Button>
      {actionable ? <><Button disabled={Boolean(pending)} onClick={() => onAction("ignore")} variant="secondary">{pending === "ignore" ? "Ignoring…" : "Ignore"}</Button><Button disabled={Boolean(pending)} onClick={() => onAction("resolve")} variant="primary">{pending === "resolve" ? "Resolving…" : "Resolve"}</Button></> : null}
    </div>
  </Dialog>;
}

export function AnomaliesWorkbench() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id") || "";
  const status = searchParams.get("status") || "";
  const anomalyType = searchParams.get("anomaly_type") || "";
  const [projects, setProjects] = useState<Project[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [detail, setDetail] = useState<Anomaly | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [pending, setPending] = useState<"resolve" | "ignore" | "">("");
  const [notice, setNotice] = useState("");
  const listRequest = useRef(0);
  const detailRequest = useRef(0);

  const loadList = useCallback(async () => {
    const requestId = ++listRequest.current;
    setLoading(true); setError("");
    const query = new URLSearchParams();
    if (projectId) query.set("project_id", projectId);
    if (status) query.set("status", status);
    if (anomalyType) query.set("anomaly_type", anomalyType);
    try {
      const [nextProjects, nextAnomalies] = await Promise.all([
        apiFetch<Project[]>("/api/v1/projects"),
        apiFetch<Anomaly[]>(`/api/v1/anomalies${query.size ? `?${query}` : ""}`),
      ]);
      if (requestId !== listRequest.current) return;
      setProjects(nextProjects || []); setAnomalies(nextAnomalies || []);
    } catch (requestError) {
      if (requestId === listRequest.current) setError(messageFor(requestError, "Anomalies could not be loaded."));
    } finally { if (requestId === listRequest.current) setLoading(false); }
  }, [anomalyType, projectId, status]);

  const loadDetail = useCallback(async (id: number) => {
    const requestId = ++detailRequest.current;
    setDetailLoading(true); setDetailError("");
    try {
      const nextDetail = await apiFetch<Anomaly>(`/api/v1/anomalies/${id}`);
      if (requestId === detailRequest.current) setDetail(nextDetail);
    } catch (requestError) {
      if (requestId === detailRequest.current) setDetailError(messageFor(requestError, "Anomaly details could not be loaded."));
    } finally { if (requestId === detailRequest.current) setDetailLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void loadList(), 0); return () => window.clearTimeout(timer); }, [loadList]);
  useEffect(() => {
    const refresh = () => { void loadList(); if (selectedId) void loadDetail(selectedId); };
    window.addEventListener("cis-global-refresh", refresh);
    return () => window.removeEventListener("cis-global-refresh", refresh);
  }, [loadDetail, loadList, selectedId]);

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, value); else next.delete(key);
    setSelectedId(null); setDetail(null); setDetailError("");
    router.replace(`/anomalies${next.size ? `?${next}` : ""}`);
  }

  function openDetail(id: number) {
    setSelectedId(id); setDetail(null); setNotice("");
    void loadDetail(id);
  }

  function closeDetail() {
    detailRequest.current += 1;
    setSelectedId(null); setDetail(null); setDetailError(""); setPending("");
  }

  async function decide(action: "resolve" | "ignore") {
    if (!selectedId || pending) return;
    setPending(action); setDetailError(""); setNotice("");
    try {
      await apiFetch<Anomaly>(`/api/v1/anomalies/${selectedId}/${action}`, { method: "POST" });
      await Promise.all([loadList(), loadDetail(selectedId)]);
      setNotice(`Anomaly #${selectedId} ${action === "resolve" ? "resolved" : "ignored"}.`);
    } catch (requestError) { setDetailError(messageFor(requestError, `Anomaly could not be ${action}d.`)); }
    finally { setPending(""); }
  }

  const projectNames = new Map(projects.map((project) => [project.id, project.name]));
  const openCount = anomalies.filter((item) => item.status === "open" || item.status === "investigating").length;
  const criticalCount = anomalies.filter((item) => item.severity === "critical").length;

  return <section className="anomaly-page mx-auto max-w-7xl space-y-6">
    <div className="page-heading flex flex-wrap items-end justify-between gap-5">
      <div><p className="eyebrow font-mono text-xs uppercase tracking-[0.2em]">Risk operations</p><h1 className="text-primary mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Anomaly control room</h1><p className="text-secondary mt-3 max-w-2xl text-sm leading-6">Inspect captured evidence and clear blockers before outbound delivery.</p></div>
      <div className="anomaly-summary" aria-label="Current anomaly summary"><div><span>Visible</span><strong>{anomalies.length}</strong></div><div><span>Needs action</span><strong>{openCount}</strong></div><div data-critical={criticalCount > 0}><span>Critical</span><strong>{criticalCount}</strong></div></div>
    </div>
    <section className="surface anomaly-filter-bar rounded-xl border" aria-label="Anomaly filters">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-secondary text-sm">Project<select aria-label="Anomaly project" className="field-control mt-2 w-full rounded-lg border px-3 py-2" onChange={(event) => updateFilter("project_id", event.target.value)} value={projectId}><option value="">All projects</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
        <label className="text-secondary text-sm">Status<select aria-label="Anomaly status" className="field-control mt-2 w-full rounded-lg border px-3 py-2" onChange={(event) => updateFilter("status", event.target.value)} value={status}><option value="">All statuses</option>{anomalyStatuses.map((value) => <option key={value} value={value}>{labelFor(value)}</option>)}</select></label>
        <label className="text-secondary text-sm">Type<select aria-label="Anomaly type" className="field-control mt-2 w-full rounded-lg border px-3 py-2" onChange={(event) => updateFilter("anomaly_type", event.target.value)} value={anomalyType}><option value="">All types</option>{anomalyTypes.map((value) => <option key={value} value={value}>{labelFor(value)}</option>)}</select></label>
      </div>
      {error && anomalies.length ? <p className="error-panel mt-4 rounded-lg border p-3 text-sm" role="alert">{error} <button className="font-semibold underline" onClick={() => void loadList()} type="button">Retry</button></p> : null}
    </section>
    {notice ? <p className="success-panel rounded-lg border p-3 text-sm" role="status">{notice}</p> : null}
    {loading && !anomalies.length ? <StatePanel title="Loading anomalies" message="Reading current anomaly evidence and operator state…" /> : null}
    {!loading && error && !anomalies.length ? <StatePanel title="Anomalies unavailable" message={error} action={<Button onClick={() => void loadList()} variant="primary">Retry</Button>} /> : null}
    {!loading && !error && !anomalies.length ? <StatePanel title="No anomalies found" message="No anomaly matches the current Project, status and type filters." /> : null}
    {anomalies.length ? <section className="surface anomaly-list rounded-xl border" aria-labelledby="anomaly-list-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4" style={{ borderColor: "var(--border)" }}><div><h2 className="text-primary font-semibold" id="anomaly-list-heading">Triage queue</h2><p className="text-secondary mt-1 text-sm">Ordered by server identity; open a row for full evidence and decision controls.</p></div>{loading ? <span className="text-subtle text-xs" role="status">Refreshing…</span> : <span className="result-count">{anomalies.length}<span> records</span></span>}</div>
      <div className="overflow-x-auto"><table className="data-table anomaly-table w-full text-left text-sm"><thead><tr><th>ID</th><th>Issue</th><th>Type</th><th>Severity</th><th>Status</th><th>Evidence</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{anomalies.map((anomaly) => <tr key={anomaly.id} data-severity={anomaly.severity}><td data-label="ID"><span className="anomaly-id">#{anomaly.id}</span></td><td data-label="Issue">{anomaly.issue_id ? <Link className="anomaly-issue-link" href={`/cis-issues/${encodeURIComponent(anomaly.issue_id)}`}>{anomaly.issue_id}</Link> : <span className="text-subtle">Not linked</span>}</td><td data-label="Type"><span className="text-primary font-medium">{labelFor(anomaly.anomaly_type)}</span><small className="text-subtle mt-1 block font-mono">{projectNames.get(anomaly.project_id) || `Project ${anomaly.project_id}`}</small></td><td data-label="Severity"><span className={`anomaly-severity anomaly-severity--${severityTone(anomaly.severity)}`}>{anomaly.severity}</span></td><td data-label="Status"><Badge tone={statusTone(anomaly.status)}>{anomaly.status}</Badge></td><td data-label="Evidence"><DetailsEvidence compact details={anomaly.details_json} /></td><td data-label="Actions"><Button aria-label={`Open anomaly ${anomaly.id}`} onClick={() => openDetail(anomaly.id)} variant="secondary">Inspect</Button></td></tr>)}</tbody></table></div>
    </section> : null}
    {selectedId && detailLoading && !detail ? <Dialog className="anomaly-dialog anomaly-dialog--loading max-w-lg rounded-xl" label={`Loading anomaly ${selectedId}`} onClose={closeDetail}><div className="p-6"><h2 className="text-primary font-semibold">Loading anomaly #{selectedId}</h2><p className="text-secondary mt-2 text-sm">Reading current server evidence…</p><div className="mt-5"><Button onClick={closeDetail}>Keep open</Button></div></div></Dialog> : null}
    {selectedId && !detailLoading && detailError && !detail ? <Dialog className="anomaly-dialog max-w-lg rounded-xl" label={`Anomaly ${selectedId} unavailable`} onClose={closeDetail}><div className="p-6"><h2 className="text-primary font-semibold">Details unavailable</h2><p className="error-panel mt-3 rounded-lg border p-3 text-sm" role="alert">{detailError}</p><div className="mt-5 flex justify-end gap-2"><Button onClick={closeDetail}>Keep open</Button><Button onClick={() => void loadDetail(selectedId)} variant="primary">Retry</Button></div></div></Dialog> : null}
    {selectedId && detail ? <DetailDialog anomaly={detail} error={detailError} onAction={(action) => void decide(action)} onClose={closeDetail} pending={pending} projectName={projectNames.get(detail.project_id) || `Project ${detail.project_id}`} /> : null}
  </section>;
}
