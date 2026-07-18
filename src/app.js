const express = require("express");
const cors = require("cors");

const { loadConfig } = require("./config/env");
const { getLogger } = require("./infrastructure/observability/logger");
const {
  createRequestBodyLoggingMiddleware,
  createRequestObservabilityMiddleware,
} = require("./http/middleware/requestObservability");
const { requireProjectWorkspace } = require("./http/middleware/requireProjectWorkspace");
const { notFoundHandler, errorHandler } = require("./http/middleware/errorHandlers");
const { success } = require("./http/response/envelope");
const { createAuthRouter, createUsersRouter } = require("./modules/Auth/http/routes");
const { createAuthenticateUser } = require("./modules/Auth/http/middleware/authenticate");
const { createGoogleIdTokenVerifier } = require("./infrastructure/external/providers/google/GoogleIdTokenVerifier");
const { createProjectsRouter } = require("./modules/Projects/http/routes");
const { createCisRouter } = require("./modules/Cis/http/routes");
const { createDashboardRouter } = require("./modules/Dashboard/http/routes");
const { createSyncRouter } = require("./modules/Sync/http/routes");
const { createTranslationRouter } = require("./modules/Translation/http/routes");
const { createMappingRouter } = require("./modules/Mapping/http/routes");
const { createAnomalyRouter } = require("./modules/Anomaly/http/routes");
const { createJiraRouter } = require("./modules/Jira/http/routes");
const {
  createBacklogAttachmentRouter,
  createBacklogRouter,
} = require("./modules/Backlog/http/routes");

function healthPayload(config) {
  return {
    status: "ok",
    service: "task_transportor",
    environment: config.env,
  };
}

function createApp(options = {}) {
  const config = options.config || loadConfig();
  const logger = options.logger || getLogger(config);
  const app = express();

  app.locals.config = config;
  app.locals.logger = logger;
  app.locals.googleVerifier = options.googleVerifier || (config.auth.google.enabled
    ? createGoogleIdTokenVerifier({ clientId: config.auth.google.clientId })
    : null);

  app.use(createRequestObservabilityMiddleware({ logger }));
  app.use(cors());
  app.use(express.json({ limit: config.http.jsonLimit }));
  app.use(express.urlencoded({ extended: true }));
  app.use(createRequestBodyLoggingMiddleware({ logger }));

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

  app.use("/api/v1/auth", createAuthRouter());
  app.use("/api/v1/users", createUsersRouter());
  app.use(
    "/api/v1",
    createDashboardRouter({
      authenticate: createAuthenticateUser(),
      requireProjectWorkspace,
    })
  );
  app.use(
    "/api/v1/projects",
    createProjectsRouter({
      authenticate: createAuthenticateUser(),
    })
  );
  app.use(
    "/api/v1",
    createCisRouter({
      authenticate: createAuthenticateUser(),
      requireProjectWorkspace,
    })
  );
  app.use(
    "/api/v1/projects",
    createBacklogRouter({
      authenticate: createAuthenticateUser(),
      requireProjectWorkspace,
    })
  );
  app.use(
    "/api/v1/projects",
    createBacklogAttachmentRouter({
      authenticate: createAuthenticateUser(),
      requireProjectWorkspace,
    })
  );
  app.use(
    "/api/v1",
    createSyncRouter({
      authenticate: createAuthenticateUser(),
      requireProjectWorkspace,
    })
  );
  app.use(
    "/api/v1",
    createTranslationRouter({
      authenticate: createAuthenticateUser(),
      requireProjectWorkspace,
    })
  );
  app.use(
    "/api/v1",
    createMappingRouter({
      authenticate: createAuthenticateUser(),
      requireProjectWorkspace,
    })
  );
  app.use(
    "/api/v1",
    createAnomalyRouter({
      authenticate: createAuthenticateUser(),
      requireProjectWorkspace,
    })
  );
  app.use(
    "/api/v1",
    createJiraRouter({
      authenticate: createAuthenticateUser(),
      requireProjectWorkspace,
    })
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
