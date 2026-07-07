# Documentation Guide

## Mục đích

`docs/guide/` là manual hướng dẫn cách đọc, viết, validate và evolve hệ tài liệu của repo.

Guide này trả lời:

- bắt đầu đọc docs từ đâu;
- `docs/app`, `docs/meta`, `docs/theories`, `docs/app_technical`, `docs/backlog-theories` khác nhau thế nào;
- khi thêm knowledge mới thì đặt ở đâu;
- khi nào cần relation, theory, decision hoặc backlog;
- cách trace impact giữa các entity;
- cách slim dần các README layer để tránh lặp mô hình chung.

Guide không phải source of truth mới. Guide là bản đồ.

Source of truth vẫn là:

| Nội dung | Canonical home |
| --- | --- |
| Luật documentation system | `docs/meta/` |
| App-specific knowledge | `docs/app/` |
| Pure theory/reasoning nền | `docs/theories/` |
| Reusable technical taxonomy | `docs/app_technical/` |
| Candidate/backlog theory | `docs/backlog-theories/` |
| Agent operating checklist | `docs/AGENT_SKILLS/` |

## Cách đọc nhanh

Nếu mới vào repo:

1. [getting-started/quick-start.md](getting-started/quick-start.md)
2. [concepts/documentation-architecture.md](concepts/documentation-architecture.md)
3. [reference/canonical-map.md](reference/canonical-map.md)
4. [workflows/read-for-task.md](workflows/read-for-task.md)

Nếu chuẩn bị sửa docs:

1. [reference/folder-map.md](reference/folder-map.md)
2. [reference/folder-structure.md](reference/folder-structure.md)
3. [workflows/write-docs.md](workflows/write-docs.md)
4. [workflows/trace-impact.md](workflows/trace-impact.md)

Nếu đang cleanup docs rời rạc:

1. [workflows/slim-layer-readme.md](workflows/slim-layer-readme.md)
2. [reference/layer-readme-template.md](reference/layer-readme-template.md)
3. [examples/slim-context-readme.md](examples/slim-context-readme.md)
4. [workflows/promote-backlog.md](workflows/promote-backlog.md)
5. [examples/backlog-to-canonical.md](examples/backlog-to-canonical.md)

## Cấu trúc

```text
docs/guide/
├── getting-started/
├── concepts/
├── workflows/
├── reference/
└── examples/
```

| Folder | Vai trò |
| --- | --- |
| `getting-started/` | Đường vào nhanh cho người mới. |
| `concepts/` | Mô hình nền: layer, entity, relation, theory, decision. |
| `workflows/` | Cách làm việc: đọc, viết, promote, trace, slim README. |
| `reference/` | Bảng tra cứu ngắn và link tới canonical docs. |
| `examples/` | Ví dụ thật theo repo để giảm mơ hồ. |

## Nguyên tắc

- Guide giải thích cách dùng, không thay thế canonical docs.
- Không copy toàn bộ README layer vào guide.
- Nếu guide mâu thuẫn với `docs/meta`, ưu tiên `docs/meta`.
- Nếu guide mâu thuẫn với app truth, ưu tiên `docs/app`.
- Nếu một candidate trong guide/backlog đủ ổn định, promote vào canonical home.
