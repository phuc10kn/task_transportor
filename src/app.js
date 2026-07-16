const express = require("express");
const cors = require("cors");

const { loadConfig } = require("./config/env");
const { createCorrelationIdMiddleware } = require("./http/middleware/correlationId");
const { requireProjectWorkspace } = require("./http/middleware/requireProjectWorkspace");
const { notFoundHandler, errorHandler } = require("./http/middleware/errorHandlers");
const { success } = require("./http/response/envelope");
const { createAuthRouter } = require("./modules/Auth/http/routes");
const { createAuthenticateAdmin } = require("./modules/Auth/http/middleware/authenticate");
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

  app.use("/api/v1/auth", createAuthRouter());
  app.use(
    "/api/v1",
    createDashboardRouter({
      authenticate: createAuthenticateAdmin(),
      requireProjectWorkspace,
    })
  );
  app.use(
    "/api/v1/projects",
    createProjectsRouter({
      authenticate: createAuthenticateAdmin(),
    })
  );
  app.use(
    "/api/v1",
    createCisRouter({
      authenticate: createAuthenticateAdmin(),
      requireProjectWorkspace,
    })
  );
  app.use(
    "/api/v1/projects",
    createBacklogRouter({
      authenticate: createAuthenticateAdmin(),
      requireProjectWorkspace,
    })
  );
  app.use(
    "/api/v1/projects",
    createBacklogAttachmentRouter({
      authenticate: createAuthenticateAdmin(),
      requireProjectWorkspace,
    })
  );
  app.use(
    "/api/v1",
    createSyncRouter({
      authenticate: createAuthenticateAdmin(),
      requireProjectWorkspace,
    })
  );
  app.use(
    "/api/v1",
    createTranslationRouter({
      authenticate: createAuthenticateAdmin(),
      requireProjectWorkspace,
    })
  );
  app.use(
    "/api/v1",
    createMappingRouter({
      authenticate: createAuthenticateAdmin(),
      requireProjectWorkspace,
    })
  );
  app.use(
    "/api/v1",
    createAnomalyRouter({
      authenticate: createAuthenticateAdmin(),
      requireProjectWorkspace,
    })
  );
  app.use(
    "/api/v1",
    createJiraRouter({
      authenticate: createAuthenticateAdmin(),
      requireProjectWorkspace,
    })
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
