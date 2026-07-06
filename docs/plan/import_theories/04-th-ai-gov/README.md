# Phase 04 - TH-AI-GOV

## Mục tiêu

Materialize theory về vai trò đúng của AI trong app: AI hỗ trợ ra quyết định, không tự trở thành người quyết định vận hành cuối cùng.

Phase này phải gom reasoning hiện đang phân tán giữa:

- Translation docs
- AI boundary docs
- Lite workflow docs
- review/approval logic trong business flow

## Inputs bắt buộc

- `docs/work/01-architecture.md`
- `docs/work/plans/README.md`
- `docs/architecture/04-boundaries.md`
- `docs/architecture/workflows/translation-review.md`
- `docs/work/plans/lite/workflow/translationContextAgent.md`
- `docs/work/plans/lite/workflow/translationStandardInput.md`
- `docs/business/workflows/translation-review.md`
- `docs/explain/missing_theories.md`

## Làm trong phase này

- Tạo folder:
  - `docs_native_theory_app/theories/human-governed-ai-assistance/`
- Viết 4 file theory chuẩn.
- Map boundary semantics của `TH-AI-GOV` theo root governance:
  - `Owns`
  - `Excludes`
  - `Depends on`
  - `Typical impact areas`
- Chốt các position chính:
  - AI propose, human decide;
  - AI transport và business review phải tách lớp;
  - provider/model không được thành business contract;
  - reviewed result mới có quyền đi vào operational state;
  - low confidence dẫn tới review priority, không phải auto-commit.
- Ghi rõ boundaries:
  - theory này không nói model cụ thể;
  - không nói provider config cụ thể;
  - không nói class transport cụ thể.
- Ghi rõ tensions:
  - tốc độ tự động vs độ tin cậy;
  - flexibility của provider vs consistency của business contract;
  - AI assistance vs human accountability.

## Deliverables

- `docs_native_theory_app/theories/human-governed-ai-assistance/README.md`
- `docs_native_theory_app/theories/human-governed-ai-assistance/agent.md`
- `docs_native_theory_app/theories/human-governed-ai-assistance/theory.md`
- `docs_native_theory_app/theories/human-governed-ai-assistance/governance.md`
- Boundary contract của `TH-AI-GOV` đã được encode trong theory group.

## Không làm trong phase này

- Không ghi tên model, provider, transport cụ thể vào theory.
- Không biến theory này thành tài liệu Translation-only.
- Không nhét prompt format hoặc request body transport vào theory.

## Chốt chặn

Phase này đạt khi:

- đã tách rõ AI theory khỏi Translation implementation;
- vai trò human review được chốt ở mức theory, không chỉ ở một workflow riêng;
- boundary semantics đã được encode rõ theo root governance;
- `src/infrastructure/ai` và business-level review boundary có theory home rõ.

Không qua phase 05 nếu:

- theory còn gắn cứng với DeepSeek/OpenAI/CodexExec;
- còn nhầm AI transport với AI business capability;
- boundary semantics chưa được encode rõ theo root governance;
- chưa chốt rule reviewed result mới được apply.

## Rủi ro chính

- Lẫn theory AI với config/provider detail.
- Lẫn theory AI với riêng module Translation.
- Bỏ quên human accountability.

## Checklist hoàn thành phase

- [ ] Folder `human-governed-ai-assistance/` đã tồn tại.
- [ ] Có đủ 4 file theory chuẩn.
- [ ] Có rule rõ `AI propose, human decide`.
- [ ] Có boundaries rõ giữa AI business layer và AI transport layer.
- [ ] Đã encode rõ `Owns / Excludes / Depends on / Typical impact areas`.
- [ ] Không có model/provider detail trong pure theory.
