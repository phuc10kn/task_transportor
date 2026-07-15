"use strict";

const nav = [
  ["/dashboard", "Dashboard", true],
  ["/projects", "Projects"],
  ["/mappings", "Mappings"],
  ["/backlog-issues", "Backlog Issues"],
  ["/cis-issues", "CIS Issues"],
  ["/translation-queue", "Translation Queue"],
  ["/translation-glossary", "Translation Glossary"],
  ["/anomalies", "Anomalies"],
  ["/sync-jobs", "Sync Jobs"],
  ["/journal", "Journal"],
];

function navItems(pathname) {
  return nav.map(([href, label, disabled]) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    if (disabled) return `<li class="nav-item"><span class="nav-link disabled" title="Dashboard awaits project-scoped backend support" aria-disabled="true"><span class="nav-link-title">${label}</span></span></li>`;
    return `<li class="nav-item${active ? " active" : ""}"><a class="nav-link${active ? " active" : ""}" href="${href}"><span class="nav-link-title">${label}</span></a></li>`;
  }).join("");
}

function loginBody() {
  return `<main class="page page-center login-page" id="page-content" data-page="login">
    <div class="container container-tight py-4">
      <div class="text-center mb-4"><span class="brand-mark">CIS</span></div>
      <form class="card card-md" id="login-form" novalidate>
        <div class="card-body">
          <div class="route-kicker">System → CIS → System</div>
          <h1 class="h2 text-center mb-2">Operations Console</h1>
          <p class="text-secondary text-center mb-4">Sign in to review, approve and recover synchronization work.</p>
          <div id="login-error"></div>
          <div class="mb-3"><label class="form-label" for="email">Email</label><input class="form-control" id="email" name="email" type="email" autocomplete="username" required></div>
          <div class="mb-3"><label class="form-label" for="password">Password</label><input class="form-control" id="password" name="password" type="password" autocomplete="current-password" required></div>
          <button class="btn btn-primary w-100" type="submit">Sign in</button>
        </div>
      </form>
      <div class="text-center text-secondary mt-3"><a href="/api/v1/health">Verify API proxy</a></div>
    </div>
  </main>`;
}

function consoleBody(route, pathname) {
  return `<div class="page" id="console-shell">
    <aside class="navbar navbar-vertical navbar-expand-lg">
      <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#sidebar-menu" aria-controls="sidebar-menu" aria-expanded="false" aria-label="Open navigation"><span class="navbar-toggler-icon"></span></button>
        <a class="navbar-brand navbar-brand-autodark" href="/projects" aria-label="CIS Operations Console"><span class="brand-mark brand-mark--sidebar">CIS</span><span class="brand-copy">Operations<br><small>Central Sync Hub</small></span></a>
        <div class="collapse navbar-collapse" id="sidebar-menu"><nav aria-label="Primary"><ul class="navbar-nav pt-lg-3">${navItems(pathname)}</ul></nav></div>
        <div class="sidebar-context">
          <div class="route-kicker">System → CIS → System</div>
          <a href="/projects" id="active-project">Choose Project</a>
        </div>
      </div>
    </aside>
    <div class="page-wrapper">
      <header class="navbar navbar-expand-md d-print-none app-toolbar"><div class="container-xl">
        <div class="navbar-nav flex-row order-md-last ms-auto gap-2">
          <button class="btn btn-icon btn-ghost-secondary" id="refresh-route" type="button" aria-label="Refresh current route" title="Refresh current route">↻</button>
          <button class="btn btn-icon btn-ghost-secondary" id="theme-toggle" type="button" aria-label="Switch to dark mode" title="Toggle theme">◐</button>
          <span class="navbar-text" id="admin-email"></span>
          <button class="btn btn-outline-secondary btn-sm" id="logout" type="button">Logout</button>
        </div>
      </div></header>
      <main class="page-body" id="page-content" data-page="${route.page}"><div class="container-xl"><section class="card state-card" aria-busy="true"><div class="card-body"><div class="spinner-border spinner-border-sm me-2" aria-hidden="true"></div>Loading ${route.title}…</div></section></div></main>
    </div>
  </div>`;
}

function renderDocument(route, pathname) {
  const login = route.page === "login";
  return `<!doctype html>
<html lang="en" data-bs-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>${route.title} · CIS</title>
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/vendor/tabler/tabler.min.css">
  <link rel="stylesheet" href="/assets/app.css">
</head>
<body data-route="${route.page}">
  ${login ? loginBody() : consoleBody(route, pathname)}
  <div class="toast-container position-fixed top-0 end-0 p-3" id="toast-region" aria-live="polite"></div>
  <script src="/vendor/tabler/tabler.min.js" defer></script>
  ${["issue-editor", "translation-queue"].includes(route.page) ? '<script src="/vendor/markdown-it/markdown-it.min.js" defer></script>' : ""}
  <script src="/assets/shared.js" defer></script>
  <script src="/assets/pages/${route.script}" defer></script>
</body>
</html>`;
}

module.exports = { renderDocument };
