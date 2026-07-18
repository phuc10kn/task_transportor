"use strict";

(() => {
  const form = document.querySelector("#login-form");
  if (!form) return;
  const errorRegion = document.querySelector("#login-error");
  const submit = form.querySelector("button[type=submit]");
  const params = new URLSearchParams(location.search);
  const googleRegion = document.querySelector("#google-login");
  const googleButton = document.querySelector("#google-button");
  const googleStatus = document.querySelector("#google-login-status");

  function finishLogin(result) {
    localStorage.removeItem("cis_admin_token");
    localStorage.setItem(CIS.AUTH_KEY, result.token);
    sessionStorage.removeItem(CIS.PROJECT_KEY);
    location.assign(CIS.safePath(params.get("next")));
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    errorRegion.innerHTML = "";
    submit.disabled = true;
    submit.textContent = "Signing in…";
    try {
      const result = await CIS.api("/api/v1/auth/login", {
        method: "POST",
        body: { email: form.email.value.trim(), password: form.password.value },
      });
      finishLogin(result);
    } catch (error) {
      errorRegion.innerHTML = CIS.alert(error.message);
      form.password.value = "";
      form.password.focus();
    } finally {
      submit.disabled = false;
      submit.textContent = "Sign in";
    }
  });

  CIS.api("/api/v1/auth/google/config").then((config) => {
    if (!config.enabled || !config.client_id) return;
    googleRegion.hidden = false;
    window.handleGoogleCredential = async ({ credential }) => {
      errorRegion.innerHTML = "";
      try {
        finishLogin(await CIS.api("/api/v1/auth/google", { method: "POST", body: { credential } }));
      } catch (error) {
        errorRegion.innerHTML = CIS.alert(error.message);
      }
    };
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      google.accounts.id.initialize({ client_id: config.client_id, callback: window.handleGoogleCredential });
      google.accounts.id.renderButton(googleButton, { theme: "outline", size: "large", width: 320 });
    };
    script.onerror = () => {
      googleButton.hidden = true;
      googleStatus.textContent = "Google sign-in could not be loaded. Email and password sign-in is still available.";
    };
    document.head.append(script);
  }).catch(() => {});
})();
