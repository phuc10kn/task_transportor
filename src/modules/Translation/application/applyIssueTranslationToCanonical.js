const CisApi = require("../../Cis/CisApi");

function applyIssueTranslationToCanonical({
  config,
  item,
  text,
  executedBy,
  correlationId,
  reason,
}) {
  return CisApi.applyReviewedIssueTranslation({
    config,
    item,
    text,
    executedBy,
    correlationId,
    reason,
  });
}

module.exports = {
  applyIssueTranslationToCanonical,
};
