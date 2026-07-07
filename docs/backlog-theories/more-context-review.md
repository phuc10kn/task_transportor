# Review Former `docs/more_context.md`

## Context

`docs/more_context.md` từng là tài liệu tổng hợp kiến thức về knowledge graph cho app docs. File gốc đã bị loại bỏ; phần dùng được đã promote vào canonical docs, phần chưa đủ chín được giữ trong `docs/backlog-theories/`.

Review này phân loại nội dung thành:

```text
use now
use as heuristic
do not promote directly
```

## Có thể dùng tốt

Các ý sau đủ rõ để áp dụng vào canonical docs:

- `Layer -> Concern -> Entity Type -> Entity Instance` là meta-model tốt và khớp cấu trúc hiện tại.
- `Relation Type` và `Valid Triple` phải tách rõ: relation type là từ/nghĩa, valid triple là combination hợp lệ.
- App docs không tự bịa relation; nếu relation chưa chốt thì dùng `Related Entities`, `Possible Trace Direction` hoặc `NOTE-OPEN`.
- Mỗi edge có một canonical direction; không mirror cùng một fact ở hai file.
- Graph nên thưa, không ép mọi entity đi qua một pipeline liền mạch.
- Trace A -> B nên kiểm tra theo ba mục đích: impact, coverage, consistency.
- Quy trình trace nên đi qua ID, entity type, layer, valid hops, repository search và validation từng hop.

## Chỉ nên dùng như heuristic

Các ý sau hữu ích nhưng chưa nên thành schema cứng:

- "Cấm nhảy cóc một hop" nên hiểu là "không nhảy cóc nếu chưa có valid triple rõ", không phải cấm tuyệt đối mọi cross-layer relation.
- Trục đọc `00-context -> 01-business -> 02-product -> 05-architecture -> ...` nên là reading order, không phải pipeline dependency bắt buộc.
- Core/supporting nên là reading priority, không phải metadata schema cho entity.
- Business case với số lượng concern/entity/triple chỉ là snapshot/gợi ý, không phải số liệu canonical.

## Không nên promote trực tiếp

Các phần sau nên giữ trong backlog hoặc reference note, không đưa thẳng vào canonical docs:

- Các con số như `~70`, `85-100`, `80% meaning template`, vì dễ stale.
- External link list và "link verified" nếu chưa kiểm tra lại trong lượt làm việc hiện tại.
- Assessment như "chưa production-ready toàn app" nếu chưa có validation/report riêng.
- Naming hoặc inverse relation chưa có file canonical trong `docs/meta/02-relation-types/`.

## Nội dung đã promote

| Nội dung | Promote vào |
| --- | --- |
| Relation Type vs Valid Triple | `docs/meta/02-relation-types/README.md`, `docs/meta/03-rules/README.md` |
| Folder relation chỉ là grouping/discovery | `docs/meta/02-relation-types/README.md` |
| Canonical direction và inverse không mirror | `docs/meta/02-relation-types/README.md` |
| Sparse graph, không ép pipeline | `docs/meta/03-rules/README.md` |
| Trace validation workflow | `docs/meta/04-conventions/validation-model.md` |
| Core/supporting như reading hint | `docs/AGENT_SKILLS/guides/reading-strategy.md` |

## Nội dung còn backlog

| Nội dung | Lý do chưa promote |
| --- | --- |
| Core/supporting cheat sheet theo từng layer | Cần thiết kế rõ là hint hay metadata trước. |
| Chuẩn hóa inverse cho từng relation type | Cần review từng file relation, không thể áp dụng bằng rule tổng quát. |
| Gap `05-09` valid triples | Cần phase riêng để thiết kế entity/relation/rule cho các layer sau. |
| External references | Cần verify lại link và route vào `docs/theories/*/governance.md` nếu thực sự ảnh hưởng theory. |

Chi tiết phần chưa promote nằm ở [more-context-unpromoted.md](more-context-unpromoted.md).
