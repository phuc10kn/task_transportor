---
id: CCR-001
slug: system-cis-system
entity_type: CrossCuttingRule
layer: 05-architecture
concern: 07-cross-cutting
status: active
theory_basis:
  - TH-HUBFLOW-01
  - TH-HUBFLOW-02
  - TH-HUBFLOW-03
---

# CCR-001 - System CIS System

## Meaning

Toàn bộ kiến trúc hiện tại tổ chức quanh mô hình `System -> CIS -> System`.

## Why this rule exists

Rule này là “trục đọc” của cả repo. Nó trả lời tại sao:

- inbound không đi thẳng sang target system khác;
- canonicalization phải xảy ra trong app;
- review và dry-run có chỗ đứng tự nhiên;
- outbound sync phải đọc từ CIS chứ không đọc lại raw payload.

## Statement

Inbound đi vào CIS để canonicalize và review; outbound lấy dữ liệu từ CIS thay vì sync thẳng giữa external systems.

## Scope

`Backlog`, `Cis`, `Translation`, `Jira`, `Sync`

## Design consequences

- `Cis` là owner của canonical issue state.
- `Backlog` và `Jira` là integration modules quanh core.
- `Translation` là review path gắn với canonical state chứ không gắn trực tiếp với external payload.
- `Sync` trở thành execution backbone chứ không là owner của business state.

## Review questions this rule forces

- Flow mới này có đang bỏ qua CIS không?
- State mới này là canonical state hay chỉ là queue/projection?
- Integration mới này có đang tạo đường `System -> System` không?

## Anti-patterns avoided

- Đồng bộ thẳng Backlog sang Jira mà không qua canonical core.
- Để external payload shape lan vào review và outbound flow.
- Trộn source ownership với target transport ownership.

## Evidence

- `docs/app/05-architecture/README.md`
- Legacy work product overview, retained only as Phase 02 architecture provenance until architecture truth is fully migrated.
