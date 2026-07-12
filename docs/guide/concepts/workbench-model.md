# Workbench Model

Workbench là optional local workspace để giữ temporary knowledge khi canonical home, contract hoặc modeling chưa đủ rõ để ghi vào `docs/app`, `docs/meta` hoặc `docs/theories`.

Guide giải thích khung khái niệm và workflow generic. Activation, owner, status vocabulary, TTL và field cụ thể thuộc project local.

## Temporary Operational Authority

```text
Workbench item là authoritative cho trạng thái vận hành của chính item
Workbench item không authoritative cho claim app/meta/theory bên trong item
```

## Generic Lifecycle Meaning

```text
capture
→ mature / model
→ review
→ canonical handoff | terminal disposition
```

Project local map các phase này sang status cụ thể. Guide không chuẩn hóa field name hoặc TTL.

## Capability Tối Thiểu

Một Workbench active tối thiểu phải có:

- owner;
- source/evidence reference;
- review hoặc expiry rule;
- destination hypothesis;
- terminal disposition (`promoted`, `rejected`, `superseded`, `expired` hoặc tương đương local).

## Quan Hệ Với Cơ Chế Khác

| Cơ chế | Dùng khi |
| --- | --- |
| Workbench | Independent candidate chưa rõ home/contract/modeling |
| `NOTE-*` | Home đã biết; thiếu fact/evidence cục bộ |
| Decision | Cần chốt trade-off/authority dài hạn |
| Issue tracker | Delivery/bug task; có thể là source_ref, không thay Workbench maturation |

## Canonical Boundary

- Không dùng Workbench như app truth hoặc meta contract.
- Không tạo entity type, relation type, valid triple hoặc entity instance chỉ vì item tồn tại.
- Promote phải quay lại workflow canonical và terminal validation.

## Đọc Tiếp

- Workflow: [../workflows/use-workbench.md](../workflows/use-workbench.md)
- Architecture overview: [documentation-architecture.md](documentation-architecture.md)
- Validation/lifecycle: [validation-and-lifecycle.md](validation-and-lifecycle.md)
