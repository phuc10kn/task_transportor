"use client";

import Link from "next/link";
import MDEditor from "@uiw/react-md-editor";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge, Button, Dialog, StatePanel } from "../../../../components/ui";
import { MarkdownField } from "../../../../features/editor/markdown-field";
import { JiraSyncPanel } from "../../../../features/jira/jira-sync-dialog";
import { ApiClientError, apiFetch } from "../../../../lib/api-client";
import { useProjectWorkspace } from "../../../../lib/project-workspace";

type CanonicalValue = { value: string | null; source: string | null };
type CatalogValue = string | { value?: string; label?: string; name?: string };
type Translation = { id: string | number; target_field?: string; target_type?: string; source_text?: string | null; ai_draft?: string | null; reviewed_text?: string | null; review_status?: string; is_source_stale?: boolean; provider_error?: string | null };
type Editor = {
  issue: { id: string; project_id: number; backlog_issue_key?: string | null; jira_issue_key?: string | null; sync_status?: string; current_revision?: number; updated_at?: string; last_synced_at?: string | null };
  canonical: Record<string, CanonicalValue>;
  sources: Record<string, Record<string, string | null>>;
  assignee_meta?: { cis?: { jira_account_id?: string | null }; jira?: { account_id?: string | null; email?: string | null } };
  field_meta: { catalogs: Record<string, CatalogValue[]>; catalogs_by_system?: Record<string, Record<string, CatalogValue[]>>; field_types: Record<string, string> };
  collections?: { worklog_summary?: { count: number; total_spent_seconds: number; sources: string[] } };
  translation?: { total: number; pending: number; approved: number };
  translations?: Translation[];
  sync?: { canonical_hash?: string };
};
type History = { manual_edits?: Array<Record<string, unknown>> };
type Attachment = { id: string | number; filename?: string; file_name?: string; download_status?: string; sync_status?: string; error?: string | null; source_url?: string | null };
type Job = { id: string | number; status: string; result?: Record<string, unknown>; error?: Record<string, unknown> | string };

const editableFields = ["summary", "description", "issue_type", "priority", "status", "assignee", "due_date"] as const;
const labels: Record<string, string> = { summary: "Summary", description: "Description", issue_type: "Issue type", priority: "Priority", status: "Status", assignee: "Assignee", due_date: "Due date" };

function messageFor(error: unknown, fallback: string) { return error instanceof ApiClientError ? error.message : error instanceof Error ? error.message : fallback; }
function optionValue(option: CatalogValue) { return typeof option === "string" ? option : option.value || option.name || ""; }
function optionLabel(option: CatalogValue) { return typeof option === "string" ? option : option.label || option.name || option.value || ""; }
function catalogWithCurrentValue(catalog: CatalogValue[], value: string) {
  if (!value || catalog.some((option) => optionValue(option) === value)) {
    return { options: catalog, missing: false };
  }

  return {
    options: [{ value, label: `${value} (current; not in catalog)` }, ...catalog],
    missing: true,
  };
}
function stringify(value: unknown) { return value === null || value === undefined || value === "" ? "—" : typeof value === "string" ? value : JSON.stringify(value); }
function translationText(item: Translation) { return item.is_source_stale ? "" : item.reviewed_text || item.ai_draft || ""; }
function TranslationField({ item, text, disabled, onChange }: { item: Translation; text: string; disabled: boolean; onChange: (value: string) => void }) {
  const ariaLabel = `Translation ${item.id}`;
  if (item.target_field === "description") return <MarkdownField ariaLabel={ariaLabel} disabled={disabled} onChange={onChange} value={text} />;
  if (item.target_field === "summary") return <input aria-label={ariaLabel} className="field-control mt-2 w-full rounded-lg border px-3 py-2" disabled={disabled} onChange={(event) => onChange(event.target.value)} value={text} />;
  return <textarea aria-label={ariaLabel} className="field-control mt-3 min-h-24 w-full rounded-lg border px-3 py-2" disabled={disabled} onChange={(event) => onChange(event.target.value)} value={text} />;
}
function TranslationSource({ item }: { item: Translation }) {
  if (item.target_field === "description") return <div className="translation-source-markdown" data-color-mode="light"><MDEditor.Markdown source={item.source_text || ""} /></div>;
  return <p className="translation-source-text text-secondary text-sm">{stringify(item.source_text)}</p>;
}

