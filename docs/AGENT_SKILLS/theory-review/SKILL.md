---
name: theory-review
description: Review docs or code for alignment with project theories.
---

# theory-review

Kiểm tra docs/code có mâu thuẫn với theory hay không.

## Workflow

```text
Task Progress:
- [ ] Xác định target docs/code
- [ ] Thu thập theory_basis hoặc TH-* references
- [ ] Đọc theory README.md + agent.md
- [ ] Mở theory.md chỉ khi có conflict hoặc cần deep reasoning
- [ ] So sánh target với theory positions/rules
- [ ] Trả review report, không tự sửa
```

## Output

```md
## theory-review result

### Target

### Theories checked

### Findings
- Violations:
- Possible violations:
- Tensions:
- Missing derived rules:

### Recommended actions
```

## Guardrails

- Không tự sửa theory.
- Không copy full theory vào app docs.
- Dùng `NOTE-CONFLICT` hoặc `NOTE-THEORY` nếu cần ghi uncertainty.

## References

- Mandatory rules: [../guides/mandatory-rules.md](../guides/mandatory-rules.md)
- Note types: [../guides/note-types.md](../guides/note-types.md)
