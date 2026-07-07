# TH-SYNC-SAFE - Governance

## Boundary contract

- `Owns`: dry-run, readiness, external write guardrail, stale preview semantics.
- `Excludes`: retry policy detail, journal schema, canonical ownership generic, payload implementation.
- `Depends on`: `TH-CANON`, `TH-HUBFLOW`.
- `Typical impact areas`: `01-business`, `02-product`, `05-architecture`, `08-quality`, `09-operation`.

## Reference notes

- Nguồn app-specific chính đến từ workflow dry-run, CIS-to-target sync và sync engine.
- Theory giữ ở mức principle để tái dùng cho outbound write nói chung.

## Challenges

- `open`: Điều gì là mức freshness tối thiểu đủ mạnh cho preview trước publish?
- `open`: Có nên phân loại external write theo mức độ đảo ngược để khác guardrail hay không?

## Decisions

- `accepted`: Dry-run là safety gate chứ không chỉ là preview UI.
- `accepted`: Retry, journal và payload detail không thuộc theory này.

## Boundary drift / split signals

- Theory bắt đầu mô tả route API, payload builder hoặc request contract.
- Theory bắt đầu nói quá sâu về retry policy và operation recovery.
- Theory mất khả năng áp dụng cho external write nói chung vì dính chặt một integration cụ thể.
