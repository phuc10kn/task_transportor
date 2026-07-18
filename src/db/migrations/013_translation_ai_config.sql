ALTER TABLE projects ADD COLUMN translation_ai_provider TEXT NOT NULL DEFAULT 'deepseek';
ALTER TABLE projects ADD COLUMN translation_ai_transport TEXT NOT NULL DEFAULT 'openai_compatible';
ALTER TABLE projects ADD COLUMN translation_ai_model TEXT;

UPDATE projects
SET translation_ai_provider = CASE
      WHEN translation_provider IN ('deepseek', 'openai') THEN translation_provider
      ELSE 'deepseek'
    END,
    translation_ai_transport = 'openai_compatible',
    translation_ai_model = CASE
      WHEN translation_provider = 'deepseek' AND translation_model IN ('DeepSeekV4Flash', 'DeepSeekV4', 'deepseek-v4-flash') THEN 'deepseek-v4-flash'
      WHEN translation_provider = 'deepseek' AND translation_model IN ('DeepSeekV4Pro', 'deepseek-v4-pro') THEN 'deepseek-v4-pro'
      WHEN translation_provider = 'deepseek' AND translation_model IN ('DeepSeekChat', 'deepseek-chat') THEN 'deepseek-chat'
      WHEN translation_provider = 'deepseek' THEN 'deepseek-v4-flash'
      ELSE NULL
    END;

UPDATE projects
SET translation_provider = translation_ai_provider,
    translation_model = translation_ai_model;

ALTER TABLE translation_queue ADD COLUMN ai_transport TEXT;

UPDATE translation_queue
SET provider = CASE WHEN provider IN ('deepseek', 'openai') THEN provider ELSE 'deepseek' END,
    model_or_command = CASE
      WHEN provider = 'deepseek' AND model_or_command IN ('DeepSeekV4Flash', 'DeepSeekV4', 'deepseek-v4-flash') THEN 'deepseek-v4-flash'
      WHEN provider = 'deepseek' AND model_or_command IN ('DeepSeekV4Pro', 'deepseek-v4-pro') THEN 'deepseek-v4-pro'
      WHEN provider = 'deepseek' AND model_or_command IN ('DeepSeekChat', 'deepseek-chat') THEN 'deepseek-chat'
      ELSE model_or_command
    END,
    ai_transport = 'openai_compatible';
