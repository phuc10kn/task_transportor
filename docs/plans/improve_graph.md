# Kế Hoạch Cải Tiến Graph Docs

## Mục tiêu

Khóa lại nguyên tắc graph canonical cho hệ thống docs, tập trung vào:

- relation canonical luôn lưu theo chiều fact gốc;
- query ngược mặc định dùng derived inverse;
- nếu query từ phía target/owned diễn ra thường xuyên, tối ưu bằng index, tooling hoặc view;
- không thêm inverse canonical chỉ để phục vụ đọc ngược;
- chỉ giữ inverse riêng khi có semantic độc lập và nhu cầu query first-class.

Kế hoạch này ưu tiên khóa doctrine trước. Chưa rollout ra docs/app, chưa dọn toàn bộ relation catalog cũ, chưa triển khai tooling.

## Phạm vi

Trong scope:

- xác định source of truth cho relation direction và inverse doctrine;
- giữ wording nhất quán, tối thiểu trong các file guide/meta;
- bổ sung cảnh báo cho reverse query tần suất cao;
- ghi rõ phần nào được defer để tránh hiểu nhầm đã rollout xong.

Ngoài scope:

- migrate toàn bộ `docs/app/**` sang frontmatter `relations`;
- audit/sửa toàn bộ relation type cũ như `owned_by`, `included_in`, `affected_by`, `used_by`, `constrained_by`;
- chỉnh hàng loạt `AGENT_SKILLS`;
- tạo index/tooling/view thật;
- chỉnh semantic relation type còn thiếu nếu chưa có;
- dọn toàn bộ prose `## Related Entities` trong `docs/app`.

## Baseline hiện tại

Graph docs hiện tại có rule đủ rõ ở mức guide/meta, nhưng vẫn còn 4 điểm có thể gây hiểu lầm:

1. Doctrine direction đang nằm rải rác nhiều bề mặt, chưa thống nhất.
2. Ý nghĩa “query ngược nhiều thì tối ưu bằng tooling/view” chưa được nêu thành rule chuẩn.
3. Người đọc có thể nhầm doctrine đã sẵn sàng query graph hoàn chỉnh, trong khi `docs/app` chưa rollout `relations` canonical.
4. Nếu mở rộng quá rộng sang skill/app/schema sẽ đẩy phase này thành rollout thay vì khóa nguyên tắc.

Baseline cần xác nhận lại trước khi sửa doctrine:

- `docs/guide/concepts/relation-model.md`: kiểm tra wording `Canonical homes` và relation direction hiện tại.
- `docs/meta/README.md`: kiểm tra có còn mục `## Direction` riêng hay không.
- `docs/meta/02-relation-types/README.md`: kiểm tra summary direction có quá dài hoặc trùng source of truth.
- `docs/app/**`: xác nhận chưa rollout `relations` canonical cho graph instance.
- `## Related Entities` và prose relation chỉ là fallback hiện trạng, không phải canonical home.

## Quy ước xung đột trực tiếp

Trong plan này, một file bị coi là mâu thuẫn trực tiếp với doctrine nếu file đó làm một trong các việc sau:

- khuyến khích tạo inverse canonical cho reverse lookup;
- phủ nhận `derived inverse` là mặc định;
- coi `## Related Entities` hoặc prose relation là canonical home của relation instance;
- giữ doctrine narrative song song cạnh tranh với `docs/guide/concepts/relation-model.md`.

## Quy tắc phải tuân thủ

### Handoff hiện tại

```text
Current phase: Complete - doctrine lock implemented
Done: P0, P1, P2, P3, P4
Next: chuyển sang rollout docs/app (phase mới, ngoài improve_graph)
Prompt tiếp theo: executor.md
```

### Trạng thái blocked

```text
None
```

### Gaps được chấp nhận

```text
None
```

### Quy tắc resume

- Tick checklist trực tiếp trong file plan này.
- Nếu file đã review và giữ nguyên, ghi theo format:
  - `No-change: <path> - <lý do ngắn>`
- Nếu file cần sửa, ghi theo format:
  - `Fix: <path> - <phạm vi ngắn>`
