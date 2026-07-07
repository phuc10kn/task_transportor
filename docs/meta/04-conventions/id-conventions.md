# ID Conventions

## Pattern chung

```text
{PREFIX}-{NNN}-{slug}
```

| Thành phần | Rule |
|------------|------|
| PREFIX | Uppercase, theo Entity Type — xem [01-entity-types/](../01-entity-types/README.md) |
| NNN | Số 3 chữ số zero-padded: `001`, `002`, ... |
| slug | kebab-case, mô tả ngắn |

## Ví dụ

```text
PROB-001-manual-reconciliation
FE-012-bulk-import
TH-MOD-05          (Theory — prefix riêng)
DEC-021            (Decision)
```

## Theory ID

```text
TH-{DOMAIN}-{NN}
```

## Decision ID

```text
DEC-{NNN}
```

## Validation

- ID unique trong scope entity type
- slug khớp folder name
- Không tự bịa prefix khi Meta chưa chốt — dùng NOTE-CANDIDATE
