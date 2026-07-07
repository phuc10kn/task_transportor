# TH-HUBFLOW - Hub-mediated Integration

## Mục đích

`TH-HUBFLOW` giữ nền suy luận cho mô hình:

```text
System -> Core Hub -> System
```

Theory này giải thích vì sao integration không nên đi trực tiếp giữa các hệ ngoài mà phải đi qua một lõi trung gian sở hữu processing và quyết định vận hành.

## Core positions

- `TH-HUBFLOW-01`: Không bypass core hub bằng sync trực tiếp system-to-system.
- `TH-HUBFLOW-02`: Inbound phải vào core trước khi được xử lý hay phát tán tiếp.
- `TH-HUBFLOW-03`: Core hub không chỉ là pass-through cache.
- `TH-HUBFLOW-04`: Outbound chỉ nên xảy ra sau khi core đã đủ điều kiện nghiệp vụ và vận hành.
- `TH-HUBFLOW-05`: External adapter không sở hữu quyết định cuối cùng của business flow.

## Boundary semantics

- `Owns`: hub-mediated integration model, inbound-to-core-first, no-bypass reasoning.
- `Excludes`: module internals, canonical branch semantics, retry policy, payload-specific sync gate.
- `Depends on`: none.
- `Typical impact areas`: `00-context`, `01-business`, `02-product`, `05-architecture`, `10-decisions`.

## Key tensions

- point-to-point đơn giản ban đầu vs khả năng kiểm soát lâu dài;
- throughput trực tiếp vs khả năng audit và chuẩn hóa;
- tốc độ adapter local vs tính nhất quán toàn hệ.

## Theory này không chứa

- tên hub cụ thể của repo;
- tên integration cụ thể;
- endpoint webhook thật;
- schema queue hay journal thật.

## Ảnh hưởng app

Theory này thường dẫn mạnh ở:

- `app/00-context`
- `app/01-business`
- `app/02-product`
- `app/05-architecture`
- `app/10-decisions`

## Đọc tiếp khi nào

- Đọc `agent.md` khi cần review một flow inbound/outbound có bypass core hay không.
- Đọc `theory.md` khi cần phân biệt hub thực với “cache ở giữa”.
- Đọc `governance.md` khi thấy theory này bắt đầu lẫn với canonical-state hoặc sync-safety reasoning.
