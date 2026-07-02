const { createCisRepository } = require("../infrastructure/CisRepository");

function markAttachmentDownloaded({ config, attachmentId, input }) {
  return createCisRepository({ config }).markAttachmentDownloaded(attachmentId, input);
}

function markAttachmentDownloadFailed({ config, attachmentId, errorMessage }) {
  return createCisRepository({ config }).markAttachmentDownloadFailed(attachmentId, errorMessage);
}

module.exports = {
  markAttachmentDownloaded,
  markAttachmentDownloadFailed,
};
