UPDATE projects
SET translation_provider = 'deepseek',
    translation_model = 'deepseek-v4-flash',
    translation_ai_provider = 'deepseek',
    translation_ai_transport = 'openai_compatible',
    translation_ai_model = 'deepseek-v4-flash',
    translation_command_profile = NULL,
    updated_at = datetime('now')
WHERE translation_provider = 'codex_exec'
   OR translation_ai_provider = 'codex_exec'
   OR translation_ai_transport = 'process_exec';

UPDATE translation_queue
SET provider = 'deepseek',
    ai_transport = 'openai_compatible',
    model_or_command = 'deepseek-v4-flash',
    provider_error = NULL,
    updated_at = datetime('now')
WHERE review_status = 'pending'
  AND (provider = 'codex_exec' OR ai_transport = 'process_exec');
