# TH-MODULAR - Governance

## Boundary contract

- `Owns`: module boundary, public surface, ownership discipline, deep-module reasoning.
- `Excludes`: hub-mediated flow, canonical truth, outbound sync gate, retry and journal policy.
- `Depends on`: none.
- `Typical impact areas`: `05-architecture`, `07-implementation`, một phần `06-technical`, `08-quality`.

## Reference notes

- Phase 05 đã đối chiếu legacy `custom_modular_monolith_theory` và giữ pure modular reasoning trong theory này.
- App-specific architecture, source path, route, schema và runtime rule không nằm trong theory này.
- App-specific adoption hiện tại nằm ở `docs/app/05-architecture`; template reusable nằm ở `docs/app_technical/custom_modular_monolith`.

## Challenges

- `open`: Khi một shared technical unit bắt đầu hấp thụ policy, có cần tách nó thành owner module riêng không?
- `open`: Read allowlist hiện tại ở monolith có còn giữ được boundary khi số lượng cross-module query tăng?

## Decisions

- `accepted`: Giữ `TH-MOD-01..06` làm bộ position nền cho architecture reasoning của repo.
- `accepted`: Không đưa job/journal, dry-run, canonical-state semantics vào theory này.

## Boundary drift / split signals

- Theory bắt đầu phải giải thích quá sâu về hub model hoặc canonical branch.
- Theory bắt đầu chứa quá nhiều rule vận hành như retry, stale preview, outbound safety.
- Agent review cần nhắc đi nhắc lại “phần này thực ra không thuộc modular architecture”.
