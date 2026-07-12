# ID Conventions

## Entity instance

Frontmatter `id`, `slug` và instance folder là ba field khác nhau:

```text
frontmatter id   = {PREFIX}-{NNN}
frontmatter slug = {kebab-case-slug}
folder name      = {PREFIX}-{NNN}-{slug}
```

| Thành phần | Rule |
|------------|------|
| PREFIX | Uppercase, theo Entity Type — xem [01-entity-types/](../01-entity-types/README.md) |
| NNN | Số 3 chữ số zero-padded: `001`, `002`, ... |
| slug | kebab-case, mô tả ngắn; chỉ nằm ở field `slug` và tên folder |

### Ví dụ khớp architecture hiện hành

```yaml
id: AF-001
slug: backlog-manual-pull
```

Folder:

```text
AF-001-backlog-manual-pull/
└── README.md
```

### Pattern trên entity type

Trên file entity type:

| Field | Nghĩa |
|-------|-------|
| `ID pattern` | Giá trị frontmatter `id`: `{PREFIX}-{NNN}` |
| `Instance folder pattern` | Tên folder instance: `{PREFIX}-{NNN}-{slug}` |

Không dùng `{PREFIX}-{NNN}-{slug}` làm giá trị field `id`.

### Ví dụ khác

```text
id: PROB-001
slug: manual-reconciliation
folder: PROB-001-manual-reconciliation/

id: FE-012
slug: bulk-import
folder: FE-012-bulk-import/
```

## Theory ID

```text
TH-{DOMAIN}-{NN}
```

Ví dụ: `TH-MOD-05`.

## Decision ID

```text
DEC-{NNN}
```

Ví dụ: `DEC-021`. Folder decision vẫn có thể kèm slug mô tả: `DEC-002-app-graph-materialization-policy/`.

## Validation

- Frontmatter `id` unique trong scope entity type
- `id` = `{PREFIX}-{NNN}` (không gồm slug)
- Folder instance = `{id}-{slug}`
- `slug` khớp phần sau `id-` trong tên folder
- Không tự bịa prefix khi Meta chưa chốt — dùng NOTE-CANDIDATE
