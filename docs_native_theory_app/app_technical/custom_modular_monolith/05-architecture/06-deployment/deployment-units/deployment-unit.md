# DeploymentUnit

| Field | Value |
|-------|-------|
| **name** | DeploymentUnit |
| **layer** | `05-architecture` |
| **concern** | `06-deployment` |
| **folder** | `deployment-units/` |
| **ID pattern** | `DU-{NNN}-{slug}` |

## meaning

Đơn vị kiến trúc được deploy hoặc vận hành như một runtime component tương đối độc lập.

## architectural value

Type này giúp tách:

- module boundary;
- runtime boundary;
- persistence boundary;
- operational responsibility.

## instance criteria

Khi app có web app, worker, scheduler hoặc storage unit cần được mô tả ở mức system structure.

## required fields

id, slug, entity_type, layer, concern, status

Body: purpose, runtime_role, boundaries

## optional fields

hosted_modules, dependencies, scaling_notes, failure_impact

## lifecycle

planned -> active -> deprecated

## allowed relations (candidate)

```text
DeploymentUnit -> Module (hosts)
DeploymentUnit -> Platform (runs_on)
DeploymentUnit -> RuntimeEnvironment (operated_by)
```

## validation

- Không mô tả số instance production thật ở đây

## questions a good instance should answer

- Runtime unit này phục vụ request, worker hay storage?
- Module nào chạy trong nó?
- Nó có phải entry point công khai không?
- Nó ảnh hưởng gì đến failure domain và operational coupling?
