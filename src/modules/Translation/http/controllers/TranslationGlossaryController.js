const { success } = require("../../../../http/response/envelope");
const TranslationApi = require("../../TranslationApi");

function list(req, res, next) {
  try {
    success(res, TranslationApi.listTranslationGlossary({
      config: req.app.locals.config,
      projectId: req.params.projectId,
      groupKey: req.query.group_key,
      query: req.query.q,
    }));
  } catch (error) {
    next(error);
  }
}

function create(req, res, next) {
  try {
    success(res, TranslationApi.createTranslationGlossaryConcept({
      config: req.app.locals.config,
      projectId: req.params.projectId,
      input: req.body,
      actorId: req.user && req.user.id,
    }), 201);
  } catch (error) {
    next(error);
  }
}

function update(req, res, next) {
  try {
    success(res, TranslationApi.updateTranslationGlossaryConcept({
      config: req.app.locals.config,
      projectId: req.params.projectId,
      conceptId: req.params.conceptId,
      input: req.body,
      actorId: req.user && req.user.id,
    }));
  } catch (error) {
    next(error);
  }
}

function remove(req, res, next) {
  try {
    success(res, TranslationApi.deleteTranslationGlossaryConcept({
      config: req.app.locals.config,
      projectId: req.params.projectId,
      conceptId: req.params.conceptId,
    }));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  list,
  remove,
  update,
};
