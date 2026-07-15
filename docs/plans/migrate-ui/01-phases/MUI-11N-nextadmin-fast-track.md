# MUI-11N — NextAdmin fast-track

## Mục tiêu

Thay visual foundation tự viết của Admin UI Next.js bằng một tập con NextAdmin đã được chọn lọc, giữ nguyên route, API contract, auth, business behavior và browser acceptance hiện tại.

Phase này nằm sau MUI-11 và trước MUI-12 để các màn còn lại được xây trực tiếp trên primitive mới, tránh tiếp tục phát sinh CSS/modal/table riêng lẻ.

## Quyết định triển khai

- Dùng NextAdmin Free `1.3.x` làm nguồn tham chiếu/source component ban đầu.
- Chỉ vendor component và asset thật sự dùng; không clone toàn bộ template vào repo.
- Không mang BetterAuth, Prisma, PostgreSQL, RBAC mẫu, dashboard demo, chart, map hoặc data layer của NextAdmin vào `task_transportor`.
- Giữ Next.js `16.2.10`, React `19.2.7`, Tailwind CSS v4 và App Router hiện tại.
- Giữ `AuthGuard`, JWT/localStorage, `apiFetch`, relative `/api/v1/*`, route registry và Express rewrite hiện tại.
- Không duy trì route NextAdmin demo hoặc hai shell active. Mỗi wave thay trực tiếp primitive/route trong branch hiện tại và phải pass regression trước khi đi tiếp.
- Bản Pro không thuộc scope. Nếu sau này dùng component Pro/SaaS redistribution, phải xác nhận license riêng trước khi import.

Nguồn tham chiếu:

- `https://github.com/NextAdminHQ/nextjs-admin-dashboard`
- `https://nextadmin.co/components`
- `https://nextadmin.co/pricing`

## Design direction chốt trước implementation

1. **Mục đích:** console vận hành CIS cho operator cần đọc trạng thái, xử lý lỗi và thực hiện action có bằng chứng.
2. **Tone:** điềm tĩnh, chính xác, compact; không mang phong cách e-commerce/marketing dashboard của template.
3. **Hierarchy:** page header ngắn, filter/action bar rõ, data surface phẳng, modal tập trung và state panel nhất quán.
4. **Typography:** Geist/Inter nếu đã có sẵn trong Next runtime; fallback system sans; số liệu/job ID dùng mono có chọn lọc.
5. **Color:** neutral slate + blue accent dịu; warning/danger chỉ theo semantic state; dark/light dùng cùng token contract.
6. **Motion:** 120–180 ms cho disclosure/modal/hover; tắt theo `prefers-reduced-motion`; không animation trang trí.
7. **Signature differentiator:** operational evidence rail — job/readiness/anomaly evidence luôn có một rail/badge semantic nhỏ, không biến thành card trang trí.

Không dùng targeted external inspiration ngoài NextAdmin component source trong phase này.

## Baseline cần bảo toàn

- Route hiện có: Login, Dashboard, Projects, Mappings, Backlog Issues, CIS Issues, Issue Editor, Translation Queue và Translation Glossary.
- Loading/empty/error/retry và dirty form behavior hiện tại.
- Global Refresh theo event `cis-global-refresh`.
- Readiness và job polling của Backlog actions.
- Source/canonical/translation separation trong Issue Editor và Translation.
- Glossary dynamic language, variants, exactly-one-canonical và conflict giữ form.
- Toàn bộ selector semantic đang được Playwright dùng; có thể đổi class nhưng không được làm mất role/label/text contract nếu không cập nhật test có chủ ý.

## Ngoài phạm vi

- Không sửa Express API, `src/modules`, SQLite hoặc migration.
- Không đổi JWT sang NextAuth/BetterAuth/cookie session.
- Không thêm Prisma/PostgreSQL.
- Không triển khai MUI-12 đến MUI-17 trong phase này.
- Không nhập toàn bộ dependency của NextAdmin. Dependency chỉ được thêm khi component được chọn thực sự cần và không thể thay bằng React/Tailwind hiện có.
- Không mua hoặc nhập component Pro.

