const express = require("express");
const cors = require("cors");

const { loadConfig } = require("./config/env");
const { createCorrelationIdMiddleware } = require("./http/middleware/correlationId");
const { notFoundHandler, errorHandler } = require("./http/middleware/errorHandlers");
const { success } = require("./http/response/envelope");

function healthPayload(config) {
  return {
    status: "ok",
    service: "task_transportor",
    environment: config.env,
  };
}

function createApp(options = {}) {
  const config = options.config || loadConfig();
  const app = express();

  app.locals.config = config;

  app.use(cors());
  app.use(express.json({ limit: config.http.jsonLimit }));
  app.use(express.urlencoded({ extended: true }));
  app.use(createCorrelationIdMiddleware());

  app.get("/", (req, res) => {
    success(res, {
      name: "task_transportor",
      status: "running",
    });
  });

  app.get("/health", (req, res) => {
    success(res, healthPayload(config));
  });

  app.get("/api/v1/health", (req, res) => {
    success(res, healthPayload(config));
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
