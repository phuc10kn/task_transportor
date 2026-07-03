UPDATE projects
SET translation_provider = 'deepseek',
    translation_model = COALESCE(NULLIF(translation_model, ''), 'DeepSeekV4Flash'),
    updated_at = datetime('now')
WHERE translation_provider = 'manual';

UPDATE translation_queue
SET provider = 'deepseek',
    model_or_command = COALESCE(NULLIF(model_or_command, ''), 'DeepSeekV4Flash'),
    provider_error = 'MANUAL_PROVIDER_REMOVED',
    updated_at = datetime('now')
WHERE provider = 'manual';
