ALTER TABLE projects
ADD COLUMN cis_mapping_values_json TEXT NOT NULL DEFAULT '{}';
