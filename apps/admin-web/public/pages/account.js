"use strict";

(() => CIS.ready(async ({ user }) => {
  const root = document.querySelector("#page-content");
  let currentUser = user;
  let googleConfig = { enabled: false, client_id: null };
  let googleConfigError = "";

  function profileSettings() {
    return `<section class="card account-card mb-3"><div class="card-header account-identity"><div><div class="route-kicker">Personal details</div><h2 class="card-title mt-1">Profile</h2></div>${CIS.badge(CIS.label(currentUser.system_role), currentUser.system_role === "system_admin" ? "blue" : "secondary")}</div><div class="card-body"><form id="profile-form"><div id="profile-error"></div><div class="row g-3 align-items-end"><div class="col-md-6"><label class="form-label" for="profile-name">Name</label><input class="form-control" id="profile-name" name="name" value="${CIS.attr(currentUser.name || "")}" maxlength="120" autocomplete="name"><div class="form-hint">Shown to other CIS users. Leave blank to use your email.</div></div><div class="col-md-6"><label class="form-label" for="profile-email">Email identity</label><input class="form-control" id="profile-email" type="email" value="${CIS.attr(currentUser.email)}" readonly aria-describedby="profile-email-help"><div class="form-hint" id="profile-email-help">Used for sign-in and Google account matching; it cannot be changed here.</div></div><div class="col-12"><button class="btn btn-primary" type="submit">Save profile</button></div></div></form></div></section>`;
  }

  function passwordMethod() {
    if (currentUser.has_password) {
      return `<div class="account-auth-row"><span class="account-auth-mark" aria-hidden="true">P</span><div class="account-auth-copy"><strong>Password</strong><span>Sign in with ${CIS.escape(currentUser.email)} and your CIS password.</span></div>${CIS.badge("Configured", "green")}</div>`;
    }
    return `<div class="account-auth-row account-auth-row--form"><span class="account-auth-mark" aria-hidden="true">P</span><div class="account-auth-copy"><strong>Password</strong><span>Add a password if you also want to sign in without Google.</span><form class="account-password-form" id="password-form"><div id="password-error"></div><div class="row g-2"><div class="col-md"><label class="form-label" for="new-password">New password</label><input class="form-control" id="new-password" name="password" type="password" minlength="8" autocomplete="new-password" required></div><div class="col-md"><label class="form-label" for="confirm-password">Confirm password</label><input class="form-control" id="confirm-password" name="confirm_password" type="password" minlength="8" autocomplete="new-password" required></div><div class="col-md-auto align-self-end"><button class="btn btn-primary" type="submit">Set password</button></div></div></form></div>${CIS.badge("Not set", "secondary")}</div>`;
  }

  function googleMethod() {
    if (currentUser.google_linked) {
      return `<div class="account-auth-row"><span class="account-auth-mark" aria-hidden="true">G</span><div class="account-auth-copy"><strong>Google</strong><span>Linked to ${CIS.escape(currentUser.google_email || currentUser.email)}.</span></div>${CIS.badge("Linked", "green")}</div>`;
    }
    if (googleConfigError) {
      return `<div class="account-auth-row"><span class="account-auth-mark" aria-hidden="true">G</span><div class="account-auth-copy"><strong>Google</strong><span>${CIS.escape(googleConfigError)}</span></div><button class="btn btn-outline-secondary btn-sm" type="button" data-retry-google>Retry</button></div>`;
    }
    if (!googleConfig.enabled || !googleConfig.client_id) {
      return `<div class="account-auth-row"><span class="account-auth-mark" aria-hidden="true">G</span><div class="account-auth-copy"><strong>Google</strong><span>Google sign-in is not available for this CIS installation.</span></div>${CIS.badge("Unavailable", "secondary")}</div>`;
    }
    return `<div class="account-auth-row"><span class="account-auth-mark" aria-hidden="true">G</span><div class="account-auth-copy"><strong>Google</strong><span>Link the Google account with the same email: ${CIS.escape(currentUser.email)}.</span><div id="google-link-error" class="mt-2"></div><div id="google-link-button" class="mt-2"></div></div>${CIS.badge("Not linked", "secondary")}</div>`;
  }

  function render() {
    root.innerHTML = `<div class="container-xl account-page"><div class="page-heading"><div><div class="route-kicker">Personal identity</div><h1>My account</h1><p class="text-secondary mb-0">Manage your profile and sign-in methods.</p></div></div>${profileSettings()}<section class="card account-card"><div class="card-header"><div><div class="route-kicker">Account security</div><h2 class="card-title mt-1">Sign-in methods</h2></div></div><div class="card-body p-0"><div class="account-auth-list" aria-label="Sign-in methods">${passwordMethod()}${googleMethod()}</div></div></section></div>`;
    bind();
  }

  function renderGoogleButton() {
    const target = document.querySelector("#google-link-button");
    if (!target) return;
    window.handleGoogleLinkCredential = async ({ credential }) => {
      const errorRegion = document.querySelector("#google-link-error");
      errorRegion.innerHTML = "";
      try {
        currentUser = await CIS.api("/api/v1/auth/google/link", { method: "POST", body: { credential } });
        CIS.toast("Google account linked.");
        render();
      } catch (error) {
        errorRegion.innerHTML = CIS.alert(error.message);
      }
    };
    const initialize = () => {
      google.accounts.id.initialize({ client_id: googleConfig.client_id, callback: window.handleGoogleLinkCredential });
      google.accounts.id.renderButton(target, { theme: "outline", size: "large", text: "continue_with" });
    };
    if (window.google?.accounts?.id) {
      initialize();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = initialize;
    script.onerror = () => {
      document.querySelector("#google-link-error").innerHTML = CIS.alert("Google sign-in could not be loaded.");
    };
    document.head.append(script);
  }

  function bind() {
    document.querySelector("[data-retry-google]")?.addEventListener("click", loadGoogleConfig);
    document.querySelector("#profile-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const errorRegion = document.querySelector("#profile-error");
      const button = event.submitter;
      errorRegion.innerHTML = "";
      if (!form.reportValidity()) return;
      button.disabled = true;
      button.textContent = "Saving…";
      try {
        currentUser = await CIS.api("/api/v1/auth/me", { method: "PATCH", body: { name: form.name.value } });
        render();
        CIS.toast("Profile updated.");
      } catch (error) {
        errorRegion.innerHTML = CIS.alert(error.message);
        button.disabled = false;
        button.textContent = "Save profile";
      }
    });
    document.querySelector("#password-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const errorRegion = document.querySelector("#password-error");
      errorRegion.innerHTML = "";
      if (!form.reportValidity()) return;
      if (form.password.value !== form.confirm_password.value) {
        errorRegion.innerHTML = CIS.alert("Passwords do not match.");
        form.confirm_password.focus();
        return;
      }
      const button = event.submitter;
      button.disabled = true;
      button.textContent = "Saving…";
      try {
        currentUser = await CIS.api("/api/v1/auth/password", { method: "POST", body: { password: form.password.value } });
        CIS.toast("Password sign-in configured.");
        render();
      } catch (error) {
        errorRegion.innerHTML = CIS.alert(error.message);
        button.disabled = false;
        button.textContent = "Set password";
      }
    });
    if (!currentUser.google_linked && googleConfig.enabled && googleConfig.client_id) renderGoogleButton();
  }

  async function loadGoogleConfig() {
    try {
      googleConfig = await CIS.api("/api/v1/auth/google/config");
      googleConfigError = "";
    } catch (error) {
      googleConfigError = error.message;
    }
    render();
  }

  await loadGoogleConfig();
}))();
