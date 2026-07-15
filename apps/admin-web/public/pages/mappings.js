"use strict";

(() => CIS.ready(async ({ project }) => {
  const root = document.querySelector("#page-content");
  const params = new URLSearchParams(location.search);
  const source = params.get("source_system") || "backlog";
  const target = params.get("target_system") || "jira";
  let settings;
  let error = "";
  const collapsedGroups = new Set();

  function header() {
    return `<div class="page-heading"><div><div class="route-kicker">Canonical governance</div><h1>Mappings</h1><p class="text-secondary mb-0">Review explicit System → CIS and CIS → System vocabulary.</p></div><div class="flow-rail"><span>${CIS.escape(source.toUpperCase())}</span><strong>→ CIS →</strong><span>${CIS.escape(target.toUpperCase())}</span></div></div>`;
  }

  function row(item, flow) {
    const key = `${flow}:${item.mapping_type}:${item.from_value}`;
    const values = flow === "source" ? item.cis_values : item.system_values;
    const status = item.existing_rule?.approval_status || "not set";
    const canApprove = Boolean(item.to_value) && status !== "approved";
    return `<tr data-mapping="${CIS.attr(key)}"><td data-label="From"><code>${CIS.escape(item.from_label || item.from_value)}</code><div class="text-secondary small">${item.issue_count || 0} issues</div></td><td data-label="To"><select class="form-select form-select-sm" aria-label="Map ${CIS.attr(item.from_value)}" data-initial-value="${CIS.attr(item.to_value || "")}"><option value="">Not mapped</option>${(values || []).map((option) => { const value = option.value ?? option; const optionLabel = option.label ?? option.name ?? value; return `<option value="${CIS.attr(value)}" ${String(value) === String(item.to_value || "") ? "selected" : ""}>${CIS.escape(optionLabel)}</option>`; }).join("")}</select></td><td data-label="Status">${CIS.badge(status)}</td><td data-label="Actions"><div class="table-actions"><button class="btn btn-sm ${canApprove ? "btn-primary" : "btn-outline-secondary"}" data-save type="button" ${canApprove ? "" : "disabled"}>Save</button></div><div class="job-evidence" aria-live="polite"></div></td></tr>`;
  }

  function groups(items) {
    return [...items.reduce((result, item) => {
      if (!result.has(item.mapping_type)) result.set(item.mapping_type, { key: item.mapping_type, label: item.mapping_label || CIS.label(item.mapping_type), items: [] });
      result.get(item.mapping_type).items.push(item);
      return result;
    }, new Map()).values()];
  }

  function groupRows(group, flow) {
    const id = `${flow}:${group.key}`;
    const collapsed = collapsedGroups.has(id);
    const required = group.items.some((item) => item.required_for_jira);
    const issueCount = group.items.reduce((total, item) => total + Number(item.issue_count || 0), 0);
    return `<tbody data-mapping-group="${CIS.attr(id)}"><tr class="mapping-group-row"><th class="mapping-group-cell" colspan="4" scope="rowgroup"><button class="mapping-group-toggle" type="button" data-toggle-mapping-group aria-expanded="${collapsed ? "false" : "true"}"><span class="mapping-group-toggle__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span><span class="mapping-group-title">${CIS.escape(group.label)}${required ? '<span class="mapping-field-required" title="Required for Jira" aria-label="Required for Jira">*</span>' : ""}</span><span class="mapping-group-meta">${group.items.length} values · ${issueCount} issues</span></button></th></tr>${group.items.map((item) => row(item, flow).replace("<tr ", `<tr ${collapsed ? "hidden " : ""}`)).join("")}</tbody>`;
  }

  function flowCard(title, description, items, flow) {
    const requiredLegend = items.some((item) => item.required_for_jira) ? '<span class="text-danger small">* Required for Jira</span>' : "";
    const fieldGroups = groups(items);
    return `<section class="card mapping-flow" data-mapping-flow="${CIS.attr(flow)}"><div class="card-header"><div><h2 class="card-title">${title}</h2><div class="text-secondary small mt-1">${description}</div></div><div class="mapping-flow__meta ms-auto">${requiredLegend}<span class="badge bg-secondary-lt">${fieldGroups.length} fields · ${items.length} mappings</span></div></div>${items.length ? `<div class="table-responsive"><table class="table table-vcenter responsive-table mapping-table"><thead><tr><th>From</th><th>To</th><th>Status</th><th>Actions</th></tr></thead>${fieldGroups.map((group) => groupRows(group, flow)).join("")}</table></div>` : '<div class="card-body text-secondary">No mapping candidates found. Pull source fields first.</div>'}</section>`;
  }

  function render() {
    root.innerHTML = `<div class="container-xl">${header()}${error ? CIS.alert(error) : ""}
      <section class="card toolbar-card"><div class="card-body"><div class="d-flex flex-wrap align-items-center gap-2"><button class="btn btn-primary" id="pull-backlog" type="button">Pull Backlog fields</button><button class="btn btn-outline-primary" id="pull-jira" type="button">Pull Jira fields</button><button class="btn btn-outline-secondary" id="sync-cis" type="button">Sync CIS catalog from Jira</button><span class="text-secondary ms-auto">${CIS.escape(project.name)} · #${project.id}</span></div><div id="mapping-notice" class="mt-3"></div></div></section>
      ${flowCard(`${CIS.label(source)} → CIS`, "Normalize source vocabulary into canonical CIS values.", settings?.flows?.systems_to_cis || [], "source")}
      ${flowCard(`CIS → ${CIS.label(target)}`, "Prepare approved target vocabulary for outbound dry-run.", settings?.flows?.cis_to_system || [], "target")}
    </div>`;
    bind();
  }

  async function load() {
    root.innerHTML = `<div class="container-xl">${header()}<section class="card state-card" aria-busy="true"><div class="card-body"><span class="spinner-border spinner-border-sm me-2"></span>Loading mapping settings…</div></section></div>`;
    try {
      settings = await CIS.api(`/api/v1/mapping-settings?project_id=${project.id}&source_system=${encodeURIComponent(source)}&target_system=${encodeURIComponent(target)}`);
      error = "";
      render();
    } catch (failure) {
      error = failure.message;
      root.innerHTML = CIS.state("Mappings unavailable", error, '<button class="btn btn-primary" id="retry" type="button">Retry</button>');
      document.querySelector("#retry").addEventListener("click", load);
    }
  }

  async function refreshCatalog(button, path, success) {
    const notice = document.querySelector("#mapping-notice");
    button.disabled = true;
    notice.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Refreshing server catalog…';
    try {
      const result = await CIS.api(path, { method: "POST", body: path.includes("/cis/") ? { target_system: target } : undefined });
      const warnings = result?.warnings || [];
      await load();
      const region = document.querySelector("#mapping-notice");
      if (region) region.innerHTML = CIS.alert(warnings.length ? `${success} ${warnings.length} catalog warning(s) require review.` : success, warnings.length ? "warning" : "success");
    } catch (failure) {
      notice.innerHTML = CIS.alert(failure.message);
      button.disabled = false;
    }
  }

  function bind() {
    document.querySelector("#pull-backlog").addEventListener("click", (event) => refreshCatalog(event.currentTarget, `/api/v1/projects/${project.id}/backlog/mapping-values/pull`, "Backlog catalog refreshed."));
    document.querySelector("#pull-jira").addEventListener("click", (event) => refreshCatalog(event.currentTarget, `/api/v1/projects/${project.id}/jira/mapping-values/pull`, "Jira catalog refreshed."));
    document.querySelector("#sync-cis").addEventListener("click", (event) => refreshCatalog(event.currentTarget, `/api/v1/projects/${project.id}/cis/mapping-values/sync`, "CIS catalog synchronized."));
    document.querySelectorAll("[data-mapping-group]").forEach((group) => group.querySelector("[data-toggle-mapping-group]").addEventListener("click", (event) => {
      const collapsed = event.currentTarget.getAttribute("aria-expanded") === "true";
      event.currentTarget.setAttribute("aria-expanded", String(!collapsed));
      group.querySelectorAll("[data-mapping]").forEach((item) => { item.hidden = collapsed; });
      if (collapsed) collapsedGroups.add(group.dataset.mappingGroup); else collapsedGroups.delete(group.dataset.mappingGroup);
    }));
    const itemsByKey = new Map([...(settings.flows?.systems_to_cis || []).map((item) => [`source:${item.mapping_type}:${item.from_value}`, item]), ...(settings.flows?.cis_to_system || []).map((item) => [`target:${item.mapping_type}:${item.from_value}`, item])]);
    document.querySelectorAll("[data-mapping]").forEach((element) => {
      const item = itemsByKey.get(element.dataset.mapping);
      const evidence = element.querySelector(".job-evidence");
      const select = element.querySelector("select");
      const save = element.querySelector("[data-save]");
      select.addEventListener("change", () => {
        const dirty = select.value !== select.dataset.initialValue;
        const canApprove = Boolean(select.value) && item.existing_rule?.approval_status !== "approved";
        element.classList.toggle("is-dirty", dirty);
        save.disabled = !dirty && !canApprove;
        save.classList.toggle("btn-primary", dirty || canApprove);
        save.classList.toggle("btn-outline-secondary", !dirty && !canApprove);
      });
      save.addEventListener("click", async (event) => {
        event.currentTarget.disabled = true;
        try {
          const body = { to_value: select.value };
          const path = item.existing_rule ? `/api/v1/mapping-rules/${item.existing_rule.id}` : "/api/v1/mapping-rules";
          if (!item.existing_rule) Object.assign(body, { project_id: item.project_id, mapping_type: item.mapping_type, direction_from: item.direction_from, direction_to: item.direction_to, from_value: item.from_value });
          const saved = await CIS.api(path, { method: item.existing_rule ? "PATCH" : "POST", body });
          if (saved.approval_status !== "approved") await CIS.api(`/api/v1/mapping-rules/${saved.id}/approve`, { method: "POST" });
          await load();
          CIS.toast("Mapping saved.");
        } catch (failure) { evidence.innerHTML = `<span class="text-danger">${CIS.escape(failure.message)}</span>`; event.currentTarget.disabled = false; }
      });
    });
  }

  load();
}))();
