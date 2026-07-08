# for_audience

| Field | Value |
|-------|-------|
| **name** | `for_audience` |
| **canonical direction** | Source --for_audience--> Target |
| **inverse** | _(none — symmetric or derive later)_ |

## meaning

Source liên hệ với Target theo semantic `for_audience`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Journey --for_audience--> Persona
```

## non-examples

```text
Target --for_audience--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Journey --for_audience--> Persona
```
