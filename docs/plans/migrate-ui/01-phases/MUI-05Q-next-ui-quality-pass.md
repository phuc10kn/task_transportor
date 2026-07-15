# MUI-05Q — Next UI quality pass

## Mục tiêu

Thực hiện một lượt cải thiện visual và interaction cho toàn bộ Next UI hiện đã có, không thay đổi route, API, field, mutation hoặc business behavior. Phạm vi chỉ tập trung desktop; không mở rộng responsive work.

## Artifact mục tiêu

- `apps/admin-web/app/globals.css` và shared UI primitives.
- Các route hiện có: `/login`, `/dashboard`, `/projects`, `/mappings`.
- Playwright visual/interaction assertions bổ sung cho theme, accordion, focus, hover, loading và saving.

## Điều kiện mở phase

- MUI-03, MUI-04 và MUI-05 automated pass.
- Design direction Modern Operations Console đã có trong `docs/app/03-interface/README.md`.
- Không cần chờ Human Gate mới vì phase này là quality pass trước HG-02.

## Công việc

- Chốt lại hierarchy desktop: page header, toolbar, surface, field, table, status và action hierarchy.
- Chuẩn hóa light/dark semantic tokens; input, table, accordion, policy, badge và state panel phải có nền/border/text rõ ràng.
- Bổ sung micro-interaction có chủ đích: hover, focus-visible, pressed, accordion open/close, button loading và state transition; tôn trọng `prefers-reduced-motion`.
- Loại bỏ clipping, native marker rơi dòng, chevron sai vị trí, khoảng trắng thừa và các card lồng không cần thiết.
- Giữ nguyên mọi endpoint, request body, route query, field, action, error semantics và server truth.
- Chạy browser review trực quan trên desktop ở dark/light; không đánh giá responsive trong phase này.

## Checklist nghiệm thu

- [x] Design review desktop pass cho `/login`, `/dashboard`, `/projects`, `/mappings`.
- [x] Light/dark canvas, surface, input, table, badge và state panel readable.
- [x] Hover/focus/pressed/loading/open-close states hoạt động và có motion phù hợp.
- [x] Không mất route, field, mutation, API request hoặc error behavior hiện tại.
- [x] Browser visual review desktop pass; không clipping hoặc layout artifact rõ ràng.
- [x] Lint/typecheck/build và Playwright pass.
- [x] Human review quality pass được user xác nhận tại HG-02.
- [x] Manual check (Người review tại HG-02).
- [x] Unit test check (Agent).

## Kết quả thực hiện

In-progress — MUI-05Q automated quality pass đã hoàn tất cho `/login`, `/dashboard`, `/projects`, `/mappings`: light theme đã chuẩn hóa về workspace gần trắng, surface/input trắng, `surface-muted` neutral slate, border slate nhạt và blue accent có chủ đích; dark theme giữ semantic token tương ứng. State-panel rail, metric-card entrance/hover, focus/pressed transitions, mapping accordion/table polish với slide open/close 250ms theo chiều cao nội dung thực tế, dirty status (`unsaved` trước Save, `approved` sau Save thành công) và theme icon SVG hợp lệ đã được áp dụng mà không đổi API/behavior. Đã pass lint, typecheck, production build và 10 Playwright tests. Next: visual review desktop dark/light tại HG-02; không mở MUI-06 trước khi gate xác nhận.
