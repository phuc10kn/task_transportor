"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, ApiClientError } from "../../../lib/api-client";
import { Badge, Button, StatePanel } from "../../../components/ui";

type Project = Record<string, unknown> & { id: number; name: string };
type TextFieldDefinition = readonly [field: string, label: string];

const defaults: Record<string, unknown> = {
  enabled: true,
  sync_enabled: false,
  auto_translate: true,
  require_translation_review: true,
  require_mapping_approval: true,
  manual_pull_enabled: true,
  scheduled_pull_enabled: false,
  translation_ai_provider: "deepseek",
  translation_ai_transport: "openai_compatible",
  translation_ai_model: "deepseek-v4-flash",
};

const generalFields: TextFieldDefinition[] = [
  ["name", "Name"],
  ["source_language", "Source language"],
  ["target_language", "Target language"],
];
const backlogFields: TextFieldDefinition[] = [
  ["backlog_space_url", "Backlog URL"],
  ["backlog_project_key", "Backlog project key"],
  ["backlog_issue_key_prefix", "Backlog issue prefix"],
  ["backlog_api_key", "Backlog API key"],
];
const jiraFields: TextFieldDefinition[] = [
  ["jira_site_url", "Jira URL"],
  ["jira_project_key", "Jira project key"],
  ["jira_email", "Jira email"],
  ["jira_api_token", "Jira API token"],
];
const flags = [
  ["enabled", "Enabled"],
  ["sync_enabled", "Sync enabled"],
  ["auto_translate", "Auto translate"],
  ["require_translation_review", "Translation review required"],
  ["require_mapping_approval", "Mapping approval required"],
  ["manual_pull_enabled", "Manual pull"],
  ["scheduled_pull_enabled", "Scheduled pull"],
] as const;

const aiTransports: Record<string, readonly string[]> = {
  deepseek: ["openai_compatible", "anthropic_compatible"],
  codex_exec: ["process_exec"],
};
const aiModels: Record<string, readonly { value: string; label: string; warning?: string }[]> = {
  deepseek: [
    { value: "deepseek-v4-flash", label: "deepseek-v4-flash" },
    { value: "deepseek-v4-pro", label: "deepseek-v4-pro" },
    { value: "deepseek-chat", label: "deepseek-chat", warning: "Deprecated soon: deepseek-chat is scheduled to retire on 2026-07-24 15:59 UTC." },
  ],
  codex_exec: [],
};

