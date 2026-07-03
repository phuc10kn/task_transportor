# Hướng Dẫn Codex Cho Dự Án

## Phạm vi

File này áp dụng cho toàn bộ repository `task_transportor`.

Hướng sản phẩm hiện tại là Central Sync Hub được mô tả trong `docs/work`. Xem các file đó là nguồn sự thật cho mọi việc triển khai mới.

Bỏ qua thư mục cũ `backlog2jira` trong công việc Codex thông thường. Không đọc, tìm kiếm, sửa hoặc dùng thư mục này làm nguồn thiết kế, trừ khi user yêu cầu rõ việc migration, so sánh hoặc cleanup liên quan đến `backlog2jira`.

## Mô hình sản phẩm

Dùng mô hình **System -> CIS -> System**:

- Đầu vào: Backlog/Jira gửi webhook hoặc Admin UI kích hoạt manual pull vào CIS.
- Xử lý: CIS lưu raw event, normalize payload, dịch, review, học mapping, phát hiện anomaly và ghi audit.
- Đầu ra: CIS đẩy dữ liệu đã được duyệt sang hệ thống đích. MVP ưu tiên `Backlog -> CIS`, `Jira -> CIS` và `CIS -> Jira`.

Tài liệu chính:

- `docs/work/README.md` - tổng quan và thứ tự đọc.
- `docs/work/plans/lite/README.md` - phạm vi và thứ tự đọc của bản Lite.
- `docs/work/plans/lite/implement_context.md` - context chọn lọc để bắt đầu implement Lite.
- `docs/work/plans/lite/implement_plans/README.md` - phase triển khai Lite, chốt chặn và checklist.
- `docs/work/plans/architecture/README.md` - ngôn ngữ kiến trúc dùng chung cho Lite, Medium và Full.
- `docs/work/plans/architecture/02-module-structure.md` - cấu trúc module.
- `docs/work/plans/architecture/module-boundary-rules.md` - luật bắt buộc về modular monolith boundary.
- `docs/work/fix_module_boundary/overview.md` - báo cáo boundary và các quyết định sửa gần nhất.
- `docs/work/implement-interview.md` - quyết định implement đã trao đổi với user.
- `docs/work/01-architecture.md` - nguyên tắc kiến trúc.
- `docs/work/02-central-issue-store.md` - schema CIS.
- `docs/work/03-backlog-ingestion.md` - Backlog inbound.
- `docs/work/04-jira-ingestion.md` - Jira inbound và CIS outbound sang Jira.
- `docs/work/06-sync-engine.md` - xử lý job, retry và audit.

## Luồng triển khai hiện tại

Triển khai dự án theo từng phase trong `docs/work/plans/lite/implement_plans`.

Luồng mặc định:

- Phiên bản: Lite.
- Phase đầu tiên: `00-foundation.md`.
- Không triển khai tính năng Medium/Full nếu user chưa yêu cầu rõ.
- Lite không bắt buộc webhook. Manual pull và project pull là đường Backlog đầu vào chính; scheduled pull là optional sau khi manual/project pull ổn định.
- Translation Lite mặc định dùng `translation_ai_provider = "deepseek"`, `translation_ai_transport = "openai_compatible"`, `translation_ai_model = "deepseek-v4-flash"` và `thinking = disabled`.
- `codex_exec` chỉ là command/process tương thích cũ hoặc fallback local, không phải provider chính mới.

Trước khi code một phase, đọc:

1. `docs/work/plans/lite/implement_context.md`.
2. `docs/work/plans/architecture/README.md`.
3. `docs/work/plans/architecture/02-module-structure.md`.
4. `docs/work/plans/architecture/module-boundary-rules.md`.
5. `docs/work/plans/lite/implement_plans/README.md`.
6. File phase đang làm, ví dụ `docs/work/plans/lite/implement_plans/00-foundation.md`.

Nếu task có sửa hoặc thêm code trong `src/modules`, Codex bắt buộc phải đọc lại `docs/work/plans/architecture/module-boundary-rules.md` trong lượt làm việc đó trước khi code.

