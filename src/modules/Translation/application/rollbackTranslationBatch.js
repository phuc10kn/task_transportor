const { createConnection } = require("../../../infrastructure/database/connection");
const { runImmediateTransaction } = require("../../../infrastructure/database/transaction");
const CisApi = require("../../Cis/CisApi");
const { createTranslationRepository } = require("../infrastructure/TranslationRepository");
const { syncIssueTranslationState } = require("./syncIssueTranslationState");

function rollbackTranslationBatch({ config, issueId, snapshots, canonical, executedBy, correlationId, parentSyncJobId }) {
  const db = createConnection({ config });
  try {
    runImmediateTransaction(db, () => {
      const repository = createTranslationRepository({ config, db });
      repository.restoreBatchInTransaction(snapshots);
      if (canonical) {
        CisApi.updateCanonicalIssue({
          config,
          db,
          issueId,
          payload: {
            summary: canonical.summary,
            description: canonical.description,
            reason: "Rollback failed Sync + Translate + Jira workflow.",
          },
          executedBy: executedBy || null,
          correlationId,
          audit: {
            job_type: "sync_translate_jira",
            action: "translation_batch_rolled_back",
            trigger: "auto",
            message: "Translation batch rolled back after workflow failure.",
            details_json: { parent_sync_job_id: parentSyncJobId || null },
          },
        });
      }
    });
  } finally {
    db.close();
  }

  syncIssueTranslationState({
    config,
    repository: createTranslationRepository({ config }),
    issueId,
    correlationId,
  });
}

module.exports = { rollbackTranslationBatch };
