const assert = require("assert");

const { createApp } = require("../../src/app");
const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const AuthApi = require("../../src/modules/Auth/AuthApi");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const { makeTempConfig } = require("./helpers/tempConfig");
const { requestJson, withServer } = require("./helpers/http");

async function main() {
  const config = makeTempConfig("translation-glossary-api", {
    ADMIN_EMAIL: "glossary-api@example.test",
    ADMIN_PASSWORD: "verify-password",
  });
  ensureStorage(config.storage);
  migrate({ config });
  AuthApi.bootstrapAdmin({
    config,
    email: "glossary-api@example.test",
    password: "verify-password",
  });
  const project = ProjectsApi.createProject({
    config,
    input: { name: "Glossary API Project", source_language: " JA ", target_language: " VI " },
  });
  const secondProject = ProjectsApi.createProject({ config, input: { name: "Other Glossary Project" } });

  const app = createApp({ config });
  await withServer(app, async (server) => {
    const login = await requestJson(server, {
      method: "POST",
      pathname: "/api/v1/auth/login",
      body: { email: "glossary-api@example.test", password: "verify-password" },
    });
    const token = login.body.data.token;

    const empty = await requestJson(server, {
      pathname: `/api/v1/projects/${project.id}/translation-glossary`,
      token,
    });
    assert.equal(empty.status, 200);
    assert.deepEqual(empty.body.data, { project_id: project.id, concepts: [] });

    const created = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/translation-glossary/concepts`,
      token,
      body: {
        group_key: " HOTEL ",
        concept_key: " Reservation ",
        note: "  Booking context  ",
        terms: [
          { language_code: " JA ", term: " 予約 ", is_canonical: true },
          { language_code: " JA ", term: "予約する", is_canonical: false },
          { language_code: " VI ", term: " đặt chỗ ", is_canonical: true },
          { language_code: " EN ", term: " reservation ", is_canonical: true },
        ],
      },
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.data.group_key, "hotel");
    assert.equal(created.body.data.concept_key, "reservation");
    assert.equal(created.body.data.note, "Booking context");
    assert.deepEqual(created.body.data.terms.map((term) => term.language_code), ["en", "ja", "ja", "vi"]);
    assert.ok(created.body.data.created_by);
    const conceptId = created.body.data.id;

    const crossConceptTermConflict = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/translation-glossary/concepts`,
      token,
      body: {
        concept_key: "other-reservation",
        terms: [
          { language_code: "ja", term: "予約", is_canonical: true },
          { language_code: "vi", term: "đặt chỗ khác", is_canonical: true },
        ],
      },
    });
    assert.equal(crossConceptTermConflict.status, 409);
    assert.equal(crossConceptTermConflict.body.error.details.field, "terms");

    const duplicateLanguage = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/translation-glossary/concepts`,
      token,
      body: {
        concept_key: "duplicate-normalized-term",
        terms: [
          { language_code: "ja", term: "一", is_canonical: true },
          { language_code: " JA ", term: " 一 ", is_canonical: false },
        ],
      },
    });
    assert.equal(duplicateLanguage.status, 422);
    assert.equal(duplicateLanguage.body.error.details.field, "terms");

    const duplicateConcept = await requestJson(server, {
      method: "POST",
      pathname: `/api/v1/projects/${project.id}/translation-glossary/concepts`,
      token,
      body: {
        group_key: "hotel",
        concept_key: "reservation",
        terms: [{ language_code: "ja", term: "予約", is_canonical: true }],
      },
    });
    assert.equal(duplicateConcept.status, 409);
    assert.equal(duplicateConcept.body.error.code, "TRANSLATION_GLOSSARY_CONFLICT");

    const updated = await requestJson(server, {
      method: "PATCH",
      pathname: `/api/v1/projects/${project.id}/translation-glossary/concepts/${conceptId}`,
      token,
      body: {
        concept_key: "reservation-updated",
        note: "",
        terms: [{ language_code: "JA", term: "予約", is_canonical: true }],
      },
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.concept_key, "reservation-updated");
    assert.equal(updated.body.data.note, null);
    assert.deepEqual(updated.body.data.terms.map((term) => term.language_code), ["ja"]);

    const crossProject = await requestJson(server, {
      method: "DELETE",
      pathname: `/api/v1/projects/${secondProject.id}/translation-glossary/concepts/${conceptId}`,
      token,
    });
    assert.equal(crossProject.status, 404);
    assert.equal(crossProject.body.error.code, "TRANSLATION_GLOSSARY_NOT_FOUND");

    const invalidId = await requestJson(server, {
      pathname: "/api/v1/projects/not-an-id/translation-glossary",
      token,
    });
    assert.equal(invalidId.status, 404);
    assert.equal(invalidId.body.error.code, "PROJECT_NOT_FOUND");

    const deleted = await requestJson(server, {
      method: "DELETE",
      pathname: `/api/v1/projects/${project.id}/translation-glossary/concepts/${conceptId}`,
      token,
    });
    assert.equal(deleted.status, 200);
    assert.deepEqual(deleted.body.data, { id: conceptId, deleted: true });
  });

  console.log("Translation glossary API verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
