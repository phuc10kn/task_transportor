---
name: theory-challenge
description: Drafts a Theory Challenge when external knowledge, project experience, or code conflicts with a Project Theory. Use when mismatch type is Project Reality vs Theory, unresolved tension, or new evidence challenges TH-* positions. Does not modify Theory.
---

# theory-challenge

Tạo Challenge khi Theory có vấn đề — **không tự sửa Theory**.

## Trigger

```text
new external knowledge
project experience / incident
code conflict với theory
architecture conflict
unresolved tension trong theory.md
theory-review kết luận: Project Reality ≠ Theory
```

## Input

```text
theory ID bị challenge
evidence (docs, code, incident, external source)
context từ theory-review nếu có
```

## Workflow

```text
Task Progress:
- [ ] Xác nhận mismatch type — không phải code sai đơn thuần
- [ ] Đọc theory README + agent.md
- [ ] Đọc theory.md nếu cần hiểu position bị challenge
- [ ] Đọc governance.md để xem challenge hiện có
- [ ] Draft Challenge theo template
- [ ] Không edit theory.md — chỉ proposal
```

## Đọc gì

| Khi | Path |
|-----|------|
| Position bị challenge | `docs/theories/<slug>/theory.md` |
| Challenge format / history | `docs/theories/<slug>/governance.md` |
| Evidence | target docs, code, incident refs |

## Output template

```markdown
## Challenge draft

### Theory challenged
- ID: TH-XXX-NN
- Path: docs/theories/<slug>/

### Trigger
[external knowledge | project experience | code conflict | ...]

### Current theory position
[tóm tắt position/principle bị đặt câu hỏi]

### Evidence
- [source 1 + trích dẫn]
- [source 2]

### Nature of challenge
[contradiction | scope error | outdated assumption | missing boundary | ...]

### Impact if theory unchanged
[ảnh hưởng tới app docs / code / decisions]

### Suggested resolution paths
- Keep theory (với lý do có thể)
- Change theory → theory-refine + theory-impact
- Open Decision → NOTE-DECISION

### Placement
[governance.md section đề xuất — human applies]
```

## Ràng buộc

```text
Challenge ≠ Theory invalid
```

Theory tiếp tục có hiệu lực cho tới khi Decision thay đổi nó.

Agent **không**:
- sửa `theory.md`
- resolve Challenge
- canonicalize thay đổi

## Anti-patterns

```text
tự sửa theory khi phát hiện conflict
tạo Challenge cho mọi code bug (đó là fix code)
Challenge không có evidence
```

## Thêm

- Rule 7: [../guides/mandatory-rules.md](../guides/mandatory-rules.md)
- Governance file: [../reference/theory-file-structure.md](../reference/theory-file-structure.md)
