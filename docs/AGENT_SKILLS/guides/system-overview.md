# System Overview

## Các Vùng Documentation

```text
docs/guide/
-> manual vận hành docs cho người và agent

docs/meta/
-> schema, entity type, relation type, valid triple, convention canonical

docs/app/
-> app truth cụ thể của CIS

docs/theories/
-> pure theory và reasoning foundation

docs/guide/reference/entity-maps/packs/
-> reusable taxonomy/template, không phải app truth

docs/workbench/
-> temporary knowledge workspace; CIS scope active theo DEC-003

docs/AGENT_SKILLS/
-> agent checklist/skill, không thay guide/meta
```

## Luồng Vận Hành

Standard agent bắt đầu từ [Luồng vận hành chuẩn](../../guide/README.md#luồng-vận-hành-chuẩn).

Sau đó chọn skill phù hợp:

- app knowledge: `doc-navigate`;
- tạo entity: `doc-create-entity`;
- validate schema/relation/path: `meta-validate`;
- theory: `theory-find`, `theory-review`, `theory-impact`;
- theory governance: `theory-challenge`, `theory-refine`.

## Ranh Giới Bắt Buộc

| Vùng | Chứa | Không chứa |
| --- | --- | --- |
| `docs/guide` | workflow, reference, example, unit structure hướng dẫn dùng | canonical schema/rule mới |
| `docs/meta` | schema/rule/convention canonical | app truth, handbook dài |
| `docs/app` | knowledge cụ thể của CIS | generic theory/docs-system explanation |
| `docs/theories` | principle/reasoning reusable | implementation detail của CIS |
| `docs/guide/reference/entity-maps/packs` | reusable taxonomy/template | source of truth cụ thể khi `docs/app` đã có |
| `docs/workbench` | temporary knowledge staging khi local decision active | source of truth, app truth, meta rule đang có hiệu lực |
| `docs/AGENT_SKILLS` | agent checklist | human-facing full manual |

## Canonical Priority

```text
scope/behavior app -> docs/app
schema/rule/meta   -> docs/meta
operating manual   -> docs/guide
pure reasoning     -> docs/theories
reusable template  -> docs/guide/reference/entity-maps/packs
agent procedure    -> docs/AGENT_SKILLS
```

Standard agent là default. Workbench-support agent chỉ tồn tại sau local activation và chỉ hỗ trợ standard flow.
