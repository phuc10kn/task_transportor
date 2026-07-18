UPDATE projects
SET translation_provider = 'deepseek',
    translation_model = 'DeepSeekV4Flash',
    updated_at = datetime('now')
WHERE translation_provider <> 'deepseek'
  AND (translation_model IS NULL OR translation_model = '')
  AND (translation_command_profile IS NULL OR translation_command_profile = '');

UPDATE projects
SET translation_model = 'DeepSeekV4Flash',
    updated_at = datetime('now')
WHERE translation_provider = 'deepseek'
  AND (translation_model IS NULL OR translation_model = '');
