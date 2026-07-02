const { success } = require("../../../../http/response/envelope");
const JiraApi = require("../../JiraApi");

function dryRun(req, res, next) {
  try {
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
