---
name: admin-ui-nextjs
description: Điều phối thiết kế, triển khai, review và kiểm thử Admin UI Next.js của task_transportor. Dùng khi task đụng page, route, layout, component, style, responsive behavior, accessibility, UI state hoặc acceptance của Admin UI mới; kết hợp ui-design với playwright/playwright-interactive và luôn tuân interface truth của repo.
---

# Admin UI Next.js

## Bắt đầu

1. In: `Đang dùng admin-ui-nextjs + ui-design; kiểm thử bằng playwright/playwright-interactive khi có UI chạy được.`
2. Đọc `AGENTS.md` và `docs/app/03-interface/README.md`.
3. Khi task sửa backend/module, đọc thêm tài liệu architecture bắt buộc trong `AGENTS.md`.
4. Xác nhận task là design, implementation, review hay acceptance; không tự mở rộng sang migration plan.

## Chọn skill hỗ trợ

- Dùng `ui-design` cho design direction và implementation UI. Chốt purpose, tone, hierarchy, typography, color, motion và một signature differentiator trước khi code.
- Dùng `playwright` cho flow acceptance có thể chạy lại.
- Dùng `playwright-interactive` để điều tra trạng thái hoặc interaction trực quan chưa rõ.
- Dùng `screenshot` chỉ khi cần bằng chứng hình ảnh hoặc inspiration có mục tiêu.
- Nếu skill thiếu, báo rõ và dùng hướng dẫn cài đặt; không giả vờ đã dùng.

## Workflow

1. Khảo sát code và API contract hiện có; không đọc `backlog2jira` trừ khi user yêu cầu rõ.
2. Giữ Express/module làm owner của business rule và persistence. Next.js chỉ gọi public API của CIS.
3. Áp dụng design direction và primitive/token canonical trong `docs/app/03-interface/README.md`.
4. Thiết kế đủ loading, empty, error/retry, success, disabled và permission/block state có liên quan.
5. Triển khai responsive và keyboard/focus ngay trong cùng change, không để thành cleanup mơ hồ.
6. Chạy lint, test, build và acceptance phù hợp với phạm vi thật.
7. Báo file đã đổi, validation đã chạy/chưa chạy và manual check còn thiếu.

## Guardrail

- Không dùng Figma như dependency mặc định.
- Không tự thêm component library, state library hoặc data-fetching library nếu native/framework capability đã đủ.
- Không tạo design system thứ hai trong từng feature.
- Không gọi Backlog/Jira trực tiếp từ browser nếu CIS API đã là boundary.
- Không coi HTTP accepted/enqueued là nghiệp vụ đã hoàn tất; UI phải theo dõi terminal state khi contract yêu cầu.
- Không xóa Admin UI cũ trước acceptance cutover; sau cutover không giữ legacy route, fallback hoặc dual UI.
- Không tự lập hoặc thay đổi migration plan khi user chỉ yêu cầu design/implementation của một scope UI.

## Definition of done

- Design direction đã được nêu rõ và thể hiện trong UI.
- Không vi phạm API/module boundary.
- Các state chính và accessibility đã được kiểm.
- Build/test/acceptance tương ứng đã pass, hoặc phần chưa chạy được nêu rõ.
- Manual check của người review không được tự tick.
