const express = require("express");

const ProjectsController = require("./controllers/ProjectsController");

function createProjectsRouter({ authenticate }) {
  const router = express.Router();

  router.use(authenticate);
  router.get("/ownerships", ProjectsController.ownerships);
  router.get("/", ProjectsController.list);
  router.post("/", ProjectsController.create);
  router.get("/:projectId", ProjectsController.show);
  router.patch("/:projectId", ProjectsController.update);
  router.patch("/:projectId/owner", ProjectsController.transferOwner);
  router.delete("/:projectId", ProjectsController.remove);
  router.post("/:projectId/sync/enable", ProjectsController.enableSync);
  router.post("/:projectId/sync/disable", ProjectsController.disableSync);
  router.post("/:projectId/cis/mapping-values/sync", ProjectsController.syncCisMappingValues);
  router.get("/:projectId/team", ProjectsController.team);
  router.post("/:projectId/team/members", ProjectsController.addTeamMember);
  router.patch("/:projectId/team/members/:userId", ProjectsController.updateTeamMember);
  router.delete("/:projectId/team/members/:userId", ProjectsController.removeTeamMember);

  return router;
}

module.exports = {
  createProjectsRouter,
};
