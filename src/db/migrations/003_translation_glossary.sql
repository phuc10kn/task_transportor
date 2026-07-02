ALTER TABLE projects
ADD COLUMN translation_glossary_json TEXT NOT NULL DEFAULT '[]';