function TranslationReviewPanel({ item, text, canonicalDirty, translationState, onTextChange, onTranslate, onReview }: {
  item: Translation;
  text: string;
  canonicalDirty: boolean;
  translationState: string | null;
  onTextChange: (value: string) => void;
  onTranslate: () => void;
  onReview: (action: "reject" | "manual-edit") => void;
}) {
  const stale = Boolean(item.is_source_stale);
  const fieldLabel = labels[item.target_field || ""] || item.target_field || `Translation #${item.id}`;
  const busy = Boolean(translationState);

  return <article aria-labelledby={`translation-tab-${item.id}`} className="translation-review" data-translation-field={item.target_field} id={`translation-panel-${item.id}`} role="tabpanel">
    <div className="translation-review__source" style={{ background: "var(--surface, #ffffff)", borderColor: "var(--border-strong, #cbd5e1)" }}>
      {item.target_field === "description" ? <details className="translation-review__source-disclosure"><summary><span><strong>Source Markdown</strong><small>Read-only original</small></span><span className="translation-review__source-action">View source</span></summary><div className="translation-review__source-body"><TranslationSource item={item} /></div></details> : <><div className="translation-review__label-row"><p className="translation-workbench__kicker">Source snapshot</p><span>Read only</span></div><div className="translation-review__source-body"><TranslationSource item={item} /></div></>}
    </div>
    <section className="translation-review__draft">
      <div className="translation-review__label-row">
        <p className="translation-workbench__kicker">{fieldLabel} · CIS draft</p>
        <span>Independent review</span>
      </div>
      {item.provider_error ? <p className="error-panel mt-3 rounded border p-2 text-xs">{item.provider_error}</p> : null}
      {item.ai_draft && item.ai_draft === item.source_text ? <p className="warning-panel mt-3 rounded border p-2 text-xs">Draft matches source. Check the provider or edit it before approval.</p> : null}
      {stale ? <p className="warning-panel mt-3 rounded border p-2 text-xs">Source changed. Retranslate this field before editing or approval.</p> : null}
      <TranslationField disabled={canonicalDirty || stale} item={item} onChange={onTextChange} text={text} />
    </section>
    <footer className="translation-review__actions">
      <Button disabled={canonicalDirty || busy} onClick={onTranslate} variant="secondary">{translationState === `item:${item.id}` ? "Translating…" : "Retranslate"}</Button>
      <Button disabled={canonicalDirty || stale || busy} onClick={() => onReview("reject")} variant="secondary">Reject</Button>
      <Button disabled={canonicalDirty || stale || !text.trim() || busy} onClick={() => onReview("manual-edit")} variant="primary">{translationState === `review:${item.id}` ? "Saving…" : "Approve + save"}</Button>
    </footer>
  </article>;
}
function isTerminal(status: string) { return ["success", "failed", "cancelled", "timeout"].includes(status); }

