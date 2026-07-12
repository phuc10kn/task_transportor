<!-- PR-CHANGE-MANIFEST:v1 -->
# Pull Request

## Classification

- Product behavior change: yes
- Change stage: implemented
- Sync verdict: ready_for_write
- Authority: docs/app/02-product/README.md
- Sync result reference: chat artifact product-change sync result

## Behavior delta

- Before: Scope could be read as full bidirectional sync.
- After: Lite prefers Backlog -> CIS and CIS -> Jira.
- Unchanged guardrails: Dry-run before real Jira write.
- No behavior change reason:

## Docs impact

- Changed docs/app paths:
  - docs/app/02-product/README.md
- No docs impact reason:

## Test evidence

| Command | Result | Coverage |
| --- | --- | --- |
| npm run verify:phase03 | pass | inbound pull behavior |
| npm run verify:phase06 | pass | outbound Jira behavior |

## Confirmation

- [x] Reviewed `product-change sync result` when this PR changes product behavior
- [x] Reviewed docs impact against changed `docs/app` paths or recorded no-doc-impact reason
- [x] Recorded test evidence with result and coverage
