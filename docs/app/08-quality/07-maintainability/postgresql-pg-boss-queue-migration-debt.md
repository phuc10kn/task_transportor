# Nợ kỹ thuật — Worker queue và chuyển sang PostgreSQL/pg-boss

> Ngày ghi nhận: 2026-07-17  
> Trạng thái: Accepted technical debt — chưa triển khai  
> Phạm vi tương lai: Database runtime + Sync queue/worker + vận hành

## Hiện trạng tạo ra nợ

Hệ thống hiện dùng SQLite và tự quản lý durable queue qua `sync_jobs`, polling, claim và retry. Worker runtime còn đơn giản: mỗi loop chỉ xử lý một job, chưa có routing theo capability/lane, configurable concurrency, lease heartbeat/fencing, shared rate limit hoặc readiness dựa trên worker đang sống.

Phương án hiện tại phù hợp Lite và tải nhỏ, nhưng toàn bộ worker/queue runtime này là nợ kỹ thuật khi cần throughput cao, nhiều worker hoặc multi-host. Không nên tiếp tục mở rộng một queue framework riêng trên SQLite nếu target đã chuyển sang PostgreSQL/`pg-boss`.

## Phạm vi nợ worker/queue

- Phân loại và routing worker theo execution profile/job type.
- `WORKER_CONCURRENCY` và quản lý nhiều job in-flight an toàn.
- Retry classification, backoff, dead-letter và recovery rõ ràng.
- Worker liveness, graceful shutdown và readiness theo consumer thực tế.
- Lease/ownership hoặc cơ chế tương đương để worker chết không gây xử lý trùng.
- Shared rate limit, gồm giới hạn Backlog `20 job starts / 60 giây` giữa mọi worker.
- Idempotency cho external write và composite `sync_translate_jira`.
- Metrics/runbook cho pending, running, retry, failed và queue latency.

## Hướng xử lý khi trả nợ

- Chuyển database runtime từ SQLite sang PostgreSQL bằng một migration/cutover plan riêng.
- Dùng `pg-boss` trên PostgreSQL làm durable job queue và worker runtime thay cho cơ chế polling/claim/lease/retry tự quản trong `sync_jobs`.
- Giữ `job_type` và execution profile làm contract routing nghiệp vụ; không để tên queue của `pg-boss` trở thành business contract.
- Giữ `sync_journal` làm audit trail của CIS; không dùng bảng nội bộ của `pg-boss` thay cho audit nghiệp vụ.
- Giữ `sync_translate_jira` là một composite parent job, không tách thành child queue.
- Thiết kế idempotency, retry classification và provider rate limit trước khi cutover.
- Chỉ có một queue source of truth sau cutover; không duy trì dual-write SQLite queue và `pg-boss` lâu dài.

## Điều kiện kích hoạt

Chỉ triển khai khoản nợ này khi có ít nhất một nhu cầu đã được đo hoặc chấp thuận:

- Cần worker chạy multi-host.
- SQLite contention/locking trở thành giới hạn throughput thực tế.
- Chi phí duy trì claim, lease, retry và recovery tự quản lớn hơn chi phí vận hành PostgreSQL.
- Cần capability vận hành queue mà runtime hiện tại không đáp ứng an toàn.

## Acceptance cho lần xử lý nợ

- Có decision được duyệt để thay SQLite bằng PostgreSQL và thay đổi scope worker hiện tại.
- Migration bảo toàn Project, CIS issue, mapping, credential reference, sync job cần tiếp tục và `sync_journal`.
- Enqueue và cập nhật dữ liệu liên quan không tạo khoảng trống mất job khi process crash.
- Retry/recovery không tạo duplicate Jira issue hoặc apply canonical hai lần.
- Concurrency, routing lane và giới hạn `20 job starts / 60 giây` có test nhiều worker.
- Có cutover, rollback, backup/restore và operational runbook được verify.
- Sau cutover không còn production worker claim queue từ SQLite.

## Ngoài lượt ghi nhận này

Không thêm PostgreSQL, `pg-boss`, dependency, schema migration, config hoặc thay đổi worker code trong lượt này. `configurable-sync-workers.md` chỉ là tài liệu phân tích cho phần nợ worker/queue, chưa phải scope triển khai được duyệt. Trước khi trả nợ phải lập lại kế hoạch theo target PostgreSQL/`pg-boss` và có decision mới.
