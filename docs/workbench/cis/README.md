# CIS Workbench

> STATUS: ACTIVE theo [DEC-003](../../app/10-decisions/01-decision-making/01-decisions/DEC-003-workbench-activation-policy/README.md).

`docs/workbench/cis/` giữ candidate CIS trước khi promote vào canonical home.

## Entry

| Cần | Đọc |
| --- | --- |
| Activation / authority | [DEC-003](../../app/10-decisions/01-decision-making/01-decisions/DEC-003-workbench-activation-policy/README.md) |
| Operational contract | [policy.md](policy.md) |
| Template | [templates/work-item.md](templates/work-item.md) |
| Registry | [items/README.md](items/README.md) |
| Guide workflow | [use-workbench.md](../../guide/workflows/use-workbench.md) |

## Trigger

Tạo item khi:

- có source/evidence nhận diện được;
- chưa chắc app / meta / theory home hoặc cách modeling;
- DEC-003 còn `accepted`.

Không tạo item khi:

- đã biết canonical home;
- chỉ thiếu fact/evidence cục bộ trong unit đã có home → dùng `NOTE-*`;
- `sync-product-change = blocked` vì thiếu authority — Workbench không đổi verdict.

## Folder Map

```text
cis/
├── README.md
├── policy.md
├── templates/work-item.md
└── items/
    ├── README.md
    └── wb-cis-NNNN.md   # chỉ khi có candidate thật
```

## Lifecycle Summary

```text
intake → triaged → modeling ↔ in_review → ready_for_promotion → promoted
terminal khác: rejected | superseded | expired
```

Owner lifecycle: `repo maintainer`. Promotion approval theo target home trong policy.

## Intake / Promote / Review

1. Copy template → tạo `items/wb-cis-NNNN.md` với owner, source refs, review/expiry date.
2. Cập nhật registry.
3. Mature tới `ready_for_promotion` khi có đúng một canonical destination.
4. Handoff canonical: `read-for-task` → sync khi cần → `write-docs` → trace khi cần → `validate-after-change`.
5. Chỉ set `promoted` sau validation `ready` hoặc `accepted-gap` hợp lệ.
6. Weekly triage; monthly audit.

## Ranh Giới

| Nội dung | Home đúng |
| --- | --- |
| Truth hiện hành của CIS | `docs/app/` |
| Entity type/relation/schema canonical | `docs/meta/` |
| Candidate tạm thời | `docs/workbench/cis/items/` |
| Conceptual/operating guide | `docs/guide/` |
