const { AppError } = require("../../../http/errors/AppError");
const {
  DEFAULT_TRANSLATION_AI_PROVIDER,
  DEFAULT_TRANSLATION_AI_MODEL,
  DEFAULT_TRANSLATION_AI_TRANSPORT,
  TRANSLATION_AI_PROVIDERS,
  TRANSLATION_AI_TRANSPORTS,
  normalizeTranslationAiModel,
  normalizeTranslationAiProvider,
  normalizeTranslationAiTransport,
} = require("../../../shared/translationModels");

function projectsApi() {
  return require("../../Projects/ProjectsApi");
}

function projectAiConfig(project) {
  const provider = normalizeTranslationAiProvider(
    project.translation_ai_provider ||
    project.translation_provider ||
    DEFAULT_TRANSLATION_AI_PROVIDER
  );

  if (provider === TRANSLATION_AI_PROVIDERS.CODEX_EXEC) {
    return {
      ai_transport: TRANSLATION_AI_TRANSPORTS.PROCESS_EXEC,
      model_or_command: project.translation_command_profile || null,
      provider,
    };
  }

  const transport = normalizeTranslationAiTransport(
    project.translation_ai_transport ||
    DEFAULT_TRANSLATION_AI_TRANSPORT
  );
  const model = normalizeTranslationAiModel(
    provider,
    project.translation_ai_model ||
    project.translation_model ||
    DEFAULT_TRANSLATION_AI_MODEL
  );

  return {
    ai_transport: transport,
    model_or_command: model,
    provider,
  };
}

function sameAiConfig(item, nextConfig) {
  return item.provider === nextConfig.provider &&
    item.ai_transport === nextConfig.ai_transport &&
    (item.model_or_command || null) === (nextConfig.model_or_command || null);
}

function refreshTranslationAiConfigForQueueItem({ config, repository, item }) {
  const project = projectsApi().getProject({ config, projectId: item.project_id });
  if (!project) {
    throw new AppError({
      code: "PROJECT_NOT_FOUND",
      message: "Project not found for translation queue item.",
      status: 404,
      details: {
        project_id: item.project_id,
        translation_queue_id: item.id,
      },
    });
  }

  const nextConfig = projectAiConfig(project);
  if (sameAiConfig(item, nextConfig)) {
    return item;
  }

  return repository.updateAiConfig(item.id, nextConfig);
}

module.exports = {
  projectAiConfig,
  refreshTranslationAiConfigForQueueItem,
};
