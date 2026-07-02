const JiraApi = require("../../JiraApi");
const { success } = require("../../../../http/response/envelope");

function sync(req, res, next) {
  try {
    success(
      res,
      JiraApi.requestJiraSync({
        config: req.app.locals.config,
        issueId: req.params.issueId,
        jiraFields: req.body && req.body.jira_fields,
        executedBy: req.user && req.user.id,
        correlationId: req.correlationId,
      }),
      202
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  sync,
};
