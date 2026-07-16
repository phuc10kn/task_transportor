const { AppError } = require("../../../http/errors/AppError");
const { createCisRepository } = require("../infrastructure/CisRepository");

function getAttachmentById({ config, attachmentId, projectId }) {
  const attachment = createCisRepository({ config }).getAttachmentById(attachmentId, projectId);

  if (!attachment) {
    throw new AppError({
      code: projectId ? "RESOURCE_NOT_FOUND" : "ATTACHMENT_NOT_FOUND",
      message: "Attachment not found.",
      status: 404,
    });
  }

  return attachment;
}

module.exports = {
  getAttachmentById,
};