- Nếu phase bị ngắt giữa chừng, ghi:
  - `In-progress: <phase id> - <đã làm> | Next: <công việc tiếp theo>`
- Deferred trong phase doctrine luôn giữ trong mục `## Deferred Sau Phase Doctrine`.
- Trong Phase P4, verify rõ ranh giới deferred.
- Không tạo backlog/file/folder mới trong phase doctrine-only.

## Source of truth

### 1. Narrative Source of Truth

```text
docs/guide/concepts/relation-model.md
```

Vai trò:

- định nghĩa canonical direction;
- định nghĩa derived inverse, paired relation, no inverse;
- định nghĩa rule chọn canonical direction;
- định nghĩa nguyên tắc reverse query.

### 2. Meta Operational Summary

```text
docs/meta/02-relation-types/README.md
```

Vai trò:

- tóm tắt cách dùng relation type;
- nhắc lại doctrine ở mức ngắn gọn;
- link về source of truth trong guide;
- không trở thành source of truth thứ hai.

### 3. Meta Root Routing

```text
docs/meta/README.md
```

Vai trò:

- giữ routing note ngắn;
- không lặp doctrine narrative;
- không thành source of truth cạnh tranh với `relation-model.md`.

Trạng thái hiện tại:

- file này đã chuyển sang mục `## Direction Routing`.
- mục này chỉ giữ routing note và dùng `relation-model.md` làm narrative source of truth.

### 4. Schema Contract

```text
docs/meta/00-schemas/relation-type-definition.md
```

Vai trò:

- giữ contract `inverse kind = derived | paired | none`;
- giữ schema source of truth kỹ thuật relation type;
- không giữ doctrine narrative.

## Nguyên tắc cần chốt

### Canonical Direction

- Canonical direction được chọn theo nơi fact gốc do chủ thể quản trị và theo semantic chủ động, rõ nhất.
- Ưu tiên:
  - owner -> owned
  - container -> member
  - cause/source -> impacted target
  - rule/constraint -> governed target
  - abstract requirement/spec -> concrete realization/evidence
  - flow -> participant

### Reverse Query

- Canonical relation vẫn lưu theo chiều fact gốc.
- Query từ phía target hoặc owned mặc định qua derived inverse (search hoặc tooling).
- Không tạo inverse canonical chỉ để reverse lookup.
- Nếu reverse query tần suất cao, tối ưu bằng index/tooling/view.
- Chỉ tạo inverse riêng khi inverse có semantic độc lập (không chỉ là chiều đọc ngược).

### Rollout Boundary

- Khóa doctrine không đồng nghĩa đã rollout graph instance.
- Hiện tại nhiều trace ngược vẫn phải dựa vào search repository, `## Related Entities`, `theory_basis`, `decision_basis` hoặc prose relation hiện có.
- `## Related Entities` và prose relation chỉ là fallback thủ công, không phải canonical home cho relation instance.
- Rollout `relations` canonical ở `docs/app` là phase riêng.

## Phase triển khai

### Phase P0 - Baseline Và Khóa Scope

Phase ID: P0

Mục tiêu:

- chỉ xử lý doctrine;
- tránh dọn relation catalog/app graph/skill/tooling trong phase này;
- khóa baseline để tránh hiểu sai trạng thái giữa các phase.

Target files/artifacts:

- `docs/plans/improve_graph.md`
- `docs/guide/concepts/relation-model.md`
- `docs/meta/README.md`
- `docs/meta/02-relation-types/README.md`
- `docs/app/**` (verify-only)

Điều kiện:

- Plan chỉ doctrine-only.
- `## Phạm vi` và `## Baseline hiện tại` đã được xác lập.

Việc cần làm:

- [x] Xác nhận phase là principle-only.
- [x] Ghi baseline hiện tại của `docs/guide/concepts/relation-model.md`, gồm wording `Canonical homes` và direction.
- [x] Ghi baseline của `docs/meta/README.md`, có còn mục `## Direction` không.
- [x] Ghi baseline của `docs/meta/02-relation-types/README.md`, gồm block direction summary có quá dài hay không.
- [x] Xác nhận `docs/app` chưa rollout `relations` canonical cho graph instance.
- [x] Ghi rõ `## Related Entities` chỉ là fallback, không phải canonical home.
- [x] Ghi rõ in-scope và out-of-scope.
- [x] Ghi rõ phần deferred để tránh nhầm.

