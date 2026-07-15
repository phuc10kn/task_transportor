"use strict";

(() => CIS.ready(({ project }) => {
  const root = document.querySelector("#page-content");
  const header = (title, copy) => `<div class="page-heading"><div><div class="route-kicker">Human-governed AI</div><h1>${title}</h1><p class="text-secondary mb-0">${copy}</p></div><div class="flow-rail"><span>AI DRAFT</span><strong>→ HUMAN REVIEW</strong></div></div>`;

  if (document.body.dataset.route === "translation-glossary") glossaryPage();
  else queuePage();

  async function queuePage() {
    const params = new URLSearchParams(location.search);
    const status = params.get("review_status") || "";
    const issueId = params.get("issue_id") || "";
    root.innerHTML = `<div class="container-xl">${header("Translation Queue", "Review, edit, approve or reject drafts without granting AI final authority.")}<section class="card state-card" aria-busy="true"><div class="card-body"><span class="spinner-border spinner-border-sm me-2"></span>Loading review queue…</div></section></div>`;
    let items;
    try {
      const query = new URLSearchParams({ project_id: project.id }); if (status) query.set("review_status", status); if (issueId) query.set("issue_id", issueId);
      items = await CIS.api(`/api/v1/translation-queue?${query}`);
    } catch (error) { root.innerHTML = CIS.state("Translation Queue unavailable", error.message, CIS.retryLink()); return; }
    root.innerHTML = `<div class="container-xl">${header("Translation Queue", "Review, edit, approve or reject drafts without granting AI final authority.")}
      <section class="card toolbar-card"><div class="card-body"><form action="/translation-queue" method="get"><input type="hidden" name="project_id" value="${project.id}"><div class="row g-3 align-items-end"><div class="col-md-4"><label class="form-label" for="review_status">Review status</label><select class="form-select" id="review_status" name="review_status"><option value="">All statuses</option>${["pending", "ai_draft", "edited", "approved", "rejected"].map((value) => `<option value="${value}" ${status === value ? "selected" : ""}>${CIS.label(value)}</option>`).join("")}</select></div><div class="col-md-5"><label class="form-label" for="issue_id">Issue ID</label><input class="form-control" id="issue_id" name="issue_id" value="${CIS.attr(issueId)}"></div><div class="col-md-3"><button class="btn btn-primary w-100" type="submit">Apply filters</button></div></div></form></div></section>
      <section class="card"><div class="card-header"><div><h2 class="card-title">Review queue</h2><div class="text-secondary small">Open Edit to compare the current source and shared Markdown draft.</div></div><span class="badge bg-secondary-lt ms-auto">${items.length}</span></div>${items.length ? `<div class="table-responsive"><table class="table table-vcenter responsive-table translation-queue-table"><thead><tr><th>Queue</th><th>System issue</th><th>CIS issue</th><th>Field</th><th>Status</th><th>AI evidence</th><th>Actions</th></tr></thead><tbody>${items.map((item) => `<tr data-queue="${item.id}"><td data-label="Queue"><code>#${item.id}</code></td><td data-label="System issue"><div class="system-issue"><span class="badge bg-blue-lt">[${CIS.escape(String(item.source_system || "cis").toUpperCase())}]</span><code>${CIS.escape(item.system_issue_key || item.issue_id)}</code></div></td><td data-label="CIS issue"><a class="cis-issue-link" href="/cis-issues/${encodeURIComponent(item.issue_id)}">${CIS.escape(item.issue_id)}</a></td><td data-label="Field"><strong>${CIS.escape(CIS.label(item.target_field || item.target_type))}</strong></td><td data-label="Status">${CIS.badge(item.review_status || "pending")}${item.is_source_stale ? '<div class="text-warning small mt-1">Source changed</div>' : ""}</td><td data-label="AI evidence"><div class="small">${CIS.escape(item.provider || "—")}<br><span class="text-secondary">${CIS.escape(item.model_or_command || "—")}</span>${item.provider_error ? `<div class="text-danger mt-1">${CIS.escape(item.provider_error)}</div>` : ""}</div></td><td data-label="Actions"><div class="table-actions"><button class="btn btn-sm btn-primary" data-action="approve" type="button" ${item.is_source_stale || !item.ai_draft ? "disabled" : ""}>Approve</button><button class="btn btn-sm btn-outline-primary" data-action="edit" type="button">Edit</button><button class="btn btn-sm btn-outline-danger" data-action="reject" type="button">Reject</button><button class="btn btn-sm btn-outline-secondary" data-action="retranslate" type="button">Retranslate</button></div><div class="job-evidence" aria-live="polite"></div></td></tr>`).join("")}</tbody></table></div>` : '<div class="card-body text-center py-6"><h2 class="h3">No translation queue items</h2><p class="text-secondary">Adjust the filters or request translation from Issue Editor.</p></div>'}</section>
    </div>`;
    document.querySelectorAll("[data-queue]").forEach((row) => {
      const item = items.find((candidate) => String(candidate.id) === row.dataset.queue);
      row.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => queueAction(item, button, row)));
    });
  }

  async function queueAction(item, button, row) {
    const action = button.dataset.action;
    if (action === "edit") return editTranslation(item);
    const evidence = row.querySelector(".job-evidence"); button.disabled = true;
    try {
      const result = await CIS.api(`/api/v1/translation-queue/${item.id}/${action}`, { method: "POST", body: { review_notes: "translation-queue" } });
      if (action === "retranslate") evidence.textContent = result.reused ? `Active job reused${result.job?.id ? ` (${result.job.id})` : ""}.` : `Retranslate queued${result.job?.id ? ` (${result.job.id})` : ""}.`;
      else { CIS.toast(`Translation ${action}d.`); await queuePage(); }
    } catch (error) { evidence.innerHTML = `<span class="text-danger">${CIS.escape(error.message)}</span>`; }
    finally { button.disabled = false; }
  }

  function readonlyMarkdown(label, value, tone = "secondary") {
    return `<section class="translation-modal-document"><div class="translation-modal-document__header"><h3>${CIS.escape(label)}</h3><span class="badge bg-${tone}-lt">Read only</span></div><textarea class="d-none" data-md-readonly-source tabindex="-1" aria-hidden="true">${CIS.escape(value || "")}</textarea><div class="markdown-preview translation-modal-document__content" data-md-readonly></div></section>`;
  }

  function draftMarkdown(value) {
    return `<div class="markdown-editor translation-modal-editor" data-markdown-editor><div class="markdown-editor__header"><label class="form-label mb-0" for="draft-text">AI draft</label><div class="btn-group" role="tablist" aria-label="AI draft mode"><button class="btn btn-sm btn-primary" role="tab" aria-selected="true" data-md-mode="edit" type="button">Edit</button><button class="btn btn-sm btn-outline-secondary" role="tab" aria-selected="false" data-md-mode="preview" type="button">Preview</button></div></div><div class="markdown-editor__toolbar" role="toolbar" aria-label="AI draft Markdown formatting" data-md-toolbar><button class="btn btn-sm btn-ghost-secondary fw-bold" data-md-wrap="**" data-md-placeholder="bold text" type="button" aria-label="Bold">B</button><button class="btn btn-sm btn-ghost-secondary fst-italic" data-md-wrap="*" data-md-placeholder="italic text" type="button" aria-label="Italic">I</button><button class="btn btn-sm btn-ghost-secondary font-monospace" data-md-wrap="\`" data-md-placeholder="code" type="button" aria-label="Inline code">&lt;/&gt;</button><span class="markdown-editor__divider" aria-hidden="true"></span><button class="btn btn-sm btn-ghost-secondary" data-md-prefix="## " type="button" aria-label="Heading">H2</button><button class="btn btn-sm btn-ghost-secondary" data-md-prefix="- " type="button" aria-label="Bullet list">• List</button><button class="btn btn-sm btn-ghost-secondary" data-md-link type="button" aria-label="Link">Link</button></div><div role="tabpanel" data-md-panel="edit"><textarea class="form-control markdown-editor__textarea" id="draft-text" name="draft_text" rows="12" required>${CIS.escape(value)}</textarea></div><div class="markdown-editor__panel markdown-preview" role="tabpanel" data-md-panel="preview" hidden></div><div class="markdown-editor__footer"><span>Markdown supported</span><span data-md-count>${String(value).length.toLocaleString()} characters</span></div></div>`;
  }

  function bindModalMarkdown(modal) {
    const markdown = window.markdownit({ html: false, linkify: true, breaks: true });
    const defaultLinkOpen = markdown.renderer.rules.link_open || ((tokens, index, options, env, renderer) => renderer.renderToken(tokens, index, options));
    markdown.renderer.rules.link_open = (tokens, index, options, env, renderer) => {
      tokens[index].attrSet("target", "_blank"); tokens[index].attrSet("rel", "noopener noreferrer");
      return defaultLinkOpen(tokens, index, options, env, renderer);
    };
    modal.querySelectorAll("[data-md-readonly]").forEach((preview) => {
      const source = preview.previousElementSibling.value;
      preview.innerHTML = source.trim() ? markdown.render(source) : '<div class="markdown-preview__empty">No content.</div>';
    });
    modal.querySelectorAll("[data-markdown-editor]").forEach((shell) => {
      const textarea = shell.querySelector("textarea"); const preview = shell.querySelector('[data-md-panel="preview"]'); const count = shell.querySelector("[data-md-count]");
      const updateCount = () => { count.textContent = `${textarea.value.length.toLocaleString()} characters`; };
      const updatePreview = () => { preview.innerHTML = textarea.value.trim() ? markdown.render(textarea.value) : '<div class="markdown-preview__empty">Nothing to preview yet.</div>'; };
      const replaceSelection = (before, after, placeholder) => {
        const start = textarea.selectionStart; const end = textarea.selectionEnd; const selected = textarea.value.slice(start, end); const leading = selected.match(/^\s*/)?.[0] || ""; const rest = selected.slice(leading.length); const trailing = rest.match(/\s*$/)?.[0] || ""; const content = rest.slice(0, rest.length - trailing.length) || placeholder;
        textarea.setRangeText(`${leading}${before}${content}${after}${trailing}`, start, end, "preserve"); const contentStart = start + leading.length + before.length; textarea.setSelectionRange(contentStart, contentStart + content.length); textarea.dispatchEvent(new Event("input", { bubbles: true })); textarea.focus();
      };
      const prefixLines = (prefix) => { const start = textarea.value.lastIndexOf("\n", Math.max(0, textarea.selectionStart - 1)) + 1; const next = textarea.value.indexOf("\n", textarea.selectionEnd); const end = next === -1 ? textarea.value.length : next; const block = textarea.value.slice(start, end) || "text"; textarea.setRangeText(block.split("\n").map((line) => `${prefix}${line}`).join("\n"), start, end, "select"); textarea.dispatchEvent(new Event("input", { bubbles: true })); textarea.focus(); };
      const setMode = (mode) => { if (mode === "preview") updatePreview(); shell.querySelectorAll("[data-md-mode]").forEach((button) => { const active = button.dataset.mdMode === mode; button.classList.toggle("btn-primary", active); button.classList.toggle("btn-outline-secondary", !active); button.setAttribute("aria-selected", String(active)); }); shell.querySelector('[data-md-panel="edit"]').hidden = mode !== "edit"; preview.hidden = mode !== "preview"; shell.querySelector("[data-md-toolbar]").hidden = mode !== "edit"; };
      shell.querySelectorAll("[data-md-mode]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mdMode)));
      shell.querySelectorAll("[data-md-wrap]").forEach((button) => button.addEventListener("click", () => replaceSelection(button.dataset.mdWrap, button.dataset.mdWrap, button.dataset.mdPlaceholder)));
      shell.querySelectorAll("[data-md-prefix]").forEach((button) => button.addEventListener("click", () => prefixLines(button.dataset.mdPrefix)));
      shell.querySelector("[data-md-link]").addEventListener("click", () => replaceSelection("[", "](https://)", "link text"));
      textarea.addEventListener("input", updateCount); textarea.addEventListener("keydown", (event) => { if (!(event.ctrlKey || event.metaKey)) return; if (event.key.toLowerCase() === "b") { event.preventDefault(); replaceSelection("**", "**", "bold text"); } if (event.key.toLowerCase() === "i") { event.preventDefault(); replaceSelection("*", "*", "italic text"); } }); updateCount();
    });
  }

  function editTranslation(item) {
    const system = String(item.source_system || "cis").toUpperCase();
    const key = item.system_issue_key || item.issue_id;
    const modal = CIS.dialog("Edit translation draft", `<form id="translation-edit"><div class="dialog-header"><div><div class="route-kicker">Queue #${item.id} · ${CIS.escape(CIS.label(item.target_field || item.target_type))}</div><h2 class="h3 mb-1">Edit translation draft</h2><div class="system-issue"><span class="badge bg-blue-lt">[${CIS.escape(system)}]</span><code>${CIS.escape(key)}</code>${CIS.badge(item.review_status || "pending")}</div></div><button class="btn-close" data-dialog-close type="button" aria-label="Close"></button></div><div class="dialog-body"><div id="translation-edit-error"></div>${item.is_source_stale ? '<div class="alert alert-warning">Source changed. Saving reconciles this draft with the current source; approval remains a separate action.</div>' : ""}<div class="translation-modal-compare">${readonlyMarkdown("Source", item.source_text)}${draftMarkdown(item.ai_draft || "")}</div></div><div class="dialog-footer"><a class="btn btn-link me-auto" href="/cis-issues/${encodeURIComponent(item.issue_id)}">Open CIS issue</a><button class="btn btn-outline-secondary" data-dialog-close type="button">Cancel</button><button class="btn btn-primary" type="submit">Save draft</button></div></form>`, "translation-review-dialog");
    bindModalMarkdown(modal);
    modal.querySelector("form").addEventListener("submit", async (event) => {
      event.preventDefault(); const button = event.currentTarget.querySelector("button[type=submit]"); button.disabled = true;
      try { await CIS.api(`/api/v1/translation-queue/${item.id}/draft`, { method: "PUT", body: { draft_text: event.currentTarget.draft_text.value, review_notes: "translation-queue" } }); modal.close(); await queuePage(); CIS.toast("Translation draft saved."); }
      catch (error) { modal.querySelector("#translation-edit-error").innerHTML = CIS.alert(error.message); button.disabled = false; }
    });
  }

  async function glossaryPage() {
    const params = new URLSearchParams(location.search);
    const group = params.get("group") || "";
    const search = (params.get("search") || "").toLowerCase();
    root.innerHTML = `<div class="container-xl">${header("Translation Glossary", "Manage project terminology, variants and one canonical term per language.")}<section class="card state-card" aria-busy="true"><div class="card-body"><span class="spinner-border spinner-border-sm me-2"></span>Loading glossary…</div></section></div>`;
    let concepts;
    try { const result = await CIS.api(`/api/v1/projects/${project.id}/translation-glossary`); concepts = result.concepts || []; }
    catch (error) { root.innerHTML = CIS.state("Translation Glossary unavailable", error.message, CIS.retryLink()); return; }
    const groups = [...new Set(concepts.map((item) => item.group_key))].sort();
    const filtered = concepts.filter((concept) => (!group || concept.group_key === group) && (!search || [concept.group_key, concept.concept_key, concept.note, ...concept.terms.map((term) => term.term)].some((value) => String(value || "").toLowerCase().includes(search))));
    root.innerHTML = `<div class="container-xl">${header("Translation Glossary", "Manage project terminology, variants and one canonical term per language.")}
      <section class="card toolbar-card"><div class="card-body"><form action="/translation-glossary" method="get"><input type="hidden" name="project_id" value="${project.id}"><div class="row g-3 align-items-end"><div class="col-md-3"><label class="form-label" for="group">Group</label><select class="form-select" id="group" name="group"><option value="">All groups</option>${groups.map((value) => `<option value="${CIS.attr(value)}" ${group === value ? "selected" : ""}>${CIS.escape(value)}</option>`).join("")}</select></div><div class="col-md-6"><label class="form-label" for="search">Search</label><input class="form-control" id="search" name="search" value="${CIS.attr(params.get("search") || "")}" placeholder="Concept, term or note"></div><div class="col-md-3 d-flex gap-2"><button class="btn btn-outline-primary flex-fill" type="submit">Filter</button><button class="btn btn-primary flex-fill" id="add-concept" type="button">Add concept</button></div></div></form></div></section>
      <section class="card"><div class="card-header"><h2 class="card-title">Concept register</h2><span class="badge bg-secondary-lt ms-auto">${filtered.length} / ${concepts.length}</span></div>${filtered.length ? `<div class="table-responsive"><table class="table table-vcenter responsive-table"><thead><tr><th>Group</th><th>Concept</th><th>Languages and terms</th><th>Note</th><th>Actions</th></tr></thead><tbody>${filtered.map((concept) => `<tr data-concept="${concept.id}"><td data-label="Group">${CIS.badge(concept.group_key)}</td><td data-label="Concept"><button class="btn btn-link p-0" data-view type="button">${CIS.escape(concept.concept_key)}</button></td><td data-label="Languages">${[...new Set(concept.terms.map((term) => term.language_code))].map((language) => `<div class="language-block"><code>${CIS.escape(language)}</code> ${concept.terms.filter((term) => term.language_code === language).map((term) => `${CIS.escape(term.term)}${term.is_canonical ? " ★" : ""}`).join(" · ")}</div>`).join("")}</td><td data-label="Note">${CIS.escape(concept.note || "—")}</td><td data-label="Actions"><div class="table-actions"><button class="btn btn-sm btn-outline-primary" data-edit type="button">Edit</button><button class="btn btn-sm btn-outline-danger" data-delete type="button">Delete</button></div></td></tr>`).join("")}</tbody></table></div>` : '<div class="card-body text-center py-6"><h2 class="h3">No glossary concepts</h2><p class="text-secondary">Add a concept or change the filters.</p></div>'}</section>
    </div>`;
    document.querySelector("#add-concept").addEventListener("click", () => conceptDialog(null));
    document.querySelectorAll("[data-concept]").forEach((row) => {
      const concept = concepts.find((item) => String(item.id) === row.dataset.concept);
      row.querySelector("[data-view]").addEventListener("click", () => viewConcept(concept));
      row.querySelector("[data-edit]").addEventListener("click", () => conceptDialog(concept));
      row.querySelector("[data-delete]").addEventListener("click", () => deleteConcept(concept));
    });
  }

  function viewConcept(concept) {
    CIS.dialog("View glossary concept", `<div class="dialog-header"><div><div class="route-kicker">${CIS.escape(concept.group_key)}</div><h2 class="h3 mb-0">${CIS.escape(concept.concept_key)}</h2></div><button class="btn-close" data-dialog-close aria-label="Close"></button></div><div class="dialog-body"><p>${CIS.escape(concept.note || "No note")}</p><h3 class="h4">Languages</h3>${concept.terms.map((term) => `<div class="border rounded p-2 mt-2"><code>${CIS.escape(term.language_code)}</code>: ${CIS.escape(term.term)} ${term.is_canonical ? '<span class="badge bg-blue-lt">Canonical</span>' : ""}</div>`).join("")}</div><div class="dialog-footer"><button class="btn btn-primary" data-dialog-close data-autofocus type="button">Close</button></div>`);
  }

  function conceptDialog(concept) {
    const languages = [...new Set((concept?.terms || []).map((term) => term.language_code))];
    if (!languages.length) languages.push(project.source_language || "ja", project.target_language || "vi");
    const terms = concept?.terms?.map((term) => ({ ...term })) || languages.map((language) => ({ language_code: language, term: "", is_canonical: true }));
    const modal = CIS.dialog(concept ? "Edit glossary concept" : "Add glossary concept", `<form id="concept-form"><div class="dialog-header"><div><div class="route-kicker">Project glossary</div><h2 class="h3 mb-0">${concept ? "Edit concept" : "Add concept"}</h2></div><button class="btn-close" data-dialog-close type="button" aria-label="Close"></button></div><div class="dialog-body"><div id="concept-error"></div><div class="row g-3"><div class="col-md-4"><label class="form-label" for="concept-group">Group</label><input class="form-control" id="concept-group" value="${CIS.attr(concept?.group_key || "default")}" required></div><div class="col-md-8"><label class="form-label" for="concept-key">Concept key</label><input class="form-control" id="concept-key" value="${CIS.attr(concept?.concept_key || "")}" required></div><div class="col-12"><label class="form-label" for="concept-note">Note</label><textarea class="form-control" id="concept-note" rows="2">${CIS.escape(concept?.note || "")}</textarea></div></div><div class="d-flex justify-content-between align-items-center mt-4"><h3 class="h4 mb-0">Terms by language</h3><button class="btn btn-sm btn-outline-primary" id="add-language" type="button">Add language</button></div><div id="language-editor" class="mt-2"></div></div><div class="dialog-footer"><button class="btn btn-outline-secondary" data-dialog-close type="button">Cancel</button><button class="btn btn-primary" type="submit">Save concept</button></div></form>`);
    const editor = modal.querySelector("#language-editor");
    const renderTerms = () => {
      const codes = [...new Set(terms.map((term) => term.language_code))];
      editor.innerHTML = codes.map((language) => `<fieldset class="card language-editor mb-2" data-language="${CIS.attr(language)}"><div class="card-header"><input class="form-control form-control-sm language-code" aria-label="Language code" value="${CIS.attr(language)}"><button class="btn btn-sm btn-ghost-danger ms-auto" data-remove-language type="button">Remove language</button></div><div class="card-body">${terms.filter((term) => term.language_code === language).map((term, index) => `<div class="term-row" data-term-index="${terms.indexOf(term)}"><input class="form-control" aria-label="${CIS.attr(language)} term ${index + 1}" value="${CIS.attr(term.term)}" required><label class="form-check"><input class="form-check-input" name="canonical-${CIS.attr(language)}" type="radio" ${term.is_canonical ? "checked" : ""}><span class="form-check-label">Canonical</span></label><button class="btn btn-sm btn-ghost-danger" data-remove-term type="button">Remove</button></div>`).join("")}<button class="btn btn-sm btn-outline-primary mt-2" data-add-variant type="button">Add variant</button></div></fieldset>`).join("");
      editor.querySelectorAll(".language-editor").forEach((block) => {
        const language = block.dataset.language;
        block.querySelector(".language-code").addEventListener("change", (event) => { terms.filter((term) => term.language_code === language).forEach((term) => { term.language_code = event.target.value.trim().toLowerCase(); }); renderTerms(); });
        block.querySelector("[data-remove-language]").addEventListener("click", () => { for (let i = terms.length - 1; i >= 0; i -= 1) if (terms[i].language_code === language) terms.splice(i, 1); renderTerms(); });
        block.querySelector("[data-add-variant]").addEventListener("click", () => { terms.push({ language_code: language, term: "", is_canonical: false }); renderTerms(); });
        block.querySelectorAll("[data-term-index]").forEach((row) => {
          const index = Number(row.dataset.termIndex); row.querySelector("input.form-control").addEventListener("input", (event) => { terms[index].term = event.target.value; });
          row.querySelector("input[type=radio]").addEventListener("change", () => terms.forEach((term, termIndex) => { if (term.language_code === language) term.is_canonical = termIndex === index; }));
          row.querySelector("[data-remove-term]").addEventListener("click", () => { const removed = terms.splice(index, 1)[0]; const siblings = terms.filter((term) => term.language_code === language); if (removed.is_canonical && siblings[0]) siblings[0].is_canonical = true; renderTerms(); });
        });
      });
    };
    renderTerms();
    modal.querySelector("#add-language").addEventListener("click", () => { terms.push({ language_code: `lang${terms.length + 1}`, term: "", is_canonical: true }); renderTerms(); });
    modal.querySelector("form").addEventListener("submit", async (event) => {
      event.preventDefault(); const button = event.currentTarget.querySelector("button[type=submit]"); button.disabled = true;
      try {
        const body = { group_key: modal.querySelector("#concept-group").value, concept_key: modal.querySelector("#concept-key").value, note: modal.querySelector("#concept-note").value, terms };
        await CIS.api(concept ? `/api/v1/projects/${project.id}/translation-glossary/concepts/${concept.id}` : `/api/v1/projects/${project.id}/translation-glossary/concepts`, { method: concept ? "PATCH" : "POST", body });
        modal.close(); await glossaryPage(); CIS.toast("Glossary concept saved.");
      } catch (error) { modal.querySelector("#concept-error").innerHTML = CIS.alert(error.message); button.disabled = false; }
    });
  }

  function deleteConcept(concept) {
    const modal = CIS.dialog("Delete glossary concept", `<div class="dialog-header"><h2 class="h3 mb-0">Delete concept?</h2><button class="btn-close" data-dialog-close aria-label="Close"></button></div><div class="dialog-body">This permanently removes <strong>${CIS.escape(concept.concept_key)}</strong> from ${CIS.escape(project.name)}.</div><div class="dialog-footer"><button class="btn btn-outline-secondary" data-dialog-close type="button">Cancel</button><button class="btn btn-danger" id="confirm-delete" type="button">Delete</button></div>`);
    modal.querySelector("#confirm-delete").addEventListener("click", async (event) => {
      event.currentTarget.disabled = true;
      try { await CIS.api(`/api/v1/projects/${project.id}/translation-glossary/concepts/${concept.id}`, { method: "DELETE" }); modal.close(); await glossaryPage(); CIS.toast("Glossary concept deleted."); }
      catch (error) { event.currentTarget.disabled = false; modal.querySelector(".dialog-body").insertAdjacentHTML("afterbegin", CIS.alert(error.message)); }
    });
  }
}))();