Khi tài liệu mâu thuẫn, ưu tiên plan Lite mới trong `docs/work/plans/lite`, sau đó đến architecture guide dùng chung, sau đó `docs/work/implement-interview.md`, cuối cùng là spec nền cũ hơn.

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

`docs/work/plans/architecture/module-boundary-rules.md` là luật nguồn cho modular monolith boundary. Codex bắt buộc đọc và tuân thủ file đó khi đụng code module.

Tóm tắt không thay thế file luật:

- Module khác chỉ được gọi qua public boundary `<Domain>Api.js`.
- Không import trực tiếp file của module khác trong `application/`, `infrastructure/`, hoặc `support/`.
- Controller không gọi API/use case/repository/adapter của module khác.
- `support/` là private nội bộ module; helper chung thật sự đưa vào `src/shared`.
- Infrastructure của module là private; technical infrastructure dùng chung đưa vào `src/infrastructure`.
- Không copy business rule để né boundary.
- Không kết luận task xong nếu audit boundary còn kết quả.

Audit grep bắt buộc sau khi sửa code trong `src/modules`:

```powershell
rg -n 'require\("\.\./\.\./[A-Za-z]+/(application|infrastructure|support)|require\("\.\./\.\./\.\./modules/[A-Za-z]+/(application|infrastructure|support)' src\modules -g '*.js'
```

Lệnh trên không được có kết quả vi phạm. Nếu có kết quả, phải sửa bằng public API hoặc `src/shared`.

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

- Giữ thay đổi khớp với `docs/work/implement-interview.md`, trừ khi docs Lite/architecture mới hơn đã cập nhật quyết định khác.
- Khi triển khai Lite, ưu tiên khớp với `docs/work/plans/lite/implement_context.md` và file phase đang làm.
- Mỗi lượt triển khai chỉ nên nằm trong phạm vi của phase hiện tại, trừ khi user yêu cầu mở rộng.
- Ưu tiên module nhỏ, tập trung, tránh rewrite rộng.
- Dùng cấu trúc modular monolith trong `docs/work/plans/architecture/02-module-structure.md`.
- Không commit secret. Dùng `.env` hoặc `.codex/config.toml` local cho credential/path riêng máy.
- Không hard-code credential Backlog/Jira, API key AI, Codex auth path, JWT secret hoặc internal server path.
- Dùng `direction_from` và `direction_to` cho sync job, sync journal và mapping direction. Không thay bằng một field `direction` nếu docs chưa được cập nhật có chủ ý.
- Webhook handler phải verify, lưu raw payload, enqueue job và return nhanh. Xử lý nặng thuộc về worker/job code.
- Manual pull và webhook ingest nên dùng chung normalizer khi có thể.
- Sync đầu ra phải hỗ trợ dry-run trước khi ghi Jira thật.

## Luật checklist theo phase

Mỗi phase Lite có section `Checklist hoàn thành phase`.

- Chỉ Codex được tick item `Unit test check (Agent)` sau khi lệnh/test tự động liên quan đã pass thật.
- Item `Manual check (Người review)` phải để nguyên chưa tick, trừ khi user xác nhận đã manual pass.
- Nếu một item chưa thể tick, để nguyên chưa tick và nêu lý do trong phản hồi cuối.
- Mỗi phase đã triển khai phải có lệnh verify tương ứng, ví dụ `npm run verify:phase00`.

## Luật tài liệu

- Giữ tài liệu bằng tiếng Việt có dấu trừ khi user yêu cầu khác.
- Khi thay đổi hành vi triển khai, cập nhật file liên quan trong `docs/work`.
- Giữ rõ khác biệt giữa:
  - `webhook_events`: log raw event đầu vào.
  - `sync_jobs`: hàng đợi job nội bộ cho đầu vào/đầu ra.
  - `sync_journal`: audit trail cho kết quả job và thay đổi state.
