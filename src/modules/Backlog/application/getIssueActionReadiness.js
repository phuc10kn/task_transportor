function projectsApi() { return require("../../Projects/ProjectsApi"); }

const REASON_ORDER = ["PROJECT_PULL_DISABLED", "PROJECT_DISABLED", "BACKLOG_CONFIG_INCOMPLETE", "BACKLOG_PULL_DISABLED", "PROJECT_SYNC_DISABLED", "SYNC_WORKER_UNAVAILABLE"];

function backlogConfigReady(config, project) {
  return Boolean(project.backlog_project_key) && (
    Boolean(config.backlog && config.backlog.fakeFixturePath) || Boolean(project.backlog_space_url && project.backlog_api_key)
  );
}

function orderedReasons(reasons) {
  const set = new Set(reasons);
  return REASON_ORDER.filter((reason) => set.has(reason));
}

function writeAction({ enabled, mode, consumerReady, reasons }) {
  return {
    enabled,
    execution_mode: enabled ? mode : "disabled",
    consumer_ready: enabled ? Boolean(consumerReady) : false,
    disabled_reasons: enabled ? [] : orderedReasons(reasons),
  };
}

function getIssueActionReadiness({ config, projectId }) {
  const project = projectsApi().getProject({ config, projectId: Number(projectId) });
  const configReady = backlogConfigReady(config, project);
  const baseReasons = [!project.enabled && "PROJECT_DISABLED", !configReady && "BACKLOG_CONFIG_INCOMPLETE", !project.manual_pull_enabled && "BACKLOG_PULL_DISABLED"].filter(Boolean);
  const pullEnabled = baseReasons.length === 0;
  const workerReady = Boolean(config.worker && config.worker.enabled);
  const queueReady = Boolean(project.sync_enabled && workerReady);
  const syncReasons = [...baseReasons, !project.sync_enabled && "PROJECT_SYNC_DISABLED", !workerReady && "SYNC_WORKER_UNAVAILABLE"].filter(Boolean);

  return {
    project_id: project.id,
    actions: {
      browse: { enabled: configReady, disabled_reasons: configReady ? [] : ["BACKLOG_CONFIG_INCOMPLETE"] },
      pull_one: writeAction({ enabled: pullEnabled, mode: project.sync_enabled ? "inline" : "queued_waiting", consumerReady: project.sync_enabled, reasons: baseReasons }),
      pull_project: writeAction({ enabled: false, mode: "disabled", consumerReady: false, reasons: ["PROJECT_PULL_DISABLED"] }),
      sync_to_cis: writeAction({ enabled: syncReasons.length === 0, mode: "queued_ready", consumerReady: queueReady, reasons: syncReasons }),
    },
  };
}

module.exports = { getIssueActionReadiness };
