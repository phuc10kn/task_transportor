# Hướng Dẫn Codex Cho Dự Án

## Phạm vi

File này áp dụng cho toàn bộ repository `task_transportor`.

Hướng sản phẩm hiện tại là Central Sync Hub được mô tả trong `docs/app`. Xem các file đó là nguồn sự thật cho product scope và hành vi Lite hiện tại.

Bỏ qua thư mục cũ `backlog2jira` trong công việc Codex thông thường. Không đọc, tìm kiếm, sửa hoặc dùng thư mục này làm nguồn thiết kế, trừ khi user yêu cầu rõ việc migration, so sánh hoặc cleanup liên quan đến `backlog2jira`.

## Mô hình sản phẩm

Dùng mô hình **System -> CIS -> System**:

- Đầu vào: Backlog/Jira gửi webhook hoặc Admin UI kích hoạt manual pull vào CIS.
- Xử lý: CIS lưu raw event, normalize payload, dịch, review, học mapping, phát hiện anomaly và ghi audit.
- Đầu ra: CIS đẩy dữ liệu đã được duyệt sang hệ thống đích. MVP ưu tiên `Backlog -> CIS`, `Jira -> CIS` và `CIS -> Jira`.

Tài liệu chính:

- `docs/app/00-context/README.md` - bối cảnh Central Sync Hub và mô hình `System -> CIS -> System`.
- `docs/app/01-business/README.md` - business flow, actor/operator và business rule Lite.
- `docs/app/02-product/README.md` - scope Lite/MVP, capability và out-of-scope hiện tại.
- `docs/app/08-quality/README.md` - acceptance Lite và quality gate ở mức product.
- `docs/app/10-decisions/README.md` - quyết định sản phẩm còn hiệu lực.
- `docs/app/05-architecture/README.md` - source of truth cho cách `task_transportor` áp dụng kiến trúc.
- `docs/app/05-architecture/01-structure/README.md` - module structure canonical của repo hiện tại.
- `docs/app/05-architecture/02-boundaries/README.md` - boundary, ownership, read allowlist và AI/Translation boundary của repo hiện tại.
- `docs/app/05-architecture/03-interactions/README.md` - workflow architecture và interaction flow hiện tại.
- `docs/guide/reference/entity-maps/packs/variants/modular-monolith/05-architecture/README.md` - template/taxonomy reusable cho custom modular monolith.
- `docs/theories/modular-architecture/README.md` - theory nền về modular architecture.

## Luồng triển khai hiện tại

Triển khai dự án theo scope Lite hiện tại trong `docs/app/02-product/README.md`, quality gate trong `docs/app/08-quality/README.md` và quyết định còn hiệu lực trong `docs/app/10-decisions/README.md`.

Luồng mặc định:

- Phiên bản: Lite.
- Phase đầu tiên: `00-foundation.md`.
- Không triển khai tính năng Medium/Full nếu user chưa yêu cầu rõ.
- Lite không bắt buộc webhook. Manual pull và project pull là đường Backlog đầu vào chính; scheduled pull là optional sau khi manual/project pull ổn định.
- Translation Lite mặc định dùng `translation_ai_provider = "deepseek"`, `translation_ai_transport = "openai_compatible"`, `translation_ai_model = "deepseek-v4-flash"` và `thinking = disabled`.
- `codex_exec` chỉ là command/process tương thích cũ hoặc fallback local, không phải provider chính mới.

Trước khi code một phase, đọc:

1. `docs/app/00-context/README.md`.
2. `docs/app/01-business/README.md`.
3. `docs/app/02-product/README.md`.
4. `docs/app/08-quality/README.md`.
5. `docs/app/10-decisions/README.md`.
6. `docs/app/05-architecture/README.md`.
7. `docs/app/05-architecture/01-structure/README.md`.
8. `docs/app/05-architecture/02-boundaries/README.md`.
9. `docs/app/05-architecture/03-interactions/README.md`.
10. `docs/guide/reference/entity-maps/packs/variants/modular-monolith/05-architecture/README.md`.
11. `docs/theories/modular-architecture/README.md`.

Nếu task có sửa hoặc thêm code trong `src/modules`, Codex bắt buộc phải đọc lại `docs/app/05-architecture/02-boundaries/README.md` và `docs/app/05-architecture/01-structure/README.md` trong lượt làm việc đó trước khi code.

Khi tài liệu mâu thuẫn, ưu tiên `docs/app/02-product/README.md` cho scope/hành vi Lite, `docs/app/10-decisions/README.md` cho quyết định còn hiệu lực; ưu tiên `docs/app/05-architecture/**` cho cách repo hiện tại áp dụng kiến trúc; ưu tiên `docs/guide/reference/entity-maps/packs/universal/**` cho universal concern và generic taxonomy; ưu tiên `docs/guide/reference/entity-maps/packs/variants/modular-monolith/**` cho template phụ thuộc modular monolith; ưu tiên `docs/theories/modular-architecture/**` cho reasoning theory nền.

