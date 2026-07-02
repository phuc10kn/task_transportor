const BacklogApi = require("../../BacklogApi");
const { success } = require("../../../../http/response/envelope");

async function retryDownload(req, res, next) {
  try {
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
