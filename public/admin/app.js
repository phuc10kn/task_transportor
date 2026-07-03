(function () {
  const state = {
    token: localStorage.getItem("cis_admin_token") || "",
    view: "dashboard",
    selectedIssueId: "",
    selectedProjectId: "",
    selectedJobsProjectId: "",
    selectedJournalProjectId: "",
    selectedMappingProjectId: "",
    issueEditorDirty: false,
    mappingSourceSystem: "backlog",
    mappingTargetSystem: "jira",
    mappingDrafts: {},
    projectMappingTargetSystem: "jira",
    dryRun: null,
    issueEditorTranslationPopup: "",
    issueEditorTranslating: "",
    issueEditorJiraSyncPopup: "",
    issueEditorJiraDryRun: null,
    issueEditorJiraDryRunLoading: false,
    issueEditorJiraSyncing: false,
    issueEditorBacklogResyncing: false,
  };
  const inferredApiBaseUrls = {
    "8000": `${window.location.protocol}//${window.location.hostname}:3000`,
    "8001": `${window.location.protocol}//${window.location.hostname}:3001`,
  };
  const apiBaseUrl = window.CIS_ADMIN_API_BASE_URL || inferredApiBaseUrls[window.location.port] || "";

  const navItems = [
    ["dashboard", "Dashboard"],
    ["projects", "Project Config"],
    ["issues", "Issues"],
    ["translations", "Translations"],
    ["mappings", "Mappings"],
    ["anomalies", "Anomalies"],
    ["jobs", "Sync Jobs"],
    ["journal", "Journal"],
  ];
  const DEFAULT_TRANSLATION_AI_PROVIDER = "deepseek";
  const DEFAULT_TRANSLATION_AI_TRANSPORT = "openai_compatible";
  const DEFAULT_TRANSLATION_AI_MODEL = "deepseek-v4-flash";
  const TRANSLATION_AI_PROVIDER_OPTIONS = [
    { value: "deepseek", label: "DeepSeek" },
    { value: "codex_exec", label: "codex_exec" },
  ];
  const TRANSLATION_AI_TRANSPORT_OPTIONS = {
    deepseek: [
      { value: "openai_compatible", label: "OpenAI-compatible" },
      { value: "anthropic_compatible", label: "Anthropic-compatible" },
    ],
    codex_exec: [
      { value: "process_exec", label: "Process exec" },
    ],
  };
  const TRANSLATION_AI_MODEL_OPTIONS = {
    deepseek: {
      openai_compatible: [
        { value: "deepseek-v4-flash", label: "deepseek-v4-flash" },
        { value: "deepseek-v4-pro", label: "deepseek-v4-pro" },
        { value: "deepseek-chat", label: "deepseek-chat - deprecated soon" },
      ],
      anthropic_compatible: [
        { value: "deepseek-v4-flash", label: "deepseek-v4-flash" },
        { value: "deepseek-v4-pro", label: "deepseek-v4-pro" },
        { value: "deepseek-chat", label: "deepseek-chat - deprecated soon" },
      ],
    },
    codex_exec: {
      process_exec: [],
    },
  };

  const $ = (selector) => document.querySelector(selector);
  const content = $("#content");

  function escapeHtml(value) {
    return String(value === null || value === undefined ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function selectorValue(value) {
    return String(value === null || value === undefined ? "" : value).replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
  }

  function json(value) {
    return escapeHtml(JSON.stringify(value || {}, null, 2));
  }

  function displayDate(value) {
    return value ? escapeHtml(value) : "-";
  }

  function parseJsonObject(value, fieldName) {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
      return {};
    }

    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(`${fieldName} must be a JSON object.`);
    }

    return parsed;
  }

  function projectSelectOptions(projects, selectedProjectId) {
    return [`<option value="">All projects</option>`]
      .concat(projects.map((project) =>
        `<option value="${project.id}" ${String(project.id) === String(selectedProjectId) ? "selected" : ""}>${escapeHtml(project.name)}</option>`
      ))
      .join("");
  }

  function ensureCurrentOption(options, selectedValue) {
    const value = selectedValue === null || selectedValue === undefined ? "" : String(selectedValue);
    if (!value || options.some((option) => String(option.value) === value)) {
      return options;
    }

    return [{ value, label: value }].concat(options);
  }

  function selectOptions(options, selectedValue) {
    return ensureCurrentOption(options, selectedValue)
      .map((option) => (
        `<option value="${escapeHtml(option.value)}" ${String(option.value) === String(selectedValue) ? "selected" : ""}>${escapeHtml(option.label)}</option>`
      ))
      .join("");
  }

  function strictSelectOptions(options, selectedValue) {
    return (options || [])
      .map((option) => (
        `<option value="${escapeHtml(option.value)}" ${String(option.value) === String(selectedValue) ? "selected" : ""}>${escapeHtml(option.label)}</option>`
      ))
      .join("");
  }

  function selectField(label, name, options, selectedValue) {
    return `
      <label>${escapeHtml(label)}
        <select name="${escapeHtml(name)}">${selectOptions(options, selectedValue)}</select>
      </label>`;
  }

  function strictSelectField(label, name, options, selectedValue, disabled) {
    return `
      <label>${escapeHtml(label)}
        <select name="${escapeHtml(name)}" ${disabled ? "disabled" : ""}>${strictSelectOptions(options, selectedValue)}</select>
      </label>`;
  }

  function firstOptionValue(options, fallback = "") {
    return options && options.length > 0 ? options[0].value : fallback;
  }

  function translationAiTransportOptions(provider) {
    return TRANSLATION_AI_TRANSPORT_OPTIONS[provider] || [];
  }

  function translationAiModelOptions(provider, transport) {
    return (TRANSLATION_AI_MODEL_OPTIONS[provider] && TRANSLATION_AI_MODEL_OPTIONS[provider][transport]) || [];
  }

  function normalizeOptionValue(options, value, fallback) {
    const selected = value === null || value === undefined ? "" : String(value);
    if (selected && options.some((option) => String(option.value) === selected)) {
      return selected;
    }

    return firstOptionValue(options, fallback);
  }

  function projectTranslationAiSelection(project) {
    const p = project || {};
    const provider = normalizeOptionValue(
      TRANSLATION_AI_PROVIDER_OPTIONS,
      p.translation_ai_provider || p.translation_provider,
      DEFAULT_TRANSLATION_AI_PROVIDER
    );
    const transportOptions = translationAiTransportOptions(provider);
    const transport = normalizeOptionValue(
      transportOptions,
      p.translation_ai_transport,
      provider === DEFAULT_TRANSLATION_AI_PROVIDER ? DEFAULT_TRANSLATION_AI_TRANSPORT : firstOptionValue(transportOptions)
    );
    const modelOptions = translationAiModelOptions(provider, transport);
    const model = normalizeOptionValue(
      modelOptions,
      p.translation_ai_model || p.translation_model,
      provider === DEFAULT_TRANSLATION_AI_PROVIDER ? DEFAULT_TRANSLATION_AI_MODEL : ""
    );

    return {
      model,
      modelOptions,
      provider,
      transport,
      transportOptions,
    };
  }

  function setToast(message, isError, variant) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.style.background = variant === "warning" ? "#9a5b13" : isError ? "#b42318" : "#25302f";
    window.setTimeout(() => toast.classList.add("hidden"), 4200);
  }

  function badge(value) {
    const text = escapeHtml(value || "n/a");
    const ok = ["ok", "success", "approved", "edited", "synced", "downloaded", "resolved", "ignored"].includes(value);
    const fail = ["failed", "rejected", "conflict", "critical"].includes(value);
    const warn = ["pending", "unsaved", "ai_draft", "open", "investigating", "running", "pending_translate", "pending_review"].includes(value);
    return `<span class="badge ${ok ? "ok" : fail ? "fail" : warn ? "warn" : ""}">${text}</span>`;
  }

  async function api(path, options = {}) {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method || "GET",
      headers: {
        "content-type": "application/json",
        ...(state.token ? { authorization: `Bearer ${state.token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) {
        logout();
      }
      const error = body.error || {};
      throw new Error(error.message || `Request failed: ${response.status}`);
    }
    return body.data;
  }

  function showLogin() {
    document.querySelector("[data-view='login']").classList.remove("hidden");
    document.querySelector("[data-view='console']").classList.add("hidden");
  }

  function showConsole() {
    document.querySelector("[data-view='login']").classList.add("hidden");
    document.querySelector("[data-view='console']").classList.remove("hidden");
    renderNav();
    render();
  }

  function logout() {
    state.token = "";
    localStorage.removeItem("cis_admin_token");
    showLogin();
  }

  function renderNav() {
    const activeView = state.view === "issue_editor" ? "issues" : state.view;
    $("#nav").innerHTML = navItems
      .map(([id, label]) => `<button type="button" data-view-id="${id}" class="${activeView === id ? "active" : ""}">${label}</button>`)
      .join("");
    $("#nav").querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        state.view = button.dataset.viewId;
        state.dryRun = null;
        state.issueEditorTranslationPopup = "";
        state.issueEditorJiraSyncPopup = "";
        state.issueEditorJiraDryRun = null;
        renderNav();
        render();
      });
    });
  }

  function setLoading(title) {
    $("#activeTitle").textContent = title;
    content.innerHTML = `<section class="panel"><div class="empty">Loading ${escapeHtml(title.toLowerCase())}...</div></section>`;
  }

  function setError(error) {
    content.innerHTML = `<section class="panel"><div class="empty">${escapeHtml(error.message)}</div></section>`;
  }

  function table(headers, rows, emptyText) {
    if (!rows.length) {
      return `<div class="empty">${escapeHtml(emptyText || "No data")}</div>`;
    }
    return `
      <div class="table-wrap">
        <table>
          <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
          <tbody>${rows.join("")}</tbody>
        </table>
      </div>`;
  }

  async function render() {
    const item = navItems.find(([id]) => id === state.view);
    const title = state.view === "issue_editor" ? "Issue Editor" : item ? item[1] : "Dashboard";
    $("#activeEyebrow").textContent = "Lite";
    setLoading(title);

    try {
      if (state.view === "dashboard") await renderDashboard();
      if (state.view === "projects") await renderProjects();
      if (state.view === "issues") await renderIssues();
      if (state.view === "issue_editor") await renderIssueEditor();
      if (state.view === "translations") await renderTranslations();
      if (state.view === "mappings") await renderMappings();
      if (state.view === "anomalies") await renderAnomalies();
      if (state.view === "jobs") await renderJobs();
      if (state.view === "journal") await renderJournal();
    } catch (error) {
      setError(error);
    }
  }

  async function renderDashboard() {
    $("#activeTitle").textContent = "Dashboard";
    const [summary, alerts] = await Promise.all([
      api("/api/v1/dashboard/summary"),
      api("/api/v1/dashboard/alerts"),
    ]);
    const counts = summary.counts || {};
    const cards = [
      ["Pull pending", counts.pull_jobs_pending],
      ["Pull failed", counts.pull_jobs_failed],
      ["Review queue", counts.translation_pending],
      ["Pending mapping", counts.issue_pending_mapping],
      ["Failed jobs", counts.sync_jobs_failed],
      ["Open anomalies", counts.anomaly_open],
    ];
    content.innerHTML = `
      <section class="grid cols-3">
        ${cards.map(([label, value]) => `
          <div class="panel stat">
            <span class="muted">${escapeHtml(label)}</span>
            <strong>${escapeHtml(value || 0)}</strong>
          </div>`).join("")}
      </section>
      <section class="panel">
        <div class="panel-header"><h2>Alerts</h2>${badge(summary.health && summary.health.status)}</div>
        ${table(["Type", "Project", "Issue", "Status", "Updated"], alerts.map((alert) => `
          <tr>
            <td>${escapeHtml(alert.type)}</td>
            <td>${escapeHtml(alert.project_id || "")}</td>
            <td>${escapeHtml(alert.issue_id || "")}</td>
            <td>${badge(alert.status || alert.severity)}</td>
            <td>${escapeHtml(alert.updated_at || alert.created_at || "")}</td>
          </tr>`), "No alerts")}
      </section>`;
  }

  function projectPayloadFromForm(form) {
    const translationAiProvider = form.translation_ai_provider.value || DEFAULT_TRANSLATION_AI_PROVIDER;
    const translationAiTransport = form.translation_ai_transport.value ||
      firstOptionValue(translationAiTransportOptions(translationAiProvider));
    const modelField = form.elements.namedItem("translation_ai_model");
    const translationAiModel = modelField && !modelField.disabled ? modelField.value : "";
    const payload = {
      name: form.name.value,
      enabled: form.enabled.checked,
      sync_enabled: form.sync_enabled.checked,
      backlog_space_url: form.backlog_space_url.value || undefined,
      backlog_project_key: form.backlog_project_key.value || undefined,
      backlog_issue_key_prefix: form.backlog_issue_key_prefix.value || undefined,
      backlog_api_key: form.backlog_api_key.value || undefined,
      jira_site_url: form.jira_site_url.value || undefined,
      jira_project_key: form.jira_project_key.value || undefined,
      jira_email: form.jira_email.value || undefined,
      jira_api_token: form.jira_api_token.value || undefined,
      translation_ai_provider: translationAiProvider,
      translation_ai_transport: translationAiTransport,
      translation_ai_model: translationAiModel || undefined,
      source_language: form.source_language.value || "ja",
      target_language: form.target_language.value || "vi",
      auto_translate: form.auto_translate.checked,
      require_translation_review: form.require_translation_review.checked,
      require_mapping_approval: form.require_mapping_approval.checked,
      manual_pull_enabled: form.manual_pull_enabled.checked,
      scheduled_pull_enabled: form.scheduled_pull_enabled.checked,
    };

    const mappingFields = [
      ["cis_mapping_values_json", "CIS mapping values"],
      ["backlog_mapping_values_json", "Backlog mapping values"],
      ["jira_mapping_values_json", "Jira mapping values"],
    ];
    for (const [fieldName, label] of mappingFields) {
      const field = form.elements.namedItem(fieldName);
      if (field) {
        payload[fieldName] = parseJsonObject(field.value, label);
      }
    }

    return payload;
  }

  function projectForm(project) {
    const p = project || {};
    const translationAi = projectTranslationAiSelection(p);
    const mappingSystems = [
      { value: "jira", label: "Jira" },
      { value: "backlog", label: "Backlog" },
    ];
    const languages = [
      { value: "ja", label: "ja - Japanese" },
      { value: "vi", label: "vi - Vietnamese" },
      { value: "en", label: "en - English" },
    ];

    return `
      <form id="projectForm" class="project-form">
        <section class="form-block">
          <div class="form-block-header"><h3>Overall</h3></div>
          <div class="editor-field-grid">
            <label>Name<input name="name" required value="${escapeHtml(p.name || "")}"></label>
            ${selectField("Source language", "source_language", languages, p.source_language || "ja")}
            ${selectField("Target language", "target_language", languages, p.target_language || "vi")}
          </div>
          <div class="check-grid">
            <label class="check-option"><input type="checkbox" name="enabled" ${p.enabled !== false ? "checked" : ""}><span>Enabled</span></label>
            <label class="check-option"><input type="checkbox" name="sync_enabled" ${p.sync_enabled ? "checked" : ""}><span>Sync enabled</span></label>
            <label class="check-option"><input type="checkbox" name="auto_translate" ${p.auto_translate ? "checked" : ""}><span>Auto translate</span></label>
            <label class="check-option"><input type="checkbox" name="require_translation_review" ${p.require_translation_review ? "checked" : ""}><span>Translation review</span></label>
            <label class="check-option"><input type="checkbox" name="require_mapping_approval" ${p.require_mapping_approval !== false ? "checked" : ""}><span>Mapping approval</span></label>
            <label class="check-option"><input type="checkbox" name="manual_pull_enabled" ${p.manual_pull_enabled !== false ? "checked" : ""}><span>Manual pull</span></label>
            <label class="check-option"><input type="checkbox" name="scheduled_pull_enabled" ${p.scheduled_pull_enabled ? "checked" : ""}><span>Scheduled pull</span></label>
          </div>
        </section>
        <section class="form-block">
          <div class="form-block-header"><h3>Translation AI</h3></div>
          <div class="editor-field-grid">
            ${strictSelectField("Translation AI provider", "translation_ai_provider", TRANSLATION_AI_PROVIDER_OPTIONS, translationAi.provider)}
            ${strictSelectField("Translation AI transport", "translation_ai_transport", translationAi.transportOptions, translationAi.transport)}
            ${translationAi.modelOptions.length > 0
              ? strictSelectField("Translation AI model", "translation_ai_model", translationAi.modelOptions, translationAi.model)
              : strictSelectField("Translation AI model", "translation_ai_model", [{ value: "", label: "No model for this provider" }], "", true)}
          </div>
        </section>
        <section class="form-block">
          <div class="form-block-header"><h3>Backlog</h3></div>
          <div class="grid cols-2">
            <label>Backlog space URL<input name="backlog_space_url" value="${escapeHtml(p.backlog_space_url || "")}"></label>
            <label>Backlog project key<input name="backlog_project_key" value="${escapeHtml(p.backlog_project_key || "")}"></label>
            <label>Backlog issue prefix<input name="backlog_issue_key_prefix" value="${escapeHtml(p.backlog_issue_key_prefix || "")}"></label>
            <label>Backlog API key<input name="backlog_api_key" value="${escapeHtml(p.backlog_api_key || "")}"></label>
          </div>
        </section>
        <section class="form-block">
          <div class="form-block-header"><h3>Jira</h3></div>
          <div class="grid cols-2">
            <label>Jira site URL<input name="jira_site_url" value="${escapeHtml(p.jira_site_url || "")}"></label>
            <label>Jira project key<input name="jira_project_key" value="${escapeHtml(p.jira_project_key || "")}"></label>
            <label>Jira email<input name="jira_email" value="${escapeHtml(p.jira_email || "")}"></label>
            <label>Jira API token<input name="jira_api_token" value="${escapeHtml(p.jira_api_token || "")}"></label>
          </div>
        </section>
        <section class="form-block">
          <div class="form-block-header">
            <h3>Mapping values</h3>
            <div class="toolbar">
              <label>Target system<select id="projectMappingTargetSystem">${selectOptions(mappingSystems, state.projectMappingTargetSystem)}</select></label>
              <button id="syncCisMappingValuesButton" type="button" ${p.id ? "" : "disabled"}>Sync mapping fields</button>
            </div>
          </div>
        </section>
        <div class="actions"><button type="submit">${p.id ? "Update project" : "Create project"}</button></div>
      </form>`;
  }

  function projectPullPanel(project) {
    if (!project) {
      return "";
    }

    const readyBadges = [
      badge(project.enabled ? "enabled" : "disabled"),
      badge(project.sync_enabled ? "sync on" : "sync off"),
      badge(project.manual_pull_enabled !== false ? "manual pull on" : "manual pull off"),
    ].join("");

    return `
      <section class="action-panel">
        <div class="action-panel-header">
          <div>
            <h3>Backlog -> CIS</h3>
            <p class="muted">Kéo dữ liệu từ Backlog vào CIS cho project đang chọn.</p>
          </div>
          <div class="badge-row">${readyBadges}</div>
        </div>
        <div class="action-grid">
          <button id="pullProjectButton" type="button" disabled>Pull whole project</button>
          <label>Issue key<input id="pullIssueKey" value="${escapeHtml(project.backlog_issue_key_prefix || "")}-1"></label>
          <button id="pullIssueButton" type="button">Pull one issue</button>
        </div>
        </section>`;
  }

  function replaceSelectOptions(select, options, selectedValue) {
    select.innerHTML = strictSelectOptions(options, selectedValue);
  }

  function syncTranslationAiFields(form) {
    const providerField = form.elements.namedItem("translation_ai_provider");
    const transportField = form.elements.namedItem("translation_ai_transport");
    const modelField = form.elements.namedItem("translation_ai_model");
    if (!providerField || !transportField || !modelField) {
      return;
    }

    const provider = normalizeOptionValue(
      TRANSLATION_AI_PROVIDER_OPTIONS,
      providerField.value,
      DEFAULT_TRANSLATION_AI_PROVIDER
    );
    const transportOptions = translationAiTransportOptions(provider);
    const transport = normalizeOptionValue(
      transportOptions,
      transportField.value,
      firstOptionValue(transportOptions)
    );
    replaceSelectOptions(transportField, transportOptions, transport);
    transportField.disabled = transportOptions.length === 0;

    const modelOptions = translationAiModelOptions(provider, transport);
    if (modelOptions.length === 0) {
      replaceSelectOptions(modelField, [{ value: "", label: "No model for this provider" }], "");
      modelField.disabled = true;
      return;
    }

    const model = normalizeOptionValue(modelOptions, modelField.value, firstOptionValue(modelOptions));
    replaceSelectOptions(modelField, modelOptions, model);
    modelField.disabled = false;
  }

  async function renderProjects() {
    $("#activeTitle").textContent = "Project Config";
    const projects = await api("/api/v1/projects");
    const selected = projects.find((project) => String(project.id) === String(state.selectedProjectId)) || projects[0] || null;
    state.selectedProjectId = selected ? String(selected.id) : "";
    content.innerHTML = `
      <section class="grid cols-2">
        <div class="panel">
          <div class="panel-header"><h2>Project list</h2><button id="newProjectButton" class="ghost-button" type="button">New</button></div>
          ${table(["Name", "Backlog", "Jira", "Sync", ""], projects.map((project) => `
            <tr>
              <td>${escapeHtml(project.name)}</td>
              <td>${escapeHtml(project.backlog_project_key || "")}</td>
              <td>${escapeHtml(project.jira_project_key || "")}</td>
              <td>${badge(project.sync_enabled ? "enabled" : "disabled")}</td>
              <td><button class="link-button" data-select-project="${project.id}" type="button">Open</button></td>
            </tr>`), "No projects")}
        </div>
        <div class="panel">
          <div class="panel-header"><h2>${selected ? "Project config" : "New project"}</h2></div>
          <div class="panel-body">
            ${projectPullPanel(selected)}
            ${projectForm(selected)}
          </div>
        </div>
      </section>`;

    content.querySelectorAll("[data-select-project]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedProjectId = button.dataset.selectProject;
        renderProjects();
      });
    });
    $("#newProjectButton").addEventListener("click", () => {
      state.selectedProjectId = "";
      content.querySelector(".panel-body").innerHTML = projectForm(null);
      bindProjectForm(null);
    });
    bindProjectForm(selected);
    if (selected) {
      $("#pullProjectButton").addEventListener("click", async () => {
        if ($("#pullProjectButton").disabled) {
          return;
        }
        await api(`/api/v1/projects/${selected.id}/backlog/pull`, { method: "POST" });
        setToast("Project pull queued.");
      });
      $("#pullIssueButton").addEventListener("click", async () => {
        const key = $("#pullIssueKey").value.trim();
        const job = await api(`/api/v1/projects/${selected.id}/backlog/issues/${encodeURIComponent(key)}/pull`, { method: "POST" });
        setToast(job.status === "success" ? "Issue pulled into CIS." : `Issue pull ${job.status}.`, job.status === "failed");
        await renderProjects();
      });
      $("#projectMappingTargetSystem").addEventListener("change", (event) => {
        state.projectMappingTargetSystem = event.target.value;
      });
      $("#syncCisMappingValuesButton").addEventListener("click", async () => {
        try {
          const targetSystem = $("#projectMappingTargetSystem").value;
          const result = await api(`/api/v1/projects/${selected.id}/cis/mapping-values/sync`, {
            method: "POST",
            body: { target_system: targetSystem },
          });
          const warningFields = (result.warnings || []).map((warning) => warning.mapping_type);
          if (warningFields.length > 0) {
            setToast(`Mapping fields synced. Warning: replaced existing CIS values for ${warningFields.join(", ")}.`, false, "warning");
          } else {
            setToast("Mapping fields synced.");
          }
          await renderProjects();
        } catch (error) {
          setToast(error.message, true);
        }
      });
    }
  }

  function bindProjectForm(project) {
    const form = $("#projectForm");
    syncTranslationAiFields(form);
    const providerField = form.elements.namedItem("translation_ai_provider");
    const transportField = form.elements.namedItem("translation_ai_transport");
    if (providerField) {
      providerField.addEventListener("change", () => syncTranslationAiFields(form));
    }
    if (transportField) {
      transportField.addEventListener("change", () => syncTranslationAiFields(form));
    }
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const payload = projectPayloadFromForm(form);
        const saved = project && project.id
          ? await api(`/api/v1/projects/${project.id}`, { method: "PATCH", body: payload })
          : await api("/api/v1/projects", { method: "POST", body: payload });
        state.selectedProjectId = String(saved.id);
        setToast("Project saved.");
        await renderProjects();
      } catch (error) {
        setToast(error.message, true);
      }
    });
  }

  async function renderIssues() {
    $("#activeTitle").textContent = "Issues";
    const projects = await api("/api/v1/projects");
    const projectOptions = [`<option value="">All projects</option>`]
      .concat(projects.map((project) => `<option value="${project.id}" ${String(project.id) === String(state.selectedProjectId) ? "selected" : ""}>${escapeHtml(project.name)}</option>`));
    const qs = new URLSearchParams();
    if (state.selectedProjectId) qs.set("project_id", state.selectedProjectId);
    const issues = await api(`/api/v1/issues?${qs.toString()}`);
    content.innerHTML = `
      <section class="panel">
        <div class="panel-header">
          <h2>Issue list</h2>
          <div class="toolbar"><label>Project<select id="issueProjectFilter">${projectOptions.join("")}</select></label></div>
        </div>
        ${table(["Backlog", "Project", "Status", "Summary", "Review", "Anomaly", ""], issues.map((issue) => `
          <tr>
            <td>${escapeHtml(issue.backlog_issue_key || "")}</td>
            <td>${escapeHtml(issue.project_name || issue.project_id)}</td>
            <td>${badge(issue.sync_status || issue.status)}</td>
            <td>${escapeHtml(issue.current_summary || "")}</td>
            <td>${escapeHtml(issue.pending_translation_count || 0)}</td>
            <td>${escapeHtml(issue.open_anomaly_count || 0)}</td>
            <td><button class="link-button" data-issue-id="${escapeHtml(issue.id)}" type="button">Open</button></td>
          </tr>`), "No issues")}
      </section>`;
    $("#issueProjectFilter").addEventListener("change", (event) => {
      state.selectedProjectId = event.target.value;
      renderIssues();
    });
    content.querySelectorAll("[data-issue-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        state.selectedIssueId = button.dataset.issueId;
        state.dryRun = null;
        state.issueEditorDirty = false;
        state.view = "issue_editor";
        renderNav();
        await render();
      });
    });
  }

  function issueDetailHtml(detail) {
    const issue = detail.issue;
    const latest = detail.revisions[detail.revisions.length - 1] || {};
    return `
      <section class="panel">
        <div class="panel-header">
          <h2>${escapeHtml(issue.backlog_issue_key || issue.id)}</h2>
          <div class="actions">
            <button id="dryRunButton" type="button">Dry-run Jira</button>
            <button id="syncJiraButton" type="button">Sync Jira</button>
            <button id="openIssueEditorButton" class="ghost-button" type="button">Open editor</button>
            <button id="forceApproveButton" class="ghost-button" type="button">Force approve</button>
          </div>
        </div>
        <div class="panel-body grid">
          <div class="split">
            <div><h3>Original</h3><pre>${escapeHtml([latest.summary, latest.description].filter(Boolean).join("\n\n"))}</pre></div>
            <div><h3>Reviewed</h3><pre>${escapeHtml(detail.translations.map((item) => item.reviewed_text || item.ai_draft || "").filter(Boolean).join("\n\n"))}</pre></div>
          </div>
          <div class="grid cols-2">
            <div>${smallTable("Translations", ["ID", "Status", "Target"], detail.translations.map((item) => `
              <tr>
                <td>${escapeHtml(item.id)}</td>
                <td>${badge(item.review_status)}</td>
                <td>${escapeHtml(item.target_type)}</td>
              </tr>`), "No translations")}</div>
            <div>${smallTable("Attachments", ["File", "Download", "Sync"], detail.attachments.map((item) => `
              <tr>
                <td>${escapeHtml(item.original_filename)}</td>
                <td>${badge(item.download_status)}</td>
                <td>${badge(item.sync_status)}</td>
              </tr>`), "No attachments")}</div>
          </div>
          <div>${smallTable("Comments", ["Author", "Sync", "Content"], detail.comments.map((item) => `
            <tr>
              <td>${escapeHtml(item.author_name || "")}</td>
              <td>${badge(item.sync_status)}</td>
              <td>${escapeHtml(item.content_translated || item.content_original)}</td>
            </tr>`), "No comments")}</div>
          ${state.dryRun ? `<div>${smallTable("Dry-run result", ["Can sync", "Warnings", "Payload"], [`
            <tr><td>${badge(state.dryRun.can_sync ? "ok" : "failed")}</td><td>${escapeHtml((state.dryRun.warnings || []).map((w) => w.code).join(", "))}</td><td><pre>${json(state.dryRun.payload)}</pre></td></tr>`], "")}</div>` : ""}
        </div>
      </section>`;
  }

  function smallTable(title, headers, rows, emptyText) {
    return `<div class="subsection"><h3>${escapeHtml(title)}</h3>${table(headers, rows, emptyText)}</div>`;
  }

  function bindIssueDetail(detail) {
    const issueId = detail.issue.id;
    $("#openIssueEditorButton").addEventListener("click", async () => {
      state.selectedIssueId = issueId;
      state.issueEditorDirty = false;
      state.view = "issue_editor";
      renderNav();
      await render();
    });
    $("#dryRunButton").addEventListener("click", async () => {
      state.dryRun = await api(`/api/v1/issues/${encodeURIComponent(issueId)}/dry-run/jira`, { method: "POST" });
      setToast("Dry-run completed.");
      await renderIssues();
    });
    $("#syncJiraButton").addEventListener("click", async () => {
      const job = await api(`/api/v1/issues/${encodeURIComponent(issueId)}/sync/jira`, { method: "POST" });
      setToast(`Sync job queued: ${job.id}`);
    });
    $("#forceApproveButton").addEventListener("click", async () => {
      await api(`/api/v1/issues/${encodeURIComponent(issueId)}/force-approve`, { method: "POST" });
      setToast("Issue approved.");
      await renderIssues();
    });
  }

  function hasDisplayValue(value) {
    return value !== null && value !== undefined && value !== "";
  }

  function sourceLabel(source) {
    return {
      backlog: "Backlog",
      cis: "CIS stored",
      jira: "Jira",
    }[source] || source;
  }

  function sourceValueBlock(sources, source) {
    const value = sources && Object.prototype.hasOwnProperty.call(sources, source)
      ? sources[source]
      : "";
    const hasValue = hasDisplayValue(value);
    const body = value && typeof value === "object"
      ? `<pre>${json(value)}</pre>`
      : `<div class="source-value-text">${escapeHtml(hasValue ? value : "-")}</div>`;

    return `
      <div class="source-value ${hasValue ? "" : "empty-source"}">
        <div class="source-value-label">${escapeHtml(sourceLabel(source))}</div>
        ${body}
      </div>`;
  }

  function editorSelect(name, value, catalog) {
    const options = (catalog || []).map((item) => ({ value: item, label: item }));
    return `<select name="${escapeHtml(name)}">${selectOptions(options, value || "")}</select>`;
  }

  function fieldCatalogOptions(catalog) {
    return (catalog || []).map((item) => {
      if (item && typeof item === "object") {
        const value = item.value === undefined ? item.name : item.value;
        return {
          value: value === undefined ? item.label : value,
          label: item.label || item.name || item.value || "",
        };
      }

      return { value: item, label: item };
    });
  }

  function issueEditorForm(editor) {
    const c = editor.canonical || {};
    const catalogs = editor.field_meta && editor.field_meta.catalogs || {};
    const assigneeMeta = editor.assignee_meta && editor.assignee_meta.cis || {};
    return `
      <form id="issueEditorForm" class="project-form">
        <section class="form-block">
          <div class="form-block-header"><h3>CIS canonical</h3>${badge(editor.issue.sync_status)}</div>
          <div class="grid cols-2">
            <label>Summary<input name="summary" required value="${escapeHtml(c.summary && c.summary.value || "")}"></label>
            <label>Issue type${editorSelect("issue_type", c.issue_type && c.issue_type.value, catalogs.issue_type)}</label>
            <label>Priority${editorSelect("priority", c.priority && c.priority.value, catalogs.priority)}</label>
            <label>Business status${editorSelect("status", c.status && c.status.value, catalogs.status)}</label>
            <label>Assignee<input name="assignee" value="${escapeHtml(c.assignee && c.assignee.value || "")}"></label>
            <label>Jira account ID<input name="jira_account_id" value="${escapeHtml(assigneeMeta.jira_account_id || "")}"></label>
            <label>Due date<input name="due_date" type="date" value="${escapeHtml(c.due_date && c.due_date.value || "")}"></label>
          </div>
          <label>Description<textarea name="description">${escapeHtml(c.description && c.description.value || "")}</textarea></label>
          <label>Reason<input name="reason" value="Chuẩn hóa trước khi sync Jira"></label>
          <div class="actions">
            <button type="submit">Save canonical</button>
            <button id="backToIssueListFormButton" class="ghost-button" type="button">Back to list</button>
          </div>
        </section>
      </form>`;
  }

  function issueEditorPayload(form) {
    const payload = {
      summary: form.summary.value,
      description: form.description.value,
      issue_type: form.issue_type.value,
      priority: form.priority.value,
      status: form.status.value,
      assignee: form.assignee.value,
      due_date: form.due_date.value,
      reason: form.reason.value,
    };

    if (form.jira_account_id.value.trim()) {
      payload.assignee_meta = {
        jira_account_id: form.jira_account_id.value.trim(),
      };
    }

    return payload;
  }

  function issueEditorSourceTable(editor) {
    const sources = editor.sources || {};
    const canonical = editor.canonical || {};
    const fields = editor.field_meta && editor.field_meta.editable_fields || [];
    if (!fields.length) {
      return `<div class="subsection"><h3>Source data</h3><div class="empty">No source data</div></div>`;
    }

    return `
      <div class="subsection source-data">
        <h3>Source data</h3>
        <div class="source-data-list">
          ${fields.map((field) => {
            const entry = canonical[field] || {};
            return `
              <section class="source-field">
                <div class="source-field-head">
                  <h4>${escapeHtml(field)}</h4>
                  ${badge(entry.source ? `from ${entry.source}` : "no source")}
                </div>
                <div class="source-value-grid">
                  ${sourceValueBlock(sources[field], "backlog")}
                  ${sourceValueBlock(sources[field], "cis")}
                  ${sourceValueBlock(sources[field], "jira")}
                </div>
              </section>`;
          }).join("")}
        </div>
      </div>`;
  }

  function issueEditorOverview(editor) {
    const issue = editor.issue;
    const worklog = editor.collections && editor.collections.worklog_summary || {};
    return `
      <div class="panel">
        <div class="panel-header"><h2>Overview</h2>${badge(issue.sync_status)}</div>
        <div class="panel-body">
          ${smallTable("Identity", ["Key", "Value"], [
            `<tr><td>CIS issue</td><td>${escapeHtml(issue.id)}</td></tr>`,
            `<tr><td>Project</td><td>${escapeHtml(issue.project_id)}</td></tr>`,
            `<tr><td>Backlog</td><td>${escapeHtml(issue.backlog_issue_key || "")}</td></tr>`,
            `<tr><td>Jira</td><td>${escapeHtml(issue.jira_issue_key || "")}</td></tr>`,
            `<tr><td>Updated</td><td>${displayDate(issue.updated_at)}</td></tr>`,
          ], "No identity")}
          ${smallTable("Worklogs", ["Count", "Seconds", "Sources"], [
            `<tr><td>${escapeHtml(worklog.count || 0)}</td><td>${escapeHtml(worklog.total_spent_seconds || 0)}</td><td>${escapeHtml((worklog.sources || []).join(", "))}</td></tr>`,
          ], "No worklogs")}
          ${smallTable("Sync readiness", ["Field", "Value"], [
            `<tr><td>Canonical hash</td><td><code>${escapeHtml(editor.sync && editor.sync.canonical_hash || "")}</code></td></tr>`,
          ], "No sync data")}
        </div>
      </div>`;
  }

  function issueEditorHistory(history) {
    return smallTable("History", ["Type", "Actor", "Changed", "Created"], (history.manual_edits || []).map((item) => `
      <tr>
        <td>${escapeHtml(item.action)}</td>
        <td>${escapeHtml(item.executed_by || "")}</td>
        <td>${escapeHtml((item.details_json && item.details_json.changed_fields || []).join(", "))}</td>
        <td>${displayDate(item.created_at)}</td>
      </tr>`), "No manual edits");
  }

  function translationEditorText(item) {
    if (item.is_source_stale) {
      return "";
    }

    return item.reviewed_text || item.ai_draft || "";
  }

  function translationDraftHint(item) {
    if (item.is_source_stale) {
      return "This translation source changed. Translate again before approving or saving reviewed text.";
    }

    if (item.provider_error) {
      return `Translation failed: ${item.provider_error}`;
    }

    if (item.review_status === "pending" && !item.ai_draft) {
      return "No translated draft has been created yet. Press Translate to create one now.";
    }

    if (item.ai_draft && item.ai_draft === item.source_text) {
      return "Draft matches source text. Check the provider or edit the translation manually before approval.";
    }

    return "";
  }

  function issueTranslationItems(editor) {
    return (editor.translations || []).filter((item) => item.target_type === "issue" && !item.comment_id);
  }

  function translationTargetLabel(item) {
    const labels = {
      summary: "Summary translation",
      description: "Description translation",
    };

    return labels[item.target_field] || `Issue translation #${item.id}`;
  }

  function issueEditorTranslationPanel(editor) {
    const items = issueTranslationItems(editor);
    const summary = editor.translation || {};
    return `
      <div class="panel">
        <div class="panel-header">
          <h2>Translations</h2>
          ${items.length ? badge(`${summary.approved || 0}/${summary.total || items.length} approved`) : badge("none")}
        </div>
        <div class="panel-body">
          <div class="actions">
            <button id="openTranslatePopupButton" type="button" ${state.issueEditorDirty ? "disabled" : ""}>Translations</button>
          </div>
        </div>
      </div>`;
  }

  function issueEditorTranslationModal(editor) {
    const items = issueTranslationItems(editor);
    const isTranslating = Boolean(state.issueEditorTranslating);
    if (!state.issueEditorTranslationPopup) {
      return "";
    }

    return `
      <div class="modal-backdrop" data-editor-translation-close="1">
        <div class="modal-panel large" role="dialog" aria-modal="true" aria-label="Translate issue">
          <div class="modal-header">
            <h2>Translate</h2>
            <button class="ghost-button" data-editor-translation-close="1" type="button">Close</button>
          </div>
          <div class="actions">
            <button data-editor-request-translation="1" type="button" ${isTranslating ? "disabled" : ""}>${state.issueEditorTranslating === "all" ? "Translating..." : "Translate issue"}</button>
          </div>
          ${isTranslating ? `<p class="muted">Translating now. Keep this modal open until the draft is created.</p>` : ""}
          ${items.length ? items.map((item) => {
            const canSave = !item.is_source_stale && !state.issueEditorDirty && Boolean(translationEditorText(item).trim());
            const hint = translationDraftHint(item);
            const isItemTranslating = state.issueEditorTranslating === `item:${item.id}`;
            return `
              <section class="translation-card" data-editor-translation-card="${escapeHtml(item.id)}">
                <div class="form-block-header">
                  <h3>${escapeHtml(translationTargetLabel(item))}</h3>
                  ${badge(item.review_status)}
                </div>
                ${hint ? `<p class="muted">${escapeHtml(hint)}</p>` : ""}
                <label>Backlog source text<textarea readonly>${escapeHtml(item.source_text || "")}</textarea></label>
                <label>Translated text<textarea data-editor-translation-text="${escapeHtml(item.id)}">${escapeHtml(translationEditorText(item))}</textarea></label>
                <div class="actions">
                  <button data-editor-retranslate="${escapeHtml(item.id)}" data-editor-source-stale="${item.is_source_stale ? "1" : "0"}" type="button" ${isTranslating ? "disabled" : ""}>${isItemTranslating ? "Translating..." : "Translate"}</button>
                  <button data-editor-save-translation="${escapeHtml(item.id)}" data-editor-save-can-submit="${canSave ? "1" : "0"}" type="button" ${canSave && !isTranslating ? "" : "disabled"}>Approve + save</button>
                  <button data-editor-reject-translation="${escapeHtml(item.id)}" class="ghost-button" type="button" ${isTranslating ? "disabled" : ""}>Reject</button>
                </div>
              </section>`;
          }).join("") : `<div class="empty">No queue yet. Use Translate issue to create translation drafts.</div>`}
        </div>
      </div>`;
  }

  function issueEditorDryRunResult() {
    if (!state.dryRun) {
      return `<div class="empty">No Jira dry-run yet.</div>`;
    }

    const errors = state.dryRun.validation && state.dryRun.validation.errors || [];
    const warnings = state.dryRun.warnings || [];
    return `
      ${smallTable("Dry-run result", ["Can sync", "Errors", "Warnings"], [
        `<tr>
          <td>${badge(state.dryRun.can_sync ? "ok" : "failed")}</td>
          <td>${escapeHtml(errors.map((item) => item.code).join(", ") || "-")}</td>
          <td>${escapeHtml(warnings.map((item) => item.code).join(", ") || "-")}</td>
        </tr>`,
      ], "No dry-run")}
      ${smallTable("Dry-run metadata", ["Field", "Value"], [
        `<tr><td>Canonical hash</td><td><code>${escapeHtml(state.dryRun.canonical_hash || "")}</code></td></tr>`,
        `<tr><td>Field sources</td><td><pre>${json(state.dryRun.field_sources)}</pre></td></tr>`,
      ], "No metadata")}
      <div class="subsection">
        <h3>Jira payload</h3>
        <pre>${json(state.dryRun.payload)}</pre>
      </div>`;
  }

  function jiraFieldValue(dryRun, field) {
    const payload = dryRun && dryRun.payload || {};
    const fields = payload.fields || {};
    if (field === "summary") return fields.summary || "";
    if (field === "description") return fields.description || "";
    if (field === "issue_type") return fields.issuetype && fields.issuetype.name || "";
    if (field === "priority") return fields.priority && fields.priority.name || "";
    if (field === "status") return payload.transition_preview && payload.transition_preview.status || "";
    if (field === "assignee") {
      const assignee = fields.assignee || {};
      return assignee.emailAddress || assignee.accountId || assignee.name || "";
    }
    if (field === "due_date") return fields.duedate || "";
    return "";
  }

  function jiraSyncField(label, name, dryRun, options = {}) {
    const value = jiraFieldValue(dryRun, name);
    if (options.type === "textarea") {
      return `<label>${escapeHtml(label)}<textarea name="${escapeHtml(name)}">${escapeHtml(value)}</textarea></label>`;
    }
    if (options.catalog) {
      return `<label>${escapeHtml(label)}<select name="${escapeHtml(name)}">${selectOptions(fieldCatalogOptions(options.catalog), value || "")}</select></label>`;
    }

    return `<label>${escapeHtml(label)}<input name="${escapeHtml(name)}" ${options.type ? `type="${escapeHtml(options.type)}"` : ""} value="${escapeHtml(value)}"></label>`;
  }

  function jiraSyncPayloadFromForm(form) {
    return {
      summary: form.summary.value,
      description: form.description.value,
      issue_type: form.issue_type.value,
      priority: form.priority.value,
      status: form.status.value,
      assignee: form.assignee.value,
      due_date: form.due_date.value,
    };
  }

  function issueEditorJiraSyncModal(editor) {
    if (state.issueEditorJiraSyncPopup !== "sync") {
      return "";
    }

    const dryRun = state.issueEditorJiraDryRun;
    const errors = dryRun && dryRun.validation && dryRun.validation.errors || [];
    const warnings = dryRun && dryRun.warnings || [];
    const disabled = state.issueEditorJiraSyncing || state.issueEditorJiraDryRunLoading || !dryRun || !dryRun.can_sync;
    const catalogsBySystem = editor.field_meta && editor.field_meta.catalogs_by_system || {};
    const jiraCatalogs = catalogsBySystem.jira || {};

    return `
      <div class="modal-backdrop" data-editor-jira-sync-close="1">
        <div class="modal-panel large" role="dialog" aria-modal="true" aria-label="Jira sync">
          <div class="modal-header">
            <h2>Jira sync</h2>
            <button class="ghost-button" data-editor-jira-sync-close="1" type="button">Close</button>
          </div>
          ${state.issueEditorJiraDryRunLoading ? `<div class="empty">Running Jira dry-run...</div>` : ""}
          ${dryRun ? `
            <div class="actions">
              ${badge(dryRun.can_sync ? "can sync" : "blocked")}
              ${dryRun.stale ? badge("stale") : ""}
            </div>
            ${errors.length ? `<div class="subsection"><h3>Errors</h3><pre>${json(errors)}</pre></div>` : ""}
            ${warnings.length ? `<div class="subsection"><h3>Warnings</h3><pre>${json(warnings)}</pre></div>` : ""}
            <form id="jiraSyncForm" class="project-form">
              <section class="form-block">
                <div class="form-block-header"><h3>Fields to update on Jira</h3>${badge(dryRun.target || "jira")}</div>
                <div class="editor-field-grid">
                  ${jiraSyncField("Summary", "summary", dryRun)}
                  ${jiraSyncField("Issue type", "issue_type", dryRun, { catalog: jiraCatalogs.issue_type })}
                  ${jiraSyncField("Priority", "priority", dryRun, { catalog: jiraCatalogs.priority })}
                  ${jiraSyncField("Business status", "status", dryRun, { catalog: jiraCatalogs.status })}
                  ${jiraSyncField("Assignee", "assignee", dryRun)}
                  ${jiraSyncField("Due date", "due_date", dryRun, { type: "date" })}
                </div>
                ${jiraSyncField("Description", "description", dryRun, { type: "textarea" })}
                <div class="actions">
                  <button type="submit" ${disabled ? "disabled" : ""}>${state.issueEditorJiraSyncing ? "Syncing..." : "Sync Jira"}</button>
                  <button class="ghost-button" data-editor-jira-rerun-dryrun="1" type="button" ${state.issueEditorJiraSyncing ? "disabled" : ""}>Dry-run again</button>
                </div>
              </section>
            </form>
          ` : ""}
        </div>
      </div>`;
  }

  function issueEditorSyncPanel(editor) {
    const disabled = state.issueEditorDirty ? "disabled" : "";
    return `
      <div class="panel">
        <div class="panel-header">
          <h2>Jira sync</h2>
          ${state.issueEditorDirty ? badge("unsaved") : badge(editor.issue.sync_status)}
        </div>
        <div class="panel-body">
          <div class="actions">
            <button id="openJiraSyncModalButton" type="button" ${disabled}>Jira sync</button>
          </div>
        </div>
      </div>`;
  }

  function issueEditorBacklogSyncPanel(editor) {
    const disabled = state.issueEditorDirty || state.issueEditorBacklogResyncing || !editor.issue.backlog_issue_key
      ? "disabled"
      : "";
    return `
      <div class="panel">
        <div class="panel-header">
          <h2>Backlog sync</h2>
          ${state.issueEditorDirty ? badge("unsaved") : badge("backlog")}
        </div>
        <div class="panel-body">
          <div class="actions">
            <button id="resyncBacklogButton" type="button" ${disabled}>${state.issueEditorBacklogResyncing ? "Resyncing..." : "Resync from Backlog"}</button>
          </div>
        </div>
      </div>`;
  }

  function syncIssueEditorActionState() {
    ["openJiraSyncModalButton", "openTranslatePopupButton", "resyncBacklogButton"].forEach((id) => {
      const button = $(`#${id}`);
      if (button) {
        button.disabled = state.issueEditorDirty || (id === "resyncBacklogButton" && state.issueEditorBacklogResyncing);
      }
    });
    content.querySelectorAll("[data-editor-reject-translation], [data-editor-retranslate], [data-editor-request-translation]").forEach((button) => {
      button.disabled = state.issueEditorDirty || Boolean(state.issueEditorTranslating);
    });
    content.querySelectorAll("[data-editor-save-translation]").forEach((button) => {
      const id = button.dataset.editorSaveTranslation;
      const text = content.querySelector(`[data-editor-translation-text="${selectorValue(id)}"]`);
      const canSubmit = button.dataset.editorSaveCanSubmit === "1" && Boolean(text && text.value.trim());
      button.disabled = state.issueEditorDirty || Boolean(state.issueEditorTranslating) || !canSubmit;
    });
  }

  async function renderIssueEditor() {
    if (!state.selectedIssueId) {
      state.view = "issues";
      renderNav();
      await renderIssues();
      return;
    }

    $("#activeTitle").textContent = "Issue Editor";
    const issueId = encodeURIComponent(state.selectedIssueId);
    const [editor, history] = await Promise.all([
      api(`/api/v1/issues/${issueId}/editor`),
      api(`/api/v1/issues/${issueId}/history`),
    ]);

    content.innerHTML = `
      <section class="issue-editor-layout">
        <div class="grid issue-editor-main">
          <div class="panel">
            <div class="panel-header">
              <h2>${escapeHtml(editor.issue.backlog_issue_key || editor.issue.id)}</h2>
              ${state.issueEditorDirty ? badge("unsaved") : ""}
            </div>
            <div class="panel-body">
              ${issueEditorForm(editor)}
            </div>
          </div>
          ${issueEditorTranslationPanel(editor)}
          <div class="panel">
            <div class="panel-body">
              ${issueEditorSourceTable(editor)}
            </div>
          </div>
        </div>
        <div class="grid issue-editor-side">
            ${issueEditorBacklogSyncPanel(editor)}
            ${issueEditorSyncPanel(editor)}
            ${issueEditorOverview(editor)}
            <div class="panel"><div class="panel-body">${issueEditorHistory(history)}</div></div>
        </div>
      </section>
      ${issueEditorTranslationModal(editor)}
      ${issueEditorJiraSyncModal(editor)}`;

    const form = $("#issueEditorForm");
    form.querySelectorAll("input, select, textarea").forEach((field) => {
      field.addEventListener("input", () => {
        state.issueEditorDirty = true;
        syncIssueEditorActionState();
      });
      field.addEventListener("change", () => {
        state.issueEditorDirty = true;
        syncIssueEditorActionState();
      });
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await api(`/api/v1/issues/${issueId}`, {
          method: "PATCH",
          body: issueEditorPayload(form),
        });
        state.issueEditorDirty = false;
        state.dryRun = null;
        state.issueEditorJiraDryRun = null;
        state.issueEditorJiraSyncPopup = "";
        setToast("Canonical issue saved. Run dry-run again before sync.");
        await renderIssueEditor();
      } catch (error) {
        setToast(error.message, true);
      }
    });
    const openTranslateButton = $("#openTranslatePopupButton");
    if (openTranslateButton) {
      openTranslateButton.addEventListener("click", async () => {
        if (state.issueEditorDirty) {
          setToast("Save canonical changes before translating.", true);
          return;
        }
        state.issueEditorTranslationPopup = "translate";
        await renderIssueEditor();
      });
    }
    const openJiraSyncButton = $("#openJiraSyncModalButton");
    if (openJiraSyncButton) {
      openJiraSyncButton.addEventListener("click", async () => {
        if (state.issueEditorDirty) {
          setToast("Save canonical changes before Jira sync.", true);
          return;
        }

        state.issueEditorJiraSyncPopup = "sync";
        state.issueEditorJiraDryRun = null;
        state.issueEditorJiraDryRunLoading = true;
        await renderIssueEditor();
        try {
          state.issueEditorJiraDryRun = await api(`/api/v1/issues/${issueId}/dry-run/jira`, { method: "POST" });
          state.issueEditorJiraDryRunLoading = false;
          await renderIssueEditor();
        } catch (error) {
          state.issueEditorJiraDryRunLoading = false;
          await renderIssueEditor();
          setToast(error.message, true);
        }
      });
    }
    const resyncBacklogButton = $("#resyncBacklogButton");
    if (resyncBacklogButton) {
      resyncBacklogButton.addEventListener("click", async () => {
        if (state.issueEditorDirty) {
          setToast("Save canonical changes before resync from Backlog.", true);
          return;
        }
        if (!editor.issue.backlog_issue_key) {
          setToast("This issue has no Backlog key to resync.", true);
          return;
        }

        state.issueEditorBacklogResyncing = true;
        syncIssueEditorActionState();
        try {
          const job = await api(`/api/v1/projects/${editor.issue.project_id}/backlog/issues/${encodeURIComponent(editor.issue.backlog_issue_key)}/pull`, { method: "POST" });
          state.issueEditorBacklogResyncing = false;
          state.dryRun = null;
          state.issueEditorJiraDryRun = null;
          state.issueEditorJiraSyncPopup = "";
          setToast(job.status === "success" ? "Backlog resynced into CIS." : `Backlog resync ${job.status}.`, job.status === "failed");
          await renderIssueEditor();
        } catch (error) {
          state.issueEditorBacklogResyncing = false;
          syncIssueEditorActionState();
          setToast(error.message, true);
        }
      });
    }
    content.querySelectorAll("[data-editor-jira-sync-close]").forEach((element) => {
      element.addEventListener("click", async (event) => {
        if (event.target !== element) {
          return;
        }
        state.issueEditorJiraSyncPopup = "";
        state.issueEditorJiraDryRunLoading = false;
        state.issueEditorJiraSyncing = false;
        await renderIssueEditor();
      });
    });
    content.querySelectorAll("[data-editor-jira-rerun-dryrun]").forEach((button) => button.addEventListener("click", async () => {
      if (state.issueEditorDirty) {
        setToast("Save canonical changes before dry-run.", true);
        return;
      }

      state.issueEditorJiraDryRunLoading = true;
      button.textContent = "Running...";
      try {
        state.issueEditorJiraDryRun = await api(`/api/v1/issues/${issueId}/dry-run/jira`, { method: "POST" });
        state.issueEditorJiraDryRunLoading = false;
        setToast("Dry-run completed.");
        await renderIssueEditor();
      } catch (error) {
        state.issueEditorJiraDryRunLoading = false;
        await renderIssueEditor();
        setToast(error.message, true);
      }
    }));
    const jiraSyncForm = $("#jiraSyncForm");
    if (jiraSyncForm) {
      jiraSyncForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (state.issueEditorDirty) {
          setToast("Save canonical changes before sync.", true);
          return;
        }

        state.issueEditorJiraSyncing = true;
        syncIssueEditorActionState();
        try {
          const job = await api(`/api/v1/issues/${issueId}/sync/jira`, {
            method: "POST",
            body: {
              jira_fields: jiraSyncPayloadFromForm(jiraSyncForm),
            },
          });
          state.issueEditorJiraSyncPopup = "";
          state.issueEditorJiraSyncing = false;
          state.issueEditorJiraDryRun = null;
          setToast(`Sync job queued: ${job.id}`);
          await renderIssueEditor();
        } catch (error) {
          state.issueEditorJiraSyncing = false;
          syncIssueEditorActionState();
          setToast(error.message, true);
        }
      });
    }
    const forceApproveButton = $("#editorForceApproveButton");
    if (forceApproveButton) {
      forceApproveButton.addEventListener("click", async () => {
        if (state.issueEditorDirty) {
          setToast("Save canonical changes before force approve.", true);
          return;
        }
        try {
          await api(`/api/v1/issues/${issueId}/force-approve`, { method: "POST" });
          setToast("Issue approved.");
          await renderIssueEditor();
        } catch (error) {
          setToast(error.message, true);
        }
      });
    }
    content.querySelectorAll("[data-editor-translation-close]").forEach((element) => {
      element.addEventListener("click", async (event) => {
        if (event.target !== element) {
          return;
        }
        state.issueEditorTranslationPopup = "";
        await renderIssueEditor();
      });
    });
    content.querySelectorAll("[data-editor-translation-text]").forEach((textarea) => {
      textarea.addEventListener("input", () => {
        syncIssueEditorActionState();
      });
    });
    content.querySelectorAll("[data-editor-request-translation]").forEach((button) => button.addEventListener("click", async () => {
      if (state.issueEditorDirty) {
        setToast("Save canonical changes before translating.", true);
        return;
      }
      state.issueEditorTranslating = "all";
      button.textContent = "Translating...";
      syncIssueEditorActionState();
      try {
        const result = await api(`/api/v1/translations/issues/${issueId}/translate`, { method: "POST" });
        state.issueEditorTranslationPopup = "translate";
        setToast(`Translation drafts created: ${(result.translated_items || []).length}`);
        state.issueEditorTranslating = "";
        await renderIssueEditor();
      } catch (error) {
        state.issueEditorTranslating = "";
        syncIssueEditorActionState();
        button.textContent = "Translate issue";
        setToast(error.message, true);
      }
    }));
    content.querySelectorAll("[data-editor-save-translation]").forEach((button) => button.addEventListener("click", async () => {
      if (state.issueEditorDirty) {
        setToast("Save canonical changes before reviewing translations.", true);
        return;
      }
      const id = button.dataset.editorSaveTranslation;
      const card = button.closest("[data-editor-translation-card]");
      const textarea = card
        ? card.querySelector(`[data-editor-translation-text="${selectorValue(id)}"]`)
        : content.querySelector(`[data-editor-translation-text="${selectorValue(id)}"]`);
      const reviewedText = textarea ? textarea.value : "";
      if (!reviewedText.trim()) {
        setToast("Reviewed text is required.", true);
        return;
      }
      try {
        await api(`/api/v1/translation-queue/${id}/manual-edit`, {
          method: "POST",
          body: { reviewed_text: reviewedText, review_notes: "issue-editor" },
        });
        setToast("Translation approved and saved.");
        await renderIssueEditor();
      } catch (error) {
        setToast(error.message, true);
      }
    }));
    content.querySelectorAll("[data-editor-reject-translation]").forEach((button) => button.addEventListener("click", async () => {
      if (state.issueEditorDirty) {
        setToast("Save canonical changes before reviewing translations.", true);
        return;
      }
      try {
        await api(`/api/v1/translation-queue/${button.dataset.editorRejectTranslation}/reject`, {
          method: "POST",
          body: { review_notes: "issue-editor" },
        });
        setToast("Translation rejected.");
        await renderIssueEditor();
      } catch (error) {
        setToast(error.message, true);
      }
    }));
    content.querySelectorAll("[data-editor-retranslate]").forEach((button) => button.addEventListener("click", async () => {
      if (state.issueEditorDirty) {
        setToast("Save canonical changes before reviewing translations.", true);
        return;
      }
      const originalText = button.textContent;
      state.issueEditorTranslating = `item:${button.dataset.editorRetranslate}`;
      button.textContent = "Translating...";
      syncIssueEditorActionState();
      try {
        if (button.dataset.editorSourceStale === "1") {
          const result = await api(`/api/v1/translations/issues/${issueId}/translate`, { method: "POST" });
          setToast(`Translation drafts created: ${(result.translated_items || []).length}`);
        } else {
          await api(`/api/v1/translations/issues/${issueId}/items/${button.dataset.editorRetranslate}/translate`, { method: "POST" });
          setToast("Translation draft created.");
        }
        state.issueEditorTranslating = "";
        await renderIssueEditor();
      } catch (error) {
        state.issueEditorTranslating = "";
        syncIssueEditorActionState();
        button.textContent = originalText;
        setToast(error.message, true);
      }
    }));

    function backToIssueList() {
      state.view = "issues";
      state.issueEditorDirty = false;
      state.dryRun = null;
      state.issueEditorTranslationPopup = "";
      state.issueEditorTranslating = "";
      renderNav();
      renderIssues();
    }

    const backToIssueListButton = $("#backToIssueListButton");
    const backToIssueListFormButton = $("#backToIssueListFormButton");
    if (backToIssueListButton) {
      backToIssueListButton.addEventListener("click", backToIssueList);
    }
    if (backToIssueListFormButton) {
      backToIssueListFormButton.addEventListener("click", backToIssueList);
    }
  }

  async function renderTranslations() {
    $("#activeTitle").textContent = "Translations";
    const items = await api("/api/v1/translation-queue");
    content.innerHTML = `
      <section class="panel">
        <div class="panel-header"><h2>Review queue</h2></div>
        ${table(["ID", "Issue", "Status", "Source", "Draft", "Actions"], items.map((item) => `
          <tr>
            <td>${escapeHtml(item.id)}</td>
            <td>${escapeHtml(item.issue_id)}</td>
            <td>${badge(item.review_status)}</td>
            <td>${escapeHtml(item.source_text).slice(0, 180)}</td>
            <td>${escapeHtml(item.ai_draft || item.reviewed_text || "").slice(0, 180)}</td>
            <td class="actions">
              <button class="link-button" data-approve-translation="${item.id}" type="button">Approve</button>
              <button class="link-button" data-edit-translation="${item.id}" type="button">Edit</button>
              <button class="link-button" data-reject-translation="${item.id}" type="button">Reject</button>
              <button class="link-button" data-retranslate="${item.id}" type="button">Retranslate</button>
            </td>
          </tr>`), "No translation queue items")}
      </section>`;
    content.querySelectorAll("[data-approve-translation]").forEach((button) => button.addEventListener("click", async () => {
      await api(`/api/v1/translation-queue/${button.dataset.approveTranslation}/approve`, { method: "POST", body: { review_notes: "admin-ui" } });
      setToast("Translation approved.");
      renderTranslations();
    }));
    content.querySelectorAll("[data-edit-translation]").forEach((button) => button.addEventListener("click", async () => {
      const item = items.find((row) => String(row.id) === button.dataset.editTranslation);
      const reviewed = window.prompt("Reviewed text", item.reviewed_text || item.ai_draft || item.source_text);
      if (reviewed) {
        await api(`/api/v1/translation-queue/${item.id}/manual-edit`, { method: "POST", body: { reviewed_text: reviewed, review_notes: "admin-ui" } });
        setToast("Translation edited.");
        renderTranslations();
      }
    }));
    content.querySelectorAll("[data-reject-translation]").forEach((button) => button.addEventListener("click", async () => {
      await api(`/api/v1/translation-queue/${button.dataset.rejectTranslation}/reject`, { method: "POST", body: { review_notes: "admin-ui" } });
      setToast("Translation rejected.");
      renderTranslations();
    }));
    content.querySelectorAll("[data-retranslate]").forEach((button) => button.addEventListener("click", async () => {
      await api(`/api/v1/translation-queue/${button.dataset.retranslate}/retranslate`, { method: "POST" });
      setToast("Retranslate job queued.");
      renderTranslations();
    }));
  }

  function mappingDraftKey(row) {
    return [
      row.project_id,
      row.direction_from,
      row.direction_to,
      row.mapping_type,
      row.from_value,
    ].join("|");
  }

  function mappingDraftValue(row, field, fallback) {
    const draft = state.mappingDrafts[mappingDraftKey(row)];
    if (draft && Object.prototype.hasOwnProperty.call(draft, field)) {
      return draft[field];
    }

    return fallback;
  }

  function setMappingDraft(row, field, value) {
    const key = mappingDraftKey(row);
    state.mappingDrafts[key] = {
      ...(state.mappingDrafts[key] || {}),
      [field]: value,
    };
  }

  function clearMappingDraft(row) {
    delete state.mappingDrafts[mappingDraftKey(row)];
  }

  function currentMappingValues(row) {
    return {
      from_value: mappingDraftValue(row, "from_value", row.from_value),
      to_value: mappingDraftValue(row, "to_value", row.to_value),
    };
  }

  function mappingRuleStatus(row) {
    const current = currentMappingValues(row);
    const originalFromValue = row.existing_rule ? row.existing_rule.from_value : row.from_value;
    const originalToValue = row.existing_rule ? row.existing_rule.to_value : row.to_value;
    const hasDraftChange = String(current.from_value || "") !== String(originalFromValue || "") ||
      String(current.to_value || "") !== String(originalToValue || "");

    if (hasDraftChange) {
      return badge("unsaved");
    }

    return row.existing_rule ? badge(row.existing_rule.approval_status) : badge("not set");
  }

  function cisValueSelect(row, index) {
    const options = row.cis_values || [];
    const currentValue = mappingDraftValue(row, "to_value", row.to_value);
    const selectedValue = options.some((option) => String(option.value) === String(currentValue)) ? currentValue : "";
    const placeholder = selectedValue ? "" : `<option value="">Select CIS value</option>`;
    return `<select data-mapping-value="${index}" aria-label="CIS value">${placeholder}${strictSelectOptions(options, selectedValue)}</select>`;
  }

  function systemValueSelect(row, index, dataName, selectedValue) {
    const field = dataName === "source-system-value" ? "from_value" : "to_value";
    const currentValue = mappingDraftValue(row, field, selectedValue);
    const options = ensureCurrentOption(row.system_values || [], currentValue);
    return `<select data-${dataName}="${index}" aria-label="System value">${selectOptions(options, currentValue)}</select>`;
  }

  function rowsForMappingType(rows, mappingType) {
    return rows
      .map((row, index) => ({ ...row, originalIndex: index }))
      .filter((row) => row.mapping_type === mappingType);
  }

  function sourceMappingColumnBlocks(settings, sourceRows) {
    return (settings.mapping_types || [])
      .map((mappingType) => {
        const sourceFieldRows = rowsForMappingType(sourceRows, mappingType.key);
        if (sourceFieldRows.length === 0) {
          return "";
        }

        return `
          <div class="mapping-field-block">
            <h3>${escapeHtml(mappingType.label)}${mappingType.required_for_jira ? ` ${badge("required")}` : ""}</h3>
            ${table(["System value", "CIS value", "Seen", "Status", ""], sourceFieldRows.map((row) => `
              <tr>
                <td>${systemValueSelect(row, row.originalIndex, "source-system-value", row.from_value)}</td>
                <td>${cisValueSelect(row, row.originalIndex)}</td>
                <td>${escapeHtml(row.issue_count)}</td>
                <td>${mappingRuleStatus(row)}</td>
                <td><button class="link-button" data-save-source-mapping="${row.originalIndex}" type="button">Save setting</button></td>
              </tr>`), "No system values")}
          </div>`;
      })
      .filter(Boolean)
      .join("");
  }

  function targetMappingColumnBlocks(settings, targetRows) {
    return (settings.mapping_types || [])
      .map((mappingType) => {
        const targetFieldRows = rowsForMappingType(targetRows, mappingType.key);
        if (targetFieldRows.length === 0) {
          return "";
        }

        return `
          <div class="mapping-field-block">
            <h3>${escapeHtml(mappingType.label)}${mappingType.required_for_jira ? ` ${badge("required")}` : ""}</h3>
            ${table(["CIS value", "System value", "Status", ""], targetFieldRows.map((row) => `
              <tr>
                <td>${escapeHtml(row.from_label || row.from_value)}</td>
                <td>${systemValueSelect(row, row.originalIndex, "target-system-value", row.to_value)}</td>
                <td>${mappingRuleStatus(row)}</td>
                <td><button class="link-button" data-save-target-mapping="${row.originalIndex}" type="button">Save setting</button></td>
              </tr>`), "No CIS values")}
          </div>`;
      })
      .filter(Boolean)
      .join("");
  }

  function refreshMappingRowStatus(button, row) {
    const tableRow = button.closest("tr");
    if (!tableRow) {
      return;
    }

    const cells = tableRow.querySelectorAll("td");
    if (cells.length >= 2) {
      cells[cells.length - 2].innerHTML = mappingRuleStatus(row);
    }
  }

  async function saveMappingSetting(row, fromValue, toValue, messages = {}) {
    if (!fromValue) {
      throw new Error(messages.fromRequired || "System value is required.");
    }

    if (!toValue) {
      throw new Error(messages.toRequired || "Mapping value is required.");
    }

    if (row.existing_rule) {
      const body = { from_value: fromValue, to_value: toValue, approval_status: "approved" };
      await api(`/api/v1/mapping-rules/${row.existing_rule.id}`, { method: "PATCH", body });
      return;
    }

    await api("/api/v1/mapping-rules", {
      method: "POST",
      body: {
        project_id: Number(row.project_id),
        mapping_type: row.mapping_type,
        direction_from: row.direction_from,
        direction_to: row.direction_to,
        from_value: fromValue,
        to_value: toValue,
        approval_status: "approved",
      },
    });
  }

  function systemLabel(systems, value) {
    const match = (systems || []).find((system) => system.value === value);
    return match ? match.label : value;
  }

  async function pullMappingValuesForSystem(projectId, system) {
    if (system === "backlog") {
      return api(`/api/v1/projects/${projectId}/backlog/mapping-values/pull`, { method: "POST" });
    }

    if (system === "jira") {
      return api(`/api/v1/projects/${projectId}/jira/mapping-values/pull`, { method: "POST" });
    }

    throw new Error(`Pull mapping values is not supported for system '${system}'.`);
  }

  async function renderMappings() {
    $("#activeTitle").textContent = "Mappings";
    const projects = await api("/api/v1/projects");
    const selected = projects.find((project) => String(project.id) === String(state.selectedMappingProjectId)) || projects[0] || null;
    state.selectedMappingProjectId = selected ? String(selected.id) : "";

    const qs = new URLSearchParams();
    if (selected) qs.set("project_id", selected.id);
    qs.set("source_system", state.mappingSourceSystem);
    qs.set("target_system", state.mappingTargetSystem);

    const settings = await api(`/api/v1/mapping-settings?${qs.toString()}`);
    const sourceRows = settings.flows.systems_to_cis || [];
    const targetRows = settings.flows.cis_to_system || [];
    const systemOptions = (selectedValue) => selectOptions(settings.systems || [], selectedValue);
    const sourceSystemLabel = systemLabel(settings.systems, state.mappingSourceSystem);
    const targetSystemLabel = systemLabel(settings.systems, state.mappingTargetSystem);

    content.innerHTML = `
      <section class="panel">
        <div class="panel-header">
          <h2>Mapping Settings</h2>
          <div class="toolbar">
            <label>Project<select id="mappingProjectFilter">${projectSelectOptions(projects, state.selectedMappingProjectId)}</select></label>
          </div>
        </div>
      </section>
      <section class="grid cols-2">
        <div class="panel">
          <div class="panel-header">
            <h2>SYS -> CIS</h2>
            <div class="toolbar">
              <label>Source<select id="mappingSourceSystem">${systemOptions(state.mappingSourceSystem)}</select></label>
              <button id="pullSourceMappingValuesButton" type="button" ${selected ? "" : "disabled"}>Pull ${escapeHtml(sourceSystemLabel)} fields</button>
            </div>
          </div>
          <div class="panel-body mapping-column">${sourceMappingColumnBlocks(settings, sourceRows) || `<div class="empty">No system values</div>`}</div>
        </div>
        <div class="panel">
          <div class="panel-header">
            <h2>CIS -> SYS</h2>
            <div class="toolbar">
              <label>Target<select id="mappingTargetSystem">${systemOptions(state.mappingTargetSystem)}</select></label>
              <button id="pullTargetMappingValuesButton" type="button" ${selected ? "" : "disabled"}>Pull ${escapeHtml(targetSystemLabel)} fields</button>
            </div>
          </div>
          <div class="panel-body mapping-column">${targetMappingColumnBlocks(settings, targetRows) || `<div class="empty">No CIS values</div>`}</div>
        </div>
      </section>`;

    $("#mappingProjectFilter").addEventListener("change", (event) => {
      state.selectedMappingProjectId = event.target.value;
      state.mappingDrafts = {};
      renderMappings();
    });
    $("#pullSourceMappingValuesButton").addEventListener("click", async () => {
      if (!selected) return;
      try {
        await pullMappingValuesForSystem(selected.id, state.mappingSourceSystem);
        state.mappingDrafts = {};
        setToast(`${sourceSystemLabel} mapping fields pulled.`);
        renderMappings();
      } catch (error) {
        setToast(error.message, true);
      }
    });
    $("#pullTargetMappingValuesButton").addEventListener("click", async () => {
      if (!selected) return;
      try {
        await pullMappingValuesForSystem(selected.id, state.mappingTargetSystem);
        state.mappingDrafts = {};
        setToast(`${targetSystemLabel} mapping fields pulled.`);
        renderMappings();
      } catch (error) {
        setToast(error.message, true);
      }
    });
    $("#mappingSourceSystem").addEventListener("change", (event) => {
      state.mappingSourceSystem = event.target.value;
      state.mappingDrafts = {};
      renderMappings();
    });
    $("#mappingTargetSystem").addEventListener("change", (event) => {
      state.mappingTargetSystem = event.target.value;
      state.mappingDrafts = {};
      renderMappings();
    });
    content.querySelectorAll("[data-source-system-value]").forEach((select) => select.addEventListener("change", () => {
      const index = Number(select.dataset.sourceSystemValue);
      setMappingDraft(sourceRows[index], "from_value", select.value);
      refreshMappingRowStatus(select, sourceRows[index]);
    }));
    content.querySelectorAll("[data-mapping-value]").forEach((select) => select.addEventListener("change", () => {
      const index = Number(select.dataset.mappingValue);
      setMappingDraft(sourceRows[index], "to_value", select.value);
      refreshMappingRowStatus(select, sourceRows[index]);
    }));
    content.querySelectorAll("[data-target-system-value]").forEach((select) => select.addEventListener("change", () => {
      const index = Number(select.dataset.targetSystemValue);
      setMappingDraft(targetRows[index], "to_value", select.value);
      refreshMappingRowStatus(select, targetRows[index]);
    }));
    content.querySelectorAll("[data-save-source-mapping]").forEach((button) => button.addEventListener("click", async () => {
      const index = Number(button.dataset.saveSourceMapping);
      const fromSelect = content.querySelector(`[data-source-system-value="${index}"]`);
      const toInput = content.querySelector(`[data-mapping-value="${index}"]`);
      try {
        await saveMappingSetting(sourceRows[index], fromSelect.value.trim(), toInput.value.trim(), {
          toRequired: "Choose a CIS value before saving.",
        });
        clearMappingDraft(sourceRows[index]);
        setToast("Mapping setting saved.");
        renderMappings();
      } catch (error) {
        setToast(error.message, true);
        if (error.message === "Choose a CIS value before saving.") {
          toInput.focus();
        }
      }
    }));
    content.querySelectorAll("[data-save-target-mapping]").forEach((button) => button.addEventListener("click", async () => {
      const index = Number(button.dataset.saveTargetMapping);
      const toSelect = content.querySelector(`[data-target-system-value="${index}"]`);
      try {
        await saveMappingSetting(targetRows[index], targetRows[index].from_value, toSelect.value.trim(), {
          toRequired: "Choose a system value before saving.",
        });
        clearMappingDraft(targetRows[index]);
        setToast("Mapping setting saved.");
        renderMappings();
      } catch (error) {
        setToast(error.message, true);
        if (error.message === "Choose a system value before saving.") {
          toSelect.focus();
        }
      }
    }));
  }

  async function renderAnomalies() {
    $("#activeTitle").textContent = "Anomalies";
    const anomalies = await api("/api/v1/anomalies");
    content.innerHTML = `
      <section class="panel">
        <div class="panel-header"><h2>Anomaly list</h2></div>
        ${table(["ID", "Issue", "Type", "Severity", "Status", "Details", "Actions"], anomalies.map((item) => `
          <tr>
            <td>${escapeHtml(item.id)}</td>
            <td>${escapeHtml(item.issue_id || "")}</td>
            <td>${escapeHtml(item.anomaly_type)}</td>
            <td>${badge(item.severity)}</td>
            <td>${badge(item.status)}</td>
            <td><pre>${json(item.details_json)}</pre></td>
            <td class="actions"><button class="link-button" data-resolve-anomaly="${item.id}" type="button">Resolve</button><button class="link-button" data-ignore-anomaly="${item.id}" type="button">Ignore</button></td>
          </tr>`), "No anomalies")}
      </section>`;
    content.querySelectorAll("[data-resolve-anomaly]").forEach((button) => button.addEventListener("click", async () => {
      await api(`/api/v1/anomalies/${button.dataset.resolveAnomaly}/resolve`, { method: "POST" });
      setToast("Anomaly resolved.");
      renderAnomalies();
    }));
    content.querySelectorAll("[data-ignore-anomaly]").forEach((button) => button.addEventListener("click", async () => {
      await api(`/api/v1/anomalies/${button.dataset.ignoreAnomaly}/ignore`, { method: "POST" });
      setToast("Anomaly ignored.");
      renderAnomalies();
    }));
  }

  async function renderJobs() {
    $("#activeTitle").textContent = "Sync Jobs";
    const projects = await api("/api/v1/projects");
    const qs = new URLSearchParams();
    if (state.selectedJobsProjectId) qs.set("project_id", state.selectedJobsProjectId);
    const jobs = await api(`/api/v1/sync-jobs?${qs.toString()}`);
    content.innerHTML = `
      <section class="panel">
        <div class="panel-header">
          <h2>Job queue</h2>
          <div class="toolbar"><label>Project<select id="jobsProjectFilter">${projectSelectOptions(projects, state.selectedJobsProjectId)}</select></label></div>
        </div>
        ${table(["ID", "Project", "Source issue", "Target issue", "Type", "Direction", "Status", "Created", "Succeeded", "Error", "Actions"], jobs.map((job) => `
          <tr>
            <td>${escapeHtml(job.id)}</td>
            <td>${escapeHtml(job.project_name || job.project_id)}</td>
            <td>${escapeHtml(job.source_issue_key || "-")}</td>
            <td>${escapeHtml(job.target_issue_key || "-")}</td>
            <td>${escapeHtml(job.job_type)}</td>
            <td>${escapeHtml(job.direction_from)} -> ${escapeHtml(job.direction_to)}</td>
            <td>${badge(job.status)}</td>
            <td>${displayDate(job.created_at)}</td>
            <td>${displayDate(job.success_at)}</td>
            <td>${escapeHtml(job.last_error || "")}</td>
            <td class="actions"><button class="link-button" data-retry-job="${job.id}" type="button">Retry</button><button class="link-button" data-cancel-job="${job.id}" type="button">Cancel</button></td>
          </tr>`), "No sync jobs")}
      </section>`;
    $("#jobsProjectFilter").addEventListener("change", (event) => {
      state.selectedJobsProjectId = event.target.value;
      renderJobs();
    });
    content.querySelectorAll("[data-retry-job]").forEach((button) => button.addEventListener("click", async () => {
      await api(`/api/v1/sync-jobs/${button.dataset.retryJob}/retry`, { method: "POST" });
      setToast("Job retried.");
      renderJobs();
    }));
    content.querySelectorAll("[data-cancel-job]").forEach((button) => button.addEventListener("click", async () => {
      await api(`/api/v1/sync-jobs/${button.dataset.cancelJob}/cancel`, { method: "POST" });
      setToast("Job cancelled.");
      renderJobs();
    }));
  }

  async function renderJournal() {
    $("#activeTitle").textContent = "Journal";
    const projects = await api("/api/v1/projects");
    const qs = new URLSearchParams();
    if (state.selectedJournalProjectId) qs.set("project_id", state.selectedJournalProjectId);
    const entries = await api(`/api/v1/sync-journal?${qs.toString()}`);
    content.innerHTML = `
      <section class="panel">
        <div class="panel-header">
          <h2>Sync journal</h2>
          <div class="toolbar"><label>Project<select id="journalProjectFilter">${projectSelectOptions(projects, state.selectedJournalProjectId)}</select></label></div>
        </div>
        ${table(["ID", "Job", "Project", "Source issue", "Target issue", "Action", "Status", "Direction", "Created", "Succeeded", "Message"], entries.map((entry) => `
          <tr>
            <td>${escapeHtml(entry.id)}</td>
            <td>${escapeHtml(entry.sync_job_id || "")}</td>
            <td>${escapeHtml(entry.project_name || entry.project_id)}</td>
            <td>${escapeHtml(entry.source_issue_key || "-")}</td>
            <td>${escapeHtml(entry.target_issue_key || "-")}</td>
            <td>${escapeHtml(entry.action)}</td>
            <td>${badge(entry.status)}</td>
            <td>${escapeHtml(entry.direction_from)} -> ${escapeHtml(entry.direction_to)}</td>
            <td>${displayDate(entry.created_at)}</td>
            <td>${displayDate(entry.success_at)}</td>
            <td>${escapeHtml(entry.message || entry.error_message || "")}</td>
          </tr>`), "No journal entries")}
      </section>`;
    $("#journalProjectFilter").addEventListener("change", (event) => {
      state.selectedJournalProjectId = event.target.value;
      renderJournal();
    });
  }

  $("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    $("#loginMessage").textContent = "";
    try {
      const result = await api("/api/v1/auth/login", {
        method: "POST",
        body: {
          email: $("#email").value,
          password: $("#password").value,
        },
      });
      state.token = result.token;
      localStorage.setItem("cis_admin_token", state.token);
      showConsole();
    } catch (error) {
      $("#loginMessage").textContent = error.message;
    }
  });

  $("#logoutButton").addEventListener("click", logout);
  $("#refreshButton").addEventListener("click", render);

  if (state.token) {
    api("/api/v1/auth/me").then(showConsole).catch(logout);
  } else {
    showLogin();
  }
}());