## Công nghệ

- Môi trường chạy: Node.js, CommonJS.
- API server: Express.
- Quyết định database MVP: SQLite.
- SQLite library dự kiến: ưu tiên `better-sqlite3` trừ khi user chọn phương án khác.
- Auth admin MVP: JWT đơn giản với email + password.
- Lưu attachment: local disk trong storage path do project quản lý.

## Lệnh

- Cài dependency: `npm install`
- Start server: `npm start`
- Dev server: `npm run dev`
- Verify theo phase: `npm run verify:phaseXX` sau khi phase đó đã được triển khai.
- Verify toàn bộ: `npm test`.

Nếu phần triển khai thêm test, cập nhật `package.json` để có lệnh test thật hoặc mở rộng lệnh verify phase liên quan.

## Luật modular monolith boundary

`docs/theories/modular-architecture` là theory nền cho modular architecture. Template reusable nằm ở `docs/guide/reference/entity-maps/packs/variants/modular-monolith`. Cách repo hiện tại áp dụng pattern này được chốt ở `docs/app/05-architecture`.

Khi đụng code module, Codex bắt buộc đọc và tuân thủ `docs/app/05-architecture/02-boundaries/README.md` cùng `docs/app/05-architecture/01-structure/README.md`. File boundary legacy chỉ còn là migration provenance và không còn là nơi cập nhật luật.

## Luật AI và Translation

Translation là một business task dùng AI, nhưng AI không phải chỉ phục vụ Translation. Vì vậy không dùng config global kiểu `ai_provider` cho project.

Config canonical cho translation:

- `translation_ai_provider`: ví dụ `deepseek`, `codex_exec`.
- `translation_ai_transport`: ví dụ `openai_compatible`, `anthropic_compatible`, `process_exec`.
- `translation_ai_model`: ví dụ `deepseek-v4-flash`, `deepseek-v4-pro`, `deepseek-chat`.

Field legacy `translation_provider` và `translation_model` chỉ là mirror/backward compatibility trong giai đoạn migration. Code/UI mới phải dùng `translation_ai_*`.

Model DeepSeek hiện hỗ trợ trong UI:

- `deepseek-v4-flash`
- `deepseek-v4-pro`
- `deepseek-chat` kèm warning `deprecated soon`

Default:

- `translation_ai_provider = "deepseek"`
- `translation_ai_transport = "openai_compatible"`
- `translation_ai_model = "deepseek-v4-flash"`
- `thinking = disabled`

Ranh giới AI:

- `src/infrastructure/ai/` chứa client/transport thật sự gọi ra ngoài: `OpenAiCompatibleChatClient`, `AnthropicCompatibleMessagesClient`, `CodexExecClient`, `codexCliAdapter`.
- Module Translation không được tự gọi `fetch`, `child_process`, `spawn`, hoặc tự biết HTTP/process mechanics.
- Module Translation chỉ được dùng adapter nội bộ trung tính như `TranslationAdapter` hoặc `ProcessTranslationAdapter`.
- Không tạo class nội bộ Translation tên `DeepSeekTranslationProvider`, `CodexExecTranslationProvider`, hoặc `OpenAiTranslationProvider`.
- Trong nội bộ Translation, tránh dùng tên `provider` cho contract nghiệp vụ mới. Ưu tiên `adapter`, `generator`, `translationAdapterFor`, `aiProvider` chỉ ở lớp mapping config.
- Prompt, parse output, validation translation draft, review state và audit thuộc module Translation.
- URL, auth header, timeout, request/response protocol OpenAI-compatible/Anthropic-compatible/process exec thuộc `src/infrastructure/ai`.
- `codex_exec` là process transport/legacy command, không phải provider chính của Translation.

Sau khi sửa AI Translation, kiểm tra:

```powershell
rg -n "fetch\(|child_process|spawn\(|spawnSync\(" src\modules\Translation -g "*.js"
rg -n "TranslationProvider|DeepSeekTranslation|CodexExecTranslation|providerFor" src\modules\Translation src\infrastructure\ai -g "*.js"
npm run verify:phase04
```

Hai lệnh `rg` đầu không được có kết quả.

## Luật code