Checklist nghiệm thu:

- [x] `Kết quả thực hiện` của Phase P0 có baseline note cho `docs/guide/concepts/relation-model.md`.
- [x] `Kết quả thực hiện` của Phase P0 có baseline note cho `docs/meta/README.md`.
- [x] `Kết quả thực hiện` của Phase P0 có baseline note cho `docs/meta/02-relation-types/README.md`.
- [x] `Kết quả thực hiện` của Phase P0 xác nhận `docs/app` chưa rollout `relations` canonical.
- [x] Mục `Rollout Boundary` nói rõ fallback không thay vai trò frontmatter `relations`.

Kết quả thực hiện:

- No-change: `docs/guide/concepts/relation-model.md` - baseline giữ nguyên, xác nhận phạm vi và trạng thái.
- Baseline: `docs/meta/README.md` - tại thời điểm P0 còn có direction narrative riêng; xử lý chuyển về routing-only thuộc P1.
- Baseline: `docs/meta/02-relation-types/README.md` - tại thời điểm P0 còn có direction summary dài; xử lý rút gọn thuộc P3.
- No-change: `docs/app/**` - chưa rollout `relations` canonical.

### Phase P1 - Chốt Source of Truth

Phase ID: P1

Mục tiêu:

- xác lập đúng source of truth cho doctrine narrative;
- giảm drift giữa guide và meta.

Target files/artifacts:

- `docs/guide/concepts/relation-model.md`
- `docs/meta/02-relation-types/README.md`
- `docs/meta/README.md`
- `docs/meta/00-schemas/relation-type-definition.md` (verify-only)

Điều kiện:

- Phase P0 đã pass checklist nghiệm thu.
- Baseline đã xác nhận file nào giữ doctrine narrative, summary và routing.

Việc cần làm:

- [x] Xác nhận `docs/guide/concepts/relation-model.md` là source of truth.
- [x] Siết wording `Canonical homes` trong `docs/guide/concepts/relation-model.md` tránh tạo nhầm rằng README là canonical home cho relation instance.
- [x] Kiểm soát `docs/meta/02-relation-types/README.md` theo đúng vai trò summary vận hành theo target state.
- [x] Rút `docs/meta/README.md` về routing note ngắn, trỏ rõ vào `docs/guide/concepts/relation-model.md`.

Checklist nghiệm thu:

- [x] `docs/guide/concepts/relation-model.md` chỉ rõ relation instance canonical là frontmatter `relations`; prose chỉ giải thích ngữ cảnh.
- [x] `docs/meta/00-schemas/relation-type-definition.md` vẫn là schema source of truth, không nhầm lẫn với narrative.
- [x] `docs/meta/02-relation-types/README.md` không giữ block doctrine dài cạnh tranh với source of truth.
- [x] `docs/meta/README.md` không giữ doctrine narrative riêng lặp lại rule direction/inverse.

Kết quả thực hiện:

- Fix: `docs/guide/concepts/relation-model.md` - đã bổ sung section query ngược và làm rõ canonical homes theo từng loại knowledge.
- Fix: `docs/meta/README.md` - `## Direction` đã chuyển thành routing note thuần, link đúng nguồn doctrine.

### Phase P2 - Chốt Rule Reverse Query

Phase ID: P2

Mục tiêu:

- chuyển ngôn ngữ “reverse query nhiều thì tối ưu bằng tooling/view” thành rule chuẩn;
- chặn tạo inverse canonical không có nhu cầu semantic.

Target files/artifacts:

- `docs/guide/concepts/relation-model.md`

Điều kiện:

- Phase P1 đã pass checklist nghiệm thu.
- `docs/guide/concepts/relation-model.md` là narrative source of truth duy nhất cho doctrine.

Việc cần làm:

- [x] Thêm câu chuẩn về reverse query mặc định.
- [x] Thêm câu chuẩn về high-frequency reverse query -> index/tooling/view.
- [x] Nhấn mạnh inverse chỉ giữ khi có semantic độc lập.