export default function IssueEditorPage() {
  const params = useParams<{ issueId: string }>();
  const router = useRouter();
  const { activeProject, setDirtySource } = useProjectWorkspace();
  const issueId = params.issueId;
  const [editor, setEditor] = useState<Editor | null>(null);
  const [history, setHistory] = useState<History | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [reason, setReason] = useState("");
  const [jiraAccountId, setJiraAccountId] = useState("");
  const [identity, setIdentity] = useState({ backlog_issue_key: "", jira_issue_key: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [leaveRequested, setLeaveRequested] = useState(false);
  const [identitySaving, setIdentitySaving] = useState(false);
  const [resyncState, setResyncState] = useState<Job | null>(null);
  const [attachmentState, setAttachmentState] = useState<Record<string, string>>({});
  const [translationState, setTranslationState] = useState<string | null>(null);
  const [translationFeedback, setTranslationFeedback] = useState("");
  const [translationEdit, setTranslationEdit] = useState<Record<string, string>>({});
  const [activeTranslationId, setActiveTranslationId] = useState("");
  const [jiraDraftDirty, setJiraDraftDirty] = useState(false);
  const dirtyRef = useRef(false);
  const jiraDirtyRef = useRef(false);
  const loadRequest = useRef(0);

  const load = useCallback(async (silent = false) => {
    const requestId = ++loadRequest.current;
    if (!silent) setLoading(true);
    setError("");
    try {
      const nextEditor = await apiFetch<Editor>(`/api/v1/issues/${encodeURIComponent(issueId)}/editor`);
      if (requestId !== loadRequest.current) return;
      if (!activeProject || nextEditor.issue.project_id !== activeProject.id) {
        setEditor(null); setHistory(null); setAttachments([]);
        setError("Issue này không thuộc Project workspace đang active. Chọn đúng Project tại Projects để tiếp tục.");
        return;
      }
      const [nextHistory, nextAttachments] = await Promise.all([
        apiFetch<History>(`/api/v1/issues/${encodeURIComponent(issueId)}/history`),
        apiFetch<Attachment[]>(`/api/v1/issues/${encodeURIComponent(issueId)}/attachments`),
      ]);
      if (requestId !== loadRequest.current) return;
      setEditor(nextEditor); setHistory(nextHistory); setAttachments(nextAttachments || []);
      setDraft(Object.fromEntries(editableFields.map((field) => [field, String(nextEditor.canonical[field]?.value ?? "")])));
      setReason(""); setJiraAccountId(nextEditor.assignee_meta?.cis?.jira_account_id || "");
      setIdentity({ backlog_issue_key: nextEditor.issue.backlog_issue_key || "", jira_issue_key: nextEditor.issue.jira_issue_key || "" });
      setDirty(false); setActionError("");
    } catch (loadError) { if (requestId === loadRequest.current) { const message = messageFor(loadError, "Issue editor could not be loaded."); if (silent) setActionError(message); else setError(message); } }
    finally { if (requestId === loadRequest.current && !silent) setLoading(false); }
  }, [activeProject, issueId]);

  useEffect(() => { dirtyRef.current = dirty; }, [dirty]);
  useEffect(() => { jiraDirtyRef.current = jiraDraftDirty; }, [jiraDraftDirty]);
  useEffect(() => {
    setDirtySource("Issue Editor", dirty || jiraDraftDirty);
    return () => setDirtySource("Issue Editor", false);
  }, [dirty, jiraDraftDirty, setDirtySource]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); const refresh = () => { if (!dirtyRef.current && !jiraDirtyRef.current) void load(); }; window.addEventListener("cis-global-refresh", refresh); return () => { window.clearTimeout(timer); window.removeEventListener("cis-global-refresh", refresh); }; }, [load]);
  useEffect(() => { const handler = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } }; window.addEventListener("beforeunload", handler); return () => window.removeEventListener("beforeunload", handler); }, [dirty]);

  const sourceRows = useMemo(() => editor ? Object.entries(editor.sources || {}) : [], [editor]);
  const translationItems = useMemo(() => (editor?.translations || []).filter((item) => item.target_type === "issue" || !item.target_type), [editor]);

  function setField(field: string, value: string) { setDraft((current) => ({ ...current, [field]: value })); setDirty(true); setSaveError(""); }
  async function save() {
    if (!editor) return;
    setSaving(true); setSaveError("");
    try {
      await apiFetch(`/api/v1/issues/${encodeURIComponent(issueId)}`, { method: "PATCH", body: { ...draft, reason, assignee_meta: { jira_account_id: jiraAccountId || null } } });
      await load();
    } catch (saveFailure) { setSaveError(messageFor(saveFailure, "Canonical issue could not be saved.")); }
    finally { setSaving(false); }
  }
  function backToList() { if (dirty) { setLeaveRequested(true); return; } router.push(`/cis-issues?project_id=${editor?.issue.project_id || ""}`); }

  async function linkIdentity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editor || dirty) return;
    setIdentitySaving(true); setActionError("");
    try { await apiFetch(`/api/v1/issues/${encodeURIComponent(issueId)}/external-identities`, { method: "POST", body: { backlog_issue_key: identity.backlog_issue_key.trim() || undefined, jira_issue_key: identity.jira_issue_key.trim() || undefined } }); await load(); }
    catch (failure) { setActionError(messageFor(failure, "External identity could not be linked.")); }
    finally { setIdentitySaving(false); }
  }

  async function pollJob(job: Job) {
    if (!job?.id || isTerminal(job.status)) { setResyncState(job); return; }
    setResyncState(job);
    let current = job;
    for (let attempt = 0; attempt < 30 && !isTerminal(current.status); attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
      try { current = await apiFetch<Job>(`/api/v1/sync-jobs/${encodeURIComponent(String(job.id))}`); setResyncState(current); }
      catch (failure) { setActionError(messageFor(failure, "Job status could not be refreshed.")); return; }
    }
    if (!isTerminal(current.status)) setResyncState({ ...current, status: "timeout" });
    if (current.status === "success") await load();
  }

  async function resync() {
    if (!editor || dirty || !editor.issue.backlog_issue_key) return;
    setActionError(""); setResyncState({ id: "pending", status: "queued" });
    try { const job = await apiFetch<Job>(`/api/v1/projects/${editor.issue.project_id}/backlog/issues/${encodeURIComponent(editor.issue.backlog_issue_key)}/pull`, { method: "POST" }); await pollJob(job); }
    catch (failure) { setResyncState(null); setActionError(messageFor(failure, "Backlog resync could not be started.")); }
  }

  async function retryAttachment(attachment: Attachment) {
    const key = String(attachment.id); setAttachmentState((current) => ({ ...current, [key]: "retrying" })); setActionError("");
    try { await apiFetch(`/api/v1/attachments/${encodeURIComponent(key)}/retry-download`, { method: "POST" }); setAttachmentState((current) => ({ ...current, [key]: "queued" })); const refreshed = await apiFetch<Attachment[]>(`/api/v1/issues/${encodeURIComponent(issueId)}/attachments`); setAttachments(refreshed || []); }
    catch (failure) { setAttachmentState((current) => ({ ...current, [key]: "failed" })); setActionError(messageFor(failure, "Attachment retry could not be queued.")); }
  }

  async function translateIssue() {
    if (dirty) return; setTranslationState("issue"); setActionError(""); setTranslationFeedback("");
    try { const response = await apiFetch<{ execution_status?: string; queued_job_ids?: string[] }>(`/api/v1/translations/issues/${encodeURIComponent(issueId)}/translate`, { method: "POST" }); const queued = response.execution_status === "queued" || response.execution_status === "partial_queued" || Boolean(response.queued_job_ids?.length); setTranslationFeedback(queued ? `Translation queued${response.queued_job_ids?.length ? ` (${response.queued_job_ids.join(", ")})` : ""}; review Translation Queue.` : "Translation draft created; review before approval."); await load(); }
    catch (failure) { setActionError(messageFor(failure, "Translation could not be started.")); }
    finally { setTranslationState(null); }
  }
  async function translateItem(item: Translation) {
    if (dirty) return; const key = `item:${item.id}`; setTranslationState(key); setActionError(""); setTranslationFeedback("");
    try { const response = await apiFetch<{ execution_status?: string; queued_job_ids?: string[] }>(`/api/v1/translations/issues/${encodeURIComponent(issueId)}/items/${encodeURIComponent(String(item.id))}/translate`, { method: "POST" }); const queued = response.execution_status === "queued" || response.execution_status === "partial_queued" || Boolean(response.queued_job_ids?.length); setTranslationFeedback(queued ? `Retranslate queued${response.queued_job_ids?.length ? ` (${response.queued_job_ids.join(", ")})` : ""}; review Translation Queue.` : "Retranslate draft created; review before approval."); await load(); }
    catch (failure) { setActionError(messageFor(failure, "Translation could not be started.")); }
    finally { setTranslationState(null); }
  }
  async function reviewItem(item: Translation, action: "approve" | "reject" | "manual-edit") {
    if (dirty || item.is_source_stale) return; const key = `review:${item.id}`; setTranslationState(key); setActionError("");
    try { const body = action === "manual-edit" ? { reviewed_text: translationEdit[String(item.id)] || translationText(item), review_notes: "issue-editor" } : { review_notes: "issue-editor" }; await apiFetch(`/api/v1/translation-queue/${encodeURIComponent(String(item.id))}/${action}`, { method: "POST", body }); await load(); }
    catch (failure) { setActionError(messageFor(failure, "Translation review could not be saved.")); }
    finally { setTranslationState(null); }
  }

  if (loading) return <section className="mx-auto max-w-7xl"><StatePanel title="Loading Issue Editor" message="Reading canonical, source and recovery evidence…" /></section>;
  if (error || !editor) return <section className="mx-auto max-w-7xl"><StatePanel title="Issue Editor unavailable" message={error || "Issue was not found."} action={<div className="flex gap-2"><Button onClick={() => void load()} variant="secondary">Retry</Button><Link className="ui-button ui-button--primary" href="/projects">Open Projects</Link></div>} /></section>;
  const worklog = editor.collections?.worklog_summary;
  const activeTranslation = translationItems.find((item) => String(item.id) === activeTranslationId) || translationItems[0];
  return <section className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><button className="eyebrow text-xs font-semibold uppercase tracking-[0.16em]" onClick={backToList} type="button">← CIS Issues</button><h1 className="text-primary mt-3 text-3xl font-semibold tracking-tight">{editor.issue.backlog_issue_key || editor.issue.id}</h1><p className="text-secondary mt-2 text-sm">Canonical Issue Editor · Project {editor.issue.project_id}</p></div><div className="flex items-center gap-2">{dirty || jiraDraftDirty ? <Badge tone="warn">Unsaved</Badge> : <Badge>{editor.issue.sync_status || "unknown"}</Badge>}</div></div>
    {actionError ? <p className="error-panel rounded-lg border p-3 text-sm" role="alert">{actionError}</p> : null}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.75fr)]">
      <div className="space-y-6">
        <section className="surface rounded-xl border p-5" aria-labelledby="canonical-heading"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow font-mono text-xs font-semibold uppercase tracking-[0.16em]">Canonical CIS data</p><h2 className="text-primary mt-2 text-lg font-semibold" id="canonical-heading">Editable fields</h2><p className="text-secondary mt-1 text-sm">Select options come from the current editor catalog.</p></div><Button disabled={!dirty || saving} onClick={() => void save()} variant="primary">{saving ? "Saving…" : "Save canonical"}</Button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{editableFields.map((field) => { const type = editor.field_meta.field_types[field]; const value = draft[field] || ""; const catalog = editor.field_meta.catalogs[field] || []; const catalogState = type === "single_select" || type === "user" ? catalogWithCurrentValue(catalog, value) : { options: catalog, missing: false }; return <label className={`${field === "description" ? "sm:col-span-2" : ""} text-secondary text-sm`} key={field}><span className="text-primary font-bold">{labels[field]}</span>{type === "text" ? field === "description" ? <MarkdownField ariaLabel={labels[field]} onChange={(nextValue) => setField(field, nextValue)} value={value} /> : <textarea aria-label={labels[field]} className="field-control mt-2 min-h-32 w-full rounded-lg border px-3 py-2" onChange={(event) => setField(field, event.target.value)} value={value} /> : type === "single_select" || type === "user" ? <><select aria-label={labels[field]} className="field-control mt-2 w-full rounded-lg border px-3 py-2" onChange={(event) => setField(field, event.target.value)} value={value}><option value="">Select {labels[field].toLowerCase()}</option>{catalogState.options.map((option) => <option key={optionValue(option)} value={optionValue(option)}>{optionLabel(option)}</option>)}</select>{catalogState.missing ? <span className="warning-panel mt-2 block rounded border p-2 text-xs" role="status">Current value is not in the active catalog. Refresh Mappings before changing it.</span> : null}</> : <input aria-label={labels[field]} className="field-control mt-2 w-full rounded-lg border px-3 py-2" onChange={(event) => setField(field, event.target.value)} type={type === "date" ? "date" : "text"} value={value} />}</label>; })}<label className="text-secondary text-sm sm:col-span-2"><span className="text-primary font-bold">Jira account ID</span><input aria-label="Jira account ID" className="field-control mt-2 w-full rounded-lg border px-3 py-2" onChange={(event) => { setJiraAccountId(event.target.value); setDirty(true); }} value={jiraAccountId} /></label><label className="text-secondary text-sm sm:col-span-2"><span className="text-primary font-bold">Reason (audit note)</span><textarea aria-label="Reason" className="field-control mt-2 min-h-20 w-full rounded-lg border px-3 py-2" onChange={(event) => { setReason(event.target.value); setDirty(true); }} value={reason} /></label></div>{saveError ? <p className="error-panel mt-4 rounded-lg border p-3 text-sm" role="alert">{saveError}</p> : null}</section>
        <section className="surface rounded-xl border p-5" aria-labelledby="source-heading"><h2 className="text-primary text-lg font-semibold" id="source-heading">Source comparison</h2><p className="text-secondary mt-1 text-sm">Read-only source evidence; canonical values are the editable surface.</p><div className="mt-4 overflow-x-auto"><table className="data-table source-comparison-table w-full min-w-[960px] text-left text-sm"><thead className="text-subtle border-b text-xs uppercase tracking-wide"><tr><th>Field</th><th>Backlog</th><th>CIS</th><th>Jira</th></tr></thead><tbody>{sourceRows.map(([field, values]) => <tr key={field}><td className="text-primary align-top font-semibold">{labels[field] || field}</td><td className="source-comparison-cell text-secondary"><div className="source-comparison-value">{stringify(values.backlog)}</div></td><td className="source-comparison-cell text-secondary"><div className="source-comparison-value">{stringify(values.cis)}</div></td><td className="source-comparison-cell text-secondary"><div className="source-comparison-value">{stringify(values.jira)}</div></td></tr>)}</tbody></table></div></section>
        <section className="translation-section surface overflow-hidden rounded-xl border" aria-labelledby="translation-heading">
          <div className="translation-section__header">
            <div>
              <p className="translation-workbench__kicker">Translation workbench</p>
              <h2 className="text-primary mt-1 text-lg font-semibold" id="translation-heading">Review translations</h2>
              <p className="text-secondary mt-1 text-sm">Summary and Description are translated, edited and approved as separate fields.</p>
            </div>
            <Button disabled={dirty || Boolean(translationState)} onClick={() => void translateIssue()} variant="primary">{translationState === "issue" ? "Generating…" : "Generate drafts"}</Button>
          </div>
          {translationFeedback ? <p className="warning-panel mx-5 mt-4 rounded border p-2 text-xs" role="status">{translationFeedback}</p> : null}
          {translationItems.length ? <>
            <div aria-label="Translation field" className="translation-field-tabs" role="tablist">
              {translationItems.map((item) => {
                const active = String(activeTranslation?.id) === String(item.id);
                const stale = Boolean(item.is_source_stale);
                const approved = item.review_status === "approved";
                const statusStyle = stale
                  ? { background: "var(--warning-bg, #fffbeb)", borderColor: "var(--warning-text, #b45309)", color: "var(--warning-text, #b45309)" }
                  : approved
                    ? { background: "var(--success-bg, #ecfdf3)", borderColor: "var(--success-text, #047857)", color: "var(--success-text, #047857)" }
                    : active
                      ? { background: "var(--surface, #ffffff)", borderColor: "var(--accent, #2563eb)", color: "var(--accent, #2563eb)" }
                      : { background: "var(--surface, #ffffff)", borderColor: "var(--border-strong, #cbd5e1)", color: "var(--text, #0f172a)" };
                return <button aria-controls={`translation-panel-${item.id}`} aria-selected={active} className={`translation-field-tab ${active ? "translation-field-tab--active" : ""}`} id={`translation-tab-${item.id}`} key={String(item.id)} onClick={() => setActiveTranslationId(String(item.id))} role="tab" style={{ background: active ? "color-mix(in srgb, var(--accent, #2563eb) 12%, var(--surface, #ffffff))" : "var(--surface-muted, #f8fafc)", boxShadow: active ? "inset 0 -3px 0 var(--accent, #2563eb)" : "none", color: active ? "var(--accent, #2563eb)" : "var(--text-muted, #475569)" }} type="button"><span>{labels[item.target_field || ""] || item.target_field || `Translation #${item.id}`}</span><span className="badge" style={statusStyle}>{stale ? "source stale" : item.review_status || "pending"}</span></button>;
              })}
            </div>
            {activeTranslation ? <TranslationReviewPanel
              canonicalDirty={dirty}
              item={activeTranslation}
              onReview={(action) => void reviewItem(activeTranslation, action)}
              onTextChange={(value) => setTranslationEdit((current) => ({ ...current, [String(activeTranslation.id)]: value }))}
              onTranslate={() => void translateItem(activeTranslation)}
              text={translationEdit[String(activeTranslation.id)] ?? translationText(activeTranslation)}
              translationState={translationState}
            /> : null}
          </> : <div className="translation-workbench__empty"><p className="text-primary font-semibold">No translation drafts</p><p className="text-secondary mt-1 text-sm">Generate drafts to create separate Summary and Description review items.</p></div>}
        </section>
      </div>
      <aside className="space-y-6">
        <JiraSyncPanel canonicalDirty={dirty} issueId={issueId} jiraCatalogs={editor.field_meta.catalogs_by_system?.jira || {}} onDraftDirtyChange={setJiraDraftDirty} onSynced={() => load(true)} />
        <section className="surface rounded-xl border p-5" aria-labelledby="recovery-heading"><div className="flex items-center justify-between"><h2 className="text-primary text-lg font-semibold" id="recovery-heading">Recovery actions</h2><Badge tone={dirty ? "warn" : "neutral"}>{dirty ? "save first" : "ready"}</Badge></div><div className="mt-4 space-y-4"><form onSubmit={linkIdentity}><h3 className="text-primary font-semibold">External identities</h3><p className="text-secondary mt-1 text-xs">Blank identities can be verified once; linked identities stay immutable.</p><div className="mt-3 space-y-3"><input aria-label="Backlog issue key" className="field-control w-full rounded-lg border px-3 py-2" disabled={dirty || Boolean(editor.issue.backlog_issue_key)} onChange={(event) => setIdentity({ ...identity, backlog_issue_key: event.target.value })} placeholder="Backlog issue key" value={identity.backlog_issue_key} /><input aria-label="Jira issue key" className="field-control w-full rounded-lg border px-3 py-2" disabled={dirty || Boolean(editor.issue.jira_issue_key)} onChange={(event) => setIdentity({ ...identity, jira_issue_key: event.target.value })} placeholder="Jira issue key" value={identity.jira_issue_key} /></div><Button className="mt-3 w-full" disabled={dirty || identitySaving || (Boolean(editor.issue.backlog_issue_key) && Boolean(editor.issue.jira_issue_key))} type="submit" variant="secondary">{identitySaving ? "Verifying…" : "Verify and link"}</Button></form><div className="border-t pt-4" style={{ borderColor: "var(--border)" }}><h3 className="text-primary font-semibold">Backlog resync</h3><p className="text-secondary mt-1 text-xs">Resync is blocked while canonical changes are unsaved.</p><Button className="mt-3 w-full" disabled={dirty || !editor.issue.backlog_issue_key || resyncState?.status === "queued" || resyncState?.status === "running"} onClick={() => void resync()} variant="secondary">{resyncState && !isTerminal(resyncState.status) ? "Resyncing…" : "Resync from Backlog"}</Button>{resyncState ? <p className="text-secondary mt-2 text-xs">Job {String(resyncState.id)} · {resyncState.status}</p> : null}</div></div></section>
        <section className="surface rounded-xl border p-5" aria-labelledby="overview-heading"><div className="flex items-center justify-between"><h2 className="text-primary text-lg font-semibold" id="overview-heading">Operational evidence</h2><Badge>{editor.issue.sync_status || "unknown"}</Badge></div><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-secondary">CIS ID</dt><dd className="text-primary font-mono">{editor.issue.id}</dd></div><div className="flex justify-between gap-4"><dt className="text-secondary">Project</dt><dd className="text-primary">{editor.issue.project_id}</dd></div><div className="flex justify-between gap-4"><dt className="text-secondary">Backlog</dt><dd className="text-primary">{editor.issue.backlog_issue_key || "—"}</dd></div><div className="flex justify-between gap-4"><dt className="text-secondary">Jira</dt><dd className="text-primary">{editor.issue.jira_issue_key || "—"}</dd></div><div className="flex justify-between gap-4"><dt className="text-secondary">Updated</dt><dd className="text-primary">{stringify(editor.issue.updated_at)}</dd></div><div className="flex justify-between gap-4"><dt className="text-secondary">Worklogs</dt><dd className="text-primary">{worklog ? `${worklog.count} · ${worklog.total_spent_seconds}s · ${(worklog.sources || []).join(", ") || "no source"}` : "—"}</dd></div><div className="flex justify-between gap-4"><dt className="text-secondary">Canonical hash</dt><dd className="text-primary max-w-[12rem] truncate font-mono text-xs">{editor.sync?.canonical_hash || "—"}</dd></div></dl></section>
        <section className="surface rounded-xl border p-5" aria-labelledby="attachments-heading"><div className="flex items-center justify-between"><h2 className="text-primary text-lg font-semibold" id="attachments-heading">Attachments</h2><Badge>{attachments.length}</Badge></div><div className="mt-4 space-y-3">{attachments.length ? attachments.map((attachment) => { const state = attachmentState[String(attachment.id)]; return <div className="surface-muted flex items-center justify-between gap-3 rounded-lg border p-3 text-sm" key={String(attachment.id)}><div className="min-w-0"><p className="text-primary truncate">{attachment.filename || attachment.file_name || `Attachment ${attachment.id}`}</p><p className="text-secondary mt-1 text-xs">{attachment.download_status || attachment.sync_status || "unknown"}{attachment.error ? ` · ${attachment.error}` : ""}</p></div><Button disabled={state === "retrying"} onClick={() => void retryAttachment(attachment)} variant="secondary">{state === "retrying" ? "Retrying…" : "Retry"}</Button></div>; }) : <p className="text-secondary text-sm">No attachments for this issue.</p>}</div></section>
        <section className="surface rounded-xl border p-5" aria-labelledby="history-heading"><h2 className="text-primary text-lg font-semibold" id="history-heading">History</h2><div className="mt-4 space-y-3">{history?.manual_edits?.length ? history.manual_edits.map((item, index) => <div className="surface-muted rounded-lg border p-3 text-xs" key={`${String(item.id || "edit")}-${index}`}><p className="text-primary font-semibold">{stringify(item.action || "Manual edit")}</p><p className="text-secondary mt-1">{stringify(item.created_at || item.updated_at)}</p><p className="text-secondary mt-1">{stringify((item.details_json as Record<string, unknown> | undefined)?.reason || item.message)}</p></div>) : <p className="text-secondary text-sm">No manual edit history.</p>}</div></section>
      </aside>
    </div>
    {leaveRequested ? <Dialog className="max-w-xl rounded-xl p-5" label="Discard unsaved changes" onClose={() => setLeaveRequested(false)}><p className="text-primary font-semibold">Discard unsaved changes?</p><p className="text-secondary mt-1 text-sm">Your canonical draft has not been saved.</p><div className="mt-4 flex justify-end gap-2"><Button onClick={() => setLeaveRequested(false)} variant="secondary">Stay</Button><Button onClick={() => router.push(`/cis-issues?project_id=${editor.issue.project_id}`)} variant="primary">Discard and leave</Button></div></Dialog> : null}
  </section>;
}
