const { approveMappingRule } = require("./application/approveMappingRule");
const { createMappingRule } = require("./application/createMappingRule");
const { deleteMappingRule } = require("./application/deleteMappingRule");
const { findApprovedMappingRule } = require("./application/findApprovedMappingRule");
const { getMappingSettings } = require("./application/getMappingSettings");
const { getMappingRule } = require("./application/getMappingRule");
const { listMappingRules } = require("./application/listMappingRules");
const { rejectMappingRule } = require("./application/rejectMappingRule");
const { updateMappingRule } = require("./application/updateMappingRule");

module.exports = {
  approveMappingRule,
  createMappingRule,
  deleteMappingRule,
  findApprovedMappingRule,
  getMappingSettings,
  getMappingRule,
  listMappingRules,
  rejectMappingRule,
  updateMappingRule,
};
