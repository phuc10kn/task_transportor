const { AppError } = require("../../../http/errors/AppError");
const { createCisRepository } = require("../infrastructure/CisRepository");

function markCommentJiraSyncFailed({ config, commentId }) {
  const comment = createCisRepository({ config }).markCommentJiraSyncFailed(commentId);

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
  markCommentJiraSyncFailed,
};
