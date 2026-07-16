const JiraApi = require("../../JiraApi");
const CisApi = require("../../../Cis/CisApi");
const { success } = require("../../../../http/response/envelope");

async function sync(req, res, next) {
  try {
    CisApi.getIssueById({ config: req.app.locals.config, issueId: req.params.issueId, projectId: req.project.id });
    success(
      res,
      await JiraApi.requestJiraSync({
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
