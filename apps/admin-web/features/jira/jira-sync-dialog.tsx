"use client";

import { useState } from "react";
import { ApiClientError, apiFetch } from "../../lib/api-client";
import { Badge, Button, Dialog } from "../../components/ui";

type CatalogValue = string | { value?: string; label?: string; name?: string };
type JiraFields = Record<"summary" | "description" | "issue_type" | "priority" | "status" | "assignee" | "due_date", string>;
type ValidationItem = { code?: string; message?: string; details?: unknown };
type DryRun = {
  issue_id: string;
  target: string;
  mode: string;
  can_sync: boolean;
  canonical_hash?: string;
  field_sources?: Record<string, string | null>;
  stale?: boolean;
  payload?: { fields?: Record<string, unknown>; transition_preview?: { status?: string } | null; [key: string]: unknown };
  validation?: { errors?: ValidationItem[]; missing_required_mapping?: unknown[]; blocking_anomalies?: unknown[] };
  warnings?: ValidationItem[];
};
type Job = { id: string | number; status: string; result?: unknown; error?: unknown };

const fieldLabels: Record<keyof JiraFields, string> = { summary: "Summary", description: "Description", issue_type: "Issue type", priority: "Priority", status: "Status", assignee: "Assignee", due_date: "Due date" };
const emptyFields: JiraFields = { summary: "", description: "", issue_type: "", priority: "", status: "", assignee: "", due_date: "" };

function messageFor(error: unknown, fallback: string) { return error instanceof Error ? error.message : fallback; }
function isTerminal(status: string) { return ["success", "failed", "cancelled", "timeout"].includes(status); }
function catalogValue(option: CatalogValue) { return typeof option === "string" ? option : option.value || option.name || ""; }
function catalogLabel(option: CatalogValue) { return typeof option === "string" ? option : option.label || option.name || option.value || ""; }
function objectValue(value: unknown, key: string) { return value && typeof value === "object" ? String((value as Record<string, unknown>)[key] || "") : ""; }
function fieldsFrom(dryRun: DryRun): JiraFields {
  const fields = dryRun.payload?.fields || {};
  const assignee = fields.assignee;
  return {
    summary: String(fields.summary || ""),
    description: String(fields.description || ""),
    issue_type: objectValue(fields.issuetype, "name"),
    priority: objectValue(fields.priority, "name"),
    status: String(dryRun.payload?.transition_preview?.status || ""),
    assignee: objectValue(assignee, "emailAddress") || objectValue(assignee, "accountId") || objectValue(assignee, "name"),
    due_date: String(fields.duedate || ""),
  };
}

