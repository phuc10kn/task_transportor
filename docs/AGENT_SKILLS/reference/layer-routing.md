# Layer Routing Helper

Universal layer/concern baseline nằm ở:

```text
docs/guide/reference/folder-structure.md
```

File này chỉ là helper ngắn cho agent.

| Task keywords | Layer |
| --- | --- |
| scope, glossary, environment | `00-context/` |
| problem, stakeholder, process, policy | `01-business/` |
| feature, requirement, release, acceptance | `02-product/` |
| screen, UX, flow, persona, component | `03-interface/` |
| domain vocabulary, model, invariant, lifecycle | `04-domain/` |
| module, boundary, interaction, deployment | `05-architecture/` |
| API, database, security, jobs, config | `06-technical/` |
| code structure, adapter, repository | `07-implementation/` |
| test, risk, defect, release gate | `08-quality/` |
| incident, observability, runbook, capacity | `09-operation/` |
| why, decision, alternative | `10-decisions/` |

## Placement Ambiguity

1. Đọc universal layer/concern baseline tại `docs/guide/reference/folder-structure.md`.
2. Đọc layer README liên quan.
3. Nếu vẫn chưa rõ, dùng `NOTE-OPEN`.
4. Không đoán path.
