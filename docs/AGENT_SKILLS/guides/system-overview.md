# System Overview

## Ba vùng documentation

```text
docs/meta/
→ định nghĩa luật của documentation system
→ Entity Types, Relation Types, Rules, Conventions

docs/theories/
→ Pure Theory — project-owned reasoning foundation
→ không chứa application-specific detail

docs/app/
→ application knowledge cụ thể
→ Layer → Concern → Entity Type → Entity Instance
```

## Luồng ảnh hưởng

```text
Meta
    ↓ defines
Documentation Structure

Theory
    ↓ influences
App Documentation
    ↓ guides
Source Code
    ↓ feedback
Challenge / Decision
    ↓
Theory Evolution
```

## Ranh giới bắt buộc

| Vùng | Chứa | Không chứa |
|------|------|------------|
| `docs/meta/` | luật, schema, relation rules | Pure Theory, app instances |
| `docs/theories/` | principles, reasoning, tensions | project-specific rules, code detail |
| `docs/app/` | problems, features, modules, decisions | full Theory copy |

## Meta-model app docs

```text
Layer       → vùng knowledge lớn (00-context … 10-decisions)
Concern     → nhóm câu hỏi ổn định
Entity Type → loại knowledge có instance (Problem, Module, Feature, ...)
Entity Instance → knowledge cụ thể (PROB-001-..., MOD-004-...)
```

## Canonical source

```text
Markdown trong Git = canonical source
Graph DB / search index = derived (có thể rebuild từ Git)
```

## Agent entry points

| Task | Đọc trước |
|------|-----------|
| App knowledge | `docs/app/README.md` |
| Theory | `docs/theories/README.md` |
| Meta / validation | `docs/meta/README.md` |
| Chọn skill | `AGENT_SKILLS/README.md` |
