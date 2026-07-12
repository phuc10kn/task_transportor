# Documentation Guide

## Mục đích

`docs/guide/` là manual hướng dẫn cách đọc, viết, validate và evolve hệ tài liệu của repo.

Guide này trả lời:

- bắt đầu đọc docs từ đâu;
- `docs/app`, `docs/meta`, `docs/theories`, `docs/workbench` và guide pack khác nhau thế nào;
- khi thêm knowledge mới thì đặt ở đâu;
- khi nào cần relation, theory, decision hoặc workbench;
- cách trace impact giữa các entity;
- cách slim dần các README layer để tránh lặp mô hình chung.

Manual của guide không thay thế source of truth active của project. Guide là bản đồ; riêng `reference/entity-maps/packs/` là reusable source cho nhiều project.

Home active và reusable source là:

| Nội dung | Canonical home |
| --- | --- |
| Luật documentation system | `docs/meta/` |
| App-specific knowledge | `docs/app/` |
| Pure theory/reasoning nền | `docs/theories/` |
| Universal app model / generic taxonomy | `docs/guide/reference/entity-maps/packs/universal/` |
| Methodology-specific template | `docs/guide/reference/entity-maps/packs/variants/` |
| Optional local workspace | `docs/workbench/`; khái niệm xem [workbench-model.md](concepts/workbench-model.md), workflow xem [use-workbench.md](workflows/use-workbench.md); activation thuộc project local. |
| Agent operating checklist | `docs/AGENT_SKILLS/` |

## Luồng vận hành chuẩn

Đây là entry point mặc định cho case thường: đọc, tạo, sửa, validate hoặc trace canonical documentation. Luồng này điều phối các workflow; chi tiết thao tác thuộc [workflows/README.md](workflows/README.md#luong-tong).

1. Đọc đúng phạm vi task bằng [read-for-task.md](workflows/read-for-task.md).
2. Khi task bắt đầu từ code, incident hoặc product behavior change, chạy [sync-product-change.md](workflows/sync-product-change.md) trước khi sửa docs.
3. Khi tạo hoặc sửa knowledge, dùng [write-docs.md](workflows/write-docs.md).
4. Khi task có entity, relation hoặc impact, dùng [trace-impact.md](workflows/trace-impact.md).
5. Sau sửa/trace/slim, đóng vòng bằng [validate-after-change.md](workflows/validate-after-change.md).

Không phải mọi bước đều áp dụng cho mọi task. Prose không đổi behavior bỏ qua sync. Slim layer README là nhánh maintenance ([slim-layer-readme.md](workflows/slim-layer-readme.md)), không phải bước cuối mặc định. Khi canonical home chưa xác định và project đã kích hoạt Workbench, dùng [use-workbench.md](workflows/use-workbench.md) rồi handoff lại luồng canonical; xem [workbench-model.md](concepts/workbench-model.md).

## Cách đọc nhanh

Nếu mới vào repo:

1. [getting-started/](getting-started/README.md) — đọc đủ `quick-start` → `introduction` → `first-doc-change`
2. [concepts/documentation-architecture.md](concepts/documentation-architecture.md) — rồi `layer-model`, `relation-model` (mục Đọc tiếp trong file)
3. [reference/canonical-map.md](reference/canonical-map.md)
4. [reference/entity-maps/overview.md](reference/entity-maps/overview.md)
5. [workflows/read-for-task.md](workflows/read-for-task.md)

Nếu chuẩn bị sửa docs:

1. [workflows/read-for-task.md](workflows/read-for-task.md)
2. [reference/folder-map.md](reference/folder-map.md)
3. [reference/folder-structure.md](reference/folder-structure.md)
4. [unit-structure/README.md](unit-structure/README.md)
5. [workflows/sync-product-change.md](workflows/sync-product-change.md) — chỉ khi task từ code/incident/product behavior
6. [workflows/write-docs.md](workflows/write-docs.md)
7. [workflows/trace-impact.md](workflows/trace-impact.md)
8. [workflows/validate-after-change.md](workflows/validate-after-change.md)

Nếu đang cleanup docs rời rạc:

1. [workflows/slim-layer-readme.md](workflows/slim-layer-readme.md)
2. [reference/layer-readme-template.md](reference/layer-readme-template.md)
3. [workflows/validate-after-change.md](workflows/validate-after-change.md)

Xem thêm minh họa before/after của repo này (không portable): [examples/slim-context-readme.md](examples/slim-context-readme.md).

## Cấu trúc

```text
docs/guide/
├── getting-started/
├── concepts/
├── workflows/
├── unit-structure/
├── reference/
│   └── entity-maps/packs/       reusable cross-project packs
└── examples/
```

| Folder | Vai trò |
| --- | --- |
| `getting-started/` | Đường vào nhanh cho người mới. |
| `concepts/` | Mô hình nền: layer, entity, relation, theory, decision. |
| `workflows/` | Cách làm việc: đọc, sync product change, viết, trace, slim README và Workbench khi project đã kích hoạt. |
| `unit-structure/` | Template YAML/Markdown cho từng knowledge unit. |
| `reference/` | Bảng tra cứu, reusable pack và link tới canonical docs. |
| `examples/` | Ví dụ thật theo repo để giảm mơ hồ. |

## Nguyên tắc

- Guide giải thích cách dùng và giữ reusable pack source; pack không thay thế canonical docs active của project.
- Không copy toàn bộ README layer vào guide.
- Guide không quản lý migration, lifecycle, adoption hoặc divergence của project.
- Nếu guide mâu thuẫn với app truth, ưu tiên `docs/app`.
- Nội dung chưa có canonical home đi [use-workbench.md](workflows/use-workbench.md) khi project đã kích hoạt; guide giữ framework/workflow generic, còn status/TTL/owner thuộc policy local.