function asText(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

function TextInput({ field, form, label, onChange }: { field: string; form: Record<string, unknown>; label: string; onChange: (field: string, value: string) => void }) {
  const required = field === "name" || field === "source_language" || field === "target_language";
  const type = field.includes("token") || field.includes("api_key") ? "password" : "text";
  return <label className="text-secondary block text-sm">{label}<input className="field-control mt-2 w-full rounded-lg border px-3 py-2" name={field} onChange={(event) => onChange(field, event.target.value)} required={required} type={type} value={asText(form[field])} /></label>;
}

function SystemAccordion({ children, description, label, title }: { children: React.ReactNode; description: string; label: string; title: string }) {
  return <details aria-label={label} className="system-accordion" open>
    <summary className="system-accordion__summary">
      <span><span className="text-primary block font-semibold">{title}</span><span className="text-secondary mt-1 block text-xs">{description}</span></span>
      <svg aria-hidden="true" className="system-accordion__chevron" fill="none" height="18" viewBox="0 0 24 24" width="18"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
    </summary>
    <div className="system-accordion__content">{children}</div>
  </details>;
}

function ProjectForm({ project, onSaved }: { project: Project | null; onSaved: (project: Project) => void }) {
  const [form, setForm] = useState<Record<string, unknown>>({ ...defaults, ...(project || {}) });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: unknown) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const provider = asText(form.translation_ai_provider || "deepseek");
  const transports = aiTransports[provider] || [];
  const transport = transports.includes(asText(form.translation_ai_transport)) ? asText(form.translation_ai_transport) : transports[0] || "";
  const models = aiModels[provider] || [];
  const model = models.some((option) => option.value === asText(form.translation_ai_model)) ? asText(form.translation_ai_model) : models[0]?.value || "";
  const modelWarning = models.find((option) => option.value === model)?.warning;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = project
        ? await apiFetch<Project>(`/api/v1/projects/${project.id}`, { method: "PATCH", body: form })
        : await apiFetch<Project>("/api/v1/projects", { method: "POST", body: form });
      onSaved(data);
    } catch (requestError) {
      setError(requestError instanceof ApiClientError ? requestError.message : "Project could not be saved.");
      const field = requestError instanceof ApiClientError && requestError.details && typeof requestError.details === "object" && "field" in requestError.details
        ? String(requestError.details.field)
        : "";
      if (field) window.setTimeout(() => document.querySelector<HTMLInputElement>(`[name="${field}"]`)?.focus(), 0);
    } finally {
      setSaving(false);
    }
  }

  return <form className="space-y-6" onSubmit={submit}>
    <div className="flex items-start justify-between gap-4">
      <div><p className="eyebrow font-mono text-xs uppercase tracking-[0.2em]">{project ? `Project #${project.id}` : "New project"}</p><h2 className="text-primary mt-2 text-2xl font-semibold">{project ? "Project configuration" : "Create project"}</h2></div>
      <Button disabled={saving} variant="primary">{saving ? "Saving…" : "Save project"}</Button>
    </div>
    {error ? <p className="error-panel rounded-lg border p-3 text-sm" role="alert">{error}</p> : null}

    <section className="config-section" aria-labelledby="general-configuration-heading">
      <div><h3 className="text-primary font-semibold" id="general-configuration-heading">General configuration</h3><p className="text-secondary mt-1 text-sm">Project identity, translation and operating policy.</p></div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">{generalFields.map(([field, label]) => <TextInput field={field} form={form} key={field} label={label} onChange={set} />)}</div>
      <div className="mt-6"><h4 className="text-primary mb-3 font-semibold">Translation AI</h4><div className="grid gap-4 sm:grid-cols-3"><label className="text-secondary text-sm">Provider<select className="field-control mt-2 w-full rounded-lg border px-3 py-2" name="translation_ai_provider" onChange={(event) => { const nextProvider = event.target.value; const nextTransports = aiTransports[nextProvider] || []; const nextModels = aiModels[nextProvider] || []; set("translation_ai_provider", nextProvider); set("translation_ai_transport", nextTransports[0] || ""); set("translation_ai_model", nextModels[0]?.value || ""); }} value={provider}><option value="deepseek">DeepSeek</option><option value="codex_exec">Codex exec</option></select></label><label className="text-secondary text-sm">Transport<select className="field-control mt-2 w-full rounded-lg border px-3 py-2" name="translation_ai_transport" onChange={(event) => { const nextTransport = event.target.value; set("translation_ai_transport", nextTransport); if (!models.some((option) => option.value === model)) set("translation_ai_model", models[0]?.value || ""); }} value={transport}>{transports.map((value) => <option key={value} value={value}>{value === "openai_compatible" ? "OpenAI compatible" : value === "anthropic_compatible" ? "Anthropic compatible" : "Process exec"}</option>)}</select></label><label className="text-secondary text-sm">Model<select className="field-control mt-2 w-full rounded-lg border px-3 py-2" disabled={!models.length} name="translation_ai_model" onChange={(event) => set("translation_ai_model", event.target.value)} value={model}>{models.length ? models.map((option) => <option key={option.value} value={option.value}>{option.label}{option.warning ? " (deprecated soon)" : ""}</option>) : <option value="">Not applicable</option>}</select></label></div>{modelWarning ? <p className="warning-panel mt-3 rounded-lg border p-3 text-sm" role="status">{modelWarning}</p> : provider === "codex_exec" ? <p className="warning-panel mt-3 rounded-lg border p-3 text-sm" role="status">Codex exec uses Process exec; no model is sent.</p> : null}</div>
      <div className="mt-6"><h4 className="text-primary mb-3 font-semibold">Policies</h4><div className="grid gap-3 sm:grid-cols-2">{flags.map(([field, label]) => <label className="policy-choice flex items-center gap-3 rounded-lg border p-3 text-sm" key={field}><input checked={Boolean(form[field])} onChange={(event) => set(field, event.target.checked)} type="checkbox" />{label}</label>)}</div></div>
    </section>

    <section className="grid gap-4" aria-label="System connections">
      <SystemAccordion description="Source system connection and credentials." label="Backlog connection" title="Backlog system"><div className="grid gap-4 sm:grid-cols-2">{backlogFields.map(([field, label]) => <TextInput field={field} form={form} key={field} label={label} onChange={set} />)}</div></SystemAccordion>
      <SystemAccordion description="Target system connection and credentials." label="Jira connection" title="Jira system"><div className="grid gap-4 sm:grid-cols-2">{jiraFields.map(([field, label]) => <TextInput field={field} form={form} key={field} label={label} onChange={set} />)}</div></SystemAccordion>
    </section>
  </form>;
}

