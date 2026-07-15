"use strict";

(() => {
  const AUTH_KEY = "cis_admin_token";
  const PROJECT_KEY = "cis_active_project_id";
  const THEME_KEY = "cis_theme";
  const callbacks = [];
  let context = null;

  class ApiError extends Error {
    constructor(status, payload = {}) {
      super(payload.message || `Request failed with HTTP ${status}.`);
      this.name = "ApiError";
      this.status = status;
      this.code = payload.code || "HTTP_ERROR";
      this.details = payload.details;
      this.correlationId = payload.correlation_id;
    }
  }

  const escape = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const attr = escape;
  const label = (value) => String(value || "—").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  const formatDate = (value) => value ? new Date(value).toLocaleString() : "—";
  const token = () => localStorage.getItem(AUTH_KEY) || "";
  const activeProjectId = () => Number.parseInt(sessionStorage.getItem(PROJECT_KEY) || "", 10) || null;
  const formJson = (form) => Object.fromEntries(new FormData(form).entries());

  function safePath(value) {
    if (!value || !value.startsWith("/") || value.startsWith("//")) return "/backlog-issues";
    const allowed = ["/projects", "/mappings", "/backlog-issues", "/cis-issues", "/translation-queue", "/translation-glossary", "/anomalies", "/sync-jobs", "/journal"];
    try {
      const url = new URL(value, location.origin);
      return allowed.some((route) => url.pathname === route || url.pathname.startsWith(`${route}/`)) ? `${url.pathname}${url.search}` : "/backlog-issues";
    } catch {
      return "/backlog-issues";
    }
  }

  async function api(path, options = {}) {
    if (!path.startsWith("/api/v1/") || path.startsWith("//")) throw new Error("Only relative /api/v1/* paths are allowed.");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeout || 60000);
    const headers = new Headers(options.headers);
    const currentToken = token();
    if (currentToken) headers.set("authorization", `Bearer ${currentToken}`);
    let body = options.body;
    if (body && !(body instanceof FormData) && typeof body !== "string") {
      headers.set("content-type", "application/json");
      body = JSON.stringify(body);
    }
    try {
      const response = await fetch(path, { ...options, body, headers, signal: controller.signal });
      const payload = response.status === 204 ? null : await response.json().catch(() => null);
      if (response.status === 401) {
        localStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(PROJECT_KEY);
      }
      if (!response.ok) throw new ApiError(response.status, payload?.error);
      if (response.status === 204) return undefined;
      if (!payload || !("data" in payload)) throw new ApiError(response.status, { code: "INVALID_ENVELOPE", message: "API response did not contain a data envelope." });
      return payload.data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.name === "AbortError") throw new ApiError(0, { code: "REQUEST_TIMEOUT", message: "The request timed out." });
      throw new ApiError(0, { code: "NETWORK_ERROR", message: error.message || "Network request failed." });
    } finally {
      clearTimeout(timer);
    }
  }

  function state(title, message, action = "") {
    return `<div class="container-xl"><section class="card state-card"><div class="card-body text-center py-6"><div class="state-symbol" aria-hidden="true">◆</div><h1 class="h3 mt-3">${escape(title)}</h1><p class="text-secondary mb-4">${escape(message)}</p>${action}</div></section></div>`;
  }

  function retryLink(labelText = "Retry") {
    return `<a class="btn btn-primary" href="${attr(location.pathname + location.search)}">${escape(labelText)}</a>`;
  }

  function alert(message, tone = "danger") {
    return `<div class="alert alert-${tone}" role="${tone === "danger" ? "alert" : "status"}">${escape(message)}</div>`;
  }

  function badge(value, tone) {
    const normalized = String(value || "unknown").toLowerCase();
    const color = tone || ({ success: "green", approved: "green", resolved: "green", ignored: "green", failed: "red", critical: "red", cancelled: "red", warning: "yellow", pending: "yellow", running: "azure", open: "orange", investigating: "orange" }[normalized] || "secondary");
    return `<span class="badge bg-${color}-lt text-${color}">${escape(value || "unknown")}</span>`;
  }

  function toast(message, tone = "success") {
    const region = document.querySelector("#toast-region");
    if (!region) return;
    const element = document.createElement("div");
    element.className = `toast show text-bg-${tone}`;
    element.setAttribute("role", "status");
    element.innerHTML = `<div class="toast-body">${escape(message)}</div>`;
    region.append(element);
    setTimeout(() => element.remove(), 5000);
  }

  function dialog(labelText, content, className = "") {
    const element = document.createElement("dialog");
    element.className = `cis-dialog ${className}`;
    element.setAttribute("aria-label", labelText);
    element.innerHTML = `<div class="cis-dialog__surface">${content}</div>`;
    document.body.append(element);
    element.addEventListener("close", () => element.remove(), { once: true });
    element.addEventListener("click", (event) => { if (event.target === element) element.close(); });
    element.querySelectorAll("[data-dialog-close]").forEach((button) => button.addEventListener("click", () => element.close()));
    element.showModal();
    requestAnimationFrame(() => (element.querySelector("[data-autofocus], button, a, input, select, textarea") || element).focus());
    return element;
  }

  async function pollJob(id, onUpdate, timeout = 60000) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      const job = await api(`/api/v1/sync-jobs/${encodeURIComponent(id)}`);
      onUpdate?.(job);
      if (["success", "failed", "cancelled"].includes(job.status)) return job;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    const timeoutJob = { id, status: "timeout" };
    onUpdate?.(timeoutJob);
    return timeoutJob;
  }

  function setTheme(value) {
    const theme = value === "dark" ? "dark" : "light";
    document.documentElement.dataset.bsTheme = theme;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    const button = document.querySelector("#theme-toggle");
    if (button) button.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
  }

  function renderWorkspaceGate(message = "Choose or create Project at Projects before opening this workspace.") {
    document.querySelector("#page-content").innerHTML = state("Choose a Project first", message, `<a class="btn btn-primary" href="/projects?next=${encodeURIComponent(location.pathname + location.search)}">Choose or create Project</a>`);
  }

  function ready(callback) {
    if (context) callback(context);
    else callbacks.push(callback);
  }

  async function boot() {
    setTheme(localStorage.getItem(THEME_KEY) || "light");
    const page = document.body.dataset.route;
    if (page === "login") return;
    if (!token()) {
      location.replace(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    document.querySelector("#theme-toggle")?.addEventListener("click", () => setTheme(document.documentElement.dataset.bsTheme === "dark" ? "light" : "dark"));
    document.querySelector("#refresh-route")?.addEventListener("click", () => location.reload());
    document.querySelector("#logout")?.addEventListener("click", async () => {
      try { await api("/api/v1/auth/logout", { method: "POST" }); } catch { /* token removal is authoritative for the UI */ }
      localStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem(PROJECT_KEY);
      location.assign("/login");
    });

    try {
      const [me, projects] = await Promise.all([api("/api/v1/auth/me"), api("/api/v1/projects")]);
      document.querySelector("#admin-email").textContent = me.admin.email;
      const requestedId = activeProjectId();
      const project = projects.find((item) => item.id === requestedId && item.enabled !== false) || null;
      if (!project && requestedId) sessionStorage.removeItem(PROJECT_KEY);
      const projectLink = document.querySelector("#active-project");
      if (projectLink) projectLink.textContent = project ? `${project.name} · #${project.id}` : "Choose Project";
      context = { admin: me.admin, projects, project, projectId: project?.id || null };
      if (page === "dashboard") {
        document.querySelector("#page-content").innerHTML = state("Dashboard unavailable", "Dashboard awaits project-scoped backend support. No summary or alert request was sent.", `<a class="btn btn-primary" href="/projects">Open Projects</a>`);
        return;
      }
      if (page !== "projects" && !project) {
        renderWorkspaceGate();
        return;
      }
      if (project?.enabled === false && page !== "projects") {
        document.querySelector("#page-content").innerHTML = state("Project is disabled", "Re-enable this Project in Project Config before opening its workspace.", `<a class="btn btn-primary" href="/projects?project_id=${project.id}">Open Projects</a>`);
        return;
      }
      callbacks.splice(0).forEach((callback) => callback(context));
    } catch (error) {
      if (error.status === 401) {
        location.replace(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
        return;
      }
      document.querySelector("#page-content").innerHTML = state("Console unavailable", error.message, retryLink());
    }
  }

  window.CIS = { AUTH_KEY, PROJECT_KEY, ApiError, activeProjectId, alert, api, attr, badge, dialog, escape, formJson, formatDate, label, pollJob, ready, retryLink, safePath, state, toast };
  boot();
})();
