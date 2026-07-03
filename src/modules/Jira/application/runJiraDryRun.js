const { AppError } = require("../../../http/errors/AppError");
const AnomalyApi = require("../../Anomaly/AnomalyApi");
const MappingApi = require("../../Mapping/MappingApi");
const { createJiraSyncRepository } = require("../infrastructure/JiraSyncRepository");
const { buildJiraPayload } = require("../support/jiraDryRunPayload");
const SyncApi = require("../../Sync/SyncApi");
const CisApi = require("../../Cis/CisApi");
const { ISSUE_STATUSES } = require("../../../shared/stateConstants");

const REQUIRED_MAPPING_FIELDS = [
  "issue_type",
  "status",
  "priority",
];

function validationError(code, message, details = {}) {
  return { code, message, details };
}

function assigneeMeta(fieldsJson) {
  const meta = fieldsJson && fieldsJson.assignee_meta;
  const cis = meta && typeof meta === "object" && meta.cis && typeof meta.cis === "object"
    ? meta.cis
    : {};

  return {
    jira_account_id: cis.jira_account_id || null,
  };
}

function resolveMapping({ config, projectId, issueId, mappingType, sourceValue, sourceSystem = "cis", createAnomaly = true }) {
  const missing = [];

  if (!sourceValue) {
    missing.push({
      mapping_type: mappingType,
      direction_from: sourceSystem,
      direction_to: "cis",
      from_value: null,
    });
    return { missing };
  }

  let cisValue = sourceValue;
  let sourceToCis = null;
  if (sourceSystem && sourceSystem !== "cis") {
    sourceToCis = MappingApi.findApprovedMappingRule({
      config,
      input: {
        project_id: projectId,
        mapping_type: mappingType,
        direction_from: sourceSystem,
        direction_to: "cis",
        from_value: sourceValue,
      },
    });

    if (!sourceToCis) {
      const gap = {
        mapping_type: mappingType,
        direction_from: sourceSystem,
        direction_to: "cis",
        from_value: sourceValue,
      };
      missing.push(gap);
      if (createAnomaly) {
        AnomalyApi.ensureMappingGapAnomaly({
          config,
          input: {
            project_id: projectId,
            issue_id: issueId,
            ...gap,
          },
        });
      }
      return { missing };
    }

    cisValue = sourceToCis.to_value;
  }

  let cisToJira = MappingApi.findApprovedMappingRule({
    config,
    input: {
      project_id: projectId,
      mapping_type: mappingType,
      direction_from: "cis",
      direction_to: "jira",
      from_value: cisValue,
    },
  });
  let cisNormalizer = null;

  if (!cisToJira && sourceSystem === "cis") {
    for (const candidateSource of ["backlog", "jira"]) {
      cisNormalizer = MappingApi.findApprovedMappingRule({
        config,
        input: {
          project_id: projectId,
          mapping_type: mappingType,
          direction_from: candidateSource,
          direction_to: "cis",
          from_value: sourceValue,
        },
      });

      if (!cisNormalizer) {
        continue;
      }

      cisValue = cisNormalizer.to_value;
      cisToJira = MappingApi.findApprovedMappingRule({
        config,
        input: {
          project_id: projectId,
          mapping_type: mappingType,
          direction_from: "cis",
          direction_to: "jira",
          from_value: cisValue,
        },
      });

      if (cisToJira) {
        break;
      }
    }
  }

  if (!cisToJira) {
    const gap = {
      mapping_type: mappingType,
      direction_from: "cis",
      direction_to: "jira",
      from_value: cisValue,
    };
    missing.push(gap);
    if (createAnomaly) {
      AnomalyApi.ensureMappingGapAnomaly({
        config,
        input: {
          project_id: projectId,
          issue_id: issueId,
          ...gap,
        },
      });
    }
    return { missing, cis_value: cisValue };
  }

  return {
    backlog_value: sourceValue,
    cis_value: cisValue,
    jira_value: cisToJira.to_value,
    rules: {
      source_to_cis_rule_id: sourceToCis ? sourceToCis.id : (cisNormalizer ? cisNormalizer.id : null),
      cis_to_jira_rule_id: cisToJira.id,
    },
    missing,
  };
}

function checkJiraConfig(project) {
  const missing = [];
  for (const field of ["jira_site_url", "jira_project_key", "jira_email_env", "jira_api_token_env"]) {
    if (!project[field]) {
      missing.push(field);
    }
  }

  return missing;
}

function latestSuccessfulDryRun(result) {
  const journal = SyncApi.listJournal({
    config: result.config,
    filters: { issue_id: result.issue.id },
  });

  return journal
    .filter((entry) =>
      entry.direction_from === "cis" &&
      entry.direction_to === "jira" &&
      entry.job_type === "dry_run" &&
      entry.action === "dry_run" &&
      entry.status === "success" &&
      entry.details_json &&
      entry.details_json.can_sync === true
    )
    .reverse()[0] || null;
}

function evaluateDryRunFreshness(result) {
  const latest = latestSuccessfulDryRun(result);
  const stale = !latest ||
    !latest.details_json ||
    latest.details_json.canonical_hash !== result.canonical_hash;

  return {
    stale,
    latest_dry_run_journal_id: latest ? latest.id : null,
  };
}

