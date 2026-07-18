"use strict";

(() => CIS.ready(async ({ user }) => {
  const root = document.querySelector("#page-content");
  if (user.system_role !== "system_admin") {
    root.innerHTML = CIS.state("Access denied", "System administrator access is required.");
    return;
  }

  let users = [];
  let ownerships = [];

  async function load() {
    try {
      [users, ownerships] = await Promise.all([
        CIS.api("/api/v1/users"),
        CIS.api("/api/v1/projects/ownerships"),
      ]);
      render();
    } catch (error) {
      root.innerHTML = CIS.state("Users unavailable", error.message, CIS.retryLink());
    }
  }

  const userLabel = (item) => item.name ? `${item.name} · ${item.email}` : item.email;

  function ownershipRow(item) {
    const candidates = users.filter((candidate) => candidate.enabled);
    return `<tr data-project-ownership="${item.project_id}"><td data-label="Project"><strong>${CIS.escape(item.project_name)}</strong><div class="text-secondary small">Project #${item.project_id} · ${item.enabled ? "Enabled" : "Disabled"}</div></td><td data-label="Current owner"><strong data-current-owner>${CIS.escape(item.owner.name || item.owner.email)}</strong><div class="text-secondary small">${CIS.escape(item.owner.email)}</div></td><td data-label="New owner"><select class="form-select form-select-sm" data-owner-select="${item.project_id}" aria-label="New owner for ${CIS.attr(item.project_name)}">${candidates.map((candidate) => `<option value="${candidate.id}" ${candidate.id === item.owner_user_id ? "selected" : ""}>${CIS.escape(userLabel(candidate))}</option>`).join("")}</select></td><td data-label="Actions"><button class="btn btn-sm btn-outline-primary" data-transfer-owner="${item.project_id}" type="button" aria-label="Transfer ${CIS.attr(item.project_name)}" disabled>Transfer</button></td></tr>`;
  }

  function renderOwnershipRows() {
    const body = document.querySelector("#project-ownership-body");
    if (!body) return;
    body.innerHTML = ownerships.length ? ownerships.map(ownershipRow).join("") : '<tr><td colspan="4" class="text-center text-secondary py-4">No Projects configured.</td></tr>';
    bindOwnership();
  }

  function render() {
    root.innerHTML = `<div class="container-xl">
      <div class="page-heading"><div><div class="route-kicker">System access</div><h1>Users</h1><p class="text-secondary mb-0">Manage CIS users and system-level roles.</p></div><button class="btn btn-primary" type="button" data-create-user>Create user</button></div>
      <section class="card"><div class="card-header"><h2 class="card-title">User directory</h2><span class="badge bg-secondary-lt ms-auto">${users.length}</span></div><div class="table-responsive"><table class="table responsive-table"><thead><tr><th>User</th><th>Status</th><th>System role</th><th>Actions</th></tr></thead><tbody>${users.map((item) => `<tr data-user-row="${item.id}"><td data-label="User"><strong>${CIS.escape(item.name || item.email)}</strong><div class="text-secondary small">${CIS.escape(item.email)}</div></td><td data-label="Status">${CIS.badge(item.enabled ? "enabled" : "disabled", item.enabled ? "green" : "secondary")}</td><td data-label="System role"><select class="form-select form-select-sm" data-role-user="${item.id}" ${item.id === user.id ? 'title="You cannot remove the final system administrator"' : ""}><option value="user" ${item.system_role === "user" ? "selected" : ""}>User</option><option value="system_admin" ${item.system_role === "system_admin" ? "selected" : ""}>System admin</option></select></td><td data-label="Actions"><button class="btn btn-sm btn-outline-danger" data-delete-user="${item.id}" type="button" aria-label="Delete ${CIS.attr(item.email)}" ${item.id === user.id ? 'disabled title="You cannot delete your own account"' : ""}>Delete</button></td></tr>`).join("")}</tbody></table></div></section>
      <section class="card mt-3"><div class="card-header"><div><h2 class="card-title">Project ownership</h2><div class="text-secondary small">Transfer owner authority without granting the system administrator workspace access.</div></div><span class="badge bg-secondary-lt ms-auto">${ownerships.length}</span></div><div class="table-responsive"><table class="table responsive-table"><thead><tr><th>Project</th><th>Current owner</th><th>New owner</th><th>Actions</th></tr></thead><tbody id="project-ownership-body">${ownerships.length ? ownerships.map(ownershipRow).join("") : '<tr><td colspan="4" class="text-center text-secondary py-4">No Projects configured.</td></tr>'}</tbody></table></div></section>
    </div>`;
    bind();
  }

  function openCreateUser() {
    const modal = CIS.dialog("Create user", `<form id="user-form"><div class="dialog-header"><div><div class="route-kicker">System access</div><h2 class="h3 mb-0">Create user</h2></div><button class="btn-close" type="button" data-dialog-close aria-label="Close"></button></div><div class="dialog-body"><div id="user-error"></div><div class="mb-3"><label class="form-label" for="new-user-name">Name</label><input class="form-control" id="new-user-name" name="name" data-autofocus></div><div class="mb-3"><label class="form-label" for="new-user-email">Email</label><input class="form-control" id="new-user-email" name="email" type="email" autocomplete="off" required></div><div class="mb-3"><label class="form-label" for="new-user-password">Initial password</label><input class="form-control" id="new-user-password" name="password" type="password" minlength="8" autocomplete="new-password" required></div><div><label class="form-label" for="new-user-role">System role</label><select class="form-select" id="new-user-role" name="system_role"><option value="user">User</option><option value="system_admin">System admin</option></select></div></div><div class="dialog-footer"><button class="btn btn-outline-secondary" type="button" data-dialog-close>Cancel</button><button class="btn btn-primary" type="submit">Create user</button></div></form>`);
    modal.querySelector("#user-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      const button = event.submitter;
      button.disabled = true;
      button.textContent = "Creating…";
      try {
        await CIS.api("/api/v1/users", { method: "POST", body: CIS.formJson(form) });
        modal.close();
        CIS.toast("User created.");
        await load();
      } catch (error) {
        modal.querySelector("#user-error").innerHTML = CIS.alert(error.message);
        button.disabled = false;
        button.textContent = "Create user";
      }
    });
  }

  function openDeleteUser(item) {
    const modal = CIS.dialog("Delete user", `<div class="dialog-header"><div><div class="route-kicker">Permanent action</div><h2 class="h3 mb-0">Delete user</h2></div><button class="btn-close" type="button" data-dialog-close aria-label="Close"></button></div><div class="dialog-body"><div id="delete-user-error"></div><p>Permanently delete <strong>${CIS.escape(item.email)}</strong>?</p><p class="text-secondary mb-0">Password and Google sign-in identities and Team memberships will be removed. This cannot be undone. Owned Projects are preserved and will block deletion until their ownership is resolved.</p></div><div class="dialog-footer"><button class="btn btn-outline-secondary" type="button" data-dialog-close>Cancel</button><button class="btn btn-danger" type="button" data-confirm-delete>Delete user</button></div>`);
    modal.querySelector("[data-confirm-delete]").addEventListener("click", async (event) => {
      const button = event.currentTarget;
      button.disabled = true;
      button.textContent = "Deleting…";
      try {
        await CIS.api(`/api/v1/users/${item.id}`, { method: "DELETE" });
        users = users.filter((candidate) => candidate.id !== item.id);
        modal.close();
        render();
        CIS.toast("User permanently deleted.");
      } catch (error) {
        modal.querySelector("#delete-user-error").innerHTML = CIS.alert(error.message);
        button.disabled = false;
        button.textContent = "Delete user";
      }
    });
  }

  function openTransferOwnership(item, nextOwner) {
    const modal = CIS.dialog("Transfer Project ownership", `<div class="dialog-header"><div><div class="route-kicker">Ownership change</div><h2 class="h3 mb-0">Transfer ${CIS.escape(item.project_name)}</h2></div><button class="btn-close" type="button" data-dialog-close aria-label="Close"></button></div><div class="dialog-body"><div id="transfer-owner-error"></div><div class="d-flex align-items-center gap-2 flex-wrap"><strong>${CIS.escape(userLabel(item.owner))}</strong><span class="text-secondary">→</span><strong>${CIS.escape(userLabel(nextOwner))}</strong></div><p class="text-secondary mt-3 mb-0">The new owner becomes Team lead. The previous owner remains in the Team as a member. The system administrator is not added to the Team.</p></div><div class="dialog-footer"><button class="btn btn-outline-secondary" type="button" data-dialog-close>Cancel</button><button class="btn btn-primary" type="button" data-confirm-transfer>Transfer ownership</button></div>`);
    modal.querySelector("[data-confirm-transfer]").addEventListener("click", async (event) => {
      const button = event.currentTarget;
      button.disabled = true;
      button.textContent = "Transferring…";
      try {
        const updated = await CIS.api(`/api/v1/projects/${item.project_id}/owner`, { method: "PATCH", body: { new_owner_user_id: nextOwner.id } });
        ownerships = ownerships.map((candidate) => candidate.project_id === updated.project_id ? updated : candidate);
        modal.close();
        renderOwnershipRows();
        CIS.toast("Project ownership transferred.");
      } catch (error) {
        modal.querySelector("#transfer-owner-error").innerHTML = CIS.alert(error.message);
        button.disabled = false;
        button.textContent = "Transfer ownership";
      }
    });
  }

  function bindOwnership() {
    document.querySelectorAll("[data-owner-select]").forEach((select) => select.addEventListener("change", () => {
      const item = ownerships.find((candidate) => candidate.project_id === Number(select.dataset.ownerSelect));
      const button = document.querySelector(`[data-transfer-owner="${select.dataset.ownerSelect}"]`);
      button.disabled = !item || Number(select.value) === item.owner_user_id;
    }));
    document.querySelectorAll("[data-transfer-owner]").forEach((button) => button.addEventListener("click", () => {
      const projectId = Number(button.dataset.transferOwner);
      const item = ownerships.find((candidate) => candidate.project_id === projectId);
      const select = document.querySelector(`[data-owner-select="${projectId}"]`);
      const nextOwner = users.find((candidate) => candidate.id === Number(select.value) && candidate.enabled);
      if (item && nextOwner && nextOwner.id !== item.owner_user_id) openTransferOwnership(item, nextOwner);
    }));
  }

  function bind() {
    document.querySelector("[data-create-user]").addEventListener("click", openCreateUser);
    bindOwnership();
    document.querySelectorAll("[data-delete-user]").forEach((button) => button.addEventListener("click", () => {
      const item = users.find((candidate) => candidate.id === Number(button.dataset.deleteUser));
      if (item) openDeleteUser(item);
    }));
    document.querySelectorAll("[data-role-user]").forEach((select) => select.addEventListener("change", async () => {
      const previous = users.find((item) => item.id === Number(select.dataset.roleUser)).system_role;
      try {
        await CIS.api(`/api/v1/users/${select.dataset.roleUser}`, { method: "PATCH", body: { system_role: select.value } });
        CIS.toast("System role updated.");
        await load();
      } catch (error) {
        select.value = previous;
        CIS.toast(error.message, "danger");
      }
    }));
  }

  await load();
}))();
