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

docs/app_variants/
-> reusable taxonomy/template, không phải app truth

docs/workbench/
-> candidate workspace dự kiến, hiện chưa được đi vào hoạt động

docs/AGENT_SKILLS/
-> agent checklist/skill, không thay guide/meta
```

## Luồng Vận Hành

Agent bắt đầu từ:

```text
docs/guide/README.md#luồng-vận-hành-chuẩn
```

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
| `docs/app_variants` | reusable taxonomy/template | source of truth cụ thể khi `docs/app` đã có |
| `docs/workbench` | status/harness nháp | source of truth; hiện chưa hoạt động |
| `docs/AGENT_SKILLS` | agent checklist | human-facing full manual |

## Canonical Priority

```text
scope/behavior app -> docs/app
schema/rule/meta   -> docs/meta
operating manual   -> docs/guide
pure reasoning     -> docs/theories
reusable template  -> docs/app_variants
agent procedure    -> docs/AGENT_SKILLS
```
