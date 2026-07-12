# Canonical Map

File này trả lời source of truth nằm ở đâu. Nó không định nghĩa entity type active. Khi cần path layer/concern universal có prefix số, đọc:

```text
docs/guide/reference/folder-structure.md
```

`docs/app/` là application instance space: giữ truth cụ thể của một ứng dụng, không phải taxonomy của documentation system. Concern chi tiết trong một layer đọc từ layer README hoặc `folder-structure.md`; canonical-map chỉ route tới layer/home, không shortcut concern đã materialize của một project. Entity analysis map: [entity-maps/](entity-maps/README.md).

| Cần biết | Đọc |
| --- | --- |
| Universal layer/concern baseline | `docs/guide/reference/folder-structure.md` |
| Product scope / behavior (app) | `docs/app/02-product/README.md` |
| Business flow / rule (app) | `docs/app/01-business/README.md` |
| Quality gate / acceptance (app) | `docs/app/08-quality/README.md` |
| Decisions còn hiệu lực (app) | `docs/app/10-decisions/README.md` |
| Architecture app-specific | `docs/app/05-architecture/README.md` |
| Schema / entity / relation / convention rule | `docs/meta/` |
| Universal concern / generic taxonomy | `docs/guide/reference/entity-maps/packs/universal/` |
| Entity instance schema | `docs/meta/00-schemas/entity-instance.md` |
| Unit structure template | `docs/guide/unit-structure/` |
| Theory reasoning | `docs/theories/` |
| Reusable architecture taxonomy | `docs/guide/reference/entity-maps/packs/variants/` |
| Local workspace (nếu project kích hoạt) | `docs/workbench/README.md`, [workbench-model.md](../concepts/workbench-model.md), [use-workbench.md](../workflows/use-workbench.md) |
| Agent operations | `docs/AGENT_SKILLS/` |

Nếu hai nguồn mâu thuẫn:

```text
scope/behavior app        -> docs/app/02-product
decision                  -> docs/app/10-decisions
architecture app-specific -> docs/app/05-architecture
universal layer/concern   -> docs/guide/reference/folder-structure.md
meta rule                 -> docs/meta
generic universal model   -> docs/guide/reference/entity-maps/packs/universal
pure reasoning            -> docs/theories
```
