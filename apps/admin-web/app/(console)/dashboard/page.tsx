"use client";

import Link from "next/link";
import { StatePanel } from "../../../components/ui";

export default function DashboardPage() {
  return <section className="mx-auto max-w-3xl space-y-6">
    <div><p className="eyebrow font-mono text-xs uppercase tracking-[0.2em]">Dashboard</p><h1 className="text-primary mt-3 text-3xl font-semibold tracking-tight">Operations overview</h1></div>
    <StatePanel title="Dashboard is temporarily disabled" message="Project-scoped summary and alerts are waiting for the backend project-scope phase. No dashboard data request was made." action={<div className="flex flex-wrap gap-2"><Link className="ui-button ui-button--primary inline-flex" href="/backlog-issues">Open Backlog Issues</Link><Link className="ui-button ui-button--secondary inline-flex" href="/projects">Open Projects</Link></div>} />
  </section>;
}
