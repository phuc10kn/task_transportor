---
name: theory-impact
description: Trace docs impacted by a theory change or proposed refinement.
---

# theory-impact

Trace impact khi theory đổi hoặc có proposal refine.

## Workflow

```text
Task Progress:
- [ ] Xác định theory ID/stable position thay đổi
- [ ] Search references trong docs/app, docs/meta, docs/theories
- [ ] Kiểm tra app entities có theory_basis liên quan
- [ ] Kiểm tra decisions liên quan
- [ ] Phân loại impact: must update, review, no action
- [ ] Trả report, không tự sửa hàng loạt nếu chưa được yêu cầu
```

## Search Gợi Ý

```powershell
rg -n "TH-[A-Z0-9-]+|<theory-id>|theory_basis" docs/app docs/meta docs/theories
```

## Output

```md
## theory-impact result

### Theory

### Must update

### Review

### No action

### Open questions
```

## Guardrails

- Không thay app truth chỉ vì theory đổi nếu decision hiện tại còn hiệu lực.
- Nếu app/product decision mâu thuẫn theory, ghi finding thay vì tự resolve.
