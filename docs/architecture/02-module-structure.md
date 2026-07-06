# Module Structure

File này chốt cách `task_transportor` áp dụng cấu trúc module.

Chuẩn generic về folder/module vẫn nằm ở:

- [custom_modular_monolith_theory/module_structure.md](custom_modular_monolith_theory/module_structure.md)
- [custom_modular_monolith_theory/module_design_template.md](custom_modular_monolith_theory/module_design_template.md)
- [custom_modular_monolith_theory/implement_rules.md](custom_modular_monolith_theory/implement_rules.md)

## Cấu trúc gốc

Repo dùng dạng:

```text
src/modules/<Domain>/
```

Mỗi module có public boundary riêng qua `<Domain>Api.js`. Không import sâu sang `application/`, `infrastructure/` hoặc `support/` của module khác.

## Bản đồ domain hiện tại

| Module | Trách nhiệm chính |
| --- | --- |
| `Auth` | Admin login, JWT, password hash |
| `Projects` | Project config, sync toggle, cấu hình tích hợp và tên biến env liên quan |
| `Cis` | Issue, revision, comment, attachment metadata, canonical state |
| `Backlog` | Pull, normalizer, adapter Backlog inbound |
| `Translation` | Translation queue, AI draft, review, manual edit |
| `Mapping` | Mapping rules, approval, required mapping pre-check |
| `Anomaly` | Anomaly log, ignore, resolve, blocking check |
| `Sync` | Queue job, retry, worker state, journal |
| `Jira` | Dry-run, payload builder, outbound sync, adapter Jira |
| `Dashboard` | Reporting, counts, health summary, operations read model nhẹ |

`Attachments` có thể được tách thành module riêng sau này nếu boundary của attachment lớn hơn phạm vi `Cis`.

## Nguyên tắc đặt code trong repo này

- Use case nghiệp vụ đặt trong module owner.
- Repository và client riêng domain đặt trong `src/modules/<Domain>/infrastructure`.
- Hạ tầng kỹ thuật dùng chung đặt trong `src/infrastructure`.
- Utility thuần không thuộc domain nào đặt trong `src/shared`.
- Không nhét business orchestration vào `src/infrastructure` hoặc `src/shared`.

## Khi thêm module mới

1. Xác định owner rõ ràng.
2. Đặt capability public qua `<Domain>Api.js`.
3. Cập nhật file này nếu module đó trở thành một phần của kiến trúc chính của repo.
4. Dùng template generic ở [custom_modular_monolith_theory/module_design_template.md](custom_modular_monolith_theory/module_design_template.md) nếu cần thiết kế từ đầu.
