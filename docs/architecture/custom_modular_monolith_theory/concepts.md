# Concepts

## Module

Module là boundary nghiệp vụ. Một module sở hữu:

- use case của domain đó;
- state business của domain đó;
- public API để module khác gọi vào.

## Public API

`<Domain>Api` là public boundary của module.

Module khác nên gọi qua đây thay vì import sâu vào `application/`, `infrastructure/` hoặc `support`.

## Owner API

Owner API là public API của module đang sở hữu business state hoặc business capability tương ứng.

Nếu module khác cần đổi state đó, nó phải gọi owner API thay vì write trực tiếp.

## Application database

Application database là database phục vụ một application hoặc một deployable.

Một application database không đồng nghĩa với shared ownership. Nhiều module có thể cùng dùng một DB engine nhưng ownership state vẫn phải rõ ràng.

## Read model và snapshot

- Read model: cấu trúc đọc tối ưu cho reporting hoặc query.
- Snapshot read: đọc bundle dữ liệu hiện tại để build payload, preview hoặc reporting.

Trong pragmatic hybrid, snapshot read có thể được chấp nhận nếu read-only và có allowlist.

## Canonical model

Canonical model là mô hình dữ liệu nội bộ mà hệ thống dùng để vận hành.

Nó giúp tránh map trực tiếp giữa các external system với nhau.

## Boundary tier

- Tier 0: cross-module write, mặc định cấm.
- Tier 1: orchestration read, ưu tiên owner API.
- Tier 2: reporting read-only.
- Tier 3: outbound snapshot read-only.
- Tier 4: presentation composition.
