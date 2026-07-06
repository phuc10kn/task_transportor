# Phase 00 - Theory foundation

## Mục tiêu

Chốt nền cho toàn bộ chương trình import theories trước khi materialize từng theory riêng.

Phase này phải trả lời chắc 7 câu hỏi:

1. App sẽ có những theory active nào?
2. Mỗi theory có slug gì?
3. Mỗi theory dùng ID family nào?
4. Root theory index sẽ hoạt động ra sao?
5. Ranh giới `Pure Theory` và `app-specific application` được chốt thế nào?
6. `custom_modular_monolith_theory` cũ sẽ migrate theo meaning-to-layer thế nào?
7. Boundary giữa các theory group sẽ được document và kiểm soát ở đâu?

## Inputs bắt buộc

- `docs/explain/missing_theories.md`
- `docs/explain/custom_modular_monolith.md`
- `docs_native_theory_app/theories/README.md`
- `docs_native_theory_app/theories/governance.md`
- `docs_native_theory_app/AGENT_SKILLS/reference/theory-file-structure.md`
- `docs_native_theory_app/all.md`

## Làm trong phase này

- Tạo root folder `docs/plan/import_theories/` và phase structure.
- Chốt theory set active cho app:
  - `TH-MODULAR`
  - `TH-HUBFLOW`
  - `TH-CANON`
  - `TH-AI-GOV`
  - `TH-SYNC-SAFE`
  - `TH-OPS-TRACE`
- Chốt slug cho từng theory.
- Chốt naming rule cho folder, file và stable ID family.
- Chốt template chuẩn 4 file cho mọi theory:
  - `README.md`
  - `agent.md`
  - `theory.md`
  - `governance.md`
- Chốt root theory index format trong `docs_native_theory_app/theories/README.md`.
- Chốt `docs_native_theory_app/theories/governance.md` là canonical location cho theory-system governance.
- Chốt quy tắc app layer nào được route về theory nào ở mức cao.
- Chốt `migration policy` cho `docs/architecture/custom_modular_monolith_theory/*`.
- Chốt nội dung bắt buộc của root governance:
  - `Theory Group Boundary`
  - `Theory Boundary Matrix`
  - rule tạo group mới
  - rule split group
  - relation với meta
- Với mỗi theory group, chốt 4 trường:
  - `Owns`
  - `Excludes`
  - `Depends on`
  - `Typical impact areas`
- Dùng root governance đó để phát hiện sớm theory group nào đang quá lớn hoặc bị trộn problem space.

## Deliverables

- Kế hoạch phase đầy đủ trong folder này.
- Quyết định chính thức về theory set active.
- Mapping slug và ID family.
- Root index skeleton plan cho `docs_native_theory_app/theories/README.md`.
- Quyết định chính thức rằng `docs_native_theory_app/theories/governance.md` là root governance canonical.
- Ma trận layer -> theory ở mức cao.
- Acceptance check để xác nhận `Theory Boundary Matrix` bản v1 đã được chốt trong root governance canonical.
- Quy tắc split:
  - theory;
  - app docs;
  - decisions;
  - implementation rule;
  - template/reference.

## Slug và ID family đã chốt

| Theory | Slug | ID family |
| --- | --- | --- |
| Modular Architecture | `modular-architecture` | `TH-MOD-*` |
| Hub-mediated Integration | `hub-mediated-integration` | `TH-HUB-*` |
| Canonical State Governance | `canonical-state-governance` | `TH-CAN-*` |
| Human-governed AI Assistance | `human-governed-ai-assistance` | `TH-AI-*` |
| Safe External Synchronization | `safe-external-synchronization` | `TH-SYNC-*` |
| Recoverable Operations | `recoverable-operations` | `TH-OPS-*` |

## Governance rule cho phase này

Phase 00 không giữ bản sao lâu dài của `Theory Boundary Matrix` hay split rules.

Thay vào đó, phase này chỉ được coi là xong khi:

- root governance canonical đã tồn tại tại `docs_native_theory_app/theories/governance.md`;
- matrix cho 6 theory active đã được chốt ở đó;
- rule split group và rule tạo group mới đã được chốt ở đó;
- các phase sau chỉ tham chiếu lại root governance thay vì tự định nghĩa lại rule nền.

## Chốt chặn

Phase này đạt khi:

- không còn mơ hồ về số lượng theory cần materialize trong wave đầu;
- slug và ID family không còn xung đột;
- đã chốt rõ cái gì không được đưa vào theory;
- đã chốt rõ governance canonical sống ở đâu;
- đã có `Theory Boundary Matrix` bản v1 trong root governance;
- đã có thứ tự phase rõ ràng cho 7 phase tiếp theo.

Không qua phase 01 nếu:

- còn song song hai naming system khác nhau cho cùng một theory;
- chưa chốt root theory index sẽ chứa gì;
- chưa chốt quy tắc `theory_basis` reference;
- chưa chốt ranh giới giữa theory và `app/05`, `app/06`, `app/07`, `app/10`;
- chưa có matrix trong root governance nói rõ theory nào own/exclude/depend cái gì.

## Rủi ro chính

- Bị trộn giữa theory nền và architecture áp dụng của `task_transportor`.
- Tạo theory quá nhiều, quá nhỏ, khó bảo trì.
- Đổi ID/slug giữa chừng khiến traceability hỏng.
- Đẩy coding rule hoặc source layout vào theory.
- Không có boundary matrix nên chỉ phát hiện split sai khi đã viết xong nhiều theory.

## Checklist hoàn thành phase

- [ ] Theory set active đã được chốt bằng văn bản.
- [ ] Slug và ID family cho từng theory đã được chốt.
- [ ] Root theory index format đã được chốt.
- [ ] Root theory governance canonical đã được chốt.
- [ ] Layer map mức cao đã được chốt.
- [ ] `Theory Boundary Matrix` v1 đã được chốt trong `docs_native_theory_app/theories/governance.md`.
- [ ] Migration rule cho `custom_modular_monolith_theory` cũ đã được chốt.
- [ ] Có quyết định rõ về việc giữ `TH-MODULAR` làm theory đầu tiên.
