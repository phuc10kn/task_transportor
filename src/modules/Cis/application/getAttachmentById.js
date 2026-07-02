const { AppError } = require("../../../http/errors/AppError");
const { createCisRepository } = require("../infrastructure/CisRepository");

function getAttachmentById({ config, attachmentId }) {
  const attachment = createCisRepository({ config }).getAttachmentById(attachmentId);

  if (!attachment) {
    throw new AppError({
      code: "ATTACHMENT_NOT_FOUND",
      message: "Attachment not found.",
      status: 404,
    });
  }

  return attachment;
}

module.exports = {
  getAttachmentById,
};
