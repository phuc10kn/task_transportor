# Phase BIS-01 - Public lookup contract và CIS identity integrity

> [← Phase index](../README.md) · [Overview](../../00-overview/README.md) · [Plan index](../../README.md)

Capability contracts bắt buộc:

- [Mục tiêu, phạm vi và quyết định](../../00-overview/01-goals-scope-and-decisions.md)
- [Baseline và source of truth](../../00-overview/02-baseline-and-sources.md)
- [External identity linking và Jira guards](../../00-overview/03-target-design/05-external-identity-linking.md)
- [Persistence và module boundaries](../../00-overview/03-target-design/06-persistence-and-boundaries.md)

Mục tiêu:

- Cung cấp public remote lookup tối thiểu và persistence guard để CIS có thể kiểm tra/link external identity an toàn.

Target files/artifacts:

- src/modules/Cis/CisApi.js
- src/modules/Cis/infrastructure/CisRepository.js
- src/modules/Cis/application/getIssueByBacklogKey.js
- src/modules/Cis/application/getIssuesByBacklogKeys.js (mới)
- src/modules/Cis/application/getIssueByJiraKey.js (mới)
- src/modules/Backlog/BacklogApi.js
- src/modules/Backlog/application/lookupBacklogIssueIdentity.js (mới)
- src/modules/Backlog/support/normalizeBacklogIssue.js
- src/modules/Jira/JiraApi.js
- src/modules/Jira/application/lookupJiraIssueIdentity.js (mới)
- src/modules/Jira/infrastructure/JiraClient.js
- scripts/verify/system-issues.js
- package.json

Điều kiện mở:

- BIS-00 pass.
- Logical collision legacy, nếu có, đã được ghi data debt và có policy chặn thao tác trên key bị ảnh hưởng.

Việc cần làm:

- Thêm CisApi batch read cho Backlog keys và lookup Jira key; API chỉ trả data cần thiết.
- Thêm public Backlog/Jira lookup use case, mỗi use case load project qua public Projects API rồi gọi client của chính module.
- Bổ sung project field tối thiểu trong JiraClient.getIssue và fake client để xác nhận Jira issue thuộc jira_project_key.
- Chuẩn hóa key tại public boundary, Backlog normalizer và CIS repository owner boundary; repository lookup so sánh case-insensitive để bảo vệ legacy data.
- Tạo `verify:system-issues` ngay trong phase này và đưa vào `npm test`; BIS-02/BIS-03 chỉ mở rộng cùng verifier theo feature của phase.
- Viết test cho lookup not-found, project mismatch, input numeric ID/alias được resolve thành canonical provider key, một legacy key khác casing, nhiều row legacy cùng logical key bị block rõ ràng và database race guard. Test matrix bắt buộc chứng minh: cùng project + cùng Jira key bị chặn; cùng project + cùng Backlog key bị chặn; cùng text xuất hiện một lần ở Backlog column và một lần ở Jira column được phép; khác project_id được phép.
- Thêm CommonJS require-order smoke test: require `CisApi -> BacklogApi -> JiraApi` và thứ tự ngược lại trong process sạch, rồi assert các public lookup function vẫn callable; chạy thêm fixture smoke manual-pull và Jira lookup ở mỗi thứ tự. Test này khóa lazy accessor và ngăn regression cycle do top-level require ngược.
- Kiểm tra bằng rg rằng không có cross-module deep import mới.

## Checklist hoàn thành phase

- [ ] Cùng external key mới khác casing không thể persist vào hai CIS issue cùng project; legacy casing được lookup như cùng một identity.
- [ ] Backlog/Jira lookup xác minh remote issue tồn tại và project routing đúng.
- [ ] Numeric ID/alias chỉ là lookup token; value persist/compare luôn là canonical key do provider trả về.
- [ ] Duplicate predicate đúng theo chốt: cùng project + cùng system column bị chặn; Backlog/Jira không cross-compare; khác project_id được phép.
- [ ] Lookup/dedupe/write identity mới đi qua CisApi/CIS repository; Jira read model allowlist hiện hữu trong MB-003 không bị mở rộng hoặc refactor ngoài scope.
- [ ] Backlog/Jira consumer chỉ gọi CisApi/public API, không import sâu CIS internals.
- [ ] CommonJS require-order smoke test pass ở cả hai thứ tự module.
- [x] Unit test check (Agent): verify:system-issues, verify:phase02, verify:phase03 và verify:phase06 pass thật.
- [ ] Manual check (Người review): chỉ tick khi user xác nhận lookup/routing bằng credential Backlog/Jira thật; nếu chưa có thì giữ unchecked và ghi rõ fixture evidence.

Kết quả thực hiện:

Status: Automated pass.

- Public Backlog/Jira lookup trả canonical provider key và verify project identity.
- Duplicate được khóa theo `project_id + đúng system column`; numeric lookup token, cross-system same text và khác project đều có verifier.
- CommonJS require-order smoke test pass ở hai thứ tự process sạch.

---

[← Phase index](../README.md) · [Điều phối và handoff](../../02-coordination/README.md)
