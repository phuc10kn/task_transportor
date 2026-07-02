ALTER TABLE translation_queue
ADD COLUMN target_field TEXT CHECK(target_field IN ('summary', 'description') OR target_field IS NULL);

