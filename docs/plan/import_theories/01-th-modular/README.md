# Phase 01 - TH-MODULAR

## Mục tiêu

Materialize đầy đủ theory `TH-MODULAR` để toàn bộ kiến trúc app có nền reasoning rõ ràng.

Đây là phase phải làm đầu tiên vì:

- `05-architecture` đã có nhiều `theory_basis` kiểu `TH-MOD-*`;
- `custom_modular_monolith_theory` là nguồn generic đầy đủ nhất;
- `07-implementation` và một phần `06-technical` cũng phụ thuộc trực tiếp vào nó.

## Inputs bắt buộc

- `docs/architecture/custom_modular_monolith_theory/*`
- `docs/architecture/01-direction.md`
- `docs/architecture/02-module-structure.md`
- `docs/architecture/04-boundaries.md`
- `docs_native_theory_app/all.md`
- `docs/explain/missing_theories.md`

## Làm trong phase này

- Tạo folder:
  - `docs_native_theory_app/theories/modular-architecture/`
- Viết `README.md` cho `TH-MODULAR`.
- Viết `agent.md` nén rule cho AI/agent.
- Viết `theory.md` full reasoning.
- Viết `governance.md` skeleton cho reference/challenge/decision.
- Map boundary semantics của `TH-MODULAR` theo root governance:
  - `Owns`
  - `Excludes`
  - `Depends on`
  - `Typical impact areas`
- Chốt và ghi rõ các position:
  - `TH-MOD-01`
  - `TH-MOD-02`
  - `TH-MOD-03`
  - `TH-MOD-04`
  - `TH-MOD-05`
  - `TH-MOD-06`
- Tách phần nào của `design_axioms.md`, `concepts.md`, `boundary_model.md`, `data_ownership.md`, `evolution.md`, `tradeoffs_and_antipatterns.md` được hấp thụ vào theory này.
- Ghi rõ các anti-pattern cốt lõi trong `agent.md`.

## Deliverables

- `docs_native_theory_app/theories/modular-architecture/README.md`
- `docs_native_theory_app/theories/modular-architecture/agent.md`
- `docs_native_theory_app/theories/modular-architecture/theory.md`
- `docs_native_theory_app/theories/modular-architecture/governance.md`

## Nội dung bắt buộc phải có

### `README.md`

- ID `TH-MODULAR`
- purpose
- 6 core positions
- `Owns / Excludes / Depends on / Typical impact areas`
- key tensions
- boundaries của theory
- influenced app areas
- khi nào đọc `agent.md`, `theory.md`, `governance.md`

### `agent.md`

- short rules
- common violations
- review checklist
- read-more triggers

### `theory.md`

- question
- position
- principles
- reasoning
- boundaries
- tensions
- evolution
- open questions

### `governance.md`

- section cho reference notes
- section cho challenges
- section cho decisions
- section cho boundary drift / split signals

## Không làm trong phase này

- Không backfill rộng toàn bộ `app/*`.
- Không sửa source layout docs implementation.
- Không tạo theory khác ngoài `TH-MODULAR`.

## Chốt chặn

Phase này đạt khi:

- `TH-MODULAR` có đủ 4 file;
- 6 position `TH-MOD-01..06` được chốt rõ;
- boundary semantics đã được encode rõ theo root governance;
- `README.md` và `agent.md` đủ ngắn để agent dùng thực tế;
- `theory.md` đủ sâu để không phải nhồi reasoning vào app docs nữa.

Không qua phase 02 nếu:

- `TH-MODULAR` còn lẫn source tree hoặc endpoint cụ thể;
- position còn trùng ý hoặc mâu thuẫn nhau;
- `agent.md` vẫn giống bản chép lại của `theory.md`;
- boundary semantics chưa được encode rõ theo root governance;
- chưa chốt rõ cái gì thuộc `TH-MODULAR` và cái gì phải sang theory khác.

## Rủi ro chính

- Bị hút quá nhiều nội dung app-specific vào theory modular.
- Tạo `TH-MOD-*` mới khác với draft đã có trong `all.md`.
- Để `job/journal`, `dry-run`, `canonical hub` lẫn vào modular theory.

## Checklist hoàn thành phase

- [ ] Folder `modular-architecture/` đã tồn tại.
- [ ] Có đủ 4 file theory chuẩn.
- [ ] `TH-MOD-01..06` đã được chốt rõ.
- [ ] `agent.md` có anti-pattern và review checklist rõ.
- [ ] `theory.md` có tensions và evolution.
- [ ] `README.md` hoặc `governance.md` đã encode rõ `Owns / Excludes / Depends on / Typical impact areas`.
- [ ] `governance.md` có skeleton usable cho future evolution.
