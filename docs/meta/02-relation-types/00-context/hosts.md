# hosts

| Field | Value |
|-------|-------|
| **name** | `hosts` |
| **canonical direction** | Source --hosts--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source liên hệ với Target theo semantic `hosts`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Environment --hosts--> Application
DeploymentUnit --hosts--> Module
```

## non-examples

```text
Target --hosts--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Environment --hosts--> Application
DeploymentUnit --hosts--> Module
```