Checklist nghiệm thu:

- [x] `docs/guide/concepts/relation-model.md` có rule reverse query mặc định.
- [x] `docs/guide/concepts/relation-model.md` có rule reverse query tần suất cao không thêm inverse canonical.
- [x] `docs/guide/concepts/relation-model.md` có rule giữ inverse thật khi có semantic độc lập.

Kết quả thực hiện:

- No-change: `docs/guide/concepts/relation-model.md` - reverse query logic đã có trong source of truth.

### Phase P3 - Dọn Bề Mặt Truyền Thông

Phase ID: P3

Mục tiêu:

- gỡ các diễn giải thừa ở các mặt đang dẫn đường vận hành relation;
- giữ doctrine lock không trôi sang rollout.

Target files/artifacts:

- `docs/meta/02-relation-types/README.md`
- `docs/meta/README.md`
- `docs/guide/workflows/trace-impact.md`
- `docs/meta/04-conventions/validation-model.md`
- `docs/AGENT_SKILLS/**` (trigger-only)

Điều kiện:

- Phase P2 đã pass checklist nghiệm thu.
- Rule reverse query đã được khóa trong source of truth.

Việc cần làm:

- [x] Đảm bảo `docs/meta/02-relation-types/README.md` summary khớp source of truth và giữ summary ngắn.
- [x] Verify `docs/meta/README.md` sau P1; kỳ vọng `No-change` nếu đã chuyển đúng về routing.
- [x] Rà `docs/guide/workflows/trace-impact.md` và xác nhận không-change nếu đúng theo derived inverse.
- [x] Rà `docs/meta/04-conventions/validation-model.md` và xác nhận không-change nếu phù hợp.
- [x] Không sửa `docs/AGENT_SKILLS/**` trừ khi phát hiện conflict trực tiếp với doctrine.

Checklist nghiệm thu:

- [x] Không có câu nào khuyến khích thêm inverse canonical chỉ cho reverse lookup.
- [x] Không file summary nào mô tả logic inverse thay thế source of truth.
- [x] `docs/meta/README.md` có execution note chuẩn (`No-change` hoặc `Fix`).
- [x] Có execution note chuẩn cho `trace-impact.md`.
- [x] Có execution note chuẩn cho `validation-model.md`.
- [x] Không sửa thừa workflow/convention khi đã đúng.

Kết quả thực hiện:

- No-change: `docs/guide/workflows/trace-impact.md` - logic flow rõ, có note derived inverse cho truy vấn ngược.
- No-change: `docs/meta/04-conventions/validation-model.md` - `derived inverse` và quy tắc trace ngược đã khớp plan (đã rà trước đó).
- Fix: `docs/meta/02-relation-types/README.md` - rút direction doctrine dài về routing note ngắn và bổ sung `inverse kind` vào schema summary.

### Phase P4 - Verify Deferred Boundary

Phase ID: P4

Mục tiêu:

- tách rõ doctrine lock và rollout graph.
- xác nhận deferred section vẫn đúng vai trò backlog sau doctrine.
- đảm bảo phase sau không bị hiểu nhầm.

Target files/artifacts:

- `docs/plans/improve_graph.md`
- `## Deferred Sau Phase Doctrine` (verify-only)

Điều kiện:

- Phase P3 đã pass checklist nghiệm thu.
- deferred item chưa bị tick nhầm các phase trước.

Việc cần làm:

- [x] Xác nhận `## Deferred Sau Phase Doctrine` là địa điểm backlog duy nhất cho công việc hậu doctrine.
- [x] Verify deferred items hiện tại vẫn đúng phạm vi.
- [x] Verify không có deferred item nào bị tick sai trong doctrine-only.

Checklist nghiệm thu:

- [x] Mục `## Deferred Sau Phase Doctrine` tồn tại trong đúng file.
- [x] Deferred list phân biệt doctrine phase và rollout phase.
- [x] Deferred list không tạo backlog location mới.
- [x] Các item trong `## Deferred Sau Phase Doctrine` vẫn unchecked sau khi P4 hoàn tất.

