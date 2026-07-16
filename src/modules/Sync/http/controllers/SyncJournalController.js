const SyncApi = require("../../SyncApi");
const CisApi = require("../../../Cis/CisApi");
const { success } = require("../../../../http/response/envelope");

function list(req, res, next) {
  try {
    if (req.params.issueId) {
      CisApi.getIssueById({ config: req.app.locals.config, issueId: req.params.issueId, projectId: req.project.id });
    }
    success(res, SyncApi.listJournal({
      config: req.app.locals.config,
      filters: {
        sync_job_id: req.query.sync_job_id,
        issue_id: req.params.issueId || req.query.issue_id,
        project_id: req.project.id,
      },
    }));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
};
