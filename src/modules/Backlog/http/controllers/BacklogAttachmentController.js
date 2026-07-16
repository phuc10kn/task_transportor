const BacklogApi = require("../../BacklogApi");
const CisApi = require("../../../Cis/CisApi");
const { success } = require("../../../../http/response/envelope");

async function retryDownload(req, res, next) {
  try {
    CisApi.getAttachmentById({
      config: req.app.locals.config,
      attachmentId: req.params.attachmentId,
      projectId: req.project.id,
    });
    const attachment = await BacklogApi.retryAttachmentDownload({
      config: req.app.locals.config,
      attachmentId: req.params.attachmentId,
      executedBy: req.user && req.user.id,
      correlationId: req.correlationId,
    });

    success(res, attachment);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  retryDownload,
};