Kết quả thực hiện:

- Fix: `docs/plans/improve_graph.md` - bổ sung section `## Deferred Sau Phase Doctrine`; các deferred item vẫn để unchecked.

## Deferred Sau Phase Doctrine

- [ ] Hoàn thiện rà soát toàn bộ `docs/meta/02-relation-types/**` cho `inverse kind` sau khi các `inverse` placeholder còn lại đã được đánh giá lại về nhu cầu query.
- [ ] Hoàn thiện migration `review`/`check` trong `docs/review` cho các nội dung đã kết luận (`affects`, `supports` và vấn đề inverse `supported_by`) sang action plan rollout.
- [ ] Triển khai `docs/app/**`: thay thế `## Related Entities` bằng `relations` canonical trên frontmatter khi có đủ điều kiện rollout.
- [ ] Hoàn thiện tooling/index/view phục vụ reverse query khi query theo target xuất hiện thường xuyên.

## Tóm tắt target toàn plan

Phần này chỉ là summary vận hành nhanh. `Target files/artifacts` trong từng phase là canonical target cho executor.

File mặc định chạy:

- `docs/guide/concepts/relation-model.md`
- `docs/meta/02-relation-types/README.md`
- `docs/meta/README.md`

File dùng khi có trigger:

- `docs/meta/00-schemas/relation-type-definition.md`
  - trigger: thiếu contract cần thiết để support `derived | paired | none`.
- `docs/AGENT_SKILLS/**`
  - trigger: phát hiện conflict trực tiếp với doctrine phase này.

Không dùng trong plan doctrine-only trừ trigger trực tiếp:

- `docs/app/**`
- relation type instance files riêng lẻ
- `docs/meta/03-rules/**`

## Rủi ro và cách chặn

### Rủi ro 1 - Tạo thêm source of truth

- Nguy cơ: `docs/meta/README.md` vô tình thành source of truth thứ hai.
- Chặn: file này chỉ giữ routing note và link về `docs/guide/concepts/relation-model.md`.

### Rủi ro 2 - Trôi từ doctrine sang rollout

- Nguy cơ: lẫn lộn relation catalog, app instance, skill, tooling.
- Chặn: giữ scope chặt; bất kỳ lệch ngoài scope phải dừng và note.

### Rủi ro 3 - Nhầm ready-for-query

- Nguy cơ: doctrine đã chốt nhưng instance data chưa canonical.
- Chặn: ghi rõ trạng thái hiện tại, và ghi rõ rollout `relations` là phase riêng.

## Checklist nghiệm thu tổng

- [x] Source of truth narrative cho doctrine được chốt rõ.
- [x] Schema source of truth cho contract relation type được chốt rõ.
- [x] Meta summary chỉ làm routing/sơ đồ ngắn, không thành source of truth song song.
- [x] Rule reverse query mặc định, và rule high-frequency reverse query được viết rõ.
- [x] Rule “không thêm inverse canonical cho reverse lookup” được viết rõ.
- [x] Rule “giữ inverse thật khi có semantic độc lập” được viết rõ.
- [x] `docs/meta/README.md` đã rút về routing note ngắn.
- [x] `trace-impact.md` và `validation-model.md` có kết quả review ghi trong file plan.
- [x] Deferred section rõ ràng, không nhầm với rollout graph instance.
- [x] Deferred items trong `## Deferred Sau Phase Doctrine` còn chưa tick tại phase doctrine-only.
- [x] `docs/meta/02-relation-types/README.md` chỉ giữ summary vận hành ngắn.
- [x] Kế hoạch không ép sửa `docs/app/**` hoặc `docs/AGENT_SKILLS/**` trong doctrine-only.

## Điều kiện hoàn thành

Plan coi là hoàn thành khi:

- người triển khai biết chính xác file nào là narrative source of truth, file nào là schema source of truth;
- reviewer biết rõ phần nào không được làm trong plan doctrine-only;
- người đọc không còn nhầm giữa doctrine lock và graph rollout;
- phase tiếp theo bám plan này để sửa docs mà không kéo theo cleanup ngoài scope.
