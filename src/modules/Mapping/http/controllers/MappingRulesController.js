const { success } = require("../../../../http/response/envelope");
const MappingApi = require("../../MappingApi");

function filtersFromQuery(query, projectId) {
  return {
    project_id: projectId,
    mapping_type: query.mapping_type,
    direction_from: query.direction_from,
    direction_to: query.direction_to,
    approval_status: query.approval_status,
  };
}

function assertRuleInProject(req) {
  return MappingApi.getMappingRule({
    config: req.app.locals.config,
    ruleId: req.params.ruleId,
    projectId: req.project.id,
  });
}

function list(req, res, next) {
  try {
    success(res, MappingApi.listMappingRules({
      config: req.app.locals.config,
      filters: filtersFromQuery(req.query, req.project.id),
    }));
  } catch (error) {
    next(error);
  }
}

function settings(req, res, next) {
  try {
    success(res, MappingApi.getMappingSettings({
      config: req.app.locals.config,
      filters: {
        project_id: req.project.id,
        source_system: req.query.source_system,
        target_system: req.query.target_system,
      },
    }));
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    success(res, MappingApi.createMappingRule({
      config: req.app.locals.config,
      input: { ...req.body, project_id: req.project.id },
    }), 201);
  } catch (error) {
    next(error);
  }
}

function show(req, res, next) {
  try {
    success(res, assertRuleInProject(req));
  } catch (error) {
    next(error);
  }
}

function update(req, res, next) {
  try {
    assertRuleInProject(req);
    success(res, MappingApi.updateMappingRule({
      config: req.app.locals.config,
      ruleId: req.params.ruleId,
      input: req.body,
    }));
  } catch (error) {
    next(error);
  }
}

function approve(req, res, next) {
  try {
    assertRuleInProject(req);
    success(res, MappingApi.approveMappingRule({
      config: req.app.locals.config,
      ruleId: req.params.ruleId,
      approvedBy: req.user && req.user.id,
    }));
  } catch (error) {
    next(error);
  }
}

function reject(req, res, next) {
  try {
    assertRuleInProject(req);
    success(res, MappingApi.rejectMappingRule({
      config: req.app.locals.config,
      ruleId: req.params.ruleId,
      rejectedReason: req.body.rejected_reason,
    }));
  } catch (error) {
    next(error);
  }
}

function remove(req, res, next) {
  try {
    assertRuleInProject(req);
    success(res, MappingApi.deleteMappingRule({
      config: req.app.locals.config,
      ruleId: req.params.ruleId,
    }));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  approve,
  create,
  list,
  reject,
  remove,
  settings,
  show,
  update,
};
