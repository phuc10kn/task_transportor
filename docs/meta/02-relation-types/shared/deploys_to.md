# deploys_to

| Field | Value |
|-------|-------|
| **name** | `deploys_to` |
| **canonical direction** | Source --deploys_to--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source mô tả hoặc điều phối việc rollout/deploy thay đổi, artifact hoặc deployment unit tới Target runtime environment.

## allowed semantic

Chỉ dùng khi Source có deployment intent rõ ràng và Target là môi trường runtime nhận rollout/deployment.

Chỉ dùng ở entity instance khi combination có trong [03-rules/](../../03-rules/). App variant candidate phải được canonical hóa trước khi trở thành valid usage.

## examples

```text
DeploymentRunbook --deploys_to--> RuntimeEnvironment
```

## non-examples

```text
RuntimeEnvironment --deploys_to--> DeploymentRunbook   (sai canonical direction)
DeploymentRunbook --deploys_to--> RuntimeEnvironment   (sai nếu runbook chỉ là procedure chạy against environment, không rollout/deploy)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng `deploys_to` chỉ để nói Source có liên quan tới một environment.
Không dùng `deploys_to` cho observability, maintenance hoặc recovery procedure nếu intent thật không phải deployment.
Không tạo inverse canonical chỉ để query từ RuntimeEnvironment về DeploymentRunbook.

## valid usage (from entity types)

```text
No active meta valid usage.
Candidate only: DeploymentRunbook --deploys_to--> RuntimeEnvironment
```
