# Entity Model

## Mô hình

```text
Layer
    ↓
Concern
    ↓
Entity Type
    ↓
Entity Instance
```

Ví dụ architecture:

```text
05-architecture
    ↓
01-structure
    ↓
modules
    ↓
MOD-001-cis
```

## Concern

Concern là nhóm câu hỏi ổn định trong một layer.

Ví dụ trong `01-business`:

```text
01-discovery
02-direction
03-organization
04-behavior
05-governance
06-measurement
```

Concern không nhất thiết là entity type.

## Entity Type

Entity Type là loại knowledge có:

- meaning ổn định;
- nhiều instance tiềm năng;
- schema hoặc section chung;
- relation/lifecycle riêng khi cần.

Canonical entity types nằm trong:

```text
docs/meta/01-entity-types/
```

Folder entity type cụ thể trong `docs/app` phải theo structure chuẩn ở:

```text
docs/guide/reference/folder-structure.md
```

## Entity Instance

Entity Instance là knowledge cụ thể của app.

Ví dụ:

```text
docs/app/05-architecture/01-structure/modules/MOD-001-cis/README.md
```

## Khi nào không tạo entity mới

Không tạo entity mới chỉ vì:

- có một đoạn note;
- muốn tách file cho ngắn;
- chưa biết đặt nội dung ở đâu;
- framework ngoài có một thuật ngữ tương tự.

Nếu chưa chắc, dùng `NOTE-OPEN` hoặc giữ ngoài docs cho tới khi đủ promote. Không dùng `docs/workbench/` khi workbench chưa được kích hoạt.
