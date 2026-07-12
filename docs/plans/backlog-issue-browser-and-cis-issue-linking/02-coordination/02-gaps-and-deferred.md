# Accepted gaps và deferred work

> [← Điều phối](./README.md) · [Plan index](../README.md)

## Accepted gaps

- Không có Jira Issues browser trong plan này.
- Không có bulk candidate sync; một action xử lý một Backlog issue.
- Không có persisted search/cache cho candidate list.
- Không có unlink/relink external identity sau khi đã gán.
- Candidate browse bám Backlog API `count=100`, có safety bound công khai 10 page/1.000 source row, per-call timeout tối đa 10 giây và overall deadline 30 giây; UI hiển thị canonical stop_reason.
- Jira search-by-trace và create không có transaction chung. Worker recheck ngay trước create giữ window tối thiểu như flow hiện hữu, nhưng plan không tuyên bố exactly-once nếu một external actor tạo cùng trace giữa hai Jira API call.

## Deferred work

- [ ] Jira Issues browser và Jira -> CIS inbound đầy đủ.
- [ ] Saved search, shareable filter, cache hoặc cache invalidation cho Backlog candidates.
- [ ] Bulk select/bulk Sync to CIS, progress worker UI và cancellation batch.
- [ ] Cho phép unlink/relink với approval/audit workflow riêng.
- [ ] Rate-limit policy, adaptive scan bound hoặc server-side cache khi operational data chứng minh safety bound cố định chưa đủ.
- [ ] Pagination UI state qua reload/browser history.
- [ ] Mở rộng external identity thành mapping history hoặc many-to-many relation.
