const { createAnomalyRepository } = require("../infrastructure/AnomalyRepository");

function ensureMappingGapAnomaly({ config, input }) {
  const repository = createAnomalyRepository({ config });
  const details = {
    mapping_type: input.mapping_type,
    direction_from: input.direction_from,
    direction_to: input.direction_to,
    from_value: input.from_value,
  };
  const existing = repository.findOpenMappingGap({
    project_id: input.project_id,
    issue_id: input.issue_id,
    details_json: details,
  });

  if (existing) {
    return existing;
  }

  return repository.create({
    project_id: input.project_id,
    issue_id: input.issue_id,
    anomaly_type: "mapping_gap",
    severity: "warning",
    details_json: details,
    ai_analysis: "Required mapping is missing or not approved.",
  });
}

module.exports = {
  ensureMappingGapAnomaly,
};
