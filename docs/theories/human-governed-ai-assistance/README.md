# TH-AI-GOV - Human-governed AI Assistance

## Mục đích

`TH-AI-GOV` giữ nền suy luận cho vai trò đúng của AI trong hệ thống vận hành: AI có thể draft, propose, analyze, nhưng không tự trở thành người quyết định vận hành cuối cùng.

## Core positions

- `TH-AI-GOV-01`: AI propose, human decide.
- `TH-AI-GOV-02`: AI transport phải tách khỏi business review logic.
- `TH-AI-GOV-03`: Provider, model hay transport không được trở thành business contract.
- `TH-AI-GOV-04`: Reviewed result chỉ có hiệu lực khi đi qua owner path vào operational state.
- `TH-AI-GOV-05`: Low confidence làm tăng review priority, không tạo quyền auto-commit.

## Boundary semantics

- `Owns`: AI draft/propose/analyze role, human final authority, transport-vs-business boundary.
- `Excludes`: provider detail, model naming, prompt payload format, sync gate detail.
- `Depends on`: `TH-CANON`.
- `Typical impact areas`: `01-business`, `02-product`, `05-architecture`, `06-technical`, `09-operation`.

## Key tensions

- tốc độ tự động hóa vs độ tin cậy;
- flexibility đổi provider vs tính ổn định của contract nghiệp vụ;
- AI assistance vs human accountability.

## Theory này không chứa

- tên model cụ thể;
- config provider cụ thể;
- class transport cụ thể;
- request body hay prompt template cụ thể.

## Ảnh hưởng app

Theory này thường dẫn mạnh ở:

- `app/01-business`
- `app/02-product`
- `app/05-architecture`
- `app/06-technical`
- `app/09-operation`

## Đọc tiếp khi nào

- Đọc `agent.md` khi review flow AI draft, review queue, transport boundary.
- Đọc `theory.md` khi cần giải thích vì sao AI không được tự chốt operational mutation.
- Đọc `governance.md` khi có tension mới giữa tốc độ tự động và trách nhiệm con người.
