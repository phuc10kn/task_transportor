const { AppError } = require("../../../http/errors/AppError");
const { createCisRepository } = require("../infrastructure/CisRepository");

function applyReviewedCommentTranslation({ config, commentId, text }) {
  const comment = createCisRepository({ config }).updateCommentTranslation(commentId, text);

  if (!comment) {
    throw new AppError({
      code: "COMMENT_NOT_FOUND",
      message: "Comment not found.",
      status: 404,
    });
  }

  return comment;
}

module.exports = {
  applyReviewedCommentTranslation,
};
