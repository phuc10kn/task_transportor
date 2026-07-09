# Canonical Map

File này trả lời source of truth nằm ở đâu. Nó không định nghĩa folder structure chuẩn. Khi cần path có prefix số, concern và entity type folder, đọc:

```text
docs/guide/reference/folder-structure.md
```

`docs/app/` là application instance space: giữ truth cụ thể của một ứng dụng, không phải taxonomy của documentation system. Entity analysis map: [entity-maps/](entity-maps/README.md).

| Cần biết | Đọc |
| --- | --- |
| Folder structure chuẩn | `docs/guide/reference/folder-structure.md` |
| Product scope / behavior (app) | `docs/app/02-product/README.md` |
| Business flow / rule (app) | `docs/app/01-business/README.md` |
| Quality gate / acceptance (app) | `docs/app/08-quality/README.md` |
| Decisions còn hiệu lực (app) | `docs/app/10-decisions/README.md` |
| Architecture app-specific | `docs/app/05-architecture/README.md` |
| Module structure (app) | `docs/app/05-architecture/01-structure/README.md` |
| Module boundary (app) | `docs/app/05-architecture/02-boundaries/README.md` |
| Workflow architecture (app) | `docs/app/05-architecture/03-interactions/README.md` |
| Schema / entity / relation / convention rule | `docs/meta/` |
| Universal concern / generic taxonomy | `docs/app_variants/raw_app_original/` |
| Entity instance schema | `docs/meta/00-schemas/entity-instance.md` |
| Unit structure template | `docs/guide/unit-structure/` |
| Theory reasoning | `docs/theories/` |
| Reusable architecture taxonomy | `docs/app_variants/` |
| Workbench candidate | `docs/workbench/README.md` để xem status; hiện chưa được đi vào hoạt động. |
| Agent operations | `docs/AGENT_SKILLS/` |

Nếu hai nguồn mâu thuẫn:

```text
scope/behavior app        -> docs/app/02-product
decision                  -> docs/app/10-decisions
architecture app-specific -> docs/app/05-architecture
folder structure          -> docs/guide/reference/folder-structure.md
meta rule                 -> docs/meta
generic universal model   -> docs/app_variants/raw_app_original
pure reasoning            -> docs/theories
```
