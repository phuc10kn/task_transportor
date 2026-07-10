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
<entity-type-folder>
    ↓
<ENTITY-ID>
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
- schema hoặc section chung cho instance;
- criteria để biết khi nào tạo instance;
- lifecycle/status flow cho instance khi cần;
- `relations_template` định nghĩa relation slot cho instance; relation canonical vẫn phải có relation type và valid triple tương ứng.

Canonical entity types nằm trong:

```text
docs/meta/01-entity-types/
```

Layer/concern của entity instance trong `docs/app` lấy từ universal baseline:

```text
docs/guide/reference/folder-structure.md
```

Entity type folder cụ thể lấy từ contract active trong `docs/meta/` hoặc cấu trúc local đã được project chốt, không lấy từ universal baseline.

## Entity Instance

Entity Instance là knowledge cụ thể của app.

Ví dụ:

```text
docs/app/<layer>/<concern>/<entity-type>/<ENTITY-ID>/README.md
```

## Khi nào không tạo entity mới

Không tạo entity mới chỉ vì:

- có một đoạn note;
- muốn tách file cho ngắn;
- chưa biết đặt nội dung ở đâu;
- framework ngoài có một thuật ngữ tương tự.

Nếu chưa xác định được entity/home, không tạo entity mới. Làm theo lifecycle local của project trước khi tiếp tục.
