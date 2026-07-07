# TH-SYNC-SAFE - Safe External Synchronization

## Mục đích

`TH-SYNC-SAFE` giữ nền suy luận cho outbound external write có rủi ro cao: vì sao cần dry-run, readiness/pre-check, stale preview rule và guardrail trước khi ghi sang hệ ngoài.

## Core positions

- `TH-SYNC-SAFE-01`: Outbound external write là action rủi ro cao hơn internal mutation.
- `TH-SYNC-SAFE-02`: Dry-run là safety gate, không phải UI gimmick.
- `TH-SYNC-SAFE-03`: Readiness và pre-check có quyền chặn sync thật.
- `TH-SYNC-SAFE-04`: Stale preview không được dùng làm căn cứ publish thật.
- `TH-SYNC-SAFE-05`: Irreversible write cần guardrail mạnh hơn update nội bộ.

## Boundary semantics

- `Owns`: dry-run, readiness, external write guardrail, stale preview semantics.
- `Excludes`: retry policy detail, journal schema, canonical ownership generic, payload implementation.
- `Depends on`: `TH-CANON`, `TH-HUBFLOW`.
- `Typical impact areas`: `01-business`, `02-product`, `05-architecture`, `08-quality`, `09-operation`.

## Key tensions

- tốc độ publish vs an toàn;
- automation vs niềm tin của operator;
- freshness vs throughput.

## Theory này không chứa

- payload cụ thể của hệ ngoài;
- endpoint API cụ thể;
- code builder hay repository cụ thể;
- retry mechanics cụ thể.

## Ảnh hưởng app

Theory này thường dẫn mạnh ở:

- `app/01-business`
- `app/02-product`
- `app/05-architecture`
- `app/08-quality`
- `app/09-operation`

## Đọc tiếp khi nào

- Đọc `agent.md` khi review dry-run, pre-check, stale preview hoặc outbound gate.
- Đọc `theory.md` khi cần giải thích vì sao sync thật phải “khó hơn” preview.
- Đọc `governance.md` khi thấy theory này bị kéo sang retry/journal implementation.