- Giữ thay đổi khớp với `docs/app/02-product/README.md` và `docs/app/10-decisions/README.md`, trừ khi user yêu cầu cập nhật quyết định khác.
- Khi triển khai Lite, ưu tiên khớp với scope trong `docs/app/02-product/README.md` và acceptance trong `docs/app/08-quality/README.md`.
- Mỗi lượt triển khai chỉ nên nằm trong phạm vi của phase hiện tại, trừ khi user yêu cầu mở rộng.
- Ưu tiên module nhỏ, tập trung, tránh rewrite rộng.
- Dùng cấu trúc module và boundary hiện tại của repo trong `docs/app/05-architecture/**`, dựa trên template reusable trong `docs/guide/reference/entity-maps/packs/variants/modular-monolith` và theory nền trong `docs/theories/modular-architecture`.
- Không commit secret. Dùng `.env`, credential store của hệ điều hành hoặc config local đã được ignore cho credential/path riêng máy.
- Không hard-code credential Backlog/Jira, API key AI, Codex auth path, JWT secret hoặc internal server path.
- Dùng `direction_from` và `direction_to` cho sync job, sync journal và mapping direction. Không thay bằng một field `direction` nếu docs chưa được cập nhật có chủ ý.
- Webhook handler phải verify, lưu raw payload, enqueue job và return nhanh. Xử lý nặng thuộc về worker/job code.
- Manual pull và webhook ingest nên dùng chung normalizer khi có thể.
- Sync đầu ra phải hỗ trợ dry-run trước khi ghi Jira thật.

## Luật Admin UI

Khi task liên quan thiết kế, xây mới, sửa hoặc kiểm thử Admin UI, agent bắt buộc:

1. Đọc `docs/app/03-interface/README.md`.
2. Dùng skill `ui-design` để chốt design direction trước khi code; không tự coi Figma là dependency hoặc source of truth.
3. Dùng `playwright` cho acceptance có thể lặp lại; dùng `playwright-interactive` khi cần điều tra trực quan; chỉ dùng `screenshot` khi thật sự cần bằng chứng hình ảnh hoặc inspiration có chọn lọc.
4. Giữ business rule và data access trong Express API/module hiện tại. Admin UI chỉ gọi public API của CIS, không truy cập SQLite trực tiếp và không nhân bản nghiệp vụ backend.
5. Mọi route dữ liệu phải có loading, empty, error và retry phù hợp; form lỗi phải giữ input; thao tác quan trọng phải dùng được bằng bàn phím và có focus rõ.
6. Dùng token và component primitive dùng chung; không hard-code style rời rạc theo từng màn.
7. Không giữ hai UI active, legacy route hoặc fallback sau cutover. Chỉ xóa UI cũ khi acceptance của UI mới đã pass.

## Luật checklist theo phase

Mỗi phase Lite có section `Checklist hoàn thành phase`.

- Chỉ Codex được tick item `Unit test check (Agent)` sau khi lệnh/test tự động liên quan đã pass thật.
- Item `Manual check (Người review)` phải để nguyên chưa tick, trừ khi user xác nhận đã manual pass.
- Nếu một item chưa thể tick, để nguyên chưa tick và nêu lý do trong phản hồi cuối.
- Mỗi phase đã triển khai phải có lệnh verify tương ứng, ví dụ `npm run verify:phase00`.

## Luật tài liệu

- Giữ tài liệu bằng tiếng Việt có dấu trừ khi user yêu cầu khác.
- Khi đọc hoặc sửa tài liệu tiếng Việt bằng PowerShell, đặt console/output UTF-8 và đọc file với `-Encoding UTF8`, ví dụ: `$OutputEncoding = [System.Text.UTF8Encoding]::new(); [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new(); Get-Content -Raw -Encoding UTF8 "path"`.
- Nếu output hiển thị mojibake, phải đọc lại bằng UTF-8 trước khi diễn giải hoặc chỉnh file.
- Khi thay đổi hành vi triển khai, cập nhật file liên quan trong `docs/app`.
- Khi tạo/sửa entity type hoặc tạo entity instance mới, chạy Type Contract Gate: `npm run verify:entity-type-contract -- --type <canonical-entity-type-path>` trước khi sửa/tạo và `npm run verify:entity-type-contract -- --instance <docs/app-instance-readme-path>` sau khi instance tồn tại. Type legacy chưa có instance chỉ là debt; type đang sửa hoặc sắp có instance phải được chuẩn hóa trước.
- Khi materialize canonical relation trong `docs/app`, đọc `docs/app/10-decisions/01-decision-making/01-decisions/DEC-002-app-graph-materialization-policy/README.md`; chỉ materialize relation có trace need, evidence, relation type, valid triple, slot và target instance rõ. Không tự convert prose, tạo dual/inverse edge hoặc dùng `affects` chỉ vì Scope có nhắc target.
- Giữ rõ khác biệt giữa:
  - `webhook_events`: log raw event đầu vào.
  - `sync_jobs`: hàng đợi job nội bộ cho đầu vào/đầu ra.
  - `sync_journal`: audit trail cho kết quả job và thay đổi state.
