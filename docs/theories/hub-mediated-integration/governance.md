# TH-HUBFLOW - Governance

## Boundary contract

- `Owns`: hub-mediated integration model, inbound-to-core-first, no-bypass reasoning.
- `Excludes`: module internals, canonical branch semantics, retry policy, payload-specific sync gate.
- `Depends on`: none.
- `Typical impact areas`: `00-context`, `01-business`, `02-product`, `05-architecture`, `10-decisions`.

## Reference notes

- App-specific adoption hiện tại dùng mô hình `System -> CIS -> System`, nhưng theory giữ ở mức generic `System -> Core Hub -> System`.
- Phase 05 đã nhập provenance từ legacy work/architecture/import-theories vào root theory governance và decision layer.

## Challenges

- `open`: Khi số integration tăng, liệu một core hub chung còn là mức trừu tượng phù hợp hay cần nhiều hub có trách nhiệm riêng?
- `open`: Ngoại lệ nào đủ mạnh để cho phép bypass core mà không làm vỡ reasoning chung?

## Decisions

- `accepted`: Giữ tên theory ở mức generic, không khóa nó vào tên `CIS`.
- `accepted`: Không đưa canonical-state semantics và sync-safety gate chi tiết vào theory này.

## Boundary drift / split signals

- Theory bắt đầu đi sâu vào schema canonical hoặc owner state cụ thể.
- Theory bắt đầu hấp thụ retry, journal, stale preview như nội dung lõi.
- README phải dùng tên integration cụ thể để giải thích toàn bộ theory.
