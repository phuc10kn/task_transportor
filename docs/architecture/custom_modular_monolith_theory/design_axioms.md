# Design Axioms

File này chốt các tiên đề thiết kế chung của `custom_modular_monolith_theory`.

## Axiom 1 - System không đi tắt qua nhau

Nếu một sản phẩm dùng canonical store hoặc core domain ở giữa, mọi luồng nên đi qua lõi đó thay vì sync trực tiếp giữa các external system.

Ý nghĩa:

- inbound vào core trước;
- processing nằm trong các domain module;
- outbound đi sau validation hoặc pre-check;
- audit và journal trace được đường đi.

## Axiom 2 - Core model không chỉ là cache

Canonical hoặc core model phải có đời sống vận hành riêng, không chỉ là snapshot tạm.

Nó có thể giữ:

- canonical value;
- revision;
- review state;
- mapping state;
- anomaly state;
- sync state;
- job hoặc journal state.

## Axiom 3 - Shared database không đồng nghĩa shared ownership

Một application database có thể phục vụ nhiều module, nhưng ownership state vẫn thuộc từng module owner.

## Axiom 4 - Write ownership nghiêm hơn read ownership

Cross-module write mặc định phải bị cấm nếu không qua owner API.

Read exception có thể tồn tại khi:

- read-only;
- có allowlist;
- có lý do rõ;
- chưa cần extract service.

## Axiom 5 - Module API là boundary, không phải service locator

`<Domain>Api` đại diện cho capability mà domain đó sở hữu.

Không dùng nó để gom hộ logic của domain khác.

## Axiom 6 - Controller không orchestration chéo domain

Controller nên:

- nhận request;
- validate cơ bản;
- gọi API hoặc use case của module chủ quản route;
- trả response.

Controller không nên tự làm business flow nhiều domain, tự gọi external API rồi tự ghi state.

## Axiom 7 - External adapter không sở hữu business state

External client, transport hoặc repository kỹ thuật chỉ biết protocol bên ngoài. Use case hoặc worker mới quyết định business state transition.

## Axiom 8 - Job và journal là một phần của boundary

Luồng nặng hoặc có side effect external nên có job, journal hoặc audit rõ ràng để retry, trace và recover được.

## Axiom 9 - Dry-run là boundary an toàn cho outbound

Nếu một outbound có rủi ro ghi sang hệ ngoài, dry-run hoặc pre-check nên là cổng an toàn trước khi gọi external API thật.

## Axiom 10 - Giai đoạn đầu có thể cắt scope, không cắt nền móng

Một sản phẩm có thể chưa bật mọi capability, nhưng không nên bỏ:

- module boundary;
- canonical model;
- job hoặc journal;
- dry-run hoặc pre-check nếu outbound rủi ro;
- state model đủ để tiến hóa tiếp.

## Axiom 11 - Evolution không được phá product model lõi

Tách worker, đổi DB, thêm webhook hay extract service không nên làm đổi product model lõi mà hệ thống đang dựa vào.

## Axiom 12 - Capability kỹ thuật và business domain phải tách lớp

Ví dụ với AI:

- transport, auth, timeout, protocol thuộc hạ tầng kỹ thuật;
- prompt, parse output, review state, audit thuộc business domain đang dùng AI.
