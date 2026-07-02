DELETE FROM sync_jobs
WHERE job_type = 'translate'
  AND json_extract(payload_json, '$.translation_queue_id') IN (
    SELECT id
    FROM translation_queue
    WHERE target_type = 'issue'
      AND comment_id IS NULL
      AND target_field IS NULL
  );

DELETE FROM translation_queue
WHERE target_type = 'issue'
  AND comment_id IS NULL
  AND target_field IS NULL;
