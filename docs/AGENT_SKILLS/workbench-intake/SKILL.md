# Workbench Intake

Skill hỗ trợ intake/triage/update/handoff Workbench sau khi project đã kích hoạt workspace bằng local decision.

Không thay [use-workbench.md](../../guide/workflows/use-workbench.md). Không approve canonical truth.

## When To Use

- `read-for-task` hoặc `write-docs` dừng vì chưa có canonical home;
- DEC-003 / local activation còn hiệu lực;
- cần tạo hoặc cập nhật Workbench item.

## Steps

1. Đọc `docs/workbench/README.md` và policy local.
2. Xác nhận case là undetermined-placement, không phải authority `blocked`.
3. Tạo/sửa item theo template; gán human owner ngay.
4. Cập nhật registry.
5. Mature tới review/ready_for_promotion theo policy.
6. Handoff canonical bằng standard flow; không tự promote.

## Output

```md
## workbench-intake result

### Item
- ID:
- Status:
- Owner:
- Uncertainty:
- Destination hypothesis:

### Handoff
- Next: mature | review | read-for-task/write-docs | blocked-outside-workbench | none
- Blockers:
```

## Guardrails

- Không dùng Workbench như source of truth.
- Không tạo entity/relation chỉ vì item tồn tại.
- Không bypass `sync-product-change = blocked`.
- Không paste secret/raw payload.
- Không tự set `promoted` trước validate-after-change.

## References

- [use-workbench.md](../../guide/workflows/use-workbench.md)
- [workbench-model.md](../../guide/concepts/workbench-model.md)
- Local policy: `docs/workbench/cis/policy.md`
- Activation: DEC-003
