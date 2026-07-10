---
name: theory-refine
description: Draft a refinement proposal for an existing theory after challenge, conflict, or new project learning.
---

# theory-refine

Đề xuất refine theory, không tự chốt thay đổi.

## Workflow

```text
Task Progress:
- [ ] Đọc [Luồng vận hành chuẩn](../../guide/README.md#luồng-vận-hành-chuẩn)
- [ ] Đọc target theory README.md, agent.md, theory.md
- [ ] Đọc governance.md nếu có challenge/decision liên quan
- [ ] Xác định stable position nào đổi, giữ, hoặc cần clarify
- [ ] Draft proposal
- [ ] Liệt kê impact tới docs/app và docs/meta nếu có
```

## Output

```md
## theory-refine proposal

### Target theory

### Proposed change

### Reason

### Impact

### Open questions

### Needs decision?
```

## Guardrails

- Không tự đổi stable ID nếu chưa được chốt.
- Không biến theory thành app-specific implementation note.
- Nếu refinement ảnh hưởng app docs, chạy `theory-impact`.
