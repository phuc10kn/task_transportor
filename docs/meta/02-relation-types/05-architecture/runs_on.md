# runs_on

| Field | Value |
|-------|-------|
| **name** | `runs_on` |
| **canonical direction** | Source --runs_on--> Target |
| **inverse** | _(none - derive by search)_ |

## meaning

Source chạy trên Target như một platform/runtime substrate.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
DeploymentUnit --runs_on--> Platform
```

## non-examples

```text
Platform --runs_on--> DeploymentUnit   (sai direction)
DeploymentUnit --runs_on--> Module   (module được host, không phải platform)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng `runs_on` để mô tả operator/team chịu trách nhiệm vận hành.

## valid usage (from entity types)

```text
DeploymentUnit --runs_on--> Platform
```
