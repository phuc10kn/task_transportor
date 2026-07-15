"use strict";

(() => {
  const form = document.querySelector("#login-form");
  if (!form) return;
  const errorRegion = document.querySelector("#login-error");
  const submit = form.querySelector("button[type=submit]");
  const params = new URLSearchParams(location.search);

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
      localStorage.setItem(CIS.AUTH_KEY, result.token);
      sessionStorage.removeItem(CIS.PROJECT_KEY);
      location.assign(CIS.safePath(params.get("next")));
    } catch (error) {
      errorRegion.innerHTML = CIS.alert(error.message);
      form.password.value = "";
      form.password.focus();
    } finally {
      submit.disabled = false;
      submit.textContent = "Sign in";
    }
  });
})();
