# Lite - Implement plans

Folder này chia kế hoạch implement Lite theo phase. Mục tiêu là làm từng phần có thể kiểm chứng được, tránh đi quá xa rồi mới phát hiện nền móng sai.

Nguyên tắc triển khai:

- Mỗi phase phải có chốt chặn rõ trước khi qua phase sau.
- Mỗi phase phải có deliverables rõ để biết code artifact nào cần tồn tại.
- Mỗi phase phải có checklist hoàn thành gồm `Unit test check (Agent)` và `Manual check (Người review)`.
- `Unit test check (Agent)` là phần Agent phải chạy bằng test script/fixture/fake adapter.
- `Manual check (Người review)` là phần người vận hành tự xác nhận bằng API/UI/worker thật.
- Ưu tiên test được bằng API/DB/worker thật càng sớm càng tốt.
- Không bật webhook trong Lite; manual pull/scheduled pull là đường chính.
- Translation Lite dùng `codex_exec` là provider chính.
- Mọi job/journal/mapping phải dùng `direction_from` và `direction_to`.
- Medium/Full kế thừa bằng cách mở rộng module, không rewrite luồng Lite.

## Thứ tự phase

1. [00-foundation.md](00-foundation.md) - skeleton, config, SQLite, storage, lỗi chuẩn.
2. [01-auth-projects.md](01-auth-projects.md) - admin auth và project config.
3. [02-cis-jobs.md](02-cis-jobs.md) - CIS schema, worker nền, sync jobs, journal, state nền.
4. [03-backlog-ingestion.md](03-backlog-ingestion.md) - Backlog manual/scheduled pull vào CIS.
5. [04-translation-review.md](04-translation-review.md) - optional `codex_exec` translation và human review.
6. [05-mapping-anomaly-dryrun.md](05-mapping-anomaly-dryrun.md) - mapping, anomaly, dry-run Jira.
7. [06-jira-outbound.md](06-jira-outbound.md) - sync thật CIS -> Jira và retry.
8. [07-admin-ui-acceptance.md](07-admin-ui-acceptance.md) - Admin UI tối thiểu và nghiệm thu Lite.
9. [08-verification-matrix.md](08-verification-matrix.md) - ma trận `Unit test check (Agent)` và `Manual check (Người review)` theo phase.

## Chốt chặn tổng

| Sau phase | Có thể test được | Không đạt thì chưa đi tiếp |
| --- | --- | --- |
| 00 | Server, config, DB migrate, storage, error envelope | Không làm module nghiệp vụ |
| 01 | Login, JWT, CRUD project config | Không ingest dữ liệu thật |
| 02 | Schema CIS, worker nền, job queue, journal, retry/cancel cơ bản | Không pull Backlog |
| 03 | Backlog pull -> CIS issue/revision/comment/attachment metadata và download file Backlog -> CIS | Không làm translation |
| 04 | Nếu bật translation, `codex_exec` tạo draft và admin review/approve/edit/reject | Không nối translation review thành gate riêng của Jira dry-run; dry-run thuộc Phase 05 |
| 05 | Missing mapping/anomaly block sync, dry-run có `can_sync` | Không gọi Jira API thật |
| 06 | Jira create/update/link issue/comment, retry/journal đầy đủ | Không nghiệm thu cuối |
| 07 | UI vận hành được end-to-end | Lite sẵn sàng demo/hand-off |

## Cách dùng

- Khi bắt đầu phase mới, đọc file phase tương ứng và các docs Lite liên quan.
- Implement đủ mục "Deliverables" của phase đó.
- Khi kết thúc phase, chạy hết mục "Checklist hoàn thành phase".
- Đối chiếu thêm [08-verification-matrix.md](08-verification-matrix.md) để biết `Unit test check (Agent)` và `Manual check (Người review)` cần chạy.
- Nếu một chốt chặn fail, sửa trong phase hiện tại trước khi mở rộng scope.
