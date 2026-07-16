const { success } = require("../../../../http/response/envelope");
const JiraApi = require("../../JiraApi");
const CisApi = require("../../../Cis/CisApi");

function dryRun(req, res, next) {
  try {
    CisApi.getIssueById({ config: req.app.locals.config, issueId: req.params.issueId, projectId: req.project.id });
    success(res, JiraApi.runJiraDryRun({
      config: req.app.locals.config,
      issueId: req.params.issueId,
      executedBy: req.user && req.user.id,
      correlationId: req.correlationId,
    }));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  dryRun,
};
