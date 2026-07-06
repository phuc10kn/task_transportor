---
id: CCR-002
slug: owner-write-discipline
entity_type: CrossCuttingRule
layer: 05-architecture
concern: 07-cross-cutting
status: active
theory_basis:
  - TH-MOD-01
  - TH-MOD-06
---

# CCR-002 - Owner Write Discipline

## Meaning

Shared DB không làm mất owner write của module.

## Statement

Cross-module write mặc định bị cấm. Nếu cần thay đổi dữ liệu của module khác, phải đi qua API công khai của owner.

## Scope

Toàn bộ module business trong monolith.

## Evidence

- `docs/architecture/04-boundaries.md`