export default function ProjectsPage() {
  const router = useRouter();
  const search = useSearchParams();
  const selectedId = Number(search.get("project_id")) || 0;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const selected = useMemo(() => projects.find((item) => item.id === selectedId) || null, [projects, selectedId]);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProjects(await apiFetch<Project[]>("/api/v1/projects"));
    } catch (requestError) {
      setError(requestError instanceof ApiClientError ? requestError.message : "Projects could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    const refresh = () => void load();
    window.addEventListener("cis-global-refresh", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("cis-global-refresh", refresh);
    };
  }, [load]);

  function saved(project: Project) {
    setCreating(false);
    setProjects((current) => current.some((item) => item.id === project.id) ? current.map((item) => item.id === project.id ? project : item) : [...current, project]);
    router.replace(`/projects?project_id=${project.id}`);
  }

  return <section className="mx-auto max-w-7xl space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow font-mono text-xs uppercase tracking-[0.2em]">Projects</p><h1 className="text-primary mt-3 text-3xl font-semibold">Project Config</h1><p className="text-secondary mt-2 text-sm">Manage active project connection, translation and sync policy.</p></div><Button onClick={() => setCreating(true)} variant="primary">New project</Button></div>{loading ? <StatePanel title="Loading projects" message="Reading server truth…" /> : error ? <StatePanel title="Projects unavailable" message={error} action={<Button onClick={() => void load()} variant="primary">Retry</Button>} /> : <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)]"><section className="surface rounded-xl border p-4"><div className="mb-3 flex items-center justify-between"><h2 className="text-primary font-semibold">Project list</h2><Badge>{projects.length}</Badge></div>{projects.length === 0 ? <p className="text-secondary py-8 text-sm">No projects configured.</p> : <div><div className="text-subtle hidden grid-cols-[minmax(0,1fr)_5rem_5rem_4rem] gap-3 px-3 pb-2 text-[0.68rem] uppercase tracking-wide sm:grid"><span>Name</span><span>Backlog</span><span>Jira</span><span>Sync</span></div><div className="space-y-2">{projects.map((project) => <button aria-label={`Open ${project.name}`} className={`project-list-item text-primary grid w-full grid-cols-[minmax(0,1fr)_5rem_5rem_4rem] items-center gap-3 rounded-lg border px-3 py-3 text-left ${project.id === selectedId ? "project-list-item--selected selected-surface" : ""}`} key={project.id} onClick={() => router.push(`/projects?project_id=${project.id}`)} type="button"><span className="min-w-0 truncate font-medium">{project.name}</span><span className="text-secondary truncate text-xs">{asText(project.backlog_project_key) || "—"}</span><span className="text-secondary truncate text-xs">{asText(project.jira_project_key) || "—"}</span><span className="text-xs"><Badge>{project.sync_enabled ? "On" : "Off"}</Badge></span></button>)}</div></div>}</section><section className="surface rounded-xl border p-5">{creating ? <ProjectForm key="new" onSaved={saved} project={null} /> : selected ? <ProjectForm key={selected.id} onSaved={saved} project={selected} /> : <StatePanel title="Select a project" message="Choose a project to review or edit its configuration." />}</section></div>}</section>;
}
