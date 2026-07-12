# Proposal Plans — Bù Khoảng Trống Workflow

Ngày: 2026-07-13  
Nguồn: [../all.md](../all.md) §5.2 / §6 và [../business_example.md](../business_example.md)

> Đây là option paper trong `docs/review`, không phải decision, workflow canonical hoặc authorization để sửa product/meta.

## Cách đọc mức khuyến nghị

| Điểm | Ý nghĩa |
| --- | --- |
| 5/5 | Khuyến nghị mạnh; là hướng mặc định |
| 4/5 | Khuyến nghị; thường là phase tiếp theo |
| 3/5 | Có điều kiện / hỗ trợ |
| 2/5 | Tạm thời hoặc niche |
| 1/5 | Không khuyến nghị |

“Sửa được gốc” được đánh giá theo đúng vấn đề của file; không có phương án đơn lẻ nào giải quyết toàn bộ documentation system.

## Danh sách vấn đề

| Plan | Vấn đề | Phương án khuyến nghị | Ảnh hưởng sửa | Sửa gốc? | Recommend |
| --- | --- | --- | --- | --- | --- |
| [01](01-code-to-doc-bridge.md) | Code/product behavior đổi nhưng không có bridge vào docs | **Đã triển khai** B (`sync-product-change`) + C (PR manifest path-filtered); D chưa làm | Trung | Có ở process; enforcement CI body | **5/5 — done (B+C)** |
| [02](02-instance-relation-validation.md) | `--instance`/docs verify quá hẹp; relation generic thủ công | **Đã triển khai** C (`verify:entity-instance` / `relations` / `references`); WFP-08 còn mở | Cao | Có cho structural gap | **5/5 — done (C)** |
| [03](03-undetermined-knowledge-lifecycle.md) | Chưa có home thì workflow dừng, knowledge dễ thất lạc | **Đã triển khai** B: DEC-003 + CIS Workbench + guide/AGENT_SKILLS + `verify:workbench` | Trung | Có cho temporary lifecycle | **5/5 — done (B)** |
| [04](04-write-docs-output-throughput.md) | `write-docs` không có output audit; reviewer phải suy luận diff | **Đã triển khai** B: `write-docs result` short/full trong chat/PR + validate/example/skill | Thấp | Có cho output gap | **5/5 — done (B)** |
| [05](05-business-materialization-strategy.md) | README phình hoặc materialize Business big-bang | **PA-C đã triển khai**; 22 instance + relations; verify:*:business | Trung/slice | Có | **5/5 — done** |

## So sánh thứ tự đầu tư

| Ưu tiên | Làm gì | Giá trị sớm | Chi phí | Lý do |
| --- | --- | --- | --- | --- |
| P0 | Plan 04 — output `write-docs result` | Cao | Thấp | **Đã triển khai** PA-B; WFP-06 còn mở phần read/trace |
| P0 | Plan 01-B — `sync-product-change` | Rất cao | Trung | **Đã triển khai**; chặn docs đúng format nhưng sai product truth |
| P0 | Plan 01-C — PR change manifest | Cao | Trung | **Đã triển khai** path-filtered template + CI body check |
| P1 | Plan 03 — kích hoạt Workbench | Trung–Cao | Trung | **Đã triển khai** DEC-003 + CIS workspace + guide/skills + verifier |
| P1 | Plan 02-C — generic validators | Rất cao | Cao | **Đã triển khai** scoped `05-architecture`; WFP-08 còn mở |
| P2 | Plan 05-C — Business vertical slices | Cao | Trung theo slice | **Plan 05-C done** — 22 instance; P05-01..P05-07 pass |
| P3 | CI path mapping semantic (01-D) / generated index | Hỗ trợ | Trung–Cao | Chỉ có lợi sau khi process ổn định |

## Bộ phương án phối hợp khuyến nghị

```text
code behavior change
→ sync-product-change result                 (Plan 01-B)
→ write-docs result                          (Plan 04-B)
→ trace-impact nếu cần
→ generic structural validation              (Plan 02-C)
→ validate-after-change

không rõ canonical home
→ workbench local đã được decision kích hoạt (Plan 03-B)
→ canonical handoff về flow trên

Business CIS
→ vertical slice theo trace need              (Plan 05-C)
```

## Những tổ hợp không nên chọn

| Tổ hợp | Vì sao |
| --- | --- |
| CI auto mapping (01-D) trước workflow manual | Tự động hóa một process chưa ổn; false positive cao |
| Generalize frozen architecture baseline (02-D) | Mang assumptions architecture sang Business |
| Activate Workbench không owner/TTL/handoff | Tạo SoT thứ hai và backlog rác |
| Full change manifest cho mọi typo (04-C) | Ceremony làm team né cập nhật docs |
| Materialize toàn Business một lần (05-B) | Review quá tải, candidate giả và relation debt |

## Decision gates trước khi triển khai

1. Có chấp nhận thêm workflow `sync-product-change` vào core dispatcher không? — **đã chấp nhận và triển khai**
2. Có bắt buộc PR change manifest bằng CI body check không? — **đã triển khai path-filtered**
3. Validation tooling có ưu tiên generic Business instances trong phase kế tiếp không? — **generic verifier đã có; Business enforce khi materialize**
4. Volume knowledge “chưa có home” có đủ để justify Workbench lifecycle không? — **đã chấp nhận baseline và triển khai DEC-003**
5. `write-docs result` sống trong chat/PR hay cần artifact bền? — **đã chốt chat/PR (PA-B); không file manifest**
6. Slice Business đầu tiên dùng happy path nào và reviewer business là ai? — **đã chốt**: Slice 1 = happy path tối thiểu (`business_example` §8); reviewer structural = `repo maintainer`; instance `status: draft` đến khi wording được xác nhận

## Definition of Done của proposal set

- Mỗi vấn đề có ít nhất ba phương án thật sự khác nhau.
- Mỗi phương án ghi ưu/nhược, ảnh hưởng sửa, khả năng xử lý gốc và mức khuyến nghị.
- Recommendation không biến thành decision tự động.
- Phạm vi generic guide và product-local được tách rõ.
