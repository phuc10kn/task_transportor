"use strict";

(() => CIS.ready(({ projects: initialProjects, project: activeProject }) => {
  const root = document.querySelector("#page-content");
  const params = new URLSearchParams(location.search);
  let projects = initialProjects;
  let selectedId = Number(params.get("project_id")) || 0;
  let creating = params.get("new") === "1";

  const defaults = {
    name: "", source_language: "ja", target_language: "vi", enabled: true, sync_enabled: false,
    auto_translate: true, require_translation_review: true, require_mapping_approval: true,
    manual_pull_enabled: true, scheduled_pull_enabled: false,
    backlog_external_read_enabled: true, jira_external_read_enabled: true, jira_external_write_enabled: false,
    translation_ai_provider: "deepseek", translation_ai_transport: "openai_compatible", translation_ai_model: "deepseek-v4-flash",
  };
  const textFields = [
    ["name", "Name", "text", true], ["source_language", "Source language", "text", true], ["target_language", "Target language", "text", true],
  ];
  const backlogFields = [["backlog_space_url", "Backlog URL"], ["backlog_project_key", "Backlog project key"], ["backlog_issue_key_prefix", "Backlog issue prefix"], ["backlog_api_key", "Backlog API key", "password"]];
  const jiraFields = [["jira_site_url", "Jira URL"], ["jira_project_key", "Jira project key"], ["jira_email", "Jira email"], ["jira_api_token", "Jira API token", "password"]];
  const flags = [["enabled", "Enabled"], ["sync_enabled", "Sync enabled"], ["auto_translate", "Auto translate"], ["require_translation_review", "Translation review required"], ["require_mapping_approval", "Mapping approval required"], ["manual_pull_enabled", "Manual pull"], ["scheduled_pull_enabled", "Scheduled pull"]];
  const externalFlags = ["backlog_external_read_enabled", "jira_external_read_enabled", "jira_external_write_enabled"];
  const openAiModels = [
    ["gpt-4.1-mini", "gpt-4.1-mini · compatible default"],
    ["gpt-5.4-mini", "gpt-5.4-mini · efficient"],
    ["gpt-5.6-luna", "gpt-5.6-luna · cost-sensitive"],
    ["gpt-5.6-terra", "gpt-5.6-terra · balanced"],
    ["gpt-5.6-sol", "gpt-5.6-sol · highest quality"],
  ];

  const selected = () => projects.find((item) => item.id === selectedId) || null;
  const input = ([name, label, type = "text", required = false], value) => `<div><label class="form-label" for="${name}">${label}</label><input class="form-control" id="${name}" name="${name}" type="${type}" value="${CIS.attr(value ?? "")}" ${required ? "required" : ""}></div>`;

  function projectForm(project) {
    const value = { ...defaults, ...(project || {}) };
    return `<form class="card" id="project-form" data-project-id="${project?.id || ""}">
      <div class="card-header"><div><div class="route-kicker">${project ? `Project #${project.id}` : "New Project"}</div><h2 class="card-title mt-1">${project ? "Configuration" : "Create Project"}</h2></div></div>
      <div class="card-body">
        <div id="project-error"></div>
        <fieldset><legend class="h3">General</legend><div class="row g-3">${textFields.map((field) => `<div class="col-md-4">${input(field, value[field[0]])}</div>`).join("")}</div></fieldset>
        <fieldset class="mt-4"><legend class="h3">Translation AI</legend><div class="row g-3">
          <div class="col-md-4"><label class="form-label" for="translation_ai_provider">Provider</label><select class="form-select" id="translation_ai_provider" name="translation_ai_provider"><option value="deepseek" ${value.translation_ai_provider === "deepseek" ? "selected" : ""}>DeepSeek</option><option value="openai" ${value.translation_ai_provider === "openai" ? "selected" : ""}>OpenAI</option></select></div>
          <div class="col-md-4"><label class="form-label" for="translation_ai_transport">Transport</label><select class="form-select" id="translation_ai_transport" name="translation_ai_transport"></select></div>
          <div class="col-md-4"><label class="form-label" for="translation_ai_model">Model</label><select class="form-select" id="translation_ai_model" name="translation_ai_model"></select></div>
        </div><div id="ai-notice" class="mt-2"></div></fieldset>
        <fieldset class="mt-4"><legend class="h3">Operating policy</legend><div class="row g-2">${flags.map(([name, label]) => `<div class="col-sm-6 col-xl-4"><label class="form-check form-switch policy-switch"><input class="form-check-input" name="${name}" type="checkbox" ${value[name] ? "checked" : ""} ${name === "scheduled_pull_enabled" ? "disabled" : ""}><span class="form-check-label">${label}${name === "scheduled_pull_enabled" ? ' <span class="badge bg-secondary-lt ms-1">Disabled</span>' : ""}</span></label></div>`).join("")}</div><div class="text-secondary small mt-2">Project pull and scheduled pull are disabled; use Pull one or candidate actions.</div></fieldset>
        <div class="row g-3 mt-2">
          <div class="col-xl-6"><details class="card" open><summary class="card-header" aria-label="Backlog connection"><span class="card-title">Backlog source</span></summary><div class="card-body"><div class="row g-3">${backlogFields.map((field) => `<div class="col-sm-6">${input(field, value[field[0]])}</div>`).join("")}</div><div class="border-top mt-4 pt-3"><label class="form-check form-switch policy-switch"><input class="form-check-input" name="backlog_external_read_enabled" type="checkbox" ${value.backlog_external_read_enabled ? "checked" : ""}><span class="form-check-label">Allow external reads</span></label><div class="text-secondary small mt-1">Network access gate; Manual pull remains a separate business policy.</div></div></div></details></div>
          <div class="col-xl-6"><details class="card" open><summary class="card-header" aria-label="Jira connection"><span class="card-title">Jira target</span></summary><div class="card-body"><div class="row g-3">${jiraFields.map((field) => `<div class="col-sm-6">${input(field, value[field[0]])}</div>`).join("")}</div><div class="border-top mt-4 pt-3 d-flex flex-column gap-2"><label class="form-check form-switch policy-switch"><input class="form-check-input" name="jira_external_read_enabled" type="checkbox" ${value.jira_external_read_enabled ? "checked" : ""}><span class="form-check-label">Allow external reads</span></label><label class="form-check form-switch policy-switch"><input class="form-check-input" name="jira_external_write_enabled" type="checkbox" ${value.jira_external_write_enabled ? "checked" : ""}><span class="form-check-label">Allow external writes</span></label><div class="text-secondary small">Network access gates; Sync enabled remains a separate business policy.</div></div></div></details></div>
        </div>
      </div>
      <div class="card-footer d-flex justify-content-end gap-2"><a class="btn btn-ghost-secondary" href="/projects">Cancel</a><button class="btn btn-primary" type="submit">${project ? "Save Project" : "Create Project"}</button>${project ? "" : '<button class="btn btn-primary" name="open_after" value="1" type="submit">Create and open workspace</button>'}</div>
    </form>`;
  }

  function teamCard(project) {
    return `<section class="card mt-4" id="team-card"><div class="card-header"><div><div class="route-kicker">Project access</div><h2 class="card-title mt-1">Team</h2></div>${CIS.badge(project.access?.is_owner ? "owner" : project.access?.team_role || "member", project.access?.is_owner ? "azure" : "secondary")}</div><div class="card-body" id="team-content" aria-busy="true"><span class="spinner-border spinner-border-sm me-2"></span>Loading team…</div></section>`;
  }

  async function loadTeam(project) {
    const region = document.querySelector("#team-content");
    if (!region) return;
    try {
      const team = await CIS.api(`/api/v1/projects/${project.id}/team`);
      const canManage = project.access?.team_role === "lead";
      region.removeAttribute("aria-busy");
      region.innerHTML = `${canManage ? `<form class="row g-2 align-items-end mb-4" id="team-add"><div class="col-md-7"><label class="form-label" for="member-email">Add enabled user by exact email</label><input class="form-control" id="member-email" name="email" type="email" required></div><div class="col-md-3"><label class="form-label" for="member-role">Role</label><select class="form-select" id="member-role" name="role"><option value="member">Member</option><option value="lead">Lead</option></select></div><div class="col-md-2"><button class="btn btn-primary w-100" type="submit">Add</button></div><div class="col-12" id="team-error"></div></form>` : ""}<div class="table-responsive"><table class="table"><thead><tr><th>User</th><th>Team role</th>${canManage ? "<th>Actions</th>" : ""}</tr></thead><tbody>${team.members.map((member) => `<tr><td><strong>${CIS.escape(member.name || member.email)}</strong><div class="text-secondary small">${CIS.escape(member.email)}</div></td><td>${canManage && !member.is_owner ? `<select class="form-select form-select-sm" data-member-role="${member.id}"><option value="member" ${member.role === "member" ? "selected" : ""}>Member</option><option value="lead" ${member.role === "lead" ? "selected" : ""}>Lead</option></select>` : `${CIS.badge(member.role, member.role === "lead" ? "azure" : "secondary")} ${member.is_owner ? CIS.badge("owner", "green") : ""}`}</td>${canManage ? `<td>${member.is_owner ? '<span class="text-secondary small">Protected owner</span>' : `<button class="btn btn-sm btn-outline-danger" type="button" data-remove-member="${member.id}">Remove</button>`}</td>` : ""}</tr>`).join("")}</tbody></table></div>`;
      bindTeam(project);
    } catch (error) { region.innerHTML = CIS.alert(error.message); }
  }

  function bindTeam(project) {
    document.querySelector("#team-add")?.addEventListener("submit", async (event) => {
      event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return;
      try { await CIS.api(`/api/v1/projects/${project.id}/team/members`, { method: "POST", body: CIS.formJson(form) }); CIS.toast("Team member added."); await loadTeam(project); }
      catch (error) { document.querySelector("#team-error").innerHTML = CIS.alert(error.message); }
    });
    document.querySelectorAll("[data-member-role]").forEach((select) => select.addEventListener("change", async () => {
      try { await CIS.api(`/api/v1/projects/${project.id}/team/members/${select.dataset.memberRole}`, { method: "PATCH", body: { role: select.value } }); CIS.toast("Team role updated."); await loadTeam(project); }
      catch (error) { CIS.toast(error.message, "danger"); await loadTeam(project); }
    }));
    document.querySelectorAll("[data-remove-member]").forEach((button) => button.addEventListener("click", async () => {
      if (!confirm("Remove this user from the Project team?")) return;
      try { await CIS.api(`/api/v1/projects/${project.id}/team/members/${button.dataset.removeMember}`, { method: "DELETE" }); CIS.toast("Team member removed."); await loadTeam(project); }
      catch (error) { CIS.toast(error.message, "danger"); }
    }));
  }

  function render() {
    const current = selected();
    root.innerHTML = `<div class="container-xl">
      <div class="page-heading"><div><div class="route-kicker">Workspace authority</div><h1>Projects</h1><p class="text-secondary mb-0">Configure integrations, then explicitly open one enabled Project.</p></div><a class="btn btn-primary" href="/projects?new=1">New Project</a></div>
      ${activeProject ? `<div class="alert alert-blue" role="status">Active workspace: <strong>${CIS.escape(activeProject.name)} · #${activeProject.id}</strong></div>` : ""}
      <div class="row g-4"><div class="col-xl-4"><section class="card"><div class="card-header"><h2 class="card-title">Project directory</h2><span class="badge bg-secondary-lt ms-auto">${projects.length}</span></div><div class="list-group list-group-flush">
        ${projects.length ? projects.map((project) => `<div class="list-group-item"><div class="d-flex align-items-start gap-3"><a class="flex-fill text-reset text-decoration-none" href="/projects?project_id=${project.id}"><strong>${CIS.escape(project.name)}</strong><div class="text-secondary small mt-1">${CIS.escape(project.backlog_project_key || "No Backlog")} · ${CIS.escape(project.jira_project_key || "No Jira")} · ${project.enabled === false ? "Disabled" : "Enabled"}</div></a><button class="btn btn-sm btn-outline-primary" type="button" data-open-project="${project.id}" ${project.enabled === false ? 'disabled title="Bật Project trong cấu hình trước khi mở workspace"' : ""}>${project.enabled === false ? "Workspace disabled" : "Open workspace"}</button></div></div>`).join("") : '<div class="card-body text-secondary">No projects configured.</div>'}
      </div></section></div><div class="col-xl-8">${creating ? projectForm(null) : current ? `${projectForm(current)}${teamCard(current)}` : CIS.state("Select a Project", "Choose a Project from the directory or create a new one.")}</div></div>
    </div>`;
    bind();
  }

  function syncAiControls(saved = {}) {
    const provider = document.querySelector("#translation_ai_provider");
    const transport = document.querySelector("#translation_ai_transport");
    const model = document.querySelector("#translation_ai_model");
    if (!provider) return;
    const deepseek = provider.value === "deepseek";
    const openai = provider.value === "openai";
    transport.innerHTML = deepseek ? '<option value="openai_compatible">OpenAI compatible</option><option value="anthropic_compatible">Anthropic compatible</option>' : '<option value="openai_compatible">OpenAI compatible</option>';
    transport.value = deepseek && ["openai_compatible", "anthropic_compatible"].includes(saved.transport) ? saved.transport : "openai_compatible";
    model.innerHTML = deepseek ? '<option value="deepseek-v4-flash">deepseek-v4-flash</option><option value="deepseek-v4-pro">deepseek-v4-pro</option><option value="deepseek-chat">deepseek-chat (deprecated soon)</option>' : openAiModels.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
    model.disabled = false;
    if (deepseek && ["deepseek-v4-flash", "deepseek-v4-pro", "deepseek-chat"].includes(saved.model)) model.value = saved.model;
    if (openai && openAiModels.some(([value]) => value === saved.model)) model.value = saved.model;
    const notice = document.querySelector("#ai-notice");
    notice.innerHTML = openai ? '<div class="text-secondary small" role="status">OpenAI credentials are read from <code>OPENAI_API_KEY</code> on the API server and are never stored in this Project.</div>' : model.value === "deepseek-chat" ? CIS.alert("Deprecated soon: choose a DeepSeek v4 model for new configuration.", "warning") : "";
  }

  function bind() {
    document.querySelectorAll("[data-open-project]").forEach((button) => button.addEventListener("click", () => {
      const id = Number(button.dataset.openProject);
      sessionStorage.setItem(CIS.PROJECT_KEY, String(id));
      location.assign(CIS.workspacePath(params.get("next"), id));
    }));
    const form = document.querySelector("#project-form");
    if (!form) return;
    const current = selected() || defaults;
    if (selected()) void loadTeam(selected());
    syncAiControls({ transport: current.translation_ai_transport, model: current.translation_ai_model });
    if (selected() && !selected().access?.is_owner) {
      form.querySelectorAll("input, select, button[type=submit]").forEach((control) => { control.disabled = true; });
      document.querySelector("#project-error").innerHTML = CIS.alert("Only the Project owner can change Project configuration.", "warning");
    }
    document.querySelector("#translation_ai_provider").addEventListener("change", () => syncAiControls());
    document.querySelector("#translation_ai_model").addEventListener("change", () => syncAiControls({ transport: document.querySelector("#translation_ai_transport").value, model: document.querySelector("#translation_ai_model").value }));
    let dirty = false;
    form.addEventListener("input", () => { dirty = true; });
    addEventListener("beforeunload", (event) => { if (dirty) event.preventDefault(); });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const submitter = event.submitter;
      const raw = CIS.formJson(form);
      flags.forEach(([name]) => { raw[name] = form.elements[name].checked; });
      externalFlags.forEach((name) => { raw[name] = form.elements[name].checked; });
      const id = Number(form.dataset.projectId) || null;
      const errorRegion = document.querySelector("#project-error");
      errorRegion.innerHTML = "";
      submitter.disabled = true;
      try {
        const saved = await CIS.api(id ? `/api/v1/projects/${id}` : "/api/v1/projects", { method: id ? "PATCH" : "POST", body: raw });
        dirty = false;
        projects = projects.some((item) => item.id === saved.id) ? projects.map((item) => item.id === saved.id ? saved : item) : [...projects, saved];
        selectedId = saved.id;
        creating = false;
        if (submitter.value === "1" && saved.enabled !== false) {
          sessionStorage.setItem(CIS.PROJECT_KEY, String(saved.id));
          location.assign(CIS.workspacePath(params.get("next"), saved.id));
          return;
        }
        history.replaceState(null, "", `/projects?project_id=${saved.id}`);
        render();
        CIS.toast(`Project ${saved.name} saved.`);
      } catch (error) {
        errorRegion.innerHTML = CIS.alert(error.message);
        const field = error.details?.field;
        if (field && form.elements[field]) form.elements[field].focus();
      } finally {
        submitter.disabled = false;
      }
    });
  }

  render();
}))();
