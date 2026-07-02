const express = require("express");

const ProjectsController = require("./controllers/ProjectsController");

function createProjectsRouter({ authenticate }) {
  const router = express.Router();

  router.use(authenticate);
  router.get("/", ProjectsController.list);
  router.post("/", ProjectsController.create);
  router.get("/:projectId", ProjectsController.show);
  router.patch("/:projectId", ProjectsController.update);
  router.delete("/:projectId", ProjectsController.remove);
  router.post("/:projectId/sync/enable", ProjectsController.enableSync);
  router.post("/:projectId/sync/disable", ProjectsController.disableSync);
  router.post("/:projectId/cis/mapping-values/sync", ProjectsController.syncCisMappingValues);

  return router;
}

module.exports = {
  createProjectsRouter,
};
