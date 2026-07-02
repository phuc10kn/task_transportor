const express = require("express");

const MappingRulesController = require("./controllers/MappingRulesController");

function createMappingRouter({ authenticate }) {
  const router = express.Router();

  router.use(authenticate);
  router.get("/mapping-settings", MappingRulesController.settings);
  router.get("/mapping-rules", MappingRulesController.list);
  router.post("/mapping-rules", MappingRulesController.create);
  router.get("/mapping-rules/:ruleId", MappingRulesController.show);
  router.patch("/mapping-rules/:ruleId", MappingRulesController.update);
  router.delete("/mapping-rules/:ruleId", MappingRulesController.remove);
  router.post("/mapping-rules/:ruleId/approve", MappingRulesController.approve);
  router.post("/mapping-rules/:ruleId/reject", MappingRulesController.reject);

  return router;
}

module.exports = {
  createMappingRouter,
};
