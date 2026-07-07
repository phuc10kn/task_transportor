# Canonical Map

File này trả lời source of truth nằm ở đâu. Nó không định nghĩa folder structure chuẩn. Khi cần path có prefix số, concern và entity type folder, đọc:

```text
docs/guide/reference/folder-structure.md
```

| Cần biết | Đọc |
| --- | --- |
| Folder structure chuẩn | `docs/folder_structure.md` và `docs/guide/reference/folder-structure.md` |
| Product scope Lite | `docs/app/02-product/README.md` |
| Business flow/rule | `docs/app/01-business/README.md` |
| Quality gate/acceptance | `docs/app/08-quality/README.md` |
| Decisions còn hiệu lực | `docs/app/10-decisions/README.md` |
| Module architecture | `docs/app/05-architecture/README.md` |
| Module structure | `docs/app/05-architecture/01-structure/README.md` |
| Module boundary | `docs/app/05-architecture/02-boundaries/README.md` |
| Workflow architecture | `docs/app/05-architecture/03-interactions/README.md` |
| Entity/relation/convention rule | `docs/meta/` |
| Theory reasoning | `docs/theories/` |
| Reusable architecture taxonomy | `docs/app_technical/` |
| Candidate theory/backlog | `docs/backlog-theories/` |
| Agent operations | `docs/AGENT_SKILLS/` |

Nếu hai nguồn mâu thuẫn:

```text
scope/behavior Lite      -> docs/app/02-product
decision                 -> docs/app/10-decisions
architecture app-specific -> docs/app/05-architecture
folder structure         -> docs/folder_structure.md + docs/guide/reference/folder-structure.md
meta rule                -> docs/meta
pure reasoning           -> docs/theories
```
