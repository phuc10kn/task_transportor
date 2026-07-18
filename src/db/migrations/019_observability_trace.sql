ALTER TABLE sync_jobs ADD COLUMN trace_id TEXT;
ALTER TABLE sync_jobs ADD COLUMN correlation_id TEXT;
ALTER TABLE sync_journal ADD COLUMN trace_id TEXT;

UPDATE sync_jobs
SET correlation_id = COALESCE(
  correlation_id,
  (
    SELECT correlation_id
    FROM sync_journal
    WHERE sync_journal.sync_job_id = sync_jobs.id
      AND sync_journal.correlation_id IS NOT NULL
    ORDER BY sync_journal.id ASC
    LIMIT 1
  ),
  json_extract(payload_json, '$.request_correlation_id')
);

UPDATE sync_jobs
SET trace_id = 'trc_' || lower(hex(randomblob(16)))
WHERE trace_id IS NULL;

UPDATE sync_journal
SET trace_id = (
  SELECT sync_jobs.trace_id
  FROM sync_jobs
  WHERE sync_jobs.id = sync_journal.sync_job_id
)
WHERE trace_id IS NULL AND sync_job_id IS NOT NULL;

CREATE INDEX idx_sync_jobs_trace ON sync_jobs(trace_id);
CREATE INDEX idx_sync_journal_trace ON sync_journal(trace_id);
