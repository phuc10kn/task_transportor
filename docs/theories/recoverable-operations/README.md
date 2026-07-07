# TH-OPS-TRACE - Recoverable Operations and Traceability

## Mục đích

`TH-OPS-TRACE` giữ nền suy luận cho các operation có side effect: phải trace được, retry có nghĩa vận hành, failure nên recoverable hoặc ít nhất diagnosable.

## Core positions

- `TH-OPS-TRACE-01`: Operation có side effect phải trace được.
- `TH-OPS-TRACE-02`: Retry là hành vi vận hành có nghĩa, không chỉ là loop kỹ thuật.
- `TH-OPS-TRACE-03`: Audit và journal là công cụ ra quyết định, không chỉ là log lưu lại.
- `TH-OPS-TRACE-04`: Failure nên recoverable hoặc ít nhất diagnosable.
- `TH-OPS-TRACE-05`: Operation state và business state phải tách lớp nhưng liên hệ được.

## Boundary semantics

- `Owns`: traceability, recoverability, retry as operation, audit/journal reasoning.
- `Excludes`: dry-run gate logic, module boundary logic, canonical branch semantics, schema/runtime detail.
- `Depends on`: `TH-HUBFLOW`, một phần `TH-CANON`.
- `Typical impact areas`: `01-business`, `06-technical`, `08-quality`, `09-operation`.

## Key tensions

- trace đầy đủ vs complexity;
- automatic retry vs quyền kiểm soát của operator;
- khả năng giải thích vs chi phí vận hành.

## Theory này không chứa

- schema queue hay journal cụ thể;
- retry delay cụ thể;
- route admin cụ thể;
- dashboard implementation cụ thể.

## Ảnh hưởng app

Theory này thường dẫn mạnh ở:

- `app/01-business`
- `app/06-technical`
- `app/08-quality`
- `app/09-operation`

## Đọc tiếp khi nào

- Đọc `agent.md` khi review job state, retry, audit trail hoặc recovery flow.
- Đọc `theory.md` khi cần phân biệt log kỹ thuật với operational traceability.
- Đọc `governance.md` khi theory này bắt đầu bị lẫn với sync-safety gate.
