---
name: theory-find
description: Finds Project Theories relevant to the current task by reading docs/theories/ with progressive disclosure. Use when starting a task, tracing theory_basis references, or determining which TH-* IDs apply to architecture, business, or technical work.
---

# theory-find

Tìm Theory liên quan tới task hiện tại.

## Input

```text
task description
project context (layer, entity, feature nếu có)
```

## Workflow

```text
Task Progress:
- [ ] Đọc docs/theories/README.md — index và danh sách theory
- [ ] Xác định problem space của task (modularity, domain, quality, ...)
- [ ] Match task keywords với theory slug / stable ID trong README
- [ ] Đọc theory README.md (+ agent.md) của candidate — không đọc toàn bộ theories/
- [ ] Quyết định có cần theory.md (Level 3) hay không
- [ ] Trả output theo template
```

## Đọc gì

| Bước | Path |
|------|------|
| Bắt buộc | `docs/theories/README.md` |
| Candidate | `docs/theories/<slug>/README.md` |
| Token-optimized | `docs/theories/<slug>/agent.md` |
| Chỉ khi cần sâu | `docs/theories/<slug>/theory.md` |

## Output template

```markdown
## theory-find result

### Task
[mô tả task ngắn]

### Relevant theories
| ID | Path | Relevance | Read depth |
|----|------|-----------|------------|
| TH-XXX-NN | docs/theories/<slug>/ | [lý do] | README / agent.md / theory.md |

### Whether full theory needed
[Yes/No + lý do]

### Suggested next skill
[theory-review / doc-navigate / none]
```

## Ràng buộc

- Không đọc toàn bộ `docs/theories/` — chỉ index + candidate
- Không mở `theory.md` nếu README/agent.md đủ cho task
- Không tự tạo Theory ID giả

## Anti-patterns

```text
đọc mọi theory.md cho mọi task
copy theory content vào output
bỏ qua README index
```

## Thêm

- Reading levels: [../guides/reading-strategy.md](../guides/reading-strategy.md)
- Theory file layout: [../reference/theory-file-structure.md](../reference/theory-file-structure.md)
