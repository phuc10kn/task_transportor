"use strict";

(() => CIS.ready(async ({ user }) => {
  const root = document.querySelector("#page-content");
  if (user.system_role !== "system_admin") {
    root.innerHTML = CIS.state("Access denied", "System administrator access is required.");
    return;
  }
  let users = [];
  async function load() {
    try { users = await CIS.api("/api/v1/users"); render(); }
    catch (error) { root.innerHTML = CIS.state("Users unavailable", error.message, CIS.retryLink()); }
  }
  function render() {
    root.innerHTML = `<div class="container-xl"><div class="page-heading"><div><div class="route-kicker">System access</div><h1>Users</h1><p class="text-secondary mb-0">Create login accounts and assign system-level roles.</p></div></div>
      <div class="row g-4"><div class="col-xl-4"><form class="card" id="user-form"><div class="card-header"><h2 class="card-title">Create user</h2></div><div class="card-body"><div id="user-error"></div><div class="mb-3"><label class="form-label" for="name">Name</label><input class="form-control" id="name" name="name"></div><div class="mb-3"><label class="form-label" for="email">Email</label><input class="form-control" id="email" name="email" type="email" required></div><div class="mb-3"><label class="form-label" for="password">Initial password</label><input class="form-control" id="password" name="password" type="password" minlength="8" required></div><div><label class="form-label" for="system_role">System role</label><select class="form-select" id="system_role" name="system_role"><option value="user">User</option><option value="system_admin">System admin</option></select></div></div><div class="card-footer justify-content-end"><button class="btn btn-primary" type="submit">Create user</button></div></form></div>
      <div class="col-xl-8"><section class="card"><div class="card-header"><h2 class="card-title">User directory</h2><span class="badge bg-secondary-lt ms-auto">${users.length}</span></div><div class="table-responsive"><table class="table"><thead><tr><th>User</th><th>Status</th><th>System role</th></tr></thead><tbody>${users.map((item) => `<tr><td><strong>${CIS.escape(item.name || item.email)}</strong><div class="text-secondary small">${CIS.escape(item.email)}</div></td><td>${CIS.badge(item.enabled ? "enabled" : "disabled", item.enabled ? "green" : "secondary")}</td><td><select class="form-select form-select-sm" data-role-user="${item.id}" ${item.id === user.id ? 'title="You cannot remove the final system administrator"' : ""}><option value="user" ${item.system_role === "user" ? "selected" : ""}>User</option><option value="system_admin" ${item.system_role === "system_admin" ? "selected" : ""}>System admin</option></select></td></tr>`).join("")}</tbody></table></div></section></div></div></div>`;
    bind();
  }
  function bind() {
    document.querySelector("#user-form").addEventListener("submit", async (event) => {
      event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return;
      const button = event.submitter; button.disabled = true;
      try { await CIS.api("/api/v1/users", { method: "POST", body: CIS.formJson(form) }); CIS.toast("User created."); await load(); }
      catch (error) { document.querySelector("#user-error").innerHTML = CIS.alert(error.message); button.disabled = false; }
    });
    document.querySelectorAll("[data-role-user]").forEach((select) => select.addEventListener("change", async () => {
      const previous = users.find((item) => item.id === Number(select.dataset.roleUser)).system_role;
      try { await CIS.api(`/api/v1/users/${select.dataset.roleUser}`, { method: "PATCH", body: { system_role: select.value } }); CIS.toast("System role updated."); await load(); }
      catch (error) { select.value = previous; CIS.toast(error.message, "danger"); }
    }));
  }
  await load();
}))();
