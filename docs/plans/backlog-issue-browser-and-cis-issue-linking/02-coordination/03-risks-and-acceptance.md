# Risks và acceptance

> [← Điều phối](./README.md) · [Plan index](../README.md)

## Rủi ro và trigger phải dừng

| Trigger | Hành động bắt buộc |
| --- | --- |
| Preflight tìm thấy cùng UPPER(backlog_issue_key) hoặc UPPER(jira_issue_key) trong nhiều CIS issue cùng project. | Ghi data debt, không auto sửa data; chặn link/candidate-sync trên key bị ảnh hưởng và báo operator/user xử lý merge/archive/reassign riêng. |
| Backlog/Jira lookup không trả hoặc không thể xác minh external project identity. | Dừng identity-link write; không gán key chỉ dựa vào input. Báo user với response evidence. |
| Requirement đổi từ duplicate theo project thành duplicate toàn hệ thống. | Quay về planner; đây là domain/schema policy thay đổi. |
| Requirement cho đổi/xóa link đã gán. | Không tự thêm; mở plan/decision riêng cho immutable identity lifecycle. |
| Implementation cần import application/infrastructure/support của module khác. | Dừng thiết kế đó; expose public API tối thiểu tại owner module. |
| Browse path bắt đầu cần persist result để hoạt động. | Dừng; điều này vượt non-persistent contract và cần scope/decision mới. |
| `count=100`, scan bound 10 page/1.000 row, per-call 10 giây hoặc overall deadline 30 giây không phù hợp giới hạn thật của Backlog/site. | Dừng rollout, cập nhật contract/test/docs có chủ đích; không âm thầm đổi cap hoặc giữ request vô hạn. |
| Business yêu cầu exactly-once tuyệt đối cho Jira create trước concurrent external actor. | Dừng và mở design provider-side idempotency/reservation riêng; search-then-create recheck không thể tạo distributed transaction. |
| Cập nhật architecture entity/relation cần edge mới nhưng thiếu DEC-002 evidence/contract. | Giữ prose/evidence, không materialize edge và báo review trigger. |

## Checklist nghiệm thu tổng

- [ ] Backlog Issues yêu cầu project, created_from, created_to và limit hợp lệ.
- [ ] Candidate browser không tạo database write nào, kể cả pull_state.
- [ ] Backend dùng Backlog `count=100`/createdSince/createdUntil, fill thêm trang sau duplicate và dừng đúng khi đủ/source exhausted/scan bound/overall deadline 30 giây.
- [ ] Candidate Sync to CIS reuse normalizer/job/journal inbound hiện hữu, không direct sync Jira.
- [ ] Candidate Sync chỉ enqueue khi project gates + worker đều bật; POST chỉ trả already_in_cis/queued và không chạy attachment-heavy handler trong HTTP request.
- [ ] Concurrent/stale candidate không tạo duplicate CIS issue hoặc leak raw SQLite error.
- [ ] Pull project/Pull one issue đã chuyển sang Backlog Issues theo đúng project config.
- [ ] CIS issue thủ công có canonical CIS branch, revision đầu tiên và audit trail atomic trong cùng transaction.
- [ ] Backlog/Jira identity persist canonical provider key, remote id chỉ ở response/audit; uniqueness atomic theo `project_id + đúng system column`, không cross-compare hai system.
- [ ] CommonJS require-order smoke test chứng minh public lookup không tạo cycle regression.
- [ ] Jira dry-run/readiness/mapping/anomaly gate, H1 computed-before-commit, atomic active-job enqueue, H0/H1/H2 override/trace-safe hash recheck và save-result compare-and-set không bị bypass.
- [ ] BEGIN IMMEDIATE/bounded retry xử lý busy-snapshot từ đầu và trả stable DATABASE_BUSY khi cạn lượt, không leak raw SQLite error.
- [ ] Module boundary public-API-only và CIS owner-write được giữ.
- [ ] Docs/app phản ánh behavior đã implement; không materialize relation trái DEC-002.
- [ ] Automated verify liên quan và npm test pass.
- [ ] Manual check (Người review) chưa tick khi user chưa xác nhận.

## Điều kiện hoàn thành

Plan chỉ được coi là hoàn thành khi tất cả phase BIS-00 đến BIS-05 đã được thực thi theo thứ tự, checklist automated tương ứng đã pass thật, behavior thực tế đã được phản ánh vào docs/app và npm test pass.

Manual acceptance mặc định là non-blocking và không phải điều kiện để mở phase kế tiếp hoặc hoàn tất implementation. Item Manual check (Người review) chỉ được tick sau khi user xác nhận đã kiểm tra bằng credential/Backlog/Jira thật; nếu chưa có xác nhận thì giữ unchecked và ghi lý do trong Kết quả thực hiện của phase tương ứng/BIS-05. Chỉ coi manual acceptance là blocking khi user/coordinator ghi rõ gate đó trước khi phase bắt đầu.
