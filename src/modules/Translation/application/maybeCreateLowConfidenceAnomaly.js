const AnomalyApi = require("../../Anomaly/AnomalyApi");

function maybeCreateLowConfidenceAnomaly({ config, item, confidence }) {
  if (
    confidence === null ||
    confidence === undefined ||
    Number(confidence) >= config.translation.lowConfidenceThreshold
  ) {
    return null;
  }

  return AnomalyApi.createAnomaly({
    config,
    input: {
      project_id: item.project_id,
      issue_id: item.issue_id,
      anomaly_type: "translation_low_conf",
      severity: "warning",
      details_json: {
        translation_queue_id: item.id,
        confidence,
        threshold: config.translation.lowConfidenceThreshold,
      },
      ai_analysis: "Translation provider returned low confidence.",
    },
  });
}

module.exports = {
  maybeCreateLowConfidenceAnomaly,
};
