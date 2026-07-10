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
| Optional local workspace | `docs/workbench/`; cách dùng boundary xem [use-workbench.md](workflows/use-workbench.md), trạng thái thuộc project local. |
| Agent operating checklist | `docs/AGENT_SKILLS/` |

## Luồng vận hành chuẩn

Đây là entry point mặc định cho case thường: đọc, tạo, sửa, validate hoặc trace canonical documentation. Luồng này điều phối các workflow; chi tiết thao tác thuộc [workflows/README.md](workflows/README.md#luồng-tổng).

1. Đọc đúng phạm vi task bằng [read-for-task.md](workflows/read-for-task.md).
2. Khi tạo hoặc sửa knowledge, dùng [write-docs.md](workflows/write-docs.md).
3. Khi task có entity, relation hoặc impact, dùng [trace-impact.md](workflows/trace-impact.md).
4. Khi README layer bị lặp hoặc phình, dùng [slim-layer-readme.md](workflows/slim-layer-readme.md).

Không phải mọi bước đều áp dụng cho mọi task. `docs/workbench/` không thuộc luồng mặc định: nó chỉ là hỗ trợ local khi project đã định nghĩa và kích hoạt riêng; kết quả vẫn phải quay lại canonical home qua luồng trên.

## Cách đọc nhanh

Nếu mới vào repo:

1. [getting-started/quick-start.md](getting-started/quick-start.md)
2. [concepts/documentation-architecture.md](concepts/documentation-architecture.md)
3. [reference/canonical-map.md](reference/canonical-map.md)
4. [reference/entity-maps/overview.md](reference/entity-maps/overview.md)
5. [workflows/read-for-task.md](workflows/read-for-task.md)

Nếu chuẩn bị sửa docs:

1. [reference/folder-map.md](reference/folder-map.md)
2. [reference/folder-structure.md](reference/folder-structure.md)
3. [unit-structure/README.md](unit-structure/README.md)
4. [workflows/write-docs.md](workflows/write-docs.md)
5. [workflows/trace-impact.md](workflows/trace-impact.md)

Nếu đang cleanup docs rời rạc:

1. [workflows/slim-layer-readme.md](workflows/slim-layer-readme.md)
2. [reference/layer-readme-template.md](reference/layer-readme-template.md)
3. [examples/slim-context-readme.md](examples/slim-context-readme.md)

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
| `workflows/` | Cách làm việc: đọc, viết, trace, slim README và dùng workbench đã được project kích hoạt. |
| `unit-structure/` | Template YAML/Markdown cho từng knowledge unit. |
| `reference/` | Bảng tra cứu, reusable pack và link tới canonical docs. |
| `examples/` | Ví dụ thật theo repo để giảm mơ hồ. |

## Nguyên tắc

- Guide giải thích cách dùng và giữ reusable pack source; pack không thay thế canonical docs active của project.
- Không copy toàn bộ README layer vào guide.
- Guide không quản lý migration, lifecycle, adoption hoặc divergence của project.
- Nếu guide mâu thuẫn với app truth, ưu tiên `docs/app`.
- Nội dung chưa có canonical home được project quản lý theo lifecycle local của mình; guide không định nghĩa temporary-record flow.
