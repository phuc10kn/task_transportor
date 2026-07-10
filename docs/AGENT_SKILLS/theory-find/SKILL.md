---
name: theory-find
description: Find project theories relevant to a task using progressive disclosure.
---

# theory-find

Tìm theory liên quan tới task hiện tại.

## Workflow

```text
Task Progress:
- [ ] Đọc [Luồng vận hành chuẩn](../../guide/README.md#luồng-vận-hành-chuẩn)
- [ ] Đọc docs/theories/README.md
- [ ] Xác định problem space của task
- [ ] Chọn candidate theory
- [ ] Đọc README.md và agent.md của candidate
- [ ] Chỉ mở theory.md khi cần deep reasoning
```

## Output

```md
## theory-find result

### Task

### Relevant theories
| ID | Path | Relevance | Read depth |
| --- | --- | --- | --- |

### Full theory needed?
Yes/No - [lý do]
```

## Guardrails

- Không đọc toàn bộ `docs/theories`.
- Không copy full theory vào output.
- Không tự tạo theory ID.

## References

- Reading strategy: [../guides/reading-strategy.md](../guides/reading-strategy.md)
- Theory structure: [../reference/theory-file-structure.md](../reference/theory-file-structure.md)
