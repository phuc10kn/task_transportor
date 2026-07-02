const { success } = require("../../../../http/response/envelope");
const JiraApi = require("../../JiraApi");

async function pull(req, res, next) {
  try {
    const result = await JiraApi.pullJiraMappingValues({
      config: req.app.locals.config,
      projectId: Number(req.params.projectId),
    });

    success(res, result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  pull,
};
