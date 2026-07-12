<!-- PR-CHANGE-MANIFEST:v1 -->
# Pull Request

## Classification

- Product behavior change: no
- Change stage: not-applicable
- Sync verdict: skip
- Authority:
- Sync result reference:

## Behavior delta

- Before:
- After:
- Unchanged guardrails:
- No behavior change reason: Internal rename of helper without contract change.

## Docs impact

- Changed docs/app paths:
- No docs impact reason: Refactor stays inside src helper; docs/app truth unchanged.

## Test evidence

| Command | Result | Coverage |
| --- | --- | --- |
| npm run verify:phase04 | pass | translation review still green |

## Confirmation

- [x] Reviewed `product-change sync result` when this PR changes product behavior
- [x] Reviewed docs impact against changed `docs/app` paths or recorded no-doc-impact reason
- [x] Recorded test evidence with result and coverage
