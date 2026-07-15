"use strict";

(() => CIS.ready(({ project }) => {
  const root = document.querySelector("#page-content");
  const issueMatch = location.pathname.match(/^\/cis-issues\/([^/]+)\/?$/);
  if (issueMatch) editorPage(decodeURIComponent(issueMatch[1]));
  else listPage();

  function heading(title, copy, rail = "CIS") {
    return `<div class="page-heading"><div><div class="route-kicker">Canonical workspace</div><h1>${title}</h1><p class="text-secondary mb-0">${copy}</p></div><div class="flow-rail"><span>${rail}</span><strong>· ${CIS.escape(project.name)} #${project.id}</strong></div></div>`;
  }

  async function listPage() {
    root.innerHTML = `<div class="container-xl">${heading("CIS Issues", "Create and review canonical issue state before any outbound delivery.")}<section class="card state-card" aria-busy="true"><div class="card-body"><span class="spinner-border spinner-border-sm me-2"></span>Loading issues…</div></section></div>`;
    let issues;
    try { issues = await CIS.api(`/api/v1/issues?project_id=${project.id}`); }
    catch (error) { root.innerHTML = CIS.state("CIS Issues unavailable", error.message, CIS.retryLink()); return; }
    root.innerHTML = `<div class="container-xl">${heading("CIS Issues", "Create and review canonical issue state before any outbound delivery.")}
      <section class="card mb-3"><div class="card-header"><h2 class="card-title">Create manual CIS issue</h2></div><div class="card-body"><div id="create-error"></div><form id="create-issue"><div class="row g-3 align-items-end"><div class="col-md-5"><label class="form-label" for="issue-summary">Summary</label><input class="form-control" id="issue-summary" name="summary" required></div><div class="col-md-5"><label class="form-label" for="issue-description">Description</label><input class="form-control" id="issue-description" name="description"></div><div class="col-md-2"><button class="btn btn-primary w-100" type="submit">Create issue</button></div></div></form></div></section>
      <section class="card"><div class="card-header"><h2 class="card-title">Issue register</h2><span class="badge bg-secondary-lt ms-auto">${issues.length}</span></div>${issues.length ? `<div class="table-responsive"><table class="table table-vcenter responsive-table"><thead><tr><th>Backlog</th><th>Status</th><th>Summary</th><th>Pending review</th><th>Anomaly</th><th></th></tr></thead><tbody>${issues.map((issue) => `<tr><td data-label="Backlog"><code>${CIS.escape(issue.backlog_issue_key || "—")}</code></td><td data-label="Status">${CIS.badge(issue.sync_status || "unknown")}</td><td data-label="Summary">${CIS.escape(issue.current_summary || "—")}</td><td data-label="Pending review">${issue.pending_translation_count || 0}</td><td data-label="Anomaly">${issue.open_anomaly_count || 0}</td><td data-label="Action"><a class="btn btn-sm btn-outline-primary" href="/cis-issues/${encodeURIComponent(issue.id)}">Open Editor</a></td></tr>`).join("")}</tbody></table></div>` : '<div class="card-body text-center py-6"><h2 class="h3">No CIS issues found</h2><p class="text-secondary">Create the first canonical issue in this Project.</p></div>'}</section>
    </div>`;
    document.querySelector("#create-issue").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const button = form.querySelector("button");
      button.disabled = true;
      try {
        const result = await CIS.api("/api/v1/issues", { method: "POST", body: { project_id: project.id, ...CIS.formJson(form) } });
        location.assign(`/cis-issues/${encodeURIComponent(result.issue.id)}`);
      } catch (error) {
        document.querySelector("#create-error").innerHTML = CIS.alert(error.message);
        button.disabled = false;
      }
    });
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
    const labels = { summary: "Summary", description: "Description", issue_type: "Issue type", priority: "Priority", status: "Status", assignee: "Assignee", due_date: "Due date" };
    const current = editor.canonical?.[name]?.value || "";
    const source = editor.canonical?.[name]?.source || "manual";
    if (name === "description") return markdownDescription(current, source);
    const catalog = editor.field_meta?.catalogs?.[name] || [];
    const input = catalog.length ? `<select class="form-select" id="canonical-${name}" name="${name}">${catalogOptions(catalog, current)}</select>` : `<input class="form-control" id="canonical-${name}" name="${name}" type="${name === "due_date" ? "date" : "text"}" value="${CIS.attr(current)}">`;
    return `<div class="${name === "summary" ? "col-12" : "col-md-6"}"><label class="form-label" for="canonical-${name}">${labels[name]} <span class="text-secondary fw-normal">· ${CIS.escape(source)}</span></label>${input}</div>`;
  }

  function sourceSnapshots(editor) {
    const fields = Object.entries(editor.sources || {});
    if (!fields.length) return '<section class="card mb-3"><div class="card-header"><h2 class="card-title">Source snapshots</h2></div><div class="card-body text-secondary">No source snapshots.</div></section>';
    const wideFields = new Set(["summary", "description"]);
    const systems = ["cis", "backlog", "jira"];
    const valueCell = (field, system, value) => {
      const id = `snapshot-${field}-${system}`;
      const content = field === "description"
        ? `<textarea class="d-none" data-md-readonly-source tabindex="-1" aria-hidden="true">${CIS.escape(value || "—")}</textarea><div class="markdown-preview snapshot-markdown" data-md-readonly></div>`
        : `<div class="snapshot-plain">${CIS.escape(value || "—")}</div>`;
      if (!wideFields.has(field)) return `<div class="snapshot-compact-value"><span>${CIS.escape(system.toUpperCase())}</span><strong>${CIS.escape(value || "—")}</strong></div>`;
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
      return `<article class="card mb-3" data-translation="${item.id}"><div class="card-header"><div><h3 class="card-title">${CIS.escape(CIS.label(item.target_field || item.target_type))}</h3><div class="text-secondary small">AI and operator share one draft; approval alone updates canonical.</div></div>${CIS.badge(item.review_status || "pending")}</div><div class="card-body"><div class="row g-3 translation-compare"><div class="col-lg-6">${readonlyMarkdown("Source snapshot", item.source_text)}</div><div class="col-lg-6">${markdownWorkbench({ id: `translation-${item.id}`, label: "AI draft", current: text, className: "translation-workbench h-100" })}</div></div>${item.is_source_stale ? '<div class="alert alert-warning mt-3">Source changed. Reconcile and save this draft against the current source, or retranslate. Approval is locked until then.</div>' : ""}${item.provider_error ? `<div class="alert alert-danger mt-3">${CIS.escape(item.provider_error)}</div>` : ""}</div><div class="card-footer"><div class="table-actions"><button class="btn btn-sm btn-outline-primary" data-translation-action="retranslate" type="button">Retranslate</button><button class="btn btn-sm btn-outline-secondary" data-translation-action="save-draft" type="button" ${!text ? "disabled" : ""}>Save draft</button><button class="btn btn-sm btn-primary" data-translation-action="approve" type="button" ${item.is_source_stale || !text ? "disabled" : ""}>Approve</button><button class="btn btn-sm btn-outline-danger" data-translation-action="reject" type="button">Reject</button></div><div class="job-evidence" aria-live="polite"></div></div></article>`;
    }).join("") || '<div class="text-secondary">No translation queue items for this issue.</div>';
  }

  async function editorPage(issueId) {
    root.innerHTML = `<div class="container-xl">${heading("Issue Editor", "Loading canonical, source, translation and outbound evidence…", `CIS ${CIS.escape(issueId)}`)}<section class="card state-card" aria-busy="true"><div class="card-body"><span class="spinner-border spinner-border-sm me-2"></span>Loading editor…</div></section></div>`;
    let editor;
    let attachments = [];
    let history = {};
    try {
      [editor, attachments, history] = await Promise.all([
        CIS.api(`/api/v1/issues/${encodeURIComponent(issueId)}/editor`),
        CIS.api(`/api/v1/issues/${encodeURIComponent(issueId)}/attachments`),
        CIS.api(`/api/v1/issues/${encodeURIComponent(issueId)}/history`),
      ]);
      if (editor.issue.project_id !== project.id) throw new Error("This issue does not belong to the active Project workspace.");
    } catch (error) { root.innerHTML = CIS.state("Issue Editor unavailable", error.message, '<a class="btn btn-primary" href="/cis-issues">Back to CIS Issues</a>'); return; }

    const issue = editor.issue;
    root.innerHTML = `<div class="container-xl">${heading("Issue Editor", "Canonical state is the controlled handoff between source evidence and Jira preview.", `CIS ${issue.id}`)}
      <div id="editor-notice"></div>
      <div class="issue-editor-layout">
        <aside class="issue-editor-rail" aria-label="Issue controls">
          <section class="card mb-3"><div class="card-header d-block"><div class="d-flex align-items-center gap-2"><h2 class="card-title">Identity and state</h2><span class="ms-auto">${CIS.badge(issue.sync_status || "unknown")}</span></div><div class="text-secondary small mt-1">Revision ${issue.current_revision || 0} · updated ${CIS.formatDate(issue.updated_at)}</div></div><div class="card-body"><form id="identity-form"><div class="row g-3"><div class="col-12"><label class="form-label" for="backlog-key">Backlog issue key</label><input class="form-control" id="backlog-key" name="backlog_issue_key" value="${CIS.attr(issue.backlog_issue_key || "")}" ${issue.backlog_issue_key ? "disabled" : ""}></div><div class="col-12"><label class="form-label" for="jira-key">Jira issue key</label><input class="form-control" id="jira-key" name="jira_issue_key" value="${CIS.attr(issue.jira_issue_key || "")}" ${issue.jira_issue_key ? "disabled" : ""}></div><div class="col-12"><button class="btn btn-outline-primary w-100" type="submit" ${issue.backlog_issue_key && issue.jira_issue_key ? "disabled" : ""}>Link identity</button></div></div></form><button class="btn btn-outline-primary w-100 mt-3" id="resync" type="button" ${issue.backlog_issue_key ? "" : "disabled"}>Resync Backlog</button><div class="job-evidence" id="resync-state"></div></div></section>
          <section class="card"><div class="card-header d-block"><h2 class="card-title">Jira outbound gate</h2><div class="text-secondary small mt-1">Dry-run is mandatory before any write.</div></div><div class="card-body"><div class="metric-strip issue-editor-rail__metrics"><div class="metric"><span>Manual edits</span><strong>${history.manual_edits?.length || 0}</strong></div><div class="metric"><span>Translations</span><strong>${editor.translation?.total || editor.translations?.length || 0}</strong></div><div class="metric"><span>Attachments</span><strong>${attachments.length}</strong></div></div></div><div class="card-footer"><button class="btn btn-primary w-100" id="jira-dry-run" type="button">Prepare Jira sync</button></div></section>
        </aside>
        <div class="issue-editor-main">
          <section class="card mb-3"><div class="card-header"><h2 class="card-title">Canonical CIS data</h2><span class="text-secondary ms-auto">${editor.sync?.canonical_hash ? `Hash ${CIS.escape(editor.sync.canonical_hash.slice(0, 12))}` : "Unsynced"}</span></div><form id="canonical-form"><div class="card-body"><div class="row g-3">${["summary", "description", "issue_type", "priority", "status", "assignee", "due_date"].map((name) => canonicalField(name, editor)).join("")}<div class="col-12"><label class="form-label" for="edit-reason">Change reason</label><input class="form-control" id="edit-reason" name="reason" required placeholder="Why is canonical truth changing?"></div></div></div><div class="card-footer d-flex justify-content-end"><button class="btn btn-primary" type="submit">Save canonical revision</button></div></form></section>
          <section class="card mb-3"><div class="card-header"><div><h2 class="card-title">Translation review</h2><div class="text-secondary small">AI proposes; operator decides.</div></div><button class="btn btn-sm btn-outline-primary ms-auto" id="translate-all" type="button">Translate issue</button></div><div class="card-body" id="translations">${translationCards(editor.translations)}</div></section>
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
      try { await CIS.api(`/api/v1/issues/${encodeURIComponent(issueId)}`, { method: "PATCH", body: CIS.formJson(form) }); dirty = false; CIS.toast("Canonical revision saved."); location.reload(); }
      catch (error) { notice.innerHTML = CIS.alert(error.message); button.disabled = false; }
    });
    document.querySelector("#identity-form").addEventListener("submit", async (event) => {
      event.preventDefault(); const form = event.currentTarget; const body = CIS.formJson(form); Object.keys(body).forEach((key) => { if (!body[key]) delete body[key]; });
      try { await CIS.api(`/api/v1/issues/${encodeURIComponent(issueId)}/external-identities`, { method: "POST", body }); location.reload(); }
      catch (error) { notice.innerHTML = CIS.alert(error.message); }
    });
    document.querySelector("#resync").addEventListener("click", async (event) => {
      const target = document.querySelector("#resync-state"); event.currentTarget.disabled = true;
      try { const job = await CIS.api(`/api/v1/projects/${editor.issue.project_id}/backlog/issues/${encodeURIComponent(editor.issue.backlog_issue_key)}/pull`, { method: "POST" }); target.textContent = `Job ${job.id}: ${job.status}`; await CIS.pollJob(job.id, (current) => { target.textContent = `Job ${current.id}: ${current.status}`; }); }
      catch (error) { target.innerHTML = `<span class="text-danger">${CIS.escape(error.message)}</span>`; } finally { event.currentTarget.disabled = false; }
    });
    document.querySelector("#translate-all").addEventListener("click", async (event) => {
      event.currentTarget.disabled = true;
      try { const result = await CIS.api(`/api/v1/translations/issues/${encodeURIComponent(issueId)}/translate`, { method: "POST" }); CIS.toast(result.queued_job_ids?.length ? `Translation queued: ${result.queued_job_ids.join(", ")}` : "Translation request accepted."); location.reload(); }
      catch (error) { notice.innerHTML = CIS.alert(error.message); event.currentTarget.disabled = false; }
    });
    document.querySelectorAll("[data-translation]").forEach((card) => card.querySelectorAll("[data-translation-action]").forEach((button) => button.addEventListener("click", async () => {
      const id = card.dataset.translation; const action = button.dataset.translationAction; const evidence = card.querySelector(".job-evidence"); button.disabled = true;
      try {
        if (action === "retranslate") await CIS.api(`/api/v1/translations/issues/${encodeURIComponent(issueId)}/items/${encodeURIComponent(id)}/translate`, { method: "POST" });
        else if (action === "save-draft") await CIS.api(`/api/v1/translation-queue/${encodeURIComponent(id)}/draft`, { method: "PUT", body: { draft_text: card.querySelector("textarea").value, review_notes: "issue-editor" } });
        else await CIS.api(`/api/v1/translation-queue/${encodeURIComponent(id)}/${action}`, { method: "POST", body: { review_notes: "issue-editor" } });
        CIS.toast(action === "save-draft" ? "Translation draft saved." : `Translation ${action} requested.`); location.reload();
      } catch (error) { evidence.innerHTML = `<span class="text-danger">${CIS.escape(error.message)}</span>`; button.disabled = false; }
    })));
    document.querySelectorAll("[data-retry-attachment]").forEach((button) => button.addEventListener("click", async () => {
      const id = button.closest("tr").dataset.attachment; button.disabled = true;
      try { await CIS.api(`/api/v1/attachments/${encodeURIComponent(id)}/retry-download`, { method: "POST" }); CIS.toast(`Attachment ${id} queued for retry.`); }
      catch (error) { notice.innerHTML = CIS.alert(error.message); button.disabled = false; }
    }));
    document.querySelector("#jira-dry-run").addEventListener("click", () => openJiraGate(issueId));
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

  async function openJiraGate(issueId) {
    const modal = CIS.dialog("Jira sync preparation", `<div class="dialog-header"><div><div class="route-kicker">Outbound safety</div><h2 class="h3 mb-0">Jira dry-run</h2></div><button class="btn-close" data-dialog-close aria-label="Close"></button></div><div class="dialog-body" id="jira-gate"><span class="spinner-border spinner-border-sm me-2"></span>Running pre-check…</div>`);
    const region = modal.querySelector("#jira-gate");
    try {
      const dryRun = await CIS.api(`/api/v1/issues/${encodeURIComponent(issueId)}/dry-run/jira`, { method: "POST" });
      const errors = dryRun.validation?.errors || [];
      const warnings = dryRun.warnings || [];
      const fields = dryRun.payload?.fields || {};
      const transition = dryRun.payload?.transition_preview || {};
      const assignee = fields.assignee?.accountId || fields.assignee?.account_id || fields.assignee?.name || "";
      region.innerHTML = `<div class="d-flex align-items-center justify-content-between mb-3"><strong>Gate result</strong>${CIS.badge(dryRun.can_sync ? "can_sync" : "blocked", dryRun.can_sync ? "green" : "red")}</div>${errors.map((item) => CIS.alert(`${item.code || "ERROR"}: ${item.message}`)).join("")}${warnings.map((item) => CIS.alert(`${item.code || "WARNING"}: ${item.message}`, "warning")).join("")}
        <form id="jira-fields" class="card mt-3"><div class="card-header"><div><h3 class="card-title">Jira fields</h3><div class="text-secondary small">Review the exact outbound values before publishing.</div></div></div><div class="card-body"><div class="row g-3">
          <div class="col-12"><label class="form-label" for="jira-summary">Summary</label><input class="form-control" id="jira-summary" name="summary" value="${CIS.attr(fields.summary || "")}" required></div>
          <div class="col-12"><label class="form-label" for="jira-description">Description</label><textarea class="form-control" id="jira-description" name="description" rows="5">${CIS.escape(fields.description || "")}</textarea></div>
          <div class="col-md-6"><label class="form-label" for="jira-type">Issue type</label><input class="form-control" id="jira-type" name="issue_type" value="${CIS.attr(fields.issuetype?.name || fields.issuetype?.id || "")}"></div>
          <div class="col-md-6"><label class="form-label" for="jira-priority">Priority</label><input class="form-control" id="jira-priority" name="priority" value="${CIS.attr(fields.priority?.name || fields.priority?.id || "")}"></div>
          <div class="col-md-4"><label class="form-label" for="jira-status">Target status</label><input class="form-control" id="jira-status" name="status" value="${CIS.attr(transition.status || "")}"></div>
          <div class="col-md-4"><label class="form-label" for="jira-assignee">Assignee</label><input class="form-control" id="jira-assignee" name="assignee" value="${CIS.attr(assignee)}"></div>
          <div class="col-md-4"><label class="form-label" for="jira-due-date">Due date</label><input class="form-control" id="jira-due-date" name="due_date" type="date" value="${CIS.attr(fields.duedate || "")}"></div>
        </div></div></form>
        <details class="card mt-3"><summary class="card-header"><span class="card-title">Original payload preview</span></summary><pre class="card-body source-panel">${CIS.escape(JSON.stringify(dryRun.payload || {}, null, 2))}</pre></details><div class="d-flex justify-content-end gap-2 mt-3"><button class="btn btn-outline-secondary" data-dialog-close type="button">Close</button><button class="btn btn-primary" id="publish-jira" type="button" ${dryRun.can_sync ? "" : "disabled"}>Sync Jira</button></div><div class="job-evidence" id="jira-job" aria-live="polite"></div>`;
      region.querySelectorAll("[data-dialog-close]").forEach((button) => button.addEventListener("click", () => modal.close()));
      region.querySelector("#publish-jira")?.addEventListener("click", async (event) => {
        const jobRegion = region.querySelector("#jira-job"); event.currentTarget.disabled = true;
        try {
          const form = region.querySelector("#jira-fields");
          if (!form.reportValidity()) { event.currentTarget.disabled = false; return; }
          const job = await CIS.api(`/api/v1/issues/${encodeURIComponent(issueId)}/sync/jira`, { method: "POST", body: { jira_fields: CIS.formJson(form) } });
          jobRegion.textContent = `Job ${job.id}: ${job.status}`;
          await CIS.pollJob(job.id, (current) => { jobRegion.textContent = `Job ${current.id}: ${current.status}`; });
        }
        catch (error) { jobRegion.innerHTML = `<span class="text-danger">${CIS.escape(error.message)}</span>`; event.currentTarget.disabled = false; }
      });
    } catch (error) { region.innerHTML = `${CIS.alert(error.message)}${CIS.retryLink()}`; }
  }
}))();
