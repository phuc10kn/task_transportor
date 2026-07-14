const assert = require("assert");

const { migrate } = require("../../src/infrastructure/database/migrate");
const { ensureStorage } = require("../../src/infrastructure/storage/bootstrap");
const CisApi = require("../../src/modules/Cis/CisApi");
const ProjectsApi = require("../../src/modules/Projects/ProjectsApi");
const TranslationApi = require("../../src/modules/Translation/TranslationApi");
const { prepareGlossaryForContext } = require("../../src/modules/Translation/application/collectTranslationContext");
const { createTranslationRepository } = require("../../src/modules/Translation/infrastructure/TranslationRepository");
const { makeTempConfig } = require("./helpers/tempConfig");

function createGlossary(config, projectId, input) {
  return TranslationApi.createTranslationGlossaryConcept({
    config,
    projectId,
    input,
  });
}

function main() {
  const prepared = prepareGlossaryForContext([
    { source: "予約", target: "đặt chỗ" },
    { source: "予約完了", target: "đã đặt chỗ" },
    { source: "未一致", target: "không dùng" },
  ], "予約完了の状態");
  assert.deepEqual(prepared.map((entry) => entry.source), ["予約完了"]);
  const fortyFiveTerms = Array.from({ length: 45 }, (_, index) => ({
    source: `用語${index}`,
    target: `term-${index}`,
  }));
  const preparedForty = prepareGlossaryForContext(fortyFiveTerms, fortyFiveTerms.map((entry) => entry.source).join(" "));
  assert.equal(preparedForty.length, 40);

  const config = makeTempConfig("translation-glossary-runtime");
  ensureStorage(config.storage);
  migrate({ config });
  const project = ProjectsApi.createProject({
    config,
    input: {
      name: "Glossary Runtime Project",
      source_language: " JA ",
      target_language: " VI ",
    },
  });

  const reservation = createGlossary(config, project.id, {
    concept_key: "reservation",
    terms: [
      { language_code: "ja", term: "予約", is_canonical: true },
      { language_code: "vi", term: "đặt chỗ", is_canonical: true },
      { language_code: "en", term: "reservation", is_canonical: true },
    ],
  });
  createGlossary(config, project.id, {
    concept_key: "missing-target",
      terms: [{ language_code: "ja", term: "不足", is_canonical: true }],
  });

  const issue = CisApi.createIssue({
    config,
    input: {
      project_id: project.id,
      backlog_issue_key: "GLS-1",
      source_system: "backlog",
      status: "pending_translate",
      fields_json: { summary: { backlog: "予約" } },
    },
  });
  const item = CisApi.createTranslationQueueItem({
    config,
    input: {
      project_id: project.id,
      issue_id: issue.id,
      target_type: "issue",
      target_field: "summary",
      source_language: " JA ",
      target_language: " VI ",
      source_text: "予約",
      provider: "codex_exec",
    },
  });

  const context = TranslationApi.collectTranslationContext({ config, item });
  assert.equal(context.context_bundle.project_profile.source_language, "ja");
  assert.equal(context.context_bundle.project_profile.target_language, "vi");
  assert.deepEqual(context.context_bundle.glossary, [{
    source: "予約",
    target: "đặt chỗ",
    notes: null,
    group_key: "default",
    concept_key: "reservation",
  }]);
  assert.ok(!context.context_bundle.glossary.some((entry) => entry.concept_key === "missing-target"));
  assert.ok(context.context_bundle.glossary.length <= 40);

  const englishItem = CisApi.createTranslationQueueItem({
    config,
    input: {
      project_id: project.id,
      issue_id: issue.id,
      target_type: "issue",
      target_field: "summary",
      source_language: "JA",
      target_language: "EN",
      source_text: "予約",
      provider: "codex_exec",
    },
  });
  const englishContext = TranslationApi.collectTranslationContext({ config, item: englishItem });
  assert.ok(englishContext.context_bundle.glossary.some((entry) => entry.target === "reservation"));

  const pendingIssue = CisApi.createIssue({
    config,
    input: {
      project_id: project.id,
      backlog_issue_key: "GLS-2",
      source_system: "backlog",
      status: "pending_translate",
      fields_json: { summary: { backlog: "後で" } },
    },
  });
  const pendingItem = CisApi.createTranslationQueueItem({
    config,
    input: {
      project_id: project.id,
      issue_id: pendingIssue.id,
      target_type: "issue",
      target_field: "summary",
      source_language: "ja",
      target_language: "vi",
      source_text: "後で",
      provider: "codex_exec",
    },
  });
  createGlossary(config, project.id, {
    concept_key: "late-term",
    terms: [
      { language_code: "ja", term: "後で", is_canonical: true },
      { language_code: "vi", term: "sau đó", is_canonical: true },
    ],
  });
  const pendingContext = TranslationApi.collectTranslationContext({ config, item: pendingItem });
  assert.ok(pendingContext.context_bundle.glossary.some((entry) => entry.concept_key === "late-term"));

  const draftItem = CisApi.createTranslationQueueItem({
    config,
    input: {
      project_id: project.id,
      issue_id: issue.id,
      target_type: "issue",
      target_field: "description",
      source_language: "ja",
      target_language: "vi",
      source_text: "予約",
      provider: "codex_exec",
    },
  });
  const translationRepository = createTranslationRepository({ config });
  translationRepository.markAiDraft(draftItem.id, {
    ai_draft: "draft stays unchanged",
    provider: "codex_exec",
    model_or_command: "test",
  });
  TranslationApi.updateTranslationGlossaryConcept({
    config,
    projectId: project.id,
    conceptId: reservation.id,
    input: {
      concept_key: "reservation",
      terms: [
        { language_code: "ja", term: "予約", is_canonical: true },
        { language_code: "vi", term: "chỗ đặt mới", is_canonical: true },
        { language_code: "en", term: "new reservation", is_canonical: true },
      ],
    },
  });
  assert.equal(translationRepository.findById(draftItem.id).ai_draft, "draft stays unchanged");
  console.log("Translation glossary runtime verification passed.");
}

main();
