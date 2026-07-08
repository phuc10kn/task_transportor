# runs_in

| Field | Value |
|-------|-------|
| **name** | `runs_in` |
| **canonical direction** | Source --runs_in--> Target |
| **inverse** | `hosts` |

## meaning

Source liên hệ với Target theo semantic `runs_in`.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Application --runs_in--> Environment
DeploymentUnit --runs_in--> RuntimeEnvironment
```

## non-examples

```text
Target --runs_in--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.

## valid usage (from entity types)

```text
Application --runs_in--> Environment
```