## Artifact mục tiêu

```text
apps/admin-web/
  app/
    (console)/layout.tsx             # shell NextAdmin-adapted duy nhất
    globals.css                      # token/reset tối thiểu, không giữ CSS feature đã chết
  components/
    console-shell.tsx                # sidebar/header/mobile navigation
    ui/
      button.tsx
      badge.tsx
      card.tsx
      data-table.tsx
      dialog.tsx
      field.tsx
      state-panel.tsx
      index.ts
  lib/
    auth.tsx                         # giữ contract
    api-client.ts                    # giữ contract
    route-registry.ts                # giữ contract
```

Tên file có thể điều chỉnh theo source NextAdmin thực tế, nhưng chỉ có một primitive owner cho mỗi concern. Không giữ `components/ui.tsx` song song sau khi tất cả caller đã chuyển.

## Component mapping

| Hiện tại | Target NextAdmin-adapted | Rule bắt buộc |
| --- | --- | --- |
| `.app-shell`, `.app-sidebar`, `.app-header` | `ConsoleShell`, `Sidebar`, `Header` | Route registry, admin identity, refresh và logout giữ nguyên |
| `Button` trong `components/ui.tsx` | `Button` variants | Primary/secondary/danger/icon, busy/disabled/focus rõ |
| `.surface`, `.surface-muted` | `Card`, `Panel` | Không card lồng quá hai tầng |
| `.field-control` | `Field`, `Input`, `Select`, `Textarea` | Label/error/help/disabled nhất quán |
| table CSS theo route | `DataTable` shell + semantic native table | Không thêm data-grid dependency; vẫn hỗ trợ overflow và sticky header khi cần |
| modal fixed theo page | `Dialog` primitive | Backdrop, focus trap, Escape, restore focus, scroll lock, header/body/footer |
| `StatePanel` | `StatePanel` primitive | Loading/empty/error/retry/success dùng cùng hierarchy |
| `.badge` | `Badge` | Chỉ semantic neutral/success/warning/danger/info |
| custom accordion | `Disclosure`/accordion adapted | Keyboard, focus và reduced-motion |

## Kế hoạch fast-track

### Wave 0 — Preflight và source lock (tối đa 0,25 ngày)

1. Ghi commit/tag/URL NextAdmin Free dùng làm nguồn; lưu license/attribution cần thiết trong `apps/admin-web/README.md` hoặc file license phù hợp.
2. Inventory dependency của component được chọn; từ chối BetterAuth, Prisma, PostgreSQL, chart/map/demo dependency.
3. Chạy baseline:

   ```text
   npm run admin:lint
   npm run admin:typecheck
   npm run admin:build
   npm run verify:admin-ui-e2e
   ```

4. Chụp browser baseline cho desktop `1440x900`, tablet `1024x768`, mobile `390x844` ở Login, Dashboard và Translation Glossary.
5. Khóa selector/behavior matrix: route, action, loading/error, dialog, table overflow, keyboard.

**Exit:** source/license/dependency allowlist rõ; baseline pass; không sửa behavior.

### Wave 1 — Shell, tokens và primitive core (tối đa 0,75 ngày)

1. Port/adapt sidebar, header, mobile navigation và theme toggle từ NextAdmin.
2. Tạo token canonical cho canvas/surface/text/border/accent/semantic state; map dark/light hiện tại vào token mới.
3. Tạo `Button`, `Badge`, `Card`, `Field`, `StatePanel`, `Dialog` và `DataTable` shell.
4. Giữ `AuthGuard`, route registry, Global Refresh, admin identity và logout trong shell.
5. Migrate Login + Dashboard làm smoke route.
6. Kiểm tra keyboard: skip link, sidebar, theme, refresh, logout, dialog focus/Escape.

**Exit:** Login/Dashboard/shell pass E2E và ba viewport; không còn shell CSS cũ được dùng.

