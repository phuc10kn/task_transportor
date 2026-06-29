const { AppError } = require("../errors/AppError");
const { failure } = require("../response/envelope");

function notFoundHandler(req, res, next) {
  next(new AppError({
    code: "NOT_FOUND",
    message: "Endpoint not found.",
    status: 404,
  }));
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  const status = error.status || 500;
  const code = error.code || "INTERNAL_SERVER_ERROR";
  const message = status >= 500 ? "Internal server error." : error.message;

  failure(res, {
    status,
    code,
    message,
    details: error.details || {},
    correlationId: req.correlationId || res.locals.correlationId,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
