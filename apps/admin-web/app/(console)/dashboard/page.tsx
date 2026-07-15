"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Button, StatePanel } from "../../../components/ui";
import { apiFetch, ApiClientError } from "../../../lib/api-client";

type Summary = { health: { status: string; database: string }; counts: Record<string, number> };
type Alert = { type: string; project_id?: number; issue_id?: number; status?: string; updated_at?: string; created_at?: string };

const counters = [
  ["pull_jobs_pending", "Pull pending"], ["pull_jobs_failed", "Pull failed"], ["translation_pending", "Translation review"],
  ["issue_pending_mapping", "Pending mapping"], ["sync_jobs_failed", "Failed jobs"], ["anomaly_open", "Open anomalies"],
] as const;

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [nextSummary, nextAlerts] = await Promise.all([apiFetch<Summary>("/api/v1/dashboard/summary"), apiFetch<Alert[]>("/api/v1/dashboard/alerts")]);
      setSummary(nextSummary); setAlerts(nextAlerts);
    } catch (requestError) { setError(requestError instanceof ApiClientError ? requestError.message : "Dashboard could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    const onRefresh = () => void load();
    window.addEventListener("cis-global-refresh", onRefresh);
    return () => { window.clearTimeout(initialLoad); window.removeEventListener("cis-global-refresh", onRefresh); };
  }, [load]);

  return <section className="mx-auto max-w-7xl space-y-8">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="eyebrow font-mono text-xs uppercase tracking-[0.2em]">Dashboard</p><h1 className="text-primary mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Operations overview</h1><p className="text-secondary mt-3 max-w-2xl text-sm leading-6">A focused view of work waiting for operator attention across the Central Sync Hub.</p></div>
      {summary ? <Badge tone={summary.health.status === "ok" ? "good" : "warn"}>API {summary.health.status} · DB {summary.health.database}</Badge> : null}
    </div>
    {loading && !summary ? <StatePanel title="Loading dashboard" message="Reading current operational signals…" /> : null}
    {error && !summary ? <StatePanel title="Dashboard unavailable" message={error} action={<Button onClick={() => void load()} variant="primary">Retry</Button>} /> : null}
    {summary ? <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {counters.map(([key, label], index) => <div className="metric-card surface rounded-xl border p-5" key={key} style={{ animationDelay: `${index * 45}ms` }}><p className="text-secondary text-sm">{label}</p><p className="text-primary mt-3 font-mono text-3xl">{summary.counts[key] ?? 0}</p><span aria-hidden="true" className="metric-card__rule" /></div>)}
      </div>
      <section className="surface rounded-xl border">
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--border)" }}><div><h2 className="text-primary font-semibold">Alerts</h2><p className="text-secondary mt-1 text-sm">Items that may need operator attention.</p></div>{error ? <Button onClick={() => void load()}>Retry</Button> : null}</div>
        {alerts.length === 0 ? <p className="text-secondary px-5 py-8 text-sm">No open alerts.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="text-subtle text-xs uppercase tracking-wide"><tr><th className="px-5 py-3">Type</th><th className="px-5 py-3">Project</th><th className="px-5 py-3">Issue</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Updated</th></tr></thead><tbody>{alerts.map((alert, index) => <tr style={{ borderTop: "1px solid var(--border)" }} key={`${alert.type}-${alert.issue_id ?? index}`}><td className="text-primary px-5 py-3">{alert.type}</td><td className="text-secondary px-5 py-3">{alert.project_id ?? "—"}</td><td className="text-secondary px-5 py-3">{alert.issue_id ?? "—"}</td><td className="px-5 py-3"><Badge tone={alert.status === "open" ? "warn" : "neutral"}>{alert.status ?? "attention"}</Badge></td><td className="text-subtle px-5 py-3 font-mono text-xs">{alert.updated_at ?? alert.created_at ?? "—"}</td></tr>)}</tbody></table></div>}
      </section>
    </> : null}
  </section>;
}
