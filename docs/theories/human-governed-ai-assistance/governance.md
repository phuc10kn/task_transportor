# TH-AI-GOV - Governance

## Boundary contract

- `Owns`: AI draft/propose/analyze role, human final authority, transport-vs-business boundary.
- `Excludes`: provider detail, model naming, prompt payload format, sync gate detail.
- `Depends on`: `TH-CANON`.
- `Typical impact areas`: `01-business`, `02-product`, `05-architecture`, `06-technical`, `09-operation`.

## Reference notes

- Nguồn app-specific chính đến từ workflow translation review, AI boundary trong architecture và Lite workflow docs.
- Theory này được giữ generic để không biến thành tài liệu cho riêng Translation.

## Challenges

- `open`: Có phạm vi nào đủ nhỏ và đủ kiểm soát để cho phép auto-apply mà không phá trách nhiệm con người?
- `open`: Confidence score hiện nên được giải thích như tín hiệu review hay có thể tiến xa hơn?

## Decisions

- `accepted`: Không ghi provider, model, transport cụ thể trong pure theory.
- `accepted`: Human review và owner apply là hai checkpoint tách biệt về nghĩa.

## Boundary drift / split signals

- Theory bắt đầu đầy tên model, transport, request protocol.
- Theory chỉ còn nói về Translation mà không còn dùng được cho AI assistance nói chung.
- Theory bắt đầu hấp thụ sync-safety gate thay vì chỉ nói về governance của AI outcome.
