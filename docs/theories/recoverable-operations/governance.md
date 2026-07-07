# TH-OPS-TRACE - Governance

## Boundary contract

- `Owns`: traceability, recoverability, retry as operation, audit/journal reasoning.
- `Excludes`: dry-run gate logic, module boundary logic, canonical branch semantics, schema/runtime detail.
- `Depends on`: `TH-HUBFLOW`, một phần `TH-CANON`.
- `Typical impact areas`: `01-business`, `06-technical`, `08-quality`, `09-operation`.

## Reference notes

- Nguồn app-specific chính đến từ sync engine, failed-job retry, audit-and-journal review, monitor-and-recover.
- Theory giữ generic để áp dụng cho mọi operation có side effect, không chỉ sync job.

## Challenges

- `open`: Mức trace nào là đủ để ra quyết định mà không tạo noise quá lớn?
- `open`: Khi nào auto-retry nên dừng để ưu tiên operator control?

## Decisions

- `accepted`: Retry là một phần của recoverability reasoning chứ không chỉ là tiện ích kỹ thuật.
- `accepted`: Không đưa schema queue/journal hay backoff cụ thể vào pure theory.

## Boundary drift / split signals

- Theory bắt đầu đi quá sâu vào route admin, SQL schema hoặc dashboard implementation.
- Theory bắt đầu sở hữu dry-run gate thay vì traceability/recovery.
- Agent review phải giải thích quá nhiều về canonical truth để hiểu operation state.
