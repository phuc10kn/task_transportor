# TH-MODULAR - Modular Architecture

## Mục đích

`TH-MODULAR` giữ nền suy luận cho cách project hiểu `module`, `boundary`, `ownership` và `public surface` trong một custom modular monolith.

Theory này trả lời:

- module là boundary nghiệp vụ hay chỉ là cách chia folder;
- khi nào shared infrastructure được chấp nhận;
- vì sao cross-module write phải bị kiểm soát mạnh hơn cross-module read;
- vì sao chưa cần tách microservice nếu boundary nội bộ vẫn đang làm việc tốt.

## Core positions

- `TH-MOD-01`: Behavioral ownership quan trọng hơn hình dạng source tree.
- `TH-MOD-02`: Boundary module quan trọng hơn việc mọi module phải giống hệt nhau.
- `TH-MOD-03`: Ưu tiên deep module thay vì public surface quá rộng.
- `TH-MOD-04`: Implementation nội bộ phải bị ẩn sau owner API.
- `TH-MOD-05`: Shared infrastructure chỉ hợp lệ khi không sở hữu business policy.
- `TH-MOD-06`: Data ownership là ownership theo hành vi ghi và quyết định, không chỉ theo nơi lưu dữ liệu.

## Boundary semantics

- `Owns`: module boundary, public surface, ownership discipline, deep-module reasoning.
- `Excludes`: hub flow, canonical truth model, dry-run gate, retry/journal policy.
- `Depends on`: none.
- `Typical impact areas`: `05-architecture`, `07-implementation`, một phần `06-technical`, `08-quality`.

## Key tensions

- đơn giản cấu trúc vs bảo toàn boundary;
- shared runtime vs owner autonomy;
- delivery nhanh vs giữ được khả năng tiến hóa sau này.

## Theory này không chứa

- source tree cụ thể của repo;
- endpoint hay route cụ thể;
- schema bảng thật;
- workflow sync cụ thể theo từng hệ ngoài.

## Ảnh hưởng app

Theory này thường được áp dụng mạnh nhất ở:

- `app/05-architecture`
- `app/06-technical`
- `app/07-implementation`
- `app/08-quality`
- `app/10-decisions`

## Đọc tiếp khi nào

- Đọc `agent.md` khi review boundary, owner API, cross-module dependency.
- Đọc `theory.md` khi cần lý giải sâu trade-off, anti-pattern hoặc evolution trigger.
- Đọc `governance.md` khi cần challenge boundary hiện tại hoặc xem dấu hiệu phải split theory.
