# Architecture Clean Baseline - `05-architecture`

Đây là implementation record local của DEC-002. Nó xác định baseline sạch cần đạt cho architecture instance hiện có; không phải reusable guide pack và không thay entity instance canonical tại `docs/app/05-architecture/`.

## Scope

Baseline bao phủ 43 instance hiện có thuộc 7 entity type đã promote:

| Entity type | Instance IDs |
| --- | --- |
| Module | `MOD-001` đến `MOD-010` |
| ModuleBoundary | `MB-001` đến `MB-006` |
| InteractionFlow | `AF-001` đến `AF-007` |
| StateOwner | `SO-001` đến `SO-007` |
| DataFlow | `DF-001` đến `DF-006` |
| DeploymentUnit | `DU-001` |
| CrossCuttingRule | `CCR-001` đến `CCR-006` |

## Definition Of Done

- Mỗi instance trong scope có `schema: entity-instance/v1` và đủ field base: `id`, `slug`, `title`, `entity_type`, `layer`, `concern`, `status`, `summary`.
- Mỗi instance có `## Summary`, `## Meaning`, `## Relations`, `## Validation Notes` cùng section do entity type yêu cầu.
- Verifier chặn thiếu/thừa instance ngoài đúng 43 ID trong Scope.
- Mọi edge canonical trong frontmatter pass entity type relation slot, valid triple và target instance type.
- Verifier chặn thiếu/thừa relation ngoài đúng 129 edge trong Core Relation Baseline.
- Mỗi Markdown link trong `Related Entities` được phân loại `Canonical relation` hoặc `Context/evidence`; nhãn canonical phải có direct edge incident trong frontmatter, direction vẫn theo source YAML và prose không tự thành edge.
- Core graph giữ đúng 129 edge đã được materialize; baseline không tự thêm edge khác.
- `npm run verify:architecture-baseline` pass.
- `npm run verify:architecture-trace` pass.

## Core Relation Baseline

Core graph có 129 edge: 38 edge từ InteractionFlow, 20 edge từ ModuleBoundary, 7 ownership edge từ Module, 15 edge từ DataFlow/StateOwner, 10 edge từ DeploymentUnit và 39 edge từ CrossCuttingRule.

### InteractionFlow

| Source | `involves` Module | `changes` StateOwner |
| --- | --- | --- |
| AF-001 | MOD-002, MOD-004, MOD-008, MOD-006, MOD-001 | SO-003, SO-001 |
| AF-002 | MOD-002, MOD-008, MOD-006 | SO-003 |
| AF-003 | MOD-002, MOD-008, MOD-006 | SO-003 |
| AF-004 | MOD-003, MOD-001, MOD-006 | SO-002, SO-001, SO-003 |
| AF-005 | MOD-001 | SO-001 |
| AF-006 | MOD-007, MOD-001, MOD-004, MOD-005, MOD-006 | SO-003, SO-006 |
| AF-007 | MOD-001, MOD-006, MOD-007, MOD-004, MOD-005 | SO-001, SO-003, SO-006 |

`changes` nghĩa là flow có execution path đã được model hóa có thể thay đổi state, không phải mọi lần chạy đều ghi mọi target.

### ModuleBoundary

| Source | `constrains` Module | `constrains` StateOwner |
| --- | --- | --- |
| MB-001 | MOD-001 | SO-001 |
| MB-002 | MOD-001 đến MOD-010 | - |
| MB-003 | MOD-010, MOD-007, MOD-003 | - |
| MB-004 | MOD-003 | SO-002 |
| MB-005 | MOD-006 | SO-003 |
| MB-006 | MOD-007 | - |

### Module Ownership

| Source | `owns` StateOwner |
| --- | --- |
| MOD-001 | SO-001 |
| MOD-003 | SO-002 |
| MOD-003 | SO-007 |
| MOD-004 | SO-005 |
| MOD-005 | SO-006 |
| MOD-006 | SO-003 |
| MOD-008 | SO-004 |

### DataFlow

| DataFlow | StateOwner input `shared_via` | StateOwner output `moves` |
| --- | --- | --- |
| DF-001 | external Backlog source | SO-001 |
| DF-002 | SO-001 | SO-002 |
| DF-003 | SO-001, SO-004, SO-005, SO-006 | ephemeral dry-run preview |
| DF-004 | SO-001, SO-004, SO-005, SO-006 | external Jira payload |
| DF-005 | SO-002 | SO-001 |
| DF-006 | external Jira result | SO-001, SO-003 |

### DeploymentUnit

| DeploymentUnit | `hosts` Module |
| --- | --- |
| DU-001 | MOD-001 đến MOD-010 |

Worker nội bộ, SQLite và local storage là role/dependency của DU-001; chúng không tạo DeploymentUnit hoặc relation target riêng.

### CrossCuttingRule

| CrossCuttingRule | `constrains` Module | `constrains` StateOwner |
| --- | --- | --- |
| CCR-001 | MOD-002, MOD-001, MOD-003, MOD-007, MOD-006 | - |
| CCR-002 | MOD-001 đến MOD-010 | - |
| CCR-003 | MOD-002, MOD-003, MOD-006, MOD-007 | - |
| CCR-004 | MOD-007, MOD-004, MOD-005, MOD-001, MOD-006 | - |
| CCR-005 | MOD-003, MOD-001, MOD-005 | SO-002, SO-001 |
| CCR-006 | MOD-001 đến MOD-010 | - |

`constrains` là rule applicability đã được Scope và Statement xác nhận; nó không mang nghĩa business impact của `affects`.

Relation mới chỉ được thêm theo DEC-002 khi phần trace tương ứng có evidence và contract meta rõ.

## Migration Boundary

- Rebuild instance tại canonical path hiện hữu; không tạo `old/` hoặc `new/` truth song song.
- Prose/code cũ được giữ như evidence hoặc context trong instance đã chuẩn hóa; Git history giữ trạng thái trước baseline.
- Không dùng `docs/workbench/` cho baseline này; Workbench CIS active theo DEC-003 nhưng không phải architecture SoT.
