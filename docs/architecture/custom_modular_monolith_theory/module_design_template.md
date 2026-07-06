# Module Design Template

## Tên module hoặc capability

`<Domain>`

## Responsibility

- Sở hữu capability nào?
- Sở hữu state nào?
- Không sở hữu gì?

## Public API

```text
<Domain>Api.<capabilityA>()
<Domain>Api.<capabilityB>()
```

## Data ownership

| Aggregate | Quyền |
| --- | --- |
| `<aggregate_a>` | Owns write |
| `<aggregate_b>` | Read-only qua owner API hoặc allowlist |

## Use cases chính

- `<verbActionOne>`
- `<verbActionTwo>`

## External dependencies

- External client nào?
- Module owner API nào khác nếu cần?

## Boundary notes

- Có cross-module read exception không?
- Có dry-run hoặc pre-check không?
- Có job hoặc journal không?
- Có audit không?

## Evolution notes

- Khi scale lên, capability này có tách worker hoặc read model không?
