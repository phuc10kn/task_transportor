const SyncApi = require("../../SyncApi");
const { success } = require("../../../../http/response/envelope");

function list(req, res, next) {
  try {
    success(res, SyncApi.listJournal({
      config: req.app.locals.config,
      filters: {
        sync_job_id: req.query.sync_job_id,
        issue_id: req.params.issueId || req.query.issue_id,
        project_id: req.query.project_id ? Number(req.query.project_id) : undefined,
      },
    }));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
};
