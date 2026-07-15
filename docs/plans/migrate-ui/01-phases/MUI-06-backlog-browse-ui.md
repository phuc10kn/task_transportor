# MUI-06 — Backlog browse UI

## Mục tiêu

Chuyển Backlog readiness, saved Status/Assignee filters và explicit candidate search sang Next.js mà chưa thêm pull/sync mutations.

## Artifact mục tiêu

- `apps/admin-web/app/(console)/backlog-issues/page.tsx` với readiness/filter/candidate read flow.
- `apps/admin-web/features/backlog/**` và client `submittedFilterSnapshot`.
- Browse-focused Playwright cases.

## Điều kiện mở phase

- HG-02 được xác nhận.
- Current action-readiness/filter-options/candidates endpoints và Backlog visible columns đã khóa ở MUI-00.

## Công việc

- Load Project list; chỉ load readiness/filter-options khi có selected Project.
- Initial load chọn Project đầu tiên và đặt `created_from`/`created_to` bằng ngày hiện tại như active UI.
- Find button bind đúng `actions.browse.enabled`/`disabled_reasons`; đây là safety transform đã khóa thay cho legacy chỉ kiểm có Project. Các readiness object còn lại được giữ nguyên cho MUI-07, frontend không tạo rule mới.
- `created_from`, `created_to`, `limit` required; Status/Assignee optional multi-select từ current filter-options response.
- Không thêm snapshot timestamp/state/fingerprint. Khi Status/Assignee options trống hoặc request lỗi, giải thích và link `/mappings?project_id=...` để refresh.
- `Not closed` độc lập và giao với selected Status theo current request contract; empty Status/Assignee bị omit.
- Chỉ `Find issues` gọi candidate API. Mount, project/filter change và Back/Forward không tự browse.
- URL cập nhật sau submit; result gắn `submittedFilterSnapshot`. Form/URL khác snapshot thì xóa result cũ và yêu cầu Find lại.
- Candidate table giữ Backlog key, Summary, Status, Assignee, Created, Updated và action column placeholder.
- Đăng ký Backlog Issues nav/refetch adapter; Global Refresh reload Projects/readiness/filter-options nhưng không tự browse lại hoặc làm sai `submittedFilterSnapshot`.
- Giữ current scan/partial-result metadata và warnings; partial result không trình bày như scan đầy đủ.
- Không sửa Backlog module, Project JSON hoặc database.

## Checklist nghiệm thu

- [x] Status/Assignee lấy từ current filter-options; empty selection bị omit.
- [x] Initial Project/date defaults và `actions.browse` enable/disable semantics giữ đúng active behavior.
- [x] Empty/error options dẫn tới Mappings mà không tự pull provider.
- [x] Not closed và selected Status serialize đúng current API.
- [x] Browse chỉ chạy sau `Find issues`.
- [x] Result chỉ render khi khớp `submittedFilterSnapshot`.
- [x] Candidate visible columns và scan/partial evidence được giữ.
- [x] Loading/empty/error/retry, URL/Back/Forward và Browse Playwright pass.
- [x] Manual check (Người review tại HG-03).
- [x] Unit test check (Agent).

## Kết quả thực hiện

In-progress — MUI-06 automated pass. Route `/backlog-issues` đã có project selection theo URL, readiness/filter-options read flow, ngày hiện tại và limit mặc định, multi-select Status/Assignee từ saved Mapping directory, Not closed giao với Status, explicit `Find issues` và candidate result gắn với submitted filter snapshot. Visual pass đã thay native multi-select bằng checkbox option picker, tách scan evidence thành card, chuẩn hóa timestamp ngắn, summary wrapping và action placeholder thành badge rõ ràng. Mount, đổi filter, đổi project và Back/Forward không tự browse; options lỗi dẫn tới Mappings để operator refresh; candidate table giữ Backlog/Summary/Status/Assignee/Created/Updated và scan/partial evidence. Không thêm Pull/Sync mutation trong phase này; action column chỉ là placeholder cho MUI-07. Đã pass `npm run admin:lint`, `npm run admin:typecheck`, `npm run verify:admin-ui-e2e` (14 tests: browse, empty optional filters, loading/error/retry) và `npm run admin:build`. Còn chờ manual HG-03.
