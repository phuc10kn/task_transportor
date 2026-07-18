const { createProject } = require("./application/createProject");
const { deleteProject } = require("./application/deleteProject");
const { getProject } = require("./application/getProject");
const { importProjects } = require("./application/importProjects");
const { listProjects } = require("./application/listProjects");
const { setProjectSyncEnabled } = require("./application/setProjectSyncEnabled");
const { syncCisMappingValuesFromTarget } = require("./application/syncCisMappingValuesFromTarget");
const { updateProject } = require("./application/updateProject");
const { getProjectForUser, requireProjectOwner, requireTeamLead } = require("./application/projectAccess");
const { addProjectTeamMember, getProjectTeam, removeProjectTeamMember, updateProjectTeamMember } = require("./application/team");

module.exports = {
  createProject,
  addProjectTeamMember,
  deleteProject,
  getProject,
  getProjectForUser,
  getProjectTeam,
  importProjects,
  listProjects,
  removeProjectTeamMember,
  requireProjectOwner,
  requireTeamLead,
  setProjectSyncEnabled,
  syncCisMappingValuesFromTarget,
  updateProject,
  updateProjectTeamMember,
};
