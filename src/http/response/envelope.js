function success(res, data, status = 200, meta = undefined) {
  const body = { data };

  if (meta) {
    body.meta = meta;
  }

  if (typeof res.locals.logResponse === "function") res.locals.logResponse({ status, body });
  return res.status(status).json(body);
}

function failure(res, { status, code, message, details = {}, correlationId }) {
  const body = {
    error: {
      code,
      message,
      details,
      correlation_id: correlationId,
    },
  };
  if (typeof res.locals.logResponse === "function") {
    res.locals.logResponse({ status, body, error: res.locals.requestError });
  }
  return res.status(status).json(body);
}

module.exports = {
  success,
  failure,
};
