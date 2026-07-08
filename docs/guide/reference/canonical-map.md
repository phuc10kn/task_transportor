# Canonical Map

File này trả lời source of truth nằm ở đâu. Nó không định nghĩa folder structure chuẩn. Khi cần path có prefix số, concern và entity type folder, đọc:

```text
docs/guide/reference/folder-structure.md
```

| Cần biết | Đọc |
| --- | --- |
| Folder structure chuẩn | `docs/guide/reference/folder-structure.md` |
| Product scope Lite | `docs/app/02-product/README.md` |
| Business flow/rule | `docs/app/01-business/README.md` |
| Quality gate/acceptance | `docs/app/08-quality/README.md` |
| Decisions còn hiệu lực | `docs/app/10-decisions/README.md` |
| Module architecture | `docs/app/05-architecture/README.md` |
| Module structure | `docs/app/05-architecture/01-structure/README.md` |
| Module boundary | `docs/app/05-architecture/02-boundaries/README.md` |
| Workflow architecture | `docs/app/05-architecture/03-interactions/README.md` |
| Schema/entity/relation/convention rule | `docs/meta/` |
| Entity instance schema | `docs/meta/00-schemas/entity-instance.md` |
| Unit structure template | `docs/guide/unit-structure/` |
| Theory reasoning | `docs/theories/` |
| Reusable architecture taxonomy | `docs/app_variants/` |
| Workbench candidate | `docs/workbench/README.md` để xem status; hiện chưa được đi vào hoạt động. |
| Agent operations | `docs/AGENT_SKILLS/` |

Nếu hai nguồn mâu thuẫn:

```text
scope/behavior Lite      -> docs/app/02-product
decision                 -> docs/app/10-decisions
architecture app-specific -> docs/app/05-architecture
folder structure         -> docs/guide/reference/folder-structure.md
meta rule                -> docs/meta
pure reasoning           -> docs/theories
```