export function JiraSyncPanel({ canonicalDirty, issueId, jiraCatalogs, onDraftDirtyChange, onSynced }: { canonicalDirty: boolean; issueId: string; jiraCatalogs: Record<string, CatalogValue[]>; onDraftDirtyChange: (dirty: boolean) => void; onSynced: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [dryRun, setDryRun] = useState<DryRun | null>(null);
  const [fields, setFields] = useState<JiraFields>(emptyFields);
  const [fieldsDirty, setFieldsDirty] = useState(false);
  const [dryRunLoading, setDryRunLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [localStale, setLocalStale] = useState(false);
  const [requestError, setRequestError] = useState<{ code?: string; message: string; details?: unknown } | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [confirmRerun, setConfirmRerun] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  function markDirty(value: boolean) { setFieldsDirty(value); onDraftDirtyChange(value); }
  function setField(field: keyof JiraFields, value: string) { setFields((current) => ({ ...current, [field]: value })); markDirty(true); setRequestError(null); }

  async function runDryRun() {
    setDryRunLoading(true); setRequestError(null); setConfirmRerun(false); setJob(null);
    try {
      const result = await apiFetch<DryRun>(`/api/v1/issues/${encodeURIComponent(issueId)}/dry-run/jira`, { method: "POST" });
      setDryRun(result); setFields(fieldsFrom(result)); markDirty(false); setLocalStale(false);
    } catch (error) {
      const apiError = error instanceof ApiClientError ? error : null;
      setRequestError({ code: apiError?.code, message: messageFor(error, "Jira dry-run could not be completed."), details: apiError?.details });
      if (dryRun) setLocalStale(true);
    } finally { setDryRunLoading(false); }
  }

  function openDialog() {
    if (canonicalDirty) return;
    setOpen(true); setDryRun(null); setFields(emptyFields); markDirty(false); setLocalStale(false); setRequestError(null); setJob(null); setConfirmRerun(false); setConfirmClose(false);
    void runDryRun();
  }
  function discardAndClose() { setOpen(false); setDryRun(null); setFields(emptyFields); markDirty(false); setRequestError(null); setJob(null); setConfirmClose(false); }
  function requestClose() { if (fieldsDirty && !job) { setConfirmClose(true); return; } discardAndClose(); }
  function requestRerun() { if (fieldsDirty) { setConfirmRerun(true); return; } void runDryRun(); }

  async function pollJob(initial: Job) {
    let current = initial;
    for (let attempt = 0; attempt < 20 && !isTerminal(current.status); attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 750));
      try { current = await apiFetch<Job>(`/api/v1/sync-jobs/${encodeURIComponent(String(initial.id))}`); setJob(current); }
      catch (error) { setRequestError({ message: messageFor(error, "Jira job status could not be refreshed.") }); return; }
    }
    if (!isTerminal(current.status)) { current = { ...current, status: "timeout" }; setJob(current); }
    if (current.status === "success") await onSynced();
  }

  async function syncJira() {
    if (!dryRun?.can_sync || localStale || canonicalDirty || syncing) return;
    setSyncing(true); setRequestError(null);
    try {
      const queued = await apiFetch<Job>(`/api/v1/issues/${encodeURIComponent(issueId)}/sync/jira`, { method: "POST", body: { jira_fields: fields } });
      setJob(queued); markDirty(false);
      if (isTerminal(queued.status)) { if (queued.status === "success") await onSynced(); }
      else await pollJob(queued);
    } catch (error) {
      const apiError = error instanceof ApiClientError ? error : null;
      if (apiError?.code === "DRY_RUN_STALE") setLocalStale(true);
      setRequestError({ code: apiError?.code, message: messageFor(error, "Jira sync could not be started."), details: apiError?.details });
    } finally { setSyncing(false); }
  }

  const errors = dryRun?.validation?.errors || [];
  const warnings = dryRun?.warnings || [];
  const gate = job && !isTerminal(job.status) ? "Publishing" : localStale ? "Stale" : dryRunLoading ? "Checking" : dryRun?.can_sync ? "Ready" : dryRun ? "Blocked" : "Not checked";
  const gateTone = gate === "Ready" || job?.status === "success" ? "good" : gate === "Blocked" || gate === "Stale" || job?.status === "failed" ? "warn" : "neutral";
  const syncDisabled = canonicalDirty || dryRunLoading || syncing || localStale || !dryRun?.can_sync || Boolean(job && !isTerminal(job.status));

  return <>
    <section aria-labelledby="jira-publish-heading" className="surface jira-publish-panel rounded-xl border p-5"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow text-xs font-semibold uppercase tracking-[0.14em]">Outbound gate</p><h2 className="text-primary mt-2 text-lg font-semibold" id="jira-publish-heading">Jira publish</h2></div><Badge tone={gateTone}>{gate}</Badge></div><p className="text-secondary mt-3 text-sm">Review the current canonical payload before publishing to Jira.</p><div className="jira-gate-flow mt-4" aria-label="Jira publish flow"><span>Canonical</span><b>→</b><strong>Dry-run</strong><b>→</b><span>Jira</span></div><Button className="mt-4 w-full" disabled={canonicalDirty} onClick={openDialog} variant="primary">Prepare Jira sync</Button>{canonicalDirty ? <p className="warning-panel mt-3 rounded border p-2 text-xs">Save canonical changes before opening Jira preparation.</p> : null}{job ? <p className="text-secondary mt-3 text-xs">Job <strong className="text-primary font-mono">{String(job.id)}</strong> · {job.status}</p> : null}</section>
    {open ? <Dialog className="jira-sync-dialog max-w-6xl rounded-xl" label="Jira preparation" onClose={requestClose}><div className="jira-sync-dialog__header flex items-start justify-between gap-4 border-b p-5" style={{ borderColor: "var(--border)" }}><div><p className="eyebrow text-xs font-semibold uppercase tracking-[0.14em]">CIS → Jira</p><h2 className="text-primary mt-1 text-xl font-semibold">Jira preparation</h2><p className="text-secondary mt-1 text-sm">Dry-run is the publish checkpoint. Jira remains untouched until Sync Jira is accepted.</p></div><Button onClick={requestClose} variant="secondary">Close</Button></div>
      <div className="jira-sync-dialog__body grid min-h-0 lg:grid-cols-[minmax(0,1fr)_19rem]"><div className="min-w-0 space-y-5 p-5">
        <div className="jira-publish-rail" data-state={gate.toLowerCase()}><div><span>Publish gate</span><strong>{gate}</strong></div><div><span>Canonical hash</span><code title={dryRun?.canonical_hash || ""}>{dryRun?.canonical_hash || "—"}</code></div><div><span>Job evidence</span><strong>{job ? `${job.id} · ${job.status}` : "Not queued"}</strong></div></div>
        {dryRunLoading ? <div className="surface-muted rounded-lg border p-4" role="status"><p className="text-primary font-semibold">Running Jira dry-run…</p><p className="text-secondary mt-1 text-sm">Checking mappings, anomalies, configuration and current canonical state.</p></div> : null}
        {requestError ? <div className="error-panel rounded-lg border p-4" role="alert"><p className="font-semibold">{requestError.code || "JIRA_REQUEST_FAILED"}</p><p className="mt-1 text-sm">{requestError.message}</p>{requestError.details ? <pre className="mt-3 max-h-36 overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(requestError.details, null, 2)}</pre> : null}</div> : null}
        {confirmRerun ? <div className="warning-panel rounded-lg border p-4" role="alert"><p className="font-semibold">Replace edited Jira fields?</p><p className="mt-1 text-sm">A new dry-run uses current canonical data and replaces all Jira overrides in this form.</p><div className="mt-3 flex flex-wrap gap-2"><Button onClick={() => setConfirmRerun(false)} variant="secondary">Keep edits</Button><Button onClick={() => void runDryRun()} variant="primary">Replace and dry-run</Button></div></div> : null}
        {confirmClose ? <div className="warning-panel rounded-lg border p-4" role="alert"><p className="font-semibold">Discard Jira overrides?</p><p className="mt-1 text-sm">Closing now removes the unsent target edits.</p><div className="mt-3 flex flex-wrap gap-2"><Button onClick={() => setConfirmClose(false)} variant="secondary">Continue editing</Button><Button onClick={discardAndClose} variant="danger">Discard overrides</Button></div></div> : null}
        {dryRun ? <form onSubmit={(event) => { event.preventDefault(); void syncJira(); }}><div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-primary font-semibold">Jira target fields</h3><p className="text-secondary mt-1 text-xs">Issue type, priority and status use the current Jira catalog.</p></div>{fieldsDirty ? <Badge tone="warn">Overrides edited</Badge> : <Badge>Dry-run payload</Badge>}</div><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-secondary text-sm sm:col-span-2">Summary<input aria-label="Jira summary" className="field-control mt-2 w-full rounded-lg border px-3 py-2" onChange={(event) => setField("summary", event.target.value)} value={fields.summary} /></label>{(["issue_type", "priority", "status"] as const).map((field) => <label className="text-secondary text-sm" key={field}>{fieldLabels[field]}<select aria-label={`Jira ${fieldLabels[field].toLowerCase()}`} className="field-control mt-2 w-full rounded-lg border px-3 py-2" onChange={(event) => setField(field, event.target.value)} value={fields[field]}><option value="">Select {fieldLabels[field].toLowerCase()}</option>{(jiraCatalogs[field] || []).map((option) => <option key={catalogValue(option)} value={catalogValue(option)}>{catalogLabel(option)}</option>)}</select></label>)}<label className="text-secondary text-sm">Assignee<input aria-label="Jira assignee" className="field-control mt-2 w-full rounded-lg border px-3 py-2" onChange={(event) => setField("assignee", event.target.value)} value={fields.assignee} /></label><label className="text-secondary text-sm">Due date<input aria-label="Jira due date" className="field-control mt-2 w-full rounded-lg border px-3 py-2" onChange={(event) => setField("due_date", event.target.value)} type="date" value={fields.due_date} /></label><label className="text-secondary text-sm sm:col-span-2">Description<textarea aria-label="Jira description" className="field-control mt-2 min-h-32 w-full rounded-lg border px-3 py-2" onChange={(event) => setField("description", event.target.value)} value={fields.description} /></label></div><div className="mt-5 flex flex-wrap justify-end gap-2"><Button disabled={dryRunLoading || syncing} onClick={requestRerun} type="button" variant="secondary">Dry-run again</Button><Button disabled={syncDisabled} type="submit" variant="primary">{syncing || (job && !isTerminal(job.status)) ? "Publishing…" : "Sync Jira"}</Button></div></form> : !dryRunLoading ? <Button onClick={() => void runDryRun()} variant="primary">Retry dry-run</Button> : null}
      </div><aside className="jira-sync-dialog__evidence space-y-5 border-l p-5" style={{ borderColor: "var(--border)" }}><section><h3 className="text-primary text-sm font-semibold">Validation</h3><div className="mt-3 space-y-2">{errors.length ? errors.map((item, index) => <div className="error-panel rounded border p-2 text-xs" key={`${item.code}-${index}`}><strong>{item.code || "ERROR"}</strong><p className="mt-1">{item.message}</p></div>) : <p className="success-panel rounded border p-2 text-xs">No blocking validation errors.</p>}{warnings.map((item, index) => <div className="warning-panel rounded border p-2 text-xs" key={`${item.code}-${index}`}><strong>{item.code || "WARNING"}</strong><p className="mt-1">{item.message}</p></div>)}</div></section><section><h3 className="text-primary text-sm font-semibold">Field sources</h3><dl className="mt-3 space-y-2 text-xs">{Object.entries(dryRun?.field_sources || {}).map(([field, source]) => <div className="flex justify-between gap-3" key={field}><dt className="text-secondary">{fieldLabels[field as keyof JiraFields] || field}</dt><dd className="text-primary font-medium">{source || "—"}</dd></div>)}</dl></section><details><summary className="text-primary cursor-pointer text-sm font-semibold">Payload preview</summary><pre className="surface-muted mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border p-3 text-xs">{JSON.stringify(dryRun?.payload || {}, null, 2)}</pre></details></aside></div>
    </Dialog> : null}
  </>;
}
