# Introduction

Hệ docs của repo dùng mô hình Markdown-native:

```text
Meta
    ↓ defines
App Docs
    ↓ applies
Source Code / Operation Reality
```

Thêm một trục reasoning:

```text
Theory
    ↓ guides
App Docs
    ↓ governs
Implementation
```

Vì vậy repo có nhiều folder tài liệu, nhưng mỗi folder có một vai trò riêng.

| Folder | Vai trò |
| --- | --- |
| `docs/meta/` | Luật chơi của documentation system. |
| `docs/app/` | Knowledge cụ thể của Central Sync Hub. |
| `docs/theories/` | Nguyên lý suy luận reusable mà project tin dùng. |
| `docs/app_variants/` | Template/taxonomy reusable cho technical architecture. |
| `docs/app/10-decisions/` | Quyết định và rationale cross-layer. |
| `docs/workbench/` | Khu vực dự kiến cho candidate entity/relation, hiện chưa được đi vào hoạt động. |
| `docs/guide/` | Manual hướng dẫn cách dùng hệ docs. |
| `docs/AGENT_SKILLS/` | Checklist/skill cho agent thao tác docs. |

## Tại sao cần guide

Các layer README như `docs/app/00-context/README.md` từng phải giải thích cả:

- layer là gì;
- concern/entity là gì;
- relation với layer khác;
- agent nên đọc thế nào.

Những phần đó là kiến thức chung của documentation system. Guide gom chúng về một nơi để layer README chỉ cần giữ app-specific truth và rule riêng.

## Folder structure chuẩn

Folder structure chuẩn và bản giải thích dùng để đọc/viết docs nằm ở:

```text
docs/guide/reference/folder-structure.md
```

Khi sửa `docs/app`, dùng đúng path có prefix số trong structure chuẩn, ví dụ `00-context/01-overview/` thay vì viết rút gọn `00-context/overview/`.
