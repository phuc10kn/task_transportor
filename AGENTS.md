# Codex Project Guide

## Scope

This file applies to the whole `task_transportor` repository.

The current product direction is the Central Sync Hub documented in `docs/work`. Treat those files as the source of truth for new implementation work.

Ignore the old `backlog2jira` directory for normal Codex work. Do not read, search, modify, or use it as a design source unless the user explicitly asks for migration, comparison, or cleanup work involving `backlog2jira`.

## Product Model

Use the model **System -> CIS -> System**:

- Inbound: Backlog/Jira send webhooks or Admin UI triggers manual pull into CIS.
- Processing: CIS stores raw events, normalizes payloads, translates, reviews, learns mapping, detects anomalies, and records audit data.
- Outbound: CIS pushes approved data to the destination system. MVP prioritizes `Backlog -> CIS`, `Jira -> CIS`, and `CIS -> Jira`.

Key docs:

- `docs/work/README.md` - overview and reading order.
- `docs/work/implement-interview.md` - implementation decisions collected from the user.
- `docs/work/01-architecture.md` - architecture principles.
- `docs/work/02-central-issue-store.md` - CIS schema.
- `docs/work/03-backlog-ingestion.md` - Backlog inbound.
- `docs/work/04-jira-ingestion.md` - Jira inbound and CIS outbound to Jira.
- `docs/work/06-sync-engine.md` - job processing, retry, and audit.

## Tech Stack

- Runtime: Node.js, CommonJS.
- API server: Express.
- MVP database decision: SQLite.
- Planned SQLite library: prefer `better-sqlite3` unless the user later chooses a different option.
- MVP admin auth: simple JWT with email + password.
- Attachment storage: local disk under project-controlled storage paths.

## Commands

- Install dependencies: `npm install`
- Start server: `npm start`
- Dev server: `npm run dev`

The current `npm test` script is a placeholder. If implementation adds tests, update `package.json` with a real test command.

## Coding Rules

- Keep edits aligned with `docs/work/implement-interview.md`.
- Prefer small, focused modules over broad rewrites.
- Keep secrets out of git. Use `.env` or local `.codex/config.toml` for machine-specific credentials.
- Do not hard-code Backlog/Jira credentials, OpenAI API keys, Codex auth paths, JWT secrets, or internal server paths.
- Use `direction_from` and `direction_to` for sync jobs, sync journal, and mapping direction. Do not replace them with a single `direction` field unless the docs are intentionally updated first.
- Webhook handlers should verify, persist raw payload, enqueue a job, and return quickly. Heavy processing belongs in worker/job code.
- Manual pull and webhook ingest should share normalizers where possible.
- For outbound sync, support dry-run before real Jira writes.

## Documentation Rules

- Keep documentation in Vietnamese with dấu unless the user asks otherwise.
- When changing implementation behavior, update the relevant file in `docs/work`.
- Maintain the distinction between:
  - `webhook_events`: raw inbound event log.
  - `sync_jobs`: internal job queue for inbound/outbound work.
  - `sync_journal`: audit trail of job results and state changes.