### Wave 2 — Pilot phức tạp: Translation Glossary (tối đa 0,5 ngày)

1. Migrate filter bar, table, language groups, Add/Edit/View/Delete dialog sang primitive mới.
2. Giữ full term list theo language, separator giữa language group và rule ẩn `(Canonical)` khi language chỉ có một term.
3. Dialog form dùng header/footer cố định, body cuộn, backdrop/focus trap/restore focus.
4. Validation/conflict giữ toàn bộ draft; delete confirmation giữ concept identity.
5. Xóa CSS `translation-glossary-*` đã được primitive thay thế.

**Exit:** `e2e:translation-glossary` pass; visual review desktop/tablet/mobile pass. Pilot này khóa API của primitive trước khi migrate route khác.

### Wave 3 — Route migration theo cụm (tối đa 1 ngày)

Thứ tự ưu tiên dựa trên khả năng tái sử dụng, không dựa trên độ dễ nhìn:

1. **Projects + Mappings:** form, list selection, accordion, mapping tables, refresh action.
2. **Backlog Issues:** filter groups, evidence cards, options list, candidate table, row actions/job feedback.
3. **CIS Issues + Issue Editor:** list/create, source comparison, editor sections, recovery dialogs.
4. **Translation Queue:** dense table, long text, review actions và state feedback.

Mỗi route phải:

- thay caller sang primitive mới;
- giữ request payload/API evidence;
- pass feature Playwright ngay sau migration;
- xóa CSS feature cũ khi caller cuối đã chuyển;
- không chờ migrate toàn bộ route mới chạy test.

**Exit:** toàn bộ route đang tồn tại dùng shell/primitives mới; không còn modal/table/button tự dựng ngoài primitive có lý do được ghi rõ.

### Wave 4 — Consolidation và acceptance (tối đa 0,5 ngày)

1. Xóa `components/ui.tsx` cũ sau khi `rg` xác nhận không còn import.
2. Thu gọn `globals.css` về reset/token/shared utilities; xóa selector chết.
3. Chạy full responsive/keyboard/focus/reduced-motion acceptance.
4. Chạy full Admin UI Playwright và build.
5. Human review HG-04 trên bundle Issues + Translation + NextAdmin foundation.
6. Cập nhật MUI-12 để mọi UI mới chỉ dùng primitive NextAdmin-adapted.

**Exit:** không dual design system; full automated gate pass; HG-04 chờ user xác nhận.

## Quy tắc ép tiến độ

- Một executor làm liên tục trên một branch; không handoff giữa wave.
- Wave 0 và Wave 1 hoàn thành trong ngày đầu; preflight không tạo implementation spike riêng.
- Glossary pilot chỉ được phép sửa primitive dùng chung. Sau pilot, khóa public API của primitive để tránh refactor lại các route đã chuyển.
- Giữ semantic HTML và state logic hiện tại khi chúng đúng; chỉ thay shell, component composition và style owner, không rewrite feature state.
- Chạy feature Playwright ngay sau từng cụm route; lint/typecheck/build/full suite chỉ chạy một lần ở Wave 4 nếu feature suite không phát hiện lỗi nền.
- Không thêm dependency nếu React, Tailwind hoặc primitive đã vendor giải quyết được.
- Visual review tập trung vào ba checkpoint: shell, Glossary pilot và full bundle. Không mở vòng polish riêng cho từng route.

## Timeline bắt buộc

| Ngày | Kết quả bắt buộc |
| --- | --- |
| 1 | Wave 0 + Wave 1: source lock, shell, tokens, primitives, Login và Dashboard pass |
| 2 | Wave 2 + nửa đầu Wave 3: Glossary pilot, Projects, Mappings và Backlog pass |
| 3 | Nửa sau Wave 3 + Wave 4: CIS, Translation Queue, cleanup, full test và handoff HG-03/HG-04 |

