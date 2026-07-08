---
name: doc-navigate
description: Navigate docs/app documentation by task using docs/guide operating flow, folder structure, layer README, and entity relation references.
---

# doc-navigate

Đọc app documentation theo task, không đọc toàn bộ docs.

## Workflow

```text
Task Progress:
- [ ] Đọc docs/guide/README.md#luồng-vận-hành-chuẩn
- [ ] Đọc docs/guide/workflows/read-for-task.md
- [ ] Xác định canonical home bằng docs/guide/reference/canonical-map.md
- [ ] Nếu task chạm docs/app, đọc docs/app/README.md
- [ ] Chọn layer/concern/entity type bằng docs/guide/reference/folder-structure.md
- [ ] Đọc layer README liên quan
- [ ] Đọc entity instance liên quan
- [ ] Follow theory_basis, decision_basis, relations khi task cần impact
- [ ] Nếu có relation/impact, chuyển sang meta-validate hoặc trace-impact
```

## Output

```md
## doc-navigate result

### Task
[mô tả]

### Reading path
1. docs/guide/README.md
2. docs/app/...

### Primary entities
| ID/path | Summary |
| --- | --- |
| ... | ... |

### Context sufficient?
Yes/No - [lý do]

### Suggested next
doc-create-entity / meta-validate / theory-find / theory-review / none
```

## Guardrails

- Không đọc mọi layer cho task nhỏ.
- Không dùng `docs/app_variants` như app truth.
- Không dùng `docs/workbench` vì workbench chưa hoạt động.
- Không tự đoán placement khi `folder-structure` chưa rõ.

## References

- Guide: [../guide/README.md](../../guide/README.md)
- Reading strategy: [../guides/reading-strategy.md](../guides/reading-strategy.md)
- Layer routing helper: [../reference/layer-routing.md](../reference/layer-routing.md)
