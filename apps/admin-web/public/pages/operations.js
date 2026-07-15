"use strict";

(() => CIS.ready(({ project }) => {
  const page = document.body.dataset.route;
  const header = (kicker, title, copy) => `<div class="page-heading"><div><div class="route-kicker">${kicker}</div><h1>${title}</h1><p class="text-secondary mb-0">${copy}</p></div><div class="flow-rail"><span>${CIS.escape(project.name)}</span><strong>#${project.id}</strong></div></div>`;
  const direction = (from, to) => `<span class="text-nowrap"><code>${CIS.escape(from || "—")}</code> <strong class="text-primary">→</strong> <code>${CIS.escape(to || "—")}</code></span>`;

  if (page === "anomalies") anomaliesPage();
  else if (page === "sync-jobs") jobsPage();
  else if (page === "journal") journalPage();

  async function anomaliesPage() {
    const params = new URLSearchParams(location.search);
    const status = params.get("status") || "";
    const type = params.get("anomaly_type") || "";
    rootLoading(header("Risk operations", "Anomalies", "Inspect evidence and make explicit operator decisions."), "Loading anomaly evidence…");
    let items;
    try { const query = new URLSearchParams({ project_id: project.id }); if (status) query.set("status", status); if (type) query.set("anomaly_type", type); items = await CIS.api(`/api/v1/anomalies?${query}`); }
    catch (error) { document.querySelector("#page-content").innerHTML = CIS.state("Anomalies unavailable", error.message, CIS.retryLink()); return; }
    const open = items.filter((item) => ["open", "investigating"].includes(item.status)).length;
    const critical = items.filter((item) => item.severity === "critical").length;
    document.querySelector("#page-content").innerHTML = `<div class="container-xl">${header("Risk operations", "Anomalies", "Inspect evidence and make explicit operator decisions.")}
      <div class="metric-strip mb-3"><div class="metric"><span>Visible</span><strong>${items.length}</strong></div><div class="metric"><span>Needs action</span><strong>${open}</strong></div><div class="metric"><span>Critical</span><strong>${critical}</strong></div></div>
      <section class="card toolbar-card"><div class="card-body"><form action="/anomalies" method="get"><input type="hidden" name="project_id" value="${project.id}"><div class="row g-3 align-items-end"><div class="col-md-4"><label class="form-label" for="anomaly-status">Status</label><select class="form-select" id="anomaly-status" name="status"><option value="">All statuses</option>${["open", "investigating", "resolved", "ignored"].map((value) => `<option value="${value}" ${status === value ? "selected" : ""}>${CIS.label(value)}</option>`).join("")}</select></div><div class="col-md-5"><label class="form-label" for="anomaly-type">Type</label><select class="form-select" id="anomaly-type" name="anomaly_type"><option value="">All types</option>${["routing_mismatch", "mapping_gap", "translation_low_conf", "unusual_field_change", "sync_failure_chain"].map((value) => `<option value="${value}" ${type === value ? "selected" : ""}>${CIS.label(value)}</option>`).join("")}</select></div><div class="col-md-3"><button class="btn btn-primary w-100">Apply filters</button></div></div></form></div></section>
      <section class="card"><div class="card-header"><h2 class="card-title">Triage queue</h2><span class="badge bg-secondary-lt ms-auto">${items.length}</span></div>${items.length ? `<div class="table-responsive"><table class="table table-vcenter responsive-table"><thead><tr><th>ID</th><th>Issue</th><th>Type</th><th>Severity</th><th>Status</th><th>Evidence</th><th></th></tr></thead><tbody>${items.map((item) => `<tr data-anomaly="${item.id}"><td data-label="ID"><code>#${item.id}</code></td><td data-label="Issue">${item.issue_id ? `<a href="/cis-issues/${encodeURIComponent(item.issue_id)}">${CIS.escape(item.issue_id)}</a>` : "—"}</td><td data-label="Type">${CIS.escape(CIS.label(item.anomaly_type))}</td><td data-label="Severity">${CIS.badge(item.severity)}</td><td data-label="Status">${CIS.badge(item.status)}</td><td data-label="Evidence"><div class="small">${Object.entries(item.details_json || {}).slice(0, 2).map(([key, value]) => `<strong>${CIS.escape(CIS.label(key))}:</strong> ${CIS.escape(typeof value === "object" ? JSON.stringify(value) : value)}<br>`).join("") || "No structured evidence"}</div></td><td data-label="Action"><button class="btn btn-sm btn-outline-primary" data-inspect type="button">Inspect</button></td></tr>`).join("")}</tbody></table></div>` : '<div class="card-body text-center py-6"><h2 class="h3">No anomalies found</h2><p class="text-secondary">No anomaly matches the current filters.</p></div>'}</section>
    </div>`;
    document.querySelectorAll("[data-anomaly]").forEach((row) => row.querySelector("[data-inspect]").addEventListener("click", () => anomalyDialog(Number(row.dataset.anomaly), items)));
  }

  async function anomalyDialog(id, list) {
    const known = list.find((item) => item.id === id);
    const modal = CIS.dialog(`Anomaly ${id} details`, `<div class="dialog-header"><div><div class="route-kicker">Anomaly #${id}</div><h2 class="h3 mb-0">Loading evidence…</h2></div><button class="btn-close" data-dialog-close aria-label="Close"></button></div><div class="dialog-body"><span class="spinner-border spinner-border-sm me-2"></span>Reading server truth…</div>`);
    try {
      const item = await CIS.api(`/api/v1/anomalies/${id}`);
      if (item.project_id !== project.id) throw new Error("This anomaly is outside the active Project workspace.");
      const actionable = ["open", "investigating"].includes(item.status);
      modal.querySelector(".cis-dialog__surface").innerHTML = `<div class="dialog-header"><div><div class="route-kicker">Anomaly #${id}</div><h2 class="h3 mb-0">${CIS.escape(CIS.label(item.anomaly_type))}</h2></div><div class="d-flex gap-2">${CIS.badge(item.severity)}${CIS.badge(item.status)}</div></div><div class="dialog-body"><div id="anomaly-error"></div><div class="row g-3"><div class="col-md-4"><div class="list-group"><div class="list-group-item"><small class="text-secondary">Signal</small><strong class="d-block">${CIS.label(item.severity)} severity</strong></div><div class="list-group-item"><small class="text-secondary">Evidence</small><strong class="d-block">${Object.keys(item.details_json || {}).length} fields captured</strong></div><div class="list-group-item"><small class="text-secondary">Decision</small><strong class="d-block">${actionable ? "Operator action required" : CIS.label(item.status)}</strong></div></div></div><div class="col-md-8"><dl class="row">${Object.entries(item.details_json || {}).map(([key, value]) => `<dt class="col-sm-4">${CIS.escape(CIS.label(key))}</dt><dd class="col-sm-8 source-panel">${CIS.escape(typeof value === "object" ? JSON.stringify(value, null, 2) : value)}</dd>`).join("")}</dl>${item.ai_analysis ? `<div class="alert alert-info"><strong>AI analysis</strong><div class="mt-1">${CIS.escape(item.ai_analysis)}</div></div>` : ""}${item.issue_id ? `<a href="/cis-issues/${encodeURIComponent(item.issue_id)}">Open CIS issue ${CIS.escape(item.issue_id)}</a>` : ""}</div></div></div><div class="dialog-footer"><button class="btn btn-outline-secondary" data-dialog-close type="button">Keep open</button>${actionable ? '<button class="btn btn-outline-danger" data-decision="ignore" type="button">Ignore</button><button class="btn btn-primary" data-decision="resolve" type="button">Resolve</button>' : ""}</div>`;
      modal.querySelectorAll("[data-dialog-close]").forEach((button) => button.addEventListener("click", () => modal.close()));
      modal.querySelectorAll("[data-decision]").forEach((button) => button.addEventListener("click", async () => {
        button.disabled = true;
        try { await CIS.api(`/api/v1/anomalies/${id}/${button.dataset.decision}`, { method: "POST" }); modal.close(); await anomaliesPage(); CIS.toast(`Anomaly #${id} ${button.dataset.decision === "resolve" ? "resolved" : "ignored"}.`); }
        catch (error) { modal.querySelector("#anomaly-error").innerHTML = CIS.alert(error.message); button.disabled = false; }
      }));
    } catch (error) { modal.querySelector(".dialog-body").innerHTML = CIS.alert(error.message); modal.querySelector("h2").textContent = known ? CIS.label(known.anomaly_type) : "Evidence unavailable"; }
  }

  async function jobsPage() {
    rootLoading(header("Execution operations", "Sync Jobs", "Inspect execution evidence before retrying or cancelling work."), "Loading sync jobs…");
    let items;
    try { items = await CIS.api(`/api/v1/sync-jobs?project_id=${project.id}`); }
    catch (error) { document.querySelector("#page-content").innerHTML = CIS.state("Sync Jobs unavailable", error.message, CIS.retryLink()); return; }
    const active = items.filter((item) => ["pending", "running"].includes(item.status)).length;
    const failed = items.filter((item) => item.status === "failed").length;
    document.querySelector("#page-content").innerHTML = `<div class="container-xl">${header("Execution operations", "Sync Jobs", "Inspect execution evidence before retrying or cancelling work.")}<div class="metric-strip mb-3"><div class="metric"><span>Visible</span><strong>${items.length}</strong></div><div class="metric"><span>Active</span><strong>${active}</strong></div><div class="metric"><span>Failed</span><strong>${failed}</strong></div></div><section class="card"><div class="card-header"><h2 class="card-title">Execution ledger</h2></div>${items.length ? `<div class="table-responsive"><table class="table table-vcenter responsive-table"><thead><tr><th>ID</th><th>Source issue</th><th>Target issue</th><th>Type</th><th>Direction</th><th>Status</th><th>Created</th><th>Error</th><th>Actions</th></tr></thead><tbody>${items.map((item) => `<tr data-job="${CIS.attr(item.id)}"><td data-label="ID"><code>${CIS.escape(item.id)}</code></td><td data-label="Source issue"><code>${CIS.escape(item.source_issue_key || "—")}</code></td><td data-label="Target issue"><code>${CIS.escape(item.target_issue_key || "—")}</code></td><td data-label="Type">${CIS.escape(CIS.label(item.job_type))}</td><td data-label="Direction">${direction(item.direction_from, item.direction_to)}</td><td data-label="Status">${CIS.badge(item.status)}</td><td data-label="Created">${CIS.escape(CIS.formatDate(item.created_at))}</td><td data-label="Error">${CIS.escape(item.last_error || "—")}</td><td data-label="Actions"><div class="table-actions"><button class="btn btn-sm btn-outline-primary" data-job-action="retry" type="button">Retry</button><button class="btn btn-sm btn-outline-danger" data-job-action="cancel" type="button">Cancel</button></div><div class="job-evidence"></div></td></tr>`).join("")}</tbody></table></div>` : '<div class="card-body text-center py-6"><h2 class="h3">No sync jobs found</h2><p class="text-secondary">No execution evidence exists for this Project.</p></div>'}</section></div>`;
    document.querySelectorAll("[data-job]").forEach((row) => row.querySelectorAll("[data-job-action]").forEach((button) => button.addEventListener("click", async () => {
      const id = row.dataset.job; const action = button.dataset.jobAction; button.disabled = true;
      try { await CIS.api(`/api/v1/sync-jobs/${encodeURIComponent(id)}/${action}`, { method: "POST" }); await jobsPage(); CIS.toast(`Job ${id} ${action === "retry" ? "queued for retry" : "cancelled"}.`); }
      catch (error) { row.querySelector(".job-evidence").innerHTML = `<span class="text-danger">${CIS.escape(error.message)}</span>`; button.disabled = false; }
    })));
  }

  async function journalPage() {
    rootLoading(header("Audit operations", "Sync Journal", "Read-only decisions, execution attempts and terminal outcomes."), "Loading audit evidence…");
    let items;
    try { items = await CIS.api(`/api/v1/sync-journal?project_id=${project.id}`); }
    catch (error) { document.querySelector("#page-content").innerHTML = CIS.state("Sync Journal unavailable", error.message, CIS.retryLink()); return; }
    const success = items.filter((item) => item.status === "success").length;
    const failed = items.filter((item) => item.status === "failed").length;
    document.querySelector("#page-content").innerHTML = `<div class="container-xl">${header("Audit operations", "Sync Journal", "Read-only decisions, execution attempts and terminal outcomes.")}<div class="metric-strip mb-3"><div class="metric"><span>Visible</span><strong>${items.length}</strong></div><div class="metric"><span>Success</span><strong>${success}</strong></div><div class="metric"><span>Failed</span><strong>${failed}</strong></div></div><section class="card"><div class="card-header"><h2 class="card-title">Audit ledger</h2><span class="text-secondary ms-auto">Read only</span></div>${items.length ? `<div class="table-responsive"><table class="table table-vcenter responsive-table"><thead><tr><th>ID</th><th>Job</th><th>Source issue</th><th>Target issue</th><th>Action</th><th>Status</th><th>Direction</th><th>Created</th><th>Message / error</th></tr></thead><tbody>${items.map((item) => `<tr><td data-label="ID"><code>#${item.id}</code></td><td data-label="Job"><code>${CIS.escape(item.sync_job_id || "—")}</code></td><td data-label="Source issue"><code>${CIS.escape(item.source_issue_key || "—")}</code></td><td data-label="Target issue"><code>${CIS.escape(item.target_issue_key || "—")}</code></td><td data-label="Action">${CIS.escape(CIS.label(item.action))}</td><td data-label="Status">${CIS.badge(item.status)}</td><td data-label="Direction">${direction(item.direction_from, item.direction_to)}</td><td data-label="Created">${CIS.escape(CIS.formatDate(item.created_at))}</td><td data-label="Message / error">${CIS.escape(item.message || item.error_message || "—")}</td></tr>`).join("")}</tbody></table></div>` : '<div class="card-body text-center py-6"><h2 class="h3">No journal entries found</h2><p class="text-secondary">No audit evidence exists for this Project.</p></div>'}</section></div>`;
  }

  function rootLoading(pageHeader, message) {
    document.querySelector("#page-content").innerHTML = `<div class="container-xl">${pageHeader}<section class="card state-card" aria-busy="true"><div class="card-body"><span class="spinner-border spinner-border-sm me-2"></span>${message}</div></section></div>`;
  }
}))();
