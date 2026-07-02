const { createProject } = require("./application/createProject");
const { deleteProject } = require("./application/deleteProject");
const { getProject } = require("./application/getProject");
const { importProjects } = require("./application/importProjects");
const { listProjects } = require("./application/listProjects");
const { setProjectSyncEnabled } = require("./application/setProjectSyncEnabled");
const { syncCisMappingValuesFromTarget } = require("./application/syncCisMappingValuesFromTarget");
const { updateProject } = require("./application/updateProject");

module.exports = {
  createProject,
  deleteProject,
  getProject,
  importProjects,
  listProjects,
  setProjectSyncEnabled,
  syncCisMappingValuesFromTarget,
  updateProject,
};
