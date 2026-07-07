# TH-CANON - Governance

## Boundary contract

- `Owns`: canonical truth, source snapshot vs canonical branch, owner of operational state.
- `Excludes`: module boundary generic, hub topology generic, outbound guardrail, retry mechanics.
- `Depends on`: `TH-HUBFLOW`.
- `Typical impact areas`: `00-context`, `04-domain`, `05-architecture`, `06-technical`, `10-decisions`.

## Reference notes

- Phase 05 đã nhập provenance từ legacy CIS/workflow/import-theories vào root theory governance và decision layer.
- Theory giữ generic; app docs mới nói chi tiết schema thật.

## Challenges

- `open`: Mức versioning nào là đủ cho canonical truth mà không biến theory thành schema strategy?
- `open`: Khi reviewed state ngày càng nhiều loại, có cần tách thêm theory con về governed enrichment state không?

## Decisions

- `accepted`: Canonical state, source snapshot, reviewed state và workflow state phải được gọi tên riêng.
- `accepted`: Không dùng theory này để ghi chi tiết field path, bảng hay UI editor.

## Boundary drift / split signals

- Theory bắt đầu trở thành tài liệu schema.
- Theory phải giải thích quá nhiều về dry-run, retry hoặc outbound publish.
- Agent review liên tục nhầm queue state với canonical truth.
