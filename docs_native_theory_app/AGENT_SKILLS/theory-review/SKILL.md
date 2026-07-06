---
name: theory-review
description: Reviews project documentation or code for conflicts with Project Theories. Use when checking alignment, auditing rules against TH-* IDs, finding violations, tensions, or missing derived rules in docs/app or source code.
---

# theory-review

Kiểm tra project documentation hoặc code có mâu thuẫn với Theory hay không.

## Input

```text
target: docs path, entity instance, hoặc code area
theory IDs (từ theory-find hoặc theory_basis trong frontmatter)
```

## Workflow

```text
Task Progress:
- [ ] Xác định target docs/code cần review
- [ ] Thu thập theory_basis / TH-* references trong target
- [ ] Đọc theory README + agent.md (Level 2)
- [ ] Mở theory.md chỉ khi cần deep reasoning hoặc nghi ngờ conflict
- [ ] So sánh positions/rules trong Theory với target content
- [ ] Phân loại findings — không tự sửa
- [ ] Trả output theo template
```

## Đọc gì

| Ưu tiên | Path |
|---------|------|
| Target | docs/app/... hoặc source tương ứng |
| Theory summary | `docs/theories/<slug>/README.md`, `agent.md` |
| Deep | `docs/theories/<slug>/theory.md` (khi conflict) |

## Output template

```markdown
## theory-review result

### Target reviewed
[path hoặc mô tả code area]

### Theories checked
- TH-XXX-NN: [path]

### Findings

#### Violations
- [mô tả + trích dẫn target + theory rule bị vi phạm]

#### Possible violations
- [cần thêm context / ambiguous]

#### Theory tensions
- [hai theory hoặc rule xung đột nội bộ]

#### Missing rules
- [theory yêu cầu derived rule trong app docs nhưng chưa có]

### Recommended actions
- [đề xuất — không thực hiện tự động]
```

## Phân loại mismatch (từ project reality workflow)

```text
Code ≠ Project Rule     → code có thể sai
Project Rule ≠ Theory   → app docs có thể sai
Project Reality ≠ Theory → mở Challenge (theory-challenge)
```

## Ràng buộc

- Chỉ đề xuất — **không tự sửa** docs, Theory, hoặc code
- Output = review report, không phải canonical change
- Dùng NOTE-CONFLICT / NOTE-THEORY khi ghi vào docs

## Anti-patterns

```text
tự sửa theory.md khi tìm thấy violation
bỏ qua theory_basis trong frontmatter
đọc full theory cho mọi entity nhỏ
```

## Thêm

- Mandatory rules: [../guides/mandatory-rules.md](../guides/mandatory-rules.md)
- Note types: [../guides/note-types.md](../guides/note-types.md)
