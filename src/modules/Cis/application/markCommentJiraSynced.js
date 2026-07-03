const { AppError } = require("../../../http/errors/AppError");
const { createCisRepository } = require("../infrastructure/CisRepository");

function markCommentJiraSynced({ config, commentId, jiraCommentId }) {
  const comment = createCisRepository({ config }).markCommentJiraSynced(commentId, jiraCommentId);

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
  markCommentJiraSynced,
};
