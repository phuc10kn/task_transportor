const crypto = require("crypto");

function createCorrelationIdMiddleware() {
  return function correlationIdMiddleware(req, res, next) {
    const incomingId = req.get("x-correlation-id");
    const correlationId = incomingId || `req_${crypto.randomUUID()}`;

    req.correlationId = correlationId;
    res.locals.correlationId = correlationId;
    res.setHeader("x-correlation-id", correlationId);

    next();
  };
}

module.exports = { createCorrelationIdMiddleware };
