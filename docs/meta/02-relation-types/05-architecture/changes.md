# changes

| Field | Value |
|-------|-------|
| **name** | `changes` |
| **canonical direction** | Source --changes--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source có một execution path đã được model hóa có thể tạo, cập nhật hoặc chuyển lifecycle của Target.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/), outcome/path hoặc evidence cho thấy write thật, và Target là state architecture đã được canonical hóa.

## examples

```text
InteractionFlow --changes--> StateOwner
```

## non-examples

```text
InteractionFlow --changes--> StateOwner   (flow chỉ đọc snapshot hoặc dùng state làm context)
Module --changes--> StateOwner             (ownership dùng Module --owns--> StateOwner)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

- Không dùng `changes` như inverse của `owns` hoặc `involves`.
- Không dùng edge này để nói mọi lần chạy đều ghi Target. Nó biểu thị một path đã model hóa có thể thay đổi state.
- Không materialize target chỉ vì nó xuất hiện trong `Related Entities`.

## valid usage (from entity types)

```text
InteractionFlow --changes--> StateOwner
```
