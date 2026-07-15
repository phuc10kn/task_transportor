"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, ApiClientError } from "../../../lib/api-client";
import { Badge, Button, StatePanel } from "../../../components/ui";
import { useProjectWorkspace } from "../../../lib/project-workspace";

type Project = { id: number; name: string };
type MappingRow = {
  project_id: number; mapping_type: string; mapping_label: string; required_for_jira?: boolean;
  direction_from: string; direction_to: string; from_value: string; from_label?: string;
  to_value: string; system_values?: { value: string; label: string }[]; cis_values?: { value: string; label: string }[];
  issue_count?: number; existing_rule?: { id: number; approval_status: string } | null;
};
type Settings = { systems: { value: string; label: string }[]; flows: { systems_to_cis: MappingRow[]; cis_to_system: MappingRow[] } };
type MappingGroup = { key: string; label: string; rows: MappingRow[] };

function ruleStatus(row: MappingRow, drafts: Record<string, string>, key: string) {
  const hasDraft = Object.prototype.hasOwnProperty.call(drafts, key);
  if (hasDraft && drafts[key] !== (row.to_value || "")) return "unsaved";
  return row.existing_rule?.approval_status || "not set";
}

function ruleStatusTone(status: string): "neutral" | "good" | "warn" {
  return status === "unsaved" ? "warn" : status === "approved" ? "good" : "neutral";
}

function groupMappingRows(rows: MappingRow[]): MappingGroup[] {
  const groups = new Map<string, MappingGroup>();
  for (const row of rows) {
    const key = row.mapping_type || row.mapping_label || "other";
    const group = groups.get(key) || { key, label: row.mapping_label || row.mapping_type || "Other", rows: [] };
    group.rows.push(row);
    groups.set(key, group);
  }
  return [...groups.values()];
}