function evaluateJiraSyncReadiness({ config, issueId }) {
  const bundle = createJiraSyncRepository({ config }).getIssueBundle(issueId);
  if (!bundle) {
    throw new AppError({
      code: "ISSUE_NOT_FOUND",
      message: "Issue not found.",
      status: 404,
    });
  }

  const { attachments, issue, project, revision } = bundle;
  const snapshot = CisApi.buildCanonicalSyncSnapshot({ issue, revision });
  const assignee = assigneeMeta(issue.fields_json);
  const errors = [];
  const warnings = [];
  const missingRequiredMapping = [];
  const mapped = {};
  const canonicalHash = snapshot.canonical_hash;

  if (!revision) {
    errors.push(validationError("ISSUE_REVISION_REQUIRED", "Issue has no current revision."));
  }

  if (issue.status === ISSUE_STATUSES.ARCHIVED) {
    errors.push(validationError("ISSUE_SYNC_STATE_INVALID", "Archived issue cannot sync to Jira.", {
      issue_status: issue.status,
    }));
  } else if (![
    ISSUE_STATUSES.INGESTED,
    ISSUE_STATUSES.PENDING_REVIEW,
    ISSUE_STATUSES.APPROVED,
    ISSUE_STATUSES.UPDATE_PENDING,
    ISSUE_STATUSES.SYNCED,
  ].includes(issue.status)) {
    errors.push(validationError("ISSUE_SYNC_STATE_INVALID", "Issue is not in a Jira-syncable state.", {
      issue_status: issue.status,
    }));
  }

  if (!project.sync_enabled) {
    errors.push(validationError("PROJECT_SYNC_DISABLED", "Project sync is disabled.", {
      project_id: project.id,
    }));
  }

  const missingJiraConfig = checkJiraConfig(project);
  if (missingJiraConfig.length > 0) {
    errors.push(validationError("JIRA_CONFIG_REQUIRED", "Jira project config is incomplete.", {
      missing: missingJiraConfig,
    }));
  }

  if (revision) {
    for (const field of REQUIRED_MAPPING_FIELDS) {
      const canonicalField = snapshot.canonical[field] || {};
      const result = resolveMapping({
        config,
        projectId: project.id,
        issueId: issue.id,
        mappingType: field,
        sourceValue: canonicalField.value,
        sourceSystem: canonicalField.source || "cis",
      });

      mapped[field] = result;
      missingRequiredMapping.push(...result.missing);
    }

    const canonicalAssignee = snapshot.canonical.assignee || {};
    if (!assignee.jira_account_id && canonicalAssignee.value) {
      const assigneeMapping = resolveMapping({
        config,
        projectId: project.id,
        issueId: issue.id,
        mappingType: "user",
        sourceValue: canonicalAssignee.value,
        sourceSystem: canonicalAssignee.source || "cis",
        createAnomaly: false,
      });
      if (assigneeMapping.missing.length === 0) {
        mapped.assignee = assigneeMapping;
      } else {
        warnings.push({
          code: "ASSIGNEE_MAPPING_NOT_READY",
          message: "Assignee mapping is missing; Jira payload will omit assignee.",
          details: assigneeMapping.missing[0],
        });
      }
    }
  }

  if (missingRequiredMapping.length > 0) {
    errors.push(validationError("MAPPING_REQUIRED", "Required Jira mapping is missing or not approved.", {
      missing_required_mapping: missingRequiredMapping,
    }));
  }

  const blockingAnomalies = AnomalyApi.listBlockingAnomalies({
    config,
    issueId: issue.id,
  });
  if (blockingAnomalies.length > 0) {
    errors.push(validationError("ANOMALY_BLOCKED", "Critical anomaly must be resolved or ignored first.", {
      anomaly_ids: blockingAnomalies.map((anomaly) => anomaly.id),
    }));
  }

  const payload = buildJiraPayload({
    assigneeAccountId: assignee.jira_account_id,
    canonical: snapshot.canonical,
    issue,
    mapped,
    project,
  });
  const canSync = errors.length === 0;

  return {
    config,
    issue_id: issue.id,
    target: "jira",
    mode: "dry_run",
    can_sync: canSync,
    canonical_hash: canonicalHash,
    field_sources: snapshot.field_sources,
    excluded_collections: ["worklogs"],
    payload,
    validation: {
      errors,
      missing_required_mapping: missingRequiredMapping,
      blocking_anomalies: blockingAnomalies,
    },
    warnings,
    issue,
    project,
    revision,
    comments: bundle.comments,
    attachments,
    canonical: snapshot.canonical,
  };
}

function runJiraDryRun({ config, issueId, executedBy, correlationId }) {
  const result = evaluateJiraSyncReadiness({ config, issueId });

  SyncApi.writeJournal({
    config,
    input: {
      project_id: result.project.id,
      issue_id: result.issue.id,
      direction_from: "cis",
      direction_to: "jira",
      job_type: "dry_run",
      action: "dry_run",
      status: "success",
      trigger: "manual",
      message: result.can_sync ? "Jira dry-run can sync." : "Jira dry-run found blocking validation errors.",
      details_json: {
        can_sync: result.can_sync,
        canonical_hash: result.canonical_hash,
        field_sources: result.field_sources,
        excluded_collections: result.excluded_collections,
        error_codes: result.validation.errors.map((error) => error.code),
        warning_codes: result.warnings.map((warning) => warning.code),
      },
      executed_by: executedBy || null,
      correlation_id: correlationId || null,
    },
  });

  return {
    issue_id: result.issue_id,
    target: result.target,
    mode: result.mode,
    can_sync: result.can_sync,
    canonical_hash: result.canonical_hash,
    field_sources: result.field_sources,
    excluded_collections: result.excluded_collections,
    stale: false,
    payload: result.payload,
    validation: result.validation,
    warnings: result.warnings,
  };
}

module.exports = {
  evaluateDryRunFreshness,
  evaluateJiraSyncReadiness,
  runJiraDryRun,
};
