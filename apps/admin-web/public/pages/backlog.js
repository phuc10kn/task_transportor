"use strict";

(() => CIS.ready(async ({ project }) => {
  const root = document.querySelector("#page-content");
  const params = new URLSearchParams(location.search);
  const today = new Date().toISOString().slice(0, 10);
  let readiness;
  let options;
  let result = null;
  let browseError = "";

  const selected = (name) => params.getAll(name);
  const actionReady = (name) => Boolean(readiness?.actions?.[name]?.enabled);
  const reasons = (name) => readiness?.actions?.[name]?.disabled_reasons || [];
  const jobIsActive = (job) => ["pending", "running"].includes(job?.status);

  function filterPicker(label, items, name, emptyLabel) {
    const values = new Set(selected(name));
    const choices = (items || []).map((item, index) => {
      const value = String(item.id ?? item.value ?? "");
      const text = item.name || item.label || item.value || value;
      return `<label class="filter-picker__option" for="${name}-${index}" data-picker-option><input class="form-check-input" id="${name}-${index}" name="${name}" type="checkbox" value="${CIS.attr(value)}" data-picker-label="${CIS.attr(text)}" ${values.has(value) ? "checked" : ""}><span>${CIS.escape(text)}</span></label>`;
    }).join("");
    const selectedLabels = (items || []).filter((item) => values.has(String(item.id ?? item.value ?? ""))).map((item) => item.name || item.label || item.value);
    const summary = selectedLabels.length === 0 ? emptyLabel : selectedLabels.length <= 2 ? selectedLabels.join(", ") : `${selectedLabels.length} selected`;
    return `<div class="filter-control"><span class="form-label">${label}</span><details class="filter-picker" name="backlog-filters" aria-label="${label} filter" data-empty-label="${CIS.attr(emptyLabel)}" data-filter-picker><summary class="form-select filter-picker__summary"><span data-picker-summary>${CIS.escape(summary)}</span></summary><div class="filter-picker__menu"><div class="filter-picker__search"><input class="form-control form-control-sm" type="search" placeholder="Search ${CIS.attr(label.toLowerCase())}…" aria-label="Search ${CIS.attr(label.toLowerCase())}" data-picker-search></div><div class="filter-picker__options">${choices || '<div class="text-secondary small p-3">No saved options. Refresh fields in Mappings.</div>'}</div><div class="filter-picker__footer"><button class="btn btn-sm btn-ghost-secondary" data-picker-clear type="button">Clear</button><button class="btn btn-sm btn-primary" data-picker-close type="button">Done</button></div></div></details></div>`;
  }

  function pageHeader() {
    return `<div class="page-heading"><div><div class="route-kicker">Inbound operations</div><h1>Backlog Issues</h1><p class="text-secondary mb-0">Discover source candidates, then explicitly move them into CIS.</p></div><div class="flow-rail"><span>BACKLOG</span><strong>→ CIS</strong></div></div>`;
  }

  function activeOptionalFilters() {
    const labelsFor = (name, items) => {
      const values = new Set(selected(name));
      return (items || []).filter((item) => values.has(String(item.id ?? item.value ?? ""))).map((item) => item.name || item.label || item.value);
    };
    return [
      ...labelsFor("status_id", options?.statuses).map((value) => `Status: ${value}`),
      ...labelsFor("assignee_id", options?.assignees).map((value) => `Assignee: ${value}`),
      ...(params.get("not_closed") === "true" ? ["Exclude closed"] : []),
    ];
  }

  function clearOptionalFiltersHref() {
    const query = new URLSearchParams({
      submitted: "1",
      created_from: params.get("created_from") || today,
      created_to: params.get("created_to") || today,
      limit: params.get("limit") || "20",
    });
    return CIS.projectPath(`/backlog-issues?${query}`, project.id);
  }

  function filterEvidence(filters) {
    return filters.length ? `<div class="filter-evidence" aria-label="Active optional filters">${filters.map((filter) => `<span class="badge bg-azure-lt text-azure">${CIS.escape(filter)}</span>`).join("")}</div>` : "";
  }

  function results() {
    if (browseError) return `<div class="alert alert-danger" role="alert">${CIS.escape(browseError)} <button class="btn btn-sm btn-outline-danger ms-2" id="retry-browse" type="button">Retry search</button></div>`;
    if (!params.has("submitted")) return `<section class="card state-card"><div class="card-body text-center py-6"><h2 class="h3">No search submitted</h2><p class="text-secondary">Set a date range and press Find candidates. Opening this route never queries Backlog.</p></div></section>`;
    if (!result) return `<section class="card state-card" aria-busy="true"><div class="card-body"><span class="spinner-border spinner-border-sm me-2"></span>Finding candidates…</div></section>`;
    const candidates = result.candidates || [];
    const filters = activeOptionalFilters();
    const scanned = result.meta?.source_rows_scanned || 0;
    const excluded = result.meta?.excluded_existing_cis_count || 0;
    const emptyTitle = scanned === 0 && filters.length ? "No source issues match these filters" : excluded > 0 ? `${excluded} matching issue${excluded === 1 ? " is" : "s are"} already in CIS` : "No new candidates found";
    const emptyCopy = scanned === 0 && filters.length ? "The date range is valid, but Status, Assignee and Exclude closed are combined as AND conditions." : excluded > 0 ? "Candidate browse only shows Backlog issues that are not linked to CIS yet." : "Try a wider date range or fewer optional filters.";
    return `<section class="card"><div class="card-header"><div><h2 class="card-title">Issues not in CIS</h2><div class="text-secondary small">${result.meta?.returned_count || candidates.length} candidates · ${scanned} source rows scanned · ${excluded} already in CIS</div>${candidates.length ? filterEvidence(filters) : ""}</div><span class="badge bg-secondary-lt ms-auto">${CIS.escape(result.meta?.stop_reason || "complete")}</span></div>
      ${candidates.length ? `<div class="table-responsive"><table class="table table-vcenter responsive-table"><thead><tr><th>Backlog</th><th>Summary</th><th>Status</th><th>Assignee</th><th>Created</th><th>Actions</th></tr></thead><tbody>${candidates.map((item) => {
        const activeJob = jobIsActive(item.active_job) ? item.active_job : null;
        const disabled = !actionReady("sync_to_cis") || Boolean(activeJob);
        const jiraDisabled = !actionReady("sync_translate_jira") || Boolean(activeJob);
        const jobAttributes = activeJob ? ` data-active-job-id="${CIS.attr(activeJob.id)}" data-active-job-translate="${activeJob.with_translation === true}" data-active-job-jira="${activeJob.push_to_jira === true}"` : "";
        const evidence = activeJob ? `Job ${CIS.escape(activeJob.id)}: ${CIS.escape(activeJob.status)}${activeJob.push_to_jira ? " · Jira delivery requested" : activeJob.with_translation ? " · Translation requested" : ""}` : "";
        return `<tr data-candidate="${CIS.attr(item.backlog_issue_key)}"${jobAttributes}><td data-label="Backlog"><code>${CIS.escape(item.backlog_issue_key)}</code></td><td data-label="Summary">${CIS.escape(item.summary || "—")}</td><td data-label="Status">${CIS.badge(item.status || "unknown")}</td><td data-label="Assignee">${CIS.escape(item.assignee?.name || "Unassigned")}</td><td data-label="Created">${CIS.escape(CIS.formatDate(item.created_at_source))}</td><td data-label="Actions"><div class="table-actions"><button class="btn btn-sm btn-primary" data-sync="plain" type="button" ${disabled ? "disabled" : ""}>Sync to CIS</button><button class="btn btn-sm btn-outline-primary" data-sync="translate" type="button" ${disabled ? "disabled" : ""}>Sync + Translate</button><button class="btn btn-sm btn-outline-primary" data-sync="jira" type="button" title="${jiraDisabled ? CIS.attr(reasons("sync_translate_jira").join(", ") || "Jira delivery unavailable") : "Pull, translate atomically, run Jira dry-run, then deliver"}" ${jiraDisabled ? "disabled" : ""}>Sync + Translate + Jira</button></div><div class="job-evidence" aria-live="polite">${evidence}</div></td></tr>`;
      }).join("")}</tbody></table></div>` : `<div class="card-body text-center py-6"><h2 class="h3">${CIS.escape(emptyTitle)}</h2><p class="text-secondary">${CIS.escape(emptyCopy)}</p>${filterEvidence(filters)}${filters.length ? `<a class="btn btn-outline-primary mt-3" href="${CIS.attr(clearOptionalFiltersHref())}">Clear optional filters and search</a>` : ""}</div>`}
    </section>`;
  }

  function render() {
    const browseReady = actionReady("browse");
    root.innerHTML = `<div class="container-xl">${pageHeader()}
      <section class="card toolbar-card"><div class="card-header"><div><h2 class="card-title">Find candidates</h2><div class="text-secondary small">Search only runs when you submit this form.</div></div><div class="ms-auto">${CIS.badge(browseReady ? "Browse ready" : "Browse blocked", browseReady ? "green" : "yellow")}</div></div><div class="card-body">
        <form action="${CIS.attr(CIS.projectPath("/backlog-issues", project.id))}" method="get" id="candidate-filter"><input type="hidden" name="submitted" value="1">
          <div class="filter-section"><div class="filter-section__heading"><strong>Search window</strong><span>Required</span></div><div class="backlog-window-grid">
            <div><label class="form-label" for="created_from">Created from</label><input class="form-control" id="created_from" name="created_from" type="date" value="${CIS.attr(params.get("created_from") || today)}" required></div>
            <div><label class="form-label" for="created_to">Created to</label><input class="form-control" id="created_to" name="created_to" type="date" value="${CIS.attr(params.get("created_to") || today)}" required></div>
            <div><label class="form-label" for="limit">Result limit</label><input class="form-control" id="limit" name="limit" type="number" min="1" max="100" value="${CIS.attr(params.get("limit") || "20")}" required></div>
          </div></div>
          <div class="filter-section"><div class="filter-section__heading"><strong>Optional filters</strong><span>Narrow the Backlog query</span></div><div class="backlog-options-grid">
            ${filterPicker("Status", options?.statuses, "status_id", "Any status")}
            ${filterPicker("Assignee", options?.assignees, "assignee_id", "Anyone")}
            <label class="form-check form-switch backlog-not-closed"><input class="form-check-input" name="not_closed" type="checkbox" value="true" ${params.get("not_closed") === "true" ? "checked" : ""}><span class="form-check-label"><strong>Exclude closed</strong><small>Only active work</small></span></label>
            <div class="backlog-search-actions"><a class="btn btn-ghost-secondary" href="${CIS.attr(CIS.projectPath("/backlog-issues", project.id))}">Reset</a><button class="btn btn-primary" type="submit" ${browseReady ? "" : "disabled"}>Find candidates</button></div>
          </div></div>
        </form>
        ${browseReady ? "" : `<div class="text-secondary small mt-3">Blocked by: ${CIS.escape(reasons("browse").join(", ") || "project readiness")}</div>`}
      </div></section>
      <section class="card mb-3"><div class="card-header"><h2 class="card-title">Inbound actions</h2><div class="ms-auto">${CIS.badge(actionReady("pull_one") ? "Actions ready" : "Actions blocked", actionReady("pull_one") ? "green" : "yellow")}</div></div><div class="card-body"><div id="action-error"></div><div class="row g-3">
        <div class="col-lg-6"><div class="input-group"><span class="input-group-text">Issue key</span><input class="form-control" id="pull-one-key" aria-label="Pull one issue key" value="${CIS.attr(project.backlog_issue_key_prefix ? `${project.backlog_issue_key_prefix}-1` : "")}"><button class="btn btn-primary" id="pull-one" type="button" ${actionReady("pull_one") ? "" : "disabled"}>Pull one</button></div><div class="job-evidence" id="pull-one-state" aria-live="polite"></div></div>
        <div class="col-lg-6"><div class="d-flex align-items-center justify-content-between gap-3 h-100"><div><strong>Pull project <span class="badge bg-secondary-lt ms-1">Disabled</span></strong><div class="text-secondary small" id="pull-project-disabled-reason">Sync selected candidates individually while batch pull is unavailable.</div></div><button class="btn btn-outline-secondary" type="button" aria-describedby="pull-project-disabled-reason" disabled>Pull project</button></div></div>
      </div></div></section>
      <div id="candidate-results">${results()}</div>
    </div>`;
    bind();
  }

  async function loadContext() {
    root.innerHTML = `<div class="container-xl">${pageHeader()}<section class="card state-card" aria-busy="true"><div class="card-body"><span class="spinner-border spinner-border-sm me-2"></span>Loading saved Backlog fields and readiness…</div></section></div>`;
    try {
      [readiness, options] = await Promise.all([
        CIS.api(`/api/v1/projects/${project.id}/backlog/issues/action-readiness`),
        CIS.api(`/api/v1/projects/${project.id}/backlog/issues/filter-options`),
      ]);
      render();
      if (params.has("submitted")) await browse();
    } catch (error) {
      root.innerHTML = CIS.state("Backlog workspace unavailable", error.message, '<button class="btn btn-primary" id="retry-context" type="button">Retry</button>');
      document.querySelector("#retry-context").addEventListener("click", loadContext);
    }
  }

  async function browse() {
    browseError = "";
    result = null;
    document.querySelector("#candidate-results").innerHTML = results();
    const query = new URLSearchParams();
    for (const name of ["created_from", "created_to", "limit", "not_closed", "status_id", "assignee_id"]) params.getAll(name).forEach((value) => query.append(name, value));
    try {
      result = await CIS.api(`/api/v1/projects/${project.id}/backlog/issues/candidates?${query}`);
    } catch (error) {
      browseError = error.message;
    }
    document.querySelector("#candidate-results").innerHTML = results();
    bindCandidateActions();
    resumeCandidateJobs();
    document.querySelector("#retry-browse")?.addEventListener("click", browse);
  }

  async function runJob(button, endpoint, target, body) {
    button.disabled = true;
    const original = button.textContent;
    button.textContent = "Queueing…";
    try {
      const response = await CIS.api(endpoint, { method: "POST", body });
      const job = response.job || response;
      target.textContent = `Job ${job.id}: ${job.status}`;
      if (!["success", "failed", "cancelled"].includes(job.status)) await CIS.pollJob(project.id, job.id, (current) => { target.textContent = `Job ${current.id}: ${current.status}${current.last_error ? ` — ${current.last_error}` : ""}`; });
      return job;
    } catch (error) {
      target.innerHTML = `<span class="text-danger">${CIS.escape(error.message)}</span>`;
      throw error;
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  }

  function bindCandidateActions() {
    document.querySelectorAll("[data-candidate]").forEach((row) => {
      row.querySelectorAll("[data-sync]").forEach((button) => button.addEventListener("click", async () => {
        const key = row.dataset.candidate;
        const evidence = row.querySelector(".job-evidence");
        let requestAccepted = false;
        row.querySelectorAll("button").forEach((item) => { item.disabled = true; });
        try {
          const wantsJira = button.dataset.sync === "jira";
          const wantsTranslation = wantsJira || button.dataset.sync === "translate";
          const response = await CIS.api(`/api/v1/projects/${project.id}/backlog/issues/${encodeURIComponent(key)}/sync-to-cis`, { method: "POST", body: wantsJira ? { with_translation: true, push_to_jira: true } : wantsTranslation ? { with_translation: true } : undefined });
          if (response.outcome === "already_in_cis") { evidence.textContent = "Already in CIS."; await browse(); return; }
          const job = response.job;
          if (!job) throw new Error("Sync response did not include job evidence.");
          requestAccepted = true;
          updateCandidateJob(row, job, wantsTranslation, wantsJira);
          if (!["success", "failed", "cancelled"].includes(job.status)) await watchCandidateJob(row, job.id, wantsTranslation, wantsJira);
        } catch (error) {
          if (["BACKLOG_SYNC_RUNNING_WITHOUT_TRANSLATION", "BACKLOG_SYNC_RUNNING_WITHOUT_JIRA"].includes(error.code) && error.details?.job_id) {
            requestAccepted = true;
            evidence.textContent = `Job ${error.details.job_id}: ${error.details.status}. Translation was not queued.`;
            if (jobIsActive({ status: error.details.status })) await watchCandidateJob(row, error.details.job_id, false, false);
          }
          else evidence.innerHTML = `<span class="text-danger">${CIS.escape(error.message)}</span>`;
        } finally {
          if (!requestAccepted) row.querySelectorAll("button").forEach((item) => { item.disabled = item.dataset.sync === "jira" ? !actionReady("sync_translate_jira") : !actionReady("sync_to_cis"); });
        }
      }));
    });
  }

  function updateCandidateJob(row, job, wantsTranslation, wantsJira) {
    if (!row.isConnected) return;
    const evidence = row.querySelector(".job-evidence");
    const failure = job.last_error ? `${job.last_error_code ? `${job.last_error_code}: ` : ""}${job.last_error}` : "";
    evidence.textContent = `Job ${job.id}: ${job.status}${failure ? ` — ${failure}` : ""}`;
    if (jobIsActive(job) && wantsJira) evidence.textContent += " · Translating, validating, then delivering to Jira";
    else if (jobIsActive(job) && wantsTranslation) evidence.textContent += " · Translation requested";
    if (job.status === "success" && wantsJira) evidence.textContent += " · Jira delivery complete";
    else if (job.status === "success" && wantsTranslation) evidence.textContent += " · Review Translation Queue";
    const allowRetry = ["failed", "cancelled"].includes(job.status);
    row.querySelectorAll("[data-sync]").forEach((button) => { button.disabled = !allowRetry || !(button.dataset.sync === "jira" ? actionReady("sync_translate_jira") : actionReady("sync_to_cis")); });
  }

  async function watchCandidateJob(row, jobId, wantsTranslation, wantsJira) {
    try {
      const final = await CIS.pollJob(project.id, jobId, (job) => updateCandidateJob(row, job, wantsTranslation, wantsJira));
      updateCandidateJob(row, final, wantsTranslation, wantsJira);
      return final;
    } catch (error) {
      if (row.isConnected) row.querySelector(".job-evidence").innerHTML = `<span class="text-danger">Job status unavailable: ${CIS.escape(error.message)}. Refresh to reconcile.</span>`;
      return null;
    }
  }

  function resumeCandidateJobs() {
    document.querySelectorAll("[data-active-job-id]").forEach((row) => {
      void watchCandidateJob(row, row.dataset.activeJobId, row.dataset.activeJobTranslate === "true", row.dataset.activeJobJira === "true");
    });
  }

  function bind() {
    document.querySelectorAll("[data-filter-picker]").forEach((picker) => {
      const summary = picker.querySelector("[data-picker-summary]");
      const update = () => {
        const checked = [...picker.querySelectorAll('input[type="checkbox"]:checked')];
        summary.textContent = checked.length === 0 ? picker.dataset.emptyLabel : checked.length <= 2 ? checked.map((input) => input.dataset.pickerLabel).join(", ") : `${checked.length} selected`;
      };
      picker.addEventListener("change", update);
      picker.querySelector("[data-picker-search]").addEventListener("input", (event) => {
        const query = event.currentTarget.value.trim().toLocaleLowerCase();
        picker.querySelectorAll("[data-picker-option]").forEach((option) => { option.hidden = !option.textContent.toLocaleLowerCase().includes(query); });
      });
      picker.querySelector("[data-picker-clear]").addEventListener("click", () => { picker.querySelectorAll('input[type="checkbox"]:checked').forEach((input) => { input.checked = false; }); update(); });
      picker.querySelector("[data-picker-close]").addEventListener("click", () => { picker.open = false; picker.querySelector("summary").focus(); });
      picker.addEventListener("keydown", (event) => { if (event.key === "Escape") { picker.open = false; picker.querySelector("summary").focus(); } });
    });
    document.querySelector("#candidate-filter")?.addEventListener("submit", (event) => {
      const from = event.currentTarget.elements.created_from;
      const to = event.currentTarget.elements.created_to;
      from.setCustomValidity(from.value > to.value ? "Created from must not be after Created to." : "");
      if (!event.currentTarget.reportValidity()) event.preventDefault();
    });
    document.querySelector("#pull-one")?.addEventListener("click", async (event) => {
      const key = document.querySelector("#pull-one-key").value.trim();
      if (!key) return document.querySelector("#pull-one-key").focus();
      await runJob(event.currentTarget, `/api/v1/projects/${project.id}/backlog/issues/${encodeURIComponent(key)}/pull`, document.querySelector("#pull-one-state"));
    });
    bindCandidateActions();
    document.querySelector("#retry-browse")?.addEventListener("click", browse);
  }

  loadContext();
}))();
