---
schema: decision/v1
id: DEC-004
slug: tabler-vanilla-mpa-admin-ui
title: Tabler Vanilla MPA Admin UI
status: accepted
summary: Admin UI dùng Tabler local, HTML và JavaScript thuần theo client-rendered MPA; Next.js, React, Vue và SPA router bị loại khỏi implementation active.
affected_layers:
  - 03-interface
  - 06-technical
  - 07-implementation
  - 08-quality
  - 09-operation
  - 10-decisions
theory_basis:
  - TH-MODULAR
  - TH-OPS-TRACE
review_triggers:
  - Client-rendered MPA không còn đáp ứng performance hoặc interaction complexity đo được.
  - Có yêu cầu bảo mật bắt buộc chuyển JWT sang HttpOnly cookie và server session.
  - Có yêu cầu SSR cho dữ liệu HTML ban đầu.
---

# DEC-004 - Tabler Vanilla MPA Admin UI

## Status

accepted

Ngày chốt: 2026-07-16. User đã phê duyệt trực tiếp kiến trúc này.

## Decision

Admin UI duy nhất của CIS được triển khai tại `apps/admin-web` bằng:

- Tabler `1.4.0` cài local từ npm;
- Node.js CommonJS server tối giản để phục vụ HTML/assets và proxy same-origin `/api/v1/*`;
- client-rendered multi-page application: mỗi route trả một HTML document thật, deep-link/reload hoạt động trực tiếp;
- JavaScript thuần theo controller riêng cho từng nhóm màn;
- JWT tiếp tục ở `localStorage`, active Project ở `sessionStorage` để giữ auth/workspace contract hiện hành;
- Express API/module tiếp tục sở hữu business rule và persistence.

Không dùng Next.js, React, Vue, TypeScript, Tailwind hoặc client-side SPA router trong implementation active. Điều hướng route dùng link/form URL thật; JavaScript chỉ phụ trách API, modal, validation và polling job cần thiết.

## Context

Admin UI Next.js trước đó đã hoàn thành phần lớn behavior nhưng tạo frontend stack và build lifecycle lớn hơn nhu cầu của Lite. User yêu cầu làm mới hoàn toàn UI theo Tabler, JavaScript thuần, giữ business behavior và loại bỏ toàn bộ UI cũ. Mục tiêu ưu tiên là thời gian cutover ngắn, URL thật, dependency thấp và không nhân bản business rule backend.

## Theory Basis

- `TH-MODULAR`: interface server chỉ là adapter, không sở hữu policy hoặc truy cập state module trực tiếp.
- `TH-OPS-TRACE`: UI vẫn phải giữ job evidence, terminal polling, retry và audit visibility.

## Affected Layers

- `03-interface`: design direction và navigation chuyển sang Tabler client-rendered MPA.
- `06-technical`: UI runtime là Node static/document server + API proxy.
- `07-implementation`: source active chỉ còn CommonJS/HTML/CSS/JavaScript.
- `08-quality`: build gate kiểm tra JavaScript và cấm dependency legacy; Playwright nghiệm thu URL/API/behavior mới.
- `09-operation`: dev/start/deploy không còn Next build/start.
- `10-decisions`: plan Next.js cũ trở thành superseded provenance.

## Affected Entities

Không tạo hoặc thay đổi entity instance canonical; đây là technology/interface decision.

## Alternatives Considered

| Phương án | Kết luận |
| --- | --- |
| Giữ Next.js/React và chỉ thay visual bằng Tabler | Loại — trái yêu cầu JavaScript thuần và làm mới hoàn toàn. |
| Vue + Tabler | Loại — thêm framework/runtime không cần thiết. |
| Vanilla SPA | Loại — phải tự sở hữu router, state và lifecycle phức tạp. |
| SSR MPA đầy đủ | Hoãn — tăng scope session/cookie, server loader và form PRG khi chưa có yêu cầu SSR. |
| Tabler client-rendered MPA | Chọn — URL thật, ít dependency, tái dùng API contract và triển khai nhanh nhất. |

## Consequences

- Route navigation tải document mới; filter dùng GET URL thật khi phù hợp.
- Loading/empty/error/retry vẫn do page controller quản lý vì dữ liệu tải ở browser.
- Không có hydration, virtual DOM hoặc framework component lifecycle.
- Tabler là dependency UI runtime duy nhất; shared CSS chỉ bổ sung nhận diện và responsive behavior của CIS.
- Historical Next migration plan đã bị xóa; implementation và tài liệu active không giữ execution path quay lại Next.js.

## Review Triggers

- Interaction complexity hoặc performance được đo cho thấy MPA không còn phù hợp.
- Auth phải chuyển sang HttpOnly cookie/server session.
- Product yêu cầu SSR data hoặc HTML-first rendering.
