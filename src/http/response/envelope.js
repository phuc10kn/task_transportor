function success(res, data, status = 200, meta = undefined) {
  const body = { data };

  if (meta) {
    body.meta = meta;
  }

  return res.status(status).json(body);
}

function failure(res, { status, code, message, details = {}, correlationId }) {
  return res.status(status).json({
    error: {
      code,
      message,
      details,
      correlation_id: correlationId,
    },
  });
}

module.exports = {
  success,
  failure,
};