Mục tiêu đã khóa là **3 ngày làm việc với một executor tập trung**. Đây là mức thấp nhất vẫn giữ đủ behavior, responsive, accessibility và automated acceptance. Không ép xuống hai ngày bằng cách bỏ test hoặc dồn lỗi sang Human Gate; API/behavior blocker hoặc dependency/license không rõ vẫn là stop trigger.

## Acceptance matrix tối thiểu

| Concern | Automated evidence | Manual evidence |
| --- | --- | --- |
| Shell/auth | `auth.spec.ts`, `smoke.spec.ts` | Sidebar/header/mobile nav, dark/light |
| Projects | `projects.spec.ts` | Form density, error giữ input |
| Mappings | `mappings.spec.ts` | Accordion/table/action hierarchy |
| Backlog | `backlog.spec.ts`, `backlog-actions.spec.ts` | Dense filter/table/job feedback |
| CIS/Recovery | `cis-issue-editor.spec.ts`, `issue-recovery.spec.ts` | Long content, dirty/recovery dialog |
| Translation | `translation.spec.ts` | Queue readability và action clarity |
| Glossary | `translation-glossary.spec.ts` | Language grouping, Add/Edit/View/Delete dialog |

Ba viewport bắt buộc:

- Desktop: `1440x900`.
- Tablet: `1024x768`.
- Mobile: `390x844`.

Keyboard bắt buộc:

- Tab order hợp lý và focus visible.
- Escape đóng dialog không mất draft ngoài policy hiện tại.
- Dialog giữ focus bên trong và trả focus về trigger khi đóng.
- Action quan trọng không phụ thuộc hover.

## Lệnh verify

```text
npm run admin:lint
npm run admin:typecheck
npm run admin:build
npm run verify:admin-ui-e2e
npm run verify:phase07
git diff --check
```

Trong mỗi wave chỉ chạy feature suite liên quan trước; full suite chạy ở Wave 4.

## Stop trigger

- Diff chạm `src/modules`, database hoặc thay API semantics.
- NextAdmin component yêu cầu Prisma/BetterAuth/PostgreSQL để render UI.
- License/attribution của source được chọn chưa rõ.
- Route mất loading/empty/error/retry, visible evidence hoặc dirty form behavior.
- Hai shell/design system cùng active sau Wave 4.
- E2E chỉ pass bằng cách bỏ assertion behavior hiện tại.
- Accessibility regression: mất label, focus, keyboard hoặc contrast.

## Rollback

- Mỗi wave là một commit độc lập.
- Nếu Wave 2 pilot không đạt visual/behavior acceptance, rollback Wave 2 và giữ Wave 1 chỉ khi shell primitive pass độc lập.
- Nếu primitive API phải đổi sau pilot, sửa primitive và rerun các route đã migrate; không vá riêng từng page.
- Không deploy production giữa các wave. Production chỉ nhận cây đã pass Wave 4 và Human Gate theo plan tổng.

## Checklist hoàn thành phase

- [x] NextAdmin source/version/license và dependency allowlist đã khóa.
- [x] Không có BetterAuth, Prisma, PostgreSQL hoặc demo route/data layer được nhập.
- [x] Shell/tokens/primitives mới là owner duy nhất.
- [x] Login, Dashboard và Translation Glossary pilot pass ba viewport.
- [x] Projects, Mappings, Backlog, CIS/Recovery và Translation Queue đã migrate.
- [x] Loading/empty/error/retry, dirty form và job evidence được giữ.
- [x] Dialog focus/Escape/restore focus và keyboard navigation pass.
- [x] CSS/component cũ không còn caller đã bị xóa.
- [x] Full Admin UI Playwright, lint, typecheck, build và `verify:phase07` pass.
- [x] Unit test check (Agent).
- [x] Manual check (Người review tại HG-04).

## Kết quả thực hiện

Fix tối thiểu: docs/plans/migrate-ui/01-phases/MUI-11N-nextadmin-fast-track.md - ghi nhận HG-04 đã được user xác nhận bằng yêu cầu tiếp tục MUI-12.