function MappingAccordion({ ariaLabel, eyebrow, title, description, children }: { ariaLabel: string; eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const [transition, setTransition] = useState<"opening" | "closing" | "">("");
  const timerRef = useRef<number | null>(null);
  const contentInnerRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  useLayoutEffect(() => {
    const content = contentInnerRef.current;
    if (!content) return;
    const measure = () => setContentHeight(content.scrollHeight);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [children]);

  function toggle(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();
    if (transition) return;
    if (open) {
      setTransition("closing");
      timerRef.current = window.setTimeout(() => {
        setOpen(false);
        setTransition("");
      }, 250);
      return;
    }
    setOpen(true);
    setTransition("opening");
    window.requestAnimationFrame(() => setTransition(""));
  }

  const contentStyle = transition ? 0 : open ? contentHeight ?? "auto" : 0;
  return <details aria-label={ariaLabel} className={`mapping-accordion ${transition ? `mapping-accordion--${transition}` : ""}`} open={open}><summary className="mapping-accordion__summary" onClick={toggle}><span className="mapping-accordion__summary-copy"><span className="eyebrow block text-xs font-semibold uppercase tracking-[0.16em]">{eyebrow}</span><span className="text-primary mt-1 block text-lg font-semibold">{title}</span><span className="text-secondary mt-1 block text-sm">{description}</span></span><svg aria-hidden="true" className="mapping-accordion__chevron" fill="none" height="20" viewBox="0 0 24 24" width="20"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg></summary><div className="mapping-accordion__content" style={{ height: contentStyle }}><div className="mapping-accordion__content-inner" ref={contentInnerRef}>{children}</div></div></details>;
}

function MappingTable({ rows, direction, drafts, setDraft, save, saving }: { rows: MappingRow[]; direction: "to-cis" | "to-system"; drafts: Record<string, string>; setDraft: (key: string, value: string) => void; save: (row: MappingRow) => void; saving: string }) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  if (!rows.length) return <p className="text-secondary py-8 text-sm">No mapping values.</p>;
  return <div className="mapping-field-groups">{groupMappingRows(rows).map((group) => {
    const isOpen = openGroups[group.key] !== false;
    const groupId = `mapping-group-${direction}-${group.key}`;
    return <section className="mapping-field-group" data-mapping-group={group.key} key={group.key}><button aria-controls={groupId} aria-expanded={isOpen} aria-label={`${group.label} mapping group`} className="mapping-group-toggle" onClick={() => setOpenGroups((current) => ({ ...current, [group.key]: !(current[group.key] !== false) }))} type="button"><span className="mapping-group-toggle__label">{group.label}</span><small>{group.rows.length} value{group.rows.length === 1 ? "" : "s"}</small><svg aria-hidden="true" className="mapping-group-toggle__chevron" fill="none" height="18" viewBox="0 0 24 24" width="18"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg></button>{isOpen ? <div className="mapping-field-group__content" id={groupId}><div className="data-table-wrap"><table className="data-table mapping-settings-table w-full text-left text-sm"><thead className="text-secondary text-xs uppercase tracking-wide"><tr><th>{direction === "to-cis" ? "System value" : "CIS value"}</th><th>{direction === "to-cis" ? "CIS value" : "System value"}</th><th>Seen</th><th>Status</th><th /></tr></thead><tbody>{group.rows.map((row) => { const key = `${row.direction_from}|${row.direction_to}|${row.mapping_type}|${row.from_value}`; const options = direction === "to-cis" ? row.cis_values || [] : row.system_values || []; const status = ruleStatus(row, drafts, key); return <tr key={key}><td className="text-primary">{row.from_label || row.from_value}{row.required_for_jira ? <span className="ml-2"><Badge tone="warn">required</Badge></span> : null}</td><td><select aria-label={`${row.mapping_label} target`} className="field-control w-full rounded-lg border px-3 py-2" onChange={(event) => setDraft(key, event.target.value)} value={drafts[key] ?? row.to_value ?? ""}><option value="">Select value</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></td><td className="text-secondary">{row.issue_count ?? "—"}</td><td><Badge tone={ruleStatusTone(status)}>{status}</Badge></td><td><Button className="whitespace-nowrap" disabled={saving === key} onClick={() => save(row)} variant="secondary">{saving === key ? "Saving…" : "Save setting"}</Button></td></tr>; })}</tbody></table></div></div> : null}</section>;
  })}</div>;
}

export default function MappingsPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { activeProject, setDirtySource } = useProjectWorkspace();
  const projectId = activeProject?.id || 0;
  const sourceSystem = search.get("source_system") || "backlog";
  const targetSystem = search.get("target_system") || "jira";
  const [settings, setSettings] = useState<Settings | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [action, setAction] = useState("");
  const [saving, setSaving] = useState("");

  useEffect(() => {
    setDirtySource("Mappings", Object.keys(drafts).length > 0);
    return () => setDirtySource("Mappings", false);
  }, [drafts, setDirtySource]);

  const selectedProject = activeProject as Project | null;
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      if (!selectedProject) { setSettings(null); return; }
      setSettings(await apiFetch<Settings>(`/api/v1/mapping-settings?project_id=${selectedProject.id}&source_system=${encodeURIComponent(sourceSystem)}&target_system=${encodeURIComponent(targetSystem)}`));
      setDrafts({});
    } catch (requestError) {
      setError(requestError instanceof ApiClientError ? requestError.message : "Mappings could not be loaded.");
    } finally { setLoading(false); }
  }, [selectedProject, sourceSystem, targetSystem]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); const refresh = () => void load(); window.addEventListener("cis-global-refresh", refresh); return () => { window.clearTimeout(timer); window.removeEventListener("cis-global-refresh", refresh); }; }, [load]);

  async function refreshSystem(system: string) {
    if (!selectedProject) return;
    setAction(system); setError("");
    const path = system === "cis" ? `/api/v1/projects/${selectedProject.id}/cis/mapping-values/sync` : `/api/v1/projects/${selectedProject.id}/${system}/mapping-values/pull`;
    try { await apiFetch(path, { method: "POST" }); await load(); }
    catch (requestError) { setError(requestError instanceof ApiClientError ? requestError.message : `Could not pull ${system} fields.`); }
    finally { setAction(""); }
  }

  async function save(row: MappingRow) {
    const key = `${row.direction_from}|${row.direction_to}|${row.mapping_type}|${row.from_value}`;
    const toValue = drafts[key] ?? row.to_value ?? "";
    if (!toValue) { setError("Choose a mapping value before saving."); return; }
    setSaving(key); setError("");
    try {
      const body = { from_value: row.from_value, to_value: toValue, approval_status: "approved" };
      await apiFetch(row.existing_rule ? `/api/v1/mapping-rules/${row.existing_rule.id}` : "/api/v1/mapping-rules", { method: row.existing_rule ? "PATCH" : "POST", body: row.existing_rule ? body : { ...body, project_id: row.project_id, mapping_type: row.mapping_type, direction_from: row.direction_from, direction_to: row.direction_to } });
      await load();
    } catch (requestError) { setError(requestError instanceof ApiClientError ? requestError.message : "Mapping could not be saved."); }
    finally { setSaving(""); }
  }

  function updateQuery(name: string, value: string) { const query = new URLSearchParams(search.toString()); query.set(name, value); router.push(`/mappings?${query.toString()}`); }

  const mappingTableProps = (direction: "to-cis" | "to-system", rows: MappingRow[]) => ({ direction, drafts, rows, save, saving, setDraft: (key: string, value: string) => setDrafts((current) => ({ ...current, [key]: value })) });
  return <section className="mx-auto max-w-7xl space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow font-mono text-xs uppercase tracking-[0.2em]">Mappings</p><h1 className="text-primary mt-3 text-3xl font-semibold">Mapping Settings</h1><p className="text-secondary mt-2 text-sm">Approve system values before outbound sync.</p></div><div className="flex flex-wrap gap-2"><Button disabled={!selectedProject || action === "backlog"} onClick={() => void refreshSystem("backlog")}>{action === "backlog" ? "Pulling…" : "Pull Backlog fields"}</Button><Button disabled={!selectedProject || action === "jira"} onClick={() => void refreshSystem("jira")}>{action === "jira" ? "Pulling…" : "Pull Jira fields"}</Button><Button disabled={!selectedProject || action === "cis"} onClick={() => void refreshSystem("cis")}>{action === "cis" ? "Syncing…" : "Sync CIS mapping fields"}</Button></div></div>{loading ? <StatePanel title="Loading mappings" message="Reading current mapping settings…" /> : error && !settings ? <StatePanel title="Mappings unavailable" message={error} action={<Button onClick={() => void load()} variant="primary">Retry</Button>} /> : !selectedProject ? <StatePanel title="No projects configured" message="Create a project before configuring mappings." /> : !settings ? <StatePanel title="Mappings unavailable" message={error || "Mapping settings are not available."} action={<Button onClick={() => void load()} variant="primary">Retry</Button>} /> : <><div className="surface rounded-xl border p-4"><div className="grid gap-4 sm:grid-cols-3"><div className="text-secondary text-sm">Workspace<span className="field-control mt-2 block rounded-lg border px-3 py-2">{selectedProject.name} · #{selectedProject.id}</span></div><label className="text-secondary text-sm">Source<select aria-label="Mapping source system" className="field-control mt-2 w-full rounded-lg border px-3 py-2" onChange={(event) => updateQuery("source_system", event.target.value)} value={sourceSystem}>{settings.systems.map((system) => <option key={system.value} value={system.value}>{system.label}</option>)}</select></label><label className="text-secondary text-sm">Target<select aria-label="Mapping target system" className="field-control mt-2 w-full rounded-lg border px-3 py-2" onChange={(event) => updateQuery("target_system", event.target.value)} value={targetSystem}>{settings.systems.map((system) => <option key={system.value} value={system.value}>{system.label}</option>)}</select></label></div>{error ? <p className="error-panel mt-4 rounded-lg border p-3 text-sm" role="alert">{error}</p> : null}</div><div className="mapping-accordions"><MappingAccordion ariaLabel="System to CIS mappings" eyebrow="Source mapping" title={`${sourceSystem} → CIS`} description="System values discovered from current project issues."><MappingTable {...mappingTableProps("to-cis", settings.flows.systems_to_cis)} /></MappingAccordion><MappingAccordion ariaLabel="CIS to system mappings" eyebrow="Target mapping" title={`CIS → ${targetSystem}`} description="Canonical values mapped to the target system."><MappingTable {...mappingTableProps("to-system", settings.flows.cis_to_system)} /></MappingAccordion></div></>}</section>;
}
