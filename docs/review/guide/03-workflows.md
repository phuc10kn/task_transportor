# Review — `docs/guide/workflows/`

Ngày cập nhật: 2026-07-13  
Context: [00-overview.md](00-overview.md)

> Review sâu và finding còn mở của bộ workflow nằm ở [../workflows/all.md](../workflows/all.md). File này chỉ giữ snapshot folder sau remediation.

## Snapshot

Luồng tổng hiện tại:

```text
read-for-task
-> sync-product-change khi task từ code/incident/product behavior
-> canonical-home gate
   resolved -> write-docs khi có thay đổi
            -> trace-impact khi có entity/relation/impact
            -> validate-after-change
   undetermined-placement -> use-workbench khi project đã kích hoạt
                          -> canonical handoff quay lại luồng trên

side branch: slim-layer-readme
```

Inventory: `README`, `read-for-task`, `sync-product-change`, `write-docs`, `trace-impact`, `validate-after-change`, `slim-layer-readme`, `use-workbench`.

Structural tooling local: `verify:entity-instance`, `verify:relations`, `verify:references` (scoped `05-architecture` trong `npm test`), `verify:workbench`.

## Finding còn mở

Không giữ bảng finding cũ (WF-01…WF-04 đã remediate). Finding còn mở / một phần: xem [../workflows/all.md §6](../workflows/all.md) (WFP-06 phần read/trace, WFP-07, WFP-08; WFP-09 một phần qua DEC-003). WFP-02 và WFP-03 đã đóng. Plan 03 Workbench và Plan 04-B `write-docs result` đã triển khai.

## Verdict

Core flow đã có bridge product/code change, write audit result (chat/PR), terminal validation, generic structural CI gate cho architecture và CIS Workbench activation. Còn thiếu chủ yếu body-link quét `docs/app`/`docs/meta` và human output cho read/trace.
