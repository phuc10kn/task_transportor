# TH-CANON - Canonical State Governance

## Mục đích

`TH-CANON` giữ nền suy luận cho `canonical truth`, `source snapshot`, `reviewed state`, `workflow state` và owner của từng loại state.

Theory này trả lời:

- đâu là operational truth mà hệ thống dùng để ra quyết định;
- vì sao snapshot từ nguồn ngoài không được nhầm với canonical branch;
- vì sao reviewed state và job state không thay thế canonical state.

## Core positions

- `TH-CANON-01`: Canonical state là operational truth mà hệ thống tin dùng.
- `TH-CANON-02`: Source snapshot phải được giữ tách khỏi canonical branch.
- `TH-CANON-03`: Reviewed state và workflow state không thay thế canonical state.
- `TH-CANON-04`: Canonical truth phải có owner rõ.
- `TH-CANON-05`: Projection hay read model không được giả làm canonical truth.

## Boundary semantics

- `Owns`: canonical truth, source snapshot vs canonical branch, owner of operational state.
- `Excludes`: module boundary generic, hub topology generic, outbound guardrail, retry mechanics.
- `Depends on`: `TH-HUBFLOW`.
- `Typical impact areas`: `00-context`, `04-domain`, `05-architecture`, `06-technical`, `10-decisions`.

## Key tensions

- fidelity với nguồn vs khả năng chỉnh sửa để vận hành;
- một nguồn truth vs nhiều view phục vụ workflow;
- state có nghĩa nghiệp vụ vs state phục vụ điều phối kỹ thuật.

## Theory này không chứa

- field path cụ thể;
- schema bảng cụ thể;
- UI editor cụ thể;
- payload preview cụ thể cho hệ ngoài.

## Ảnh hưởng app

Theory này thường được áp dụng mạnh nhất ở:

- `app/00-context`
- `app/04-domain`
- `app/05-architecture`
- `app/06-technical`
- `app/10-decisions`

## Đọc tiếp khi nào

- Đọc `agent.md` khi review owner state, canonical update hay read model.
- Đọc `theory.md` khi cần phân biệt canonical state với reviewed queue hoặc job state.
- Đọc `governance.md` khi thấy theory này bắt đầu bị kéo sang schema doc hay UI doc.
