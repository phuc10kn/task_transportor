# Use Workbench

`docs/workbench/` là optional local workspace. Guide giải thích conceptual model và operating workflow generic; activation, owner, format, status và TTL do project quyết định.

Xem thêm [workbench-model.md](../concepts/workbench-model.md).

## Trigger

Chạy khi:

- canonical home, contract hoặc modeling chưa xác định;
- có source/evidence nhận diện được;
- project đã kích hoạt Workbench bằng local decision.

Không chạy khi:

- đã biết canonical home;
- chỉ thiếu fact/evidence cục bộ trong unit đã có home → dùng `NOTE-*`;
- task chỉ là delivery/bug đã có home trong issue tracker;
- conflict/authority chưa rõ khiến `sync-product-change` trả `blocked` — Workbench không đổi verdict đó thành `ready_for_write`.

## Precondition

1. Đọc `docs/workbench/README.md` để biết workspace có active không.
2. Đọc decision và policy local mà project công bố.
3. Nếu chưa active: không tạo item; dừng hoặc dùng interim local mà project cho phép.

## Input

- kết quả `read-for-task` hoặc stop từ `write-docs`;
- source/evidence refs;
- uncertainty reason;
- owner role theo policy local;
- optional `product-change sync result` nếu task đi qua sync.

## Workflow

```text
1. Xác nhận activation local còn hiệu lực.
2. Capture item theo template/policy local (owner, source, review/expiry).
3. Mature / model: làm rõ destination candidates, gaps, blockers.
4. Review theo cadence/policy local.
5. Chọn terminal:
   - ready for canonical handoff
   - rejected / superseded / expired theo policy local
6. Nếu handoff:
   read-for-task lại
   → sync-product-change khi đổi product behavior
   → write-docs
   → trace-impact khi cần
   → validate-after-change
7. Chỉ đánh dấu promoted sau khi canonical handoff và validation pass theo policy local.
```

## Output

```md
## workbench-intake result

### Trigger
- Source:
- Summary:

### Item
- ID:
- Owner:
- Uncertainty:
- Source refs:
- Destination hypothesis:
- Review / expiry:

### Classification
- Ruled out homes:
- Open questions:

### Handoff
- Next: mature | review | canonical-handoff | rejected | expired | blocked-outside-workbench
- Blockers:
```

## Stop Condition

Dừng tạo/sửa Workbench item khi:

- local activation không còn hiệu lực;
- thiếu owner hoặc source/evidence tối thiểu theo policy local;
- task thực chất là authority conflict cần decision, không phải placement uncertainty;
- muốn ghi secret/raw sensitive payload vào item.

## Validation Responsibility

- Guide yêu cầu có local structural/semantic checks do project định nghĩa.
- Guide không bắt buộc tên command cụ thể.
- Canonical promote vẫn phải qua [validate-after-change.md](validate-after-change.md).

## Boundary

- Không dùng Workbench như app truth hoặc meta contract.
- Không tạo canonical entity/relation chỉ vì item tồn tại.
- Không bypass `sync-product-change = blocked`.
- Khi local policy đã có kết luận, cập nhật canonical home qua workflow chuẩn.

## Handoff

- Canonical ready → [read-for-task.md](read-for-task.md) rồi luồng write/validate.
- Rejected/expired/superseded → ghi disposition local; không sửa canonical chỉ vì item tồn tại.
- Authority blocked ngoài Workbench → clarification/decision.
