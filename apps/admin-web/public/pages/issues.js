"use strict";

(() => CIS.ready(({ project }) => {
  const root = document.querySelector("#page-content");
  const issueMatch = location.pathname.match(/^\/project\/[1-9]\d*\/cis-issues\/([^/]+)\/?$/);
  if (issueMatch) editorPage(decodeURIComponent(issueMatch[1]));
  else listPage();

  function heading(title, copy, rail = "CIS") {
    return `<div class="page-heading"><div><div class="route-kicker">Canonical workspace</div><h1>${title}</h1><p class="text-secondary mb-0">${copy}</p></div><div class="flow-rail"><span>${rail}</span><strong>· ${CIS.escape(project.name)} #${project.id}</strong></div></div>`;
  }

  function pagination(meta, params) {
    if (!meta || meta.total_pages <= 1) return "";
    return `<div class="card-footer cis-list-footer"><div class="text-secondary small">Page ${meta.page} of ${meta.total_pages} · ${meta.total} issues</div><nav aria-label="CIS issue pages"><ul class="pagination pagination-sm mb-0"><li class="page-item ${meta.page <= 1 ? "disabled" : ""}"><button class="page-link" type="button" data-issue-page="${meta.page - 1}" aria-label="Previous page" ${meta.page <= 1 ? "disabled" : ""}>Previous</button></li><li class="page-item ${meta.page >= meta.total_pages ? "disabled" : ""}"><button class="page-link" type="button" data-issue-page="${meta.page + 1}" aria-label="Next page" ${meta.page >= meta.total_pages ? "disabled" : ""}>Next</button></li></ul></nav></div>`;
  }

  function sourceIdentity(issue) {
    const [system, key] = issue.backlog_issue_key ? ["Backlog", issue.backlog_issue_key] : issue.jira_issue_key ? ["Jira", issue.jira_issue_key] : ["CIS", "Manual"];
    return `<span class="issue-source"><strong>${system}</strong> <code>(${CIS.escape(key)})</code></span>`;
  }

  function targetIdentity(issue) {
    return issue.jira_issue_key
      ? `<span class="issue-source"><strong>Jira</strong> <code>(${CIS.escape(issue.jira_issue_key)})</code></span>`
      : '<span class="text-secondary">Not synced</span>';
  }

  function issueQuery(params) {
    const query = new URLSearchParams();
    for (const field of ["q", "page"]) if (params.get(field)) query.set(field, params.get(field));
    return query;
  }

  function issueRegister(result, params) {
    const issues = Array.isArray(result) ? result : result.items || [];
    const meta = Array.isArray(result) ? { page: 1, page_size: 20, total: result.length, total_pages: 1 } : result.pagination;
    const hasFilters = Boolean(params.get("q"));
    return `<section class="card" id="issue-register"><div class="card-header"><div><h2 class="card-title">Issue register</h2><div class="text-secondary small">Canonical Summary search</div></div><span class="badge bg-secondary-lt ms-auto">${meta.total}</span></div>
      <form class="card-body border-bottom cis-issue-filters" aria-label="CIS issue filters"><div class="row g-2 align-items-end">
        <div class="col-12"><label class="form-label" for="issue-search">Summary</label><input class="form-control" id="issue-search" name="q" value="${CIS.attr(params.get("q") || "")}" placeholder="Mục đích sửa đổi"></div>
        <div class="col-12 cis-filter-actions"><button class="btn btn-primary" type="submit">Search issues</button>${hasFilters ? '<button class="btn btn-link" type="button" data-issue-list-clear>Clear filters</button>' : ""}</div>
      </div></form>
      ${issues.length ? `<div class="table-responsive"><table class="table table-vcenter responsive-table"><thead><tr><th>Source</th><th>Target</th><th>Status</th><th>Summary</th><th>Priority</th><th>Assignee</th><th>Pending review</th><th>Anomaly</th><th></th></tr></thead><tbody>${issues.map((issue) => `<tr><td data-label="Source">${sourceIdentity(issue)}</td><td data-label="Target">${targetIdentity(issue)}</td><td data-label="Status">${CIS.badge(issue.sync_status || "unknown")}</td><td data-label="Summary">${CIS.escape(issue.current_summary || "—")}</td><td data-label="Priority">${CIS.escape(issue.current_priority || "—")}</td><td data-label="Assignee">${CIS.escape(issue.current_assignee || "—")}</td><td data-label="Pending review">${issue.pending_translation_count || 0}</td><td data-label="Anomaly">${issue.open_anomaly_count || 0}</td><td data-label="Action"><a class="btn btn-sm btn-outline-primary" href="${CIS.attr(CIS.projectPath(`/cis-issues/${encodeURIComponent(issue.id)}`, project.id))}">Open Editor</a></td></tr>`).join("")}</tbody></table></div>` : `<div class="card-body text-center py-6"><h2 class="h3">${hasFilters ? "No issues match these filters" : "No CIS issues found"}</h2><p class="text-secondary">${hasFilters ? "Adjust or clear filters to broaden the result." : "Create the first canonical issue in this Project."}</p></div>`}
      ${pagination(meta, params)}</section>`;
  }

  async function updateIssueRegister(params) {
    const register = document.querySelector("#issue-register");
    register.innerHTML = '<div class="card-body" aria-busy="true"><span class="spinner-border spinner-border-sm me-2"></span>Loading issues…</div>';
    try {
      const result = await CIS.projectApi(project.id, `/issues?${issueQuery(params)}`);
      register.outerHTML = issueRegister(result, params);
      bindIssueRegister();
    } catch (error) {
      register.innerHTML = `<div class="card-body">${CIS.alert(error.message)}<button class="btn btn-primary" type="button" data-retry-issue-list>Retry</button></div>`;
      register.querySelector("[data-retry-issue-list]").addEventListener("click", () => updateIssueRegister(params));
    }
  }

  function bindIssueRegister() {
    const register = document.querySelector("#issue-register");
    register?.querySelector(".cis-issue-filters")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const params = new URLSearchParams(new FormData(event.currentTarget));
      history.replaceState(null, "", `${location.pathname}${params.size ? `?${params}` : ""}`);
      void updateIssueRegister(params);
    });
    register?.querySelector("[data-issue-list-clear]")?.addEventListener("click", () => {
      history.replaceState(null, "", location.pathname);
      void updateIssueRegister(new URLSearchParams());
    });
    register?.querySelectorAll("[data-issue-page]").forEach((button) => button.addEventListener("click", () => {
      const params = new URLSearchParams(location.search);
      params.set("page", button.dataset.issuePage);
      history.replaceState(null, "", `${location.pathname}?${params}`);
      void updateIssueRegister(params);
    }));
  }

  async function listPage() {
    root.innerHTML = `<div class="container-xl">${heading("CIS Issues", "Create and review canonical issue state before any outbound delivery.")}<section class="card state-card" aria-busy="true"><div class="card-body"><span class="spinner-border spinner-border-sm me-2"></span>Loading issues…</div></section></div>`;
    const params = new URLSearchParams(location.search);
    let result;
    try { result = await CIS.projectApi(project.id, `/issues?${issueQuery(params)}`); }
    catch (error) { root.innerHTML = CIS.state("CIS Issues unavailable", error.message, CIS.retryLink()); return; }
    root.innerHTML = `<div class="container-xl">${heading("CIS Issues", "Create and review canonical issue state before any outbound delivery.")}
      <section class="card mb-3"><div class="card-header"><h2 class="card-title">Create manual CIS issue</h2></div><div class="card-body"><div id="create-error"></div><form id="create-issue"><div class="row g-3 align-items-end"><div class="col-md-5"><label class="form-label" for="issue-summary">Summary</label><input class="form-control" id="issue-summary" name="summary" required></div><div class="col-md-5"><label class="form-label" for="issue-description">Description</label><input class="form-control" id="issue-description" name="description"></div><div class="col-md-2"><button class="btn btn-primary w-100" type="submit">Create issue</button></div></div></form></div></section>
      ${issueRegister(result, params)}
    </div>`;
    document.querySelector("#create-issue").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const button = form.querySelector("button");
      button.disabled = true;
      try {
        const result = await CIS.projectApi(project.id, "/issues", { method: "POST", body: CIS.formJson(form) });
        location.assign(CIS.projectPath(`/cis-issues/${encodeURIComponent(result.issue.id)}`, project.id));
      } catch (error) {
        document.querySelector("#create-error").innerHTML = CIS.alert(error.message);
        button.disabled = false;
      }
    });
    bindIssueRegister();
  }

  function catalogOptions(catalog, current) {
    const normalized = (catalog || []).map((option) => typeof option === "string" ? { value: option, label: option } : { value: option.value || option.name || "", label: option.label || option.name || option.value || "" });
    if (current && !normalized.some((option) => option.value === current)) normalized.unshift({ value: current, label: `${current} (current)` });
    return `<option value="">—</option>${normalized.map((option) => `<option value="${CIS.attr(option.value)}" ${option.value === current ? "selected" : ""}>${CIS.escape(option.label)}</option>`).join("")}`;
  }

  function markdownWorkbench({ id, label, current, detail = "", disabled = false, className = "" }) {
    const locked = disabled ? "disabled" : "";
    return `<div class="markdown-editor ${className}" data-markdown-editor><div class="markdown-editor__header"><label class="form-label mb-0" for="${CIS.attr(id)}">${CIS.escape(label)}${detail ? ` <span class="text-secondary fw-normal">· ${CIS.escape(detail)}</span>` : ""}</label><div class="btn-group" role="tablist" aria-label="${CIS.attr(label)} mode"><button class="btn btn-sm btn-primary" role="tab" aria-selected="true" data-md-mode="edit" type="button">Edit</button><button class="btn btn-sm btn-outline-secondary" role="tab" aria-selected="false" data-md-mode="preview" type="button">Preview</button></div></div><div class="markdown-editor__toolbar" role="toolbar" aria-label="${CIS.attr(label)} Markdown formatting" data-md-toolbar><button class="btn btn-sm btn-ghost-secondary fw-bold" data-md-wrap="**" data-md-placeholder="bold text" type="button" aria-label="Bold" ${locked}>B</button><button class="btn btn-sm btn-ghost-secondary fst-italic" data-md-wrap="*" data-md-placeholder="italic text" type="button" aria-label="Italic" ${locked}>I</button><button class="btn btn-sm btn-ghost-secondary font-monospace" data-md-wrap="\`" data-md-placeholder="code" type="button" aria-label="Inline code" ${locked}>&lt;/&gt;</button><span class="markdown-editor__divider" aria-hidden="true"></span><button class="btn btn-sm btn-ghost-secondary" data-md-prefix="## " type="button" aria-label="Heading" ${locked}>H2</button><button class="btn btn-sm btn-ghost-secondary" data-md-prefix="- " type="button" aria-label="Bullet list" ${locked}>• List</button><button class="btn btn-sm btn-ghost-secondary" data-md-link type="button" aria-label="Link" ${locked}>Link</button></div><div class="markdown-editor__panel" role="tabpanel" data-md-panel="edit"><textarea class="form-control markdown-editor__textarea" id="${CIS.attr(id)}" rows="14" ${id === "canonical-description" ? 'name="description"' : ""} ${locked}>${CIS.escape(current)}</textarea></div><div class="markdown-editor__panel markdown-preview" role="tabpanel" data-md-panel="preview" hidden></div><div class="markdown-editor__footer"><span>Markdown supported</span><span data-md-count>${String(current).length.toLocaleString()} characters</span></div></div>`;
  }

  function markdownDescription(current, source) {
    return `<div class="col-12">${markdownWorkbench({ id: "canonical-description", label: "Description", current, detail: source })}</div>`;
  }

  function readonlyMarkdown(label, current) {
    return `<div class="markdown-editor translation-source h-100"><div class="markdown-editor__header"><span class="form-label mb-0">${CIS.escape(label)}</span><span class="badge bg-secondary-lt">Read only</span></div><textarea class="d-none" data-md-readonly-source tabindex="-1" aria-hidden="true">${CIS.escape(current || "—")}</textarea><div class="markdown-preview translation-source__preview" data-md-readonly></div><div class="markdown-editor__footer"><span>Rendered Markdown</span></div></div>`;
  }

  function canonicalField(name, editor) {
    const labels = { summary: "Summary", description: "Description", issue_type: "Issue type", priority: "Priority", status: "Status", assignee: "Assignee", due_date: "Due date", story_point: "Story Point" };
    const current = editor.canonical?.[name]?.value ?? "";
    const source = editor.canonical?.[name]?.source || "manual";
    if (name === "description") return markdownDescription(current, source);
    const catalog = editor.field_meta?.catalogs?.[name] || [];
    const type = name === "due_date" ? "date" : name === "story_point" ? "number" : "text";
    const numberRules = name === "story_point" ? ' min="0" step="any" required' : "";
    const input = catalog.length ? `<select class="form-select" id="canonical-${name}" name="${name}">${catalogOptions(catalog, current)}</select>` : `<input class="form-control" id="canonical-${name}" name="${name}" type="${type}" value="${CIS.attr(current)}"${numberRules}>`;
    return `<div class="${name === "summary" ? "col-12" : "col-md-6"}"><label class="form-label" for="canonical-${name}">${labels[name]} <span class="text-secondary fw-normal">· ${CIS.escape(source)}</span></label>${input}</div>`;
  }

  function sourceSnapshots(editor) {
    const fields = Object.entries(editor.sources || {});
    if (!fields.length) return '<section class="card mb-3"><div class="card-header"><h2 class="card-title">Source snapshots</h2></div><div class="card-body text-secondary">No source snapshots.</div></section>';
    const wideFields = new Set(["summary", "description"]);
    const systems = ["cis", "backlog", "jira"];
    const valueCell = (field, system, value) => {
      const id = `snapshot-${field}-${system}`;
      const displayValue = value === null || value === undefined || value === "" ? "—" : value;
      const content = field === "description"
        ? `<textarea class="d-none" data-md-readonly-source tabindex="-1" aria-hidden="true">${CIS.escape(displayValue)}</textarea><div class="markdown-preview snapshot-markdown" data-md-readonly></div>`
        : `<div class="snapshot-plain">${CIS.escape(displayValue)}</div>`;
      if (!wideFields.has(field)) return `<div class="snapshot-compact-value"><span>${CIS.escape(system.toUpperCase())}</span><strong>${CIS.escape(displayValue)}</strong></div>`;
      return `<div class="snapshot-system"><div class="snapshot-system__label">${CIS.escape(system.toUpperCase())}</div><div class="snapshot-clamp" id="${CIS.attr(id)}" data-snapshot-clamp>${content}</div><button class="btn btn-sm btn-ghost-primary snapshot-toggle" type="button" data-snapshot-toggle aria-controls="${CIS.attr(id)}" aria-expanded="false" hidden>Show more ${CIS.escape(system.toUpperCase())}</button></div>`;
    };
    const fieldCard = ([field, values]) => {
      const wide = wideFields.has(field);
      return `<section class="snapshot-field ${wide ? "snapshot-field--wide" : ""}" data-snapshot-field="${CIS.attr(field)}"><div class="snapshot-field__header"><h3>${CIS.escape(CIS.label(field))}</h3>${wide ? '<span class="text-secondary small">Wide field</span>' : ""}</div><div class="${wide ? "snapshot-wide-values" : "snapshot-compact-values"}">${systems.map((system) => valueCell(field, system, values?.[system])).join("")}</div></section>`;
    };
    const ordered = [...fields.filter(([field]) => wideFields.has(field)), ...fields.filter(([field]) => !wideFields.has(field))];
    return `<section class="card mb-3" data-source-snapshots><div class="card-header"><div><h2 class="card-title">Source snapshots</h2><div class="text-secondary small">Compare canonical and provider evidence by field.</div></div><span class="badge bg-secondary-lt ms-auto">${fields.length} fields</span></div><div class="card-body snapshot-grid">${ordered.map(fieldCard).join("")}</div></section>`;
  }

  function translationCards(items) {
    return (items || []).map((item) => {
      const text = item.ai_draft || "";
      const field = item.target_field || item.target_type;
      const cardKey = item.id || `field-${field}`;
      const persisted = Boolean(item.id);
      return `<article class="card mb-3" data-translation="${CIS.attr(cardKey)}" data-translation-id="${CIS.attr(item.id || "")}" data-translation-field="${CIS.attr(field)}"><div class="card-header"><div><h3 class="card-title">${CIS.escape(CIS.label(field))}</h3><div class="text-secondary small">AI and operator share one draft; approved drafts update canonical.</div></div><span data-translation-status>${CIS.badge(item.review_status || "pending")}</span></div><div class="card-body"><div class="row g-3 translation-compare"><div class="col-lg-6">${readonlyMarkdown("Source snapshot", item.source_text)}</div><div class="col-lg-6">${markdownWorkbench({ id: `translation-${cardKey}`, label: "AI draft", current: text, className: "translation-workbench h-100" })}</div></div>${item.is_source_stale ? '<div class="alert alert-warning mt-3">Source changed. Reconcile and save this draft against the current source, or retranslate.</div>' : ""}${item.provider_error ? `<div class="alert alert-danger mt-3">${CIS.escape(item.provider_error)}</div>` : ""}</div><div class="card-footer"><div class="table-actions"><button class="btn btn-sm btn-outline-primary" data-translation-action="retranslate" type="button" ${item.source_text ? "" : "disabled"}>Retranslate</button><button class="btn btn-sm btn-outline-secondary" data-translation-action="save-draft" type="button" ${persisted && text ? "" : "disabled"}>Save draft</button><button class="btn btn-sm btn-primary" data-translation-action="approve" type="button" ${persisted && text && !item.is_source_stale ? "" : "disabled"}>Approve</button><button class="btn btn-sm btn-outline-danger" data-translation-action="reject" type="button" ${persisted ? "" : "disabled"}>Reject</button></div><div class="job-evidence" aria-live="polite"></div></div></article>`;
    }).join("") || '<div class="text-secondary">No translation queue items for this issue.</div>';
  }

  async function editorPage(issueId) {
    root.innerHTML = `<div class="container-xl">${heading("Issue Editor", "Loading canonical, source, translation and outbound evidence…", `CIS ${CIS.escape(issueId)}`)}<section class="card state-card" aria-busy="true"><div class="card-body"><span class="spinner-border spinner-border-sm me-2"></span>Loading editor…</div></section></div>`;
    let editor;
    let attachments = [];
    let history = {};
    try {
      [editor, attachments, history] = await Promise.all([
        CIS.projectApi(project.id, `/issues/${encodeURIComponent(issueId)}/editor`),
        CIS.projectApi(project.id, `/issues/${encodeURIComponent(issueId)}/attachments`),
        CIS.projectApi(project.id, `/issues/${encodeURIComponent(issueId)}/history`),
      ]);
      if (editor.issue.project_id !== project.id) throw new Error("This issue does not belong to the active Project workspace.");
    } catch (error) { root.innerHTML = CIS.state("Issue Editor unavailable", error.message, `<a class="btn btn-primary" href="${CIS.attr(CIS.projectPath("/cis-issues", project.id))}">Back to CIS Issues</a>`); return; }

    const issue = editor.issue;
    root.innerHTML = `<div class="container-xl">${heading("Issue Editor", "Canonical state is the controlled handoff between source evidence and Jira preview.", `CIS ${issue.id}`)}
      <div id="editor-notice"></div>
      <div class="issue-editor-layout">
        <aside class="issue-editor-rail" aria-label="Issue controls">
          <section class="card mb-3"><div class="card-header d-block"><div class="d-flex align-items-center gap-2"><h2 class="card-title">Identity and state</h2><span class="ms-auto">${CIS.badge(issue.sync_status || "unknown")}</span></div><div class="text-secondary small mt-1">Revision ${issue.current_revision || 0} · updated ${CIS.formatDate(issue.updated_at)}</div></div><div class="card-body"><form id="identity-form"><div class="row g-3"><div class="col-12"><label class="form-label" for="backlog-key">Backlog issue key</label><input class="form-control" id="backlog-key" name="backlog_issue_key" value="${CIS.attr(issue.backlog_issue_key || "")}" ${issue.backlog_issue_key ? "disabled" : ""}></div><div class="col-12"><label class="form-label" for="jira-key">Jira issue key</label><input class="form-control" id="jira-key" name="jira_issue_key" value="${CIS.attr(issue.jira_issue_key || "")}" ${issue.jira_issue_key ? "disabled" : ""}></div><div class="col-12"><button class="btn btn-outline-primary w-100" type="submit" ${issue.backlog_issue_key && issue.jira_issue_key ? "disabled" : ""}>Link identity</button></div></div></form><button class="btn btn-outline-primary w-100 mt-3" id="resync" type="button" ${issue.backlog_issue_key ? "" : "disabled"}>Resync Backlog</button><div class="job-evidence" id="resync-state"></div></div></section>
          <section class="card"><div class="card-header d-block"><h2 class="card-title">Jira outbound gate</h2><div class="text-secondary small mt-1">Dry-run is mandatory before any write.</div></div><div class="card-body"><div class="metric-strip issue-editor-rail__metrics"><div class="metric"><span>Manual edits</span><strong>${history.manual_edits?.length || 0}</strong></div><div class="metric"><span>Translations</span><strong>${editor.translation?.total || editor.translations?.length || 0}</strong></div><div class="metric"><span>Attachments</span><strong>${attachments.length}</strong></div></div></div><div class="card-footer"><button class="btn btn-primary w-100" id="jira-dry-run" type="button">Prepare Jira sync</button></div></section>
        </aside>
        <div class="issue-editor-main">
          <section class="card mb-3"><div class="card-header"><h2 class="card-title">Canonical CIS data</h2><span class="text-secondary ms-auto">${editor.sync?.canonical_hash ? `Hash ${CIS.escape(editor.sync.canonical_hash.slice(0, 12))}` : "Unsynced"}</span></div><form id="canonical-form"><div class="card-body"><div class="row g-3">${["summary", "description", "issue_type", "priority", "status", "assignee", "due_date", "story_point"].map((name) => canonicalField(name, editor)).join("")}<div class="col-12"><label class="form-label" for="edit-reason">Change reason <span class="text-secondary fw-normal">· optional</span></label><input class="form-control" id="edit-reason" name="reason" placeholder="Optional context for this change"></div></div></div><div class="card-footer d-flex justify-content-end"><button class="btn btn-primary" type="submit">Save canonical revision</button></div></form></section>
          <section class="card mb-3"><div class="card-header"><div><h2 class="card-title">Translation review</h2><div class="text-secondary small">AI proposes; operator decides.</div></div></div><div class="card-body" id="translations">${translationCards(editor.translations)}</div></section>
          <section class="card mb-3"><div class="card-header"><h2 class="card-title">Attachments</h2><span class="badge bg-secondary-lt ms-auto">${attachments.length}</span></div>${attachments.length ? `<div class="table-responsive"><table class="table table-vcenter"><thead><tr><th>File</th><th>Download</th><th>Sync</th><th>Error</th><th></th></tr></thead><tbody>${attachments.map((item) => `<tr data-attachment="${item.id}"><td>${CIS.escape(item.filename || item.file_name || `Attachment ${item.id}`)}</td><td>${CIS.badge(item.download_status || "unknown")}</td><td>${CIS.badge(item.sync_status || "unknown")}</td><td>${CIS.escape(item.error || "—")}</td><td><button class="btn btn-sm btn-outline-primary" data-retry-attachment type="button">Retry download</button></td></tr>`).join("")}</tbody></table></div>` : '<div class="card-body text-secondary">No attachments.</div>'}</section>
          ${sourceSnapshots(editor)}
        </div>
      </div>
    </div>`;
    bindEditor(issueId, editor);
  }

  function bindEditor(issueId, editor) {
    const notice = document.querySelector("#editor-notice");
    let dirty = false;
    const canonical = document.querySelector("#canonical-form");
    bindMarkdownEditor();
    bindSourceSnapshots();
    canonical.addEventListener("input", () => { dirty = true; });
    addEventListener("beforeunload", (event) => { if (dirty) event.preventDefault(); });
    canonical.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const button = form.querySelector("button");
      button.disabled = true;
      const label = button.textContent;
      button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Saving…';
      try {
        const result = await CIS.projectApi(project.id, `/issues/${encodeURIComponent(issueId)}`, { method: "PATCH", body: CIS.formJson(form) });
        editor.canonical = result.canonical;
        editor.issue = { ...editor.issue, ...result.issue };
        dirty = false;
        form.elements.reason.value = "";
        notice.innerHTML = "";
        CIS.toast("Canonical revision saved.");
      } catch (error) {
        notice.innerHTML = CIS.alert(error.message);
      } finally {
        button.disabled = false;
        button.textContent = label;
      }
    });
    document.querySelector("#identity-form").addEventListener("submit", async (event) => {
      event.preventDefault(); const form = event.currentTarget; const body = CIS.formJson(form); Object.keys(body).forEach((key) => { if (!body[key]) delete body[key]; });
      const button = form.querySelector("button"); button.disabled = true;
      try {
        const result = await CIS.projectApi(project.id, `/issues/${encodeURIComponent(issueId)}/external-identities`, { method: "POST", body });
        for (const [name, identity] of [["backlog_issue_key", result.external_identities?.backlog], ["jira_issue_key", result.external_identities?.jira]]) {
          if (!identity) continue;
          form.elements[name].value = identity.key;
          form.elements[name].disabled = true;
          editor.issue[name] = identity.key;
        }
        button.disabled = Boolean(editor.issue.backlog_issue_key && editor.issue.jira_issue_key);
        document.querySelector("#resync").disabled = !editor.issue.backlog_issue_key;
        CIS.toast("External identity linked.");
      } catch (error) { notice.innerHTML = CIS.alert(error.message); button.disabled = false; }
    });
    document.querySelector("#resync").addEventListener("click", async (event) => {
      const button = event.currentTarget; const target = document.querySelector("#resync-state"); const label = button.textContent; button.disabled = true; button.setAttribute("aria-busy", "true"); button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Resyncing…';
      try {
        const job = await CIS.projectApi(project.id, `/backlog/issues/${encodeURIComponent(editor.issue.backlog_issue_key)}/pull`, { method: "POST" });
        target.textContent = `Job ${job.id}: ${job.status}`;
        const final = await CIS.pollJob(project.id, job.id, (current) => { target.textContent = `Job ${current.id}: ${current.status}`; });
        if (final.status !== "success") throw new Error(final.last_error || `Backlog resync ended with status ${final.status}.`);
        const refreshed = await CIS.projectApi(project.id, `/issues/${encodeURIComponent(issueId)}/editor`);
        for (const name of ["issue_type", "priority", "status", "assignee"]) {
          const control = canonical.elements[name]; const value = refreshed.canonical?.[name]?.value ?? "";
          if (!control) continue;
          if (control.tagName === "SELECT" && value && ![...control.options].some((option) => option.value === String(value))) control.add(new Option(`${value} (current)`, value));
          control.value = value;
        }
        editor.canonical = refreshed.canonical;
        editor.issue = refreshed.issue;
        target.textContent = `Job ${final.id}: success · CIS mappings refreshed`;
        CIS.toast("Backlog resynced and CIS mappings refreshed.");
      }
      catch (error) { target.innerHTML = `<span class="text-danger">${CIS.escape(error.message)}</span>`; } finally { button.disabled = false; button.removeAttribute("aria-busy"); button.textContent = label; }
    });
    document.querySelectorAll("[data-translation]").forEach((card) => card.querySelectorAll("[data-translation-action]").forEach((button) => button.addEventListener("click", async () => {
      const action = button.dataset.translationAction; const evidence = card.querySelector(".job-evidence"); const label = button.innerHTML; button.disabled = true; button.setAttribute("aria-busy", "true");
      if (action === "retranslate") button.innerHTML = '<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Retranslating…';
      try {
        let result;
        const id = card.dataset.translationId;
        if (action === "retranslate" && id) result = await CIS.projectApi(project.id, `/issues/${encodeURIComponent(issueId)}/translations/${encodeURIComponent(id)}/translate`, { method: "POST" });
        else if (action === "retranslate") {
          const translated = await CIS.projectApi(project.id, `/issues/${encodeURIComponent(issueId)}/translations/translate`, { method: "POST", body: { target_field: card.dataset.translationField } });
          result = { item: translated.translations.find((item) => item.target_field === card.dataset.translationField) };
        } else if (action === "save-draft") await CIS.projectApi(project.id, `/translation-queue/${encodeURIComponent(id)}/draft`, { method: "PUT", body: { draft_text: card.querySelector(".translation-workbench textarea").value, review_notes: "issue-editor" } });
        else await CIS.projectApi(project.id, `/translation-queue/${encodeURIComponent(id)}/${action}`, { method: "POST", body: { review_notes: "issue-editor" } });
        if (action === "retranslate") {
          const item = result.item;
          card.dataset.translationId = item.id;
          const draft = card.querySelector(".translation-workbench textarea");
          draft.value = item.ai_draft || "";
          draft.dispatchEvent(new Event("input", { bubbles: true }));
          card.querySelector('[data-translation-action="save-draft"]').disabled = !item.ai_draft;
          card.querySelector('[data-translation-action="approve"]').disabled = !item.ai_draft;
          card.querySelector('[data-translation-action="reject"]').disabled = false;
          evidence.textContent = "Draft retranslated. Review and approve to update canonical.";
        }
        const status = action === "approve" ? "approved" : action === "reject" ? "rejected" : "ai_draft";
        card.querySelector("[data-translation-status]").innerHTML = CIS.badge(status);
        CIS.toast(action === "retranslate" ? "Draft retranslated; canonical is unchanged." : action === "save-draft" ? "Translation draft saved." : `Translation ${action} requested.`); button.disabled = action === "approve";
      } catch (error) { evidence.innerHTML = `<span class="text-danger">${CIS.escape(error.message)}</span>`; button.disabled = false; }
      finally { button.removeAttribute("aria-busy"); button.innerHTML = label; }
    })));
    document.querySelectorAll("[data-retry-attachment]").forEach((button) => button.addEventListener("click", async () => {
      const id = button.closest("tr").dataset.attachment; button.disabled = true;
      try { await CIS.projectApi(project.id, `/attachments/${encodeURIComponent(id)}/retry-download`, { method: "POST" }); CIS.toast(`Attachment ${id} queued for retry.`); button.disabled = false; }
      catch (error) { notice.innerHTML = CIS.alert(error.message); button.disabled = false; }
    }));
    document.querySelector("#jira-dry-run").addEventListener("click", () => openJiraGate(issueId, editor));
  }

  function bindSourceSnapshots() {
    document.querySelectorAll("[data-snapshot-clamp]").forEach((panel) => {
      const button = panel.parentElement.querySelector("[data-snapshot-toggle]");
      if (panel.scrollHeight <= panel.clientHeight + 1) return;
      panel.classList.add("is-clamped");
      button.hidden = false;
      button.addEventListener("click", () => {
        const expanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!expanded));
        button.textContent = expanded ? `Show more ${panel.previousElementSibling.textContent}` : "Show less";
        panel.classList.toggle("is-expanded", !expanded);
        panel.classList.toggle("is-clamped", expanded);
      });
    });
  }

  function bindMarkdownEditor() {
    const markdown = window.markdownit({ html: false, linkify: true, breaks: true });
    const defaultLinkOpen = markdown.renderer.rules.link_open || ((tokens, index, options, env, renderer) => renderer.renderToken(tokens, index, options));
    markdown.renderer.rules.link_open = (tokens, index, options, env, renderer) => {
      tokens[index].attrSet("target", "_blank");
      tokens[index].attrSet("rel", "noopener noreferrer");
      return defaultLinkOpen(tokens, index, options, env, renderer);
    };

    document.querySelectorAll("[data-md-readonly]").forEach((preview) => {
      const source = preview.previousElementSibling.value;
      preview.innerHTML = source.trim() ? markdown.render(source) : '<div class="markdown-preview__empty">No source content.</div>';
    });

    document.querySelectorAll("[data-markdown-editor]").forEach((shell) => {
      const textarea = shell.querySelector("textarea");
      const preview = shell.querySelector('[data-md-panel="preview"]');
      const count = shell.querySelector("[data-md-count]");
      const updateCount = () => { count.textContent = `${textarea.value.length.toLocaleString()} characters`; };
      const updatePreview = () => { preview.innerHTML = textarea.value.trim() ? markdown.render(textarea.value) : '<div class="markdown-preview__empty">Nothing to preview yet.</div>'; };
      const replaceSelection = (before, after, placeholder) => {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.slice(start, end);
        const leading = selectedText.match(/^\s*/)?.[0] || "";
        const remainder = selectedText.slice(leading.length);
        const trailing = remainder.match(/\s*$/)?.[0] || "";
        const content = remainder.slice(0, remainder.length - trailing.length) || placeholder;
        textarea.setRangeText(`${leading}${before}${content}${after}${trailing}`, start, end, "preserve");
        const contentStart = start + leading.length + before.length;
        textarea.setSelectionRange(contentStart, contentStart + content.length);
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        textarea.focus();
      };
      const prefixLines = (prefix) => {
        const lineStart = textarea.value.lastIndexOf("\n", Math.max(0, textarea.selectionStart - 1)) + 1;
        const nextBreak = textarea.value.indexOf("\n", textarea.selectionEnd);
        const lineEnd = nextBreak === -1 ? textarea.value.length : nextBreak;
        const block = textarea.value.slice(lineStart, lineEnd) || "text";
        textarea.setRangeText(block.split("\n").map((line) => `${prefix}${line}`).join("\n"), lineStart, lineEnd, "select");
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        textarea.focus();
      };
      const setMode = (mode) => {
        if (mode === "preview") updatePreview();
        shell.querySelectorAll("[data-md-mode]").forEach((button) => {
          const active = button.dataset.mdMode === mode;
          button.classList.toggle("btn-primary", active);
          button.classList.toggle("btn-outline-secondary", !active);
          button.setAttribute("aria-selected", String(active));
        });
        shell.querySelector('[data-md-panel="edit"]').hidden = mode !== "edit";
        preview.hidden = mode !== "preview";
        shell.querySelector("[data-md-toolbar]").hidden = mode !== "edit";
      };

      shell.querySelectorAll("[data-md-mode]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mdMode)));
      shell.querySelectorAll("[data-md-wrap]").forEach((button) => button.addEventListener("click", () => replaceSelection(button.dataset.mdWrap, button.dataset.mdWrap, button.dataset.mdPlaceholder)));
      shell.querySelectorAll("[data-md-prefix]").forEach((button) => button.addEventListener("click", () => prefixLines(button.dataset.mdPrefix)));
      shell.querySelector("[data-md-link]").addEventListener("click", () => replaceSelection("[", "](https://)", "link text"));
      textarea.addEventListener("input", updateCount);
      textarea.addEventListener("keydown", (event) => {
        if (!(event.ctrlKey || event.metaKey)) return;
        if (event.key.toLowerCase() === "b") { event.preventDefault(); replaceSelection("**", "**", "bold text"); }
        if (event.key.toLowerCase() === "i") { event.preventDefault(); replaceSelection("*", "*", "italic text"); }
      });
      updateCount();
    });
  }

  async function openJiraGate(issueId, editor) {
    const modal = CIS.dialog("Jira sync preparation", `<div class="dialog-header"><div><div class="route-kicker">Outbound safety</div><h2 class="h3 mb-0">Jira dry-run</h2></div><button class="btn-close" data-dialog-close aria-label="Close"></button></div><div class="dialog-body" id="jira-gate"><span class="spinner-border spinner-border-sm me-2"></span>Running pre-check…</div>`);
    const region = modal.querySelector("#jira-gate");
    try {
      const dryRun = await CIS.projectApi(project.id, `/issues/${encodeURIComponent(issueId)}/dry-run/jira`, { method: "POST" });
      const errors = dryRun.validation?.errors || [];
      const warnings = dryRun.warnings || [];
      const fields = dryRun.payload?.fields || {};
      const storyPointFieldId = dryRun.target_fields?.story_point;
      const transition = dryRun.payload?.transition_preview || {};
      const assignee = fields.assignee?.accountId || fields.assignee?.account_id || fields.assignee?.emailAddress || fields.assignee?.name || "";
      const jiraCatalogs = editor.field_meta?.catalogs_by_system?.jira || {};
      const canonicalCatalogs = editor.field_meta?.catalogs || {};
      const catalog = (name) => jiraCatalogs[name]?.length ? jiraCatalogs[name] : canonicalCatalogs[name] || [];
      const select = (id, name, current) => `<select class="form-select" id="${id}" name="${name}">${catalogOptions(catalog(name), current)}</select>`;
      const storyPoint = storyPointFieldId
        ? fields[storyPointFieldId] ?? editor.canonical?.story_point?.value ?? 1
        : editor.canonical?.story_point?.value ?? 1;
      const storyPointAvailability = storyPointFieldId
        ? `Jira ${storyPointFieldId}`
        : `Not available for ${fields.issuetype?.name || "this issue type"} in Jira`;
      region.innerHTML = `<div class="d-flex align-items-center justify-content-between mb-3"><strong>Gate result</strong>${CIS.badge(dryRun.can_sync ? "can_sync" : "blocked", dryRun.can_sync ? "green" : "red")}</div>${errors.map((item) => CIS.alert(`${item.code || "ERROR"}: ${item.message}`)).join("")}${warnings.map((item) => CIS.alert(`${item.code || "WARNING"}: ${item.message}`, "warning")).join("")}
        <form id="jira-fields" class="card mt-3"><div class="card-header"><div><h3 class="card-title">Jira fields</h3><div class="text-secondary small">Review the exact outbound values before publishing.</div></div></div><div class="card-body"><div class="row g-3">
          <div class="col-12"><label class="form-label" for="jira-summary">Summary</label><input class="form-control" id="jira-summary" name="summary" value="${CIS.attr(fields.summary || "")}" required></div>
          <div class="col-12"><label class="form-label" for="jira-description">Description</label><textarea class="form-control" id="jira-description" name="description" rows="5">${CIS.escape(fields.description || "")}</textarea></div>
          <div class="col-md-6"><label class="form-label" for="jira-type">Issue type</label>${select("jira-type", "issue_type", fields.issuetype?.name || fields.issuetype?.id || "")}</div>
          <div class="col-md-6"><label class="form-label" for="jira-priority">Priority</label>${select("jira-priority", "priority", fields.priority?.name || fields.priority?.id || "")}</div>
          <div class="col-md-4"><label class="form-label" for="jira-status">Target status</label>${select("jira-status", "status", transition.status || "")}</div>
          <div class="col-md-4"><label class="form-label" for="jira-assignee">Assignee</label>${select("jira-assignee", "assignee", assignee)}</div>
          <div class="col-md-4"><label class="form-label" for="jira-due-date">Due date</label><input class="form-control" id="jira-due-date" name="due_date" type="date" value="${CIS.attr(fields.duedate || "")}"></div>
          <div class="col-md-4"><label class="form-label" for="jira-story-point">Story Point</label><input class="form-control" id="jira-story-point" name="story_point" type="number" min="0" step="any" value="${CIS.attr(storyPoint)}" ${storyPointFieldId ? "required" : "disabled"}><div class="form-hint">${CIS.escape(storyPointAvailability)}</div></div>
        </div></div></form>
        <details class="card mt-3"><summary class="card-header"><span class="card-title">Original payload preview</span></summary><pre class="card-body source-panel">${CIS.escape(JSON.stringify(dryRun.payload || {}, null, 2))}</pre></details><div class="d-flex justify-content-end gap-2 mt-3"><button class="btn btn-outline-secondary" data-dialog-close type="button">Close</button><button class="btn btn-primary" id="publish-jira" type="button" ${dryRun.can_sync ? "" : "disabled"}>Sync Jira</button></div><div class="job-evidence" id="jira-job" aria-live="polite"></div>`;
      region.querySelectorAll("[data-dialog-close]").forEach((button) => button.addEventListener("click", () => modal.close()));
      region.querySelector("#publish-jira")?.addEventListener("click", async (event) => {
        const jobRegion = region.querySelector("#jira-job"); event.currentTarget.disabled = true;
        try {
          const form = region.querySelector("#jira-fields");
          if (!form.reportValidity()) { event.currentTarget.disabled = false; return; }
          const job = await CIS.projectApi(project.id, `/issues/${encodeURIComponent(issueId)}/sync/jira`, { method: "POST", body: { jira_fields: CIS.formJson(form) } });
          jobRegion.textContent = `Job ${job.id}: ${job.status}`;
          await CIS.pollJob(project.id, job.id, (current) => { jobRegion.textContent = `Job ${current.id}: ${current.status}`; });
        }
        catch (error) { jobRegion.innerHTML = `<span class="text-danger">${CIS.escape(error.message)}</span>`; event.currentTarget.disabled = false; }
      });
    } catch (error) { region.innerHTML = `${CIS.alert(error.message)}${CIS.retryLink()}`; }
  }
}))();
