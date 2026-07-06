# Boundary Model

Boundary trong custom modular monolith có nhiều lớp:

1. Import boundary.
2. Controller ownership.
3. Public API ownership.
4. Data write ownership.
5. Data access tiers.
6. Transaction boundary.
7. Error and retry boundary.

## Import boundary

Module khác chỉ gọi qua public API:

```js
const OtherDomainApi = require("../../OtherDomain/OtherDomainApi");
```

Không import sâu:

```js
require("../../OtherDomain/application/doThing");
require("../../OtherDomain/infrastructure/OtherRepository");
```

## Controller ownership

Controller chỉ gọi API hoặc use case của module chủ quản route.

Nếu giữ route cũ vì compatibility, wrapper phải mỏng và không chứa business logic mới.

## Public API ownership

`<Domain>Api` chỉ expose capability mà domain đó sở hữu.

Không dùng module A làm facade để proxy logic thuộc module B.

## Data write ownership

Cross-module write là lỗi nghiêm trọng hơn cross-module read.

Nếu module A cần đổi state của module B:

- gọi public API của B;
- hoặc thêm capability public mới trên B.

Không write trực tiếp bảng hoặc aggregate owner của module khác.

## Data access tiers

```text
Tier 0 - Cross-module write
Tier 1 - Orchestration read
Tier 2 - Reporting read-only
Tier 3 - Outbound snapshot read-only
Tier 4 - Presentation composition
```

Repo cụ thể phải tự document allowlist thật của từng tier.

## Transaction boundary

Mỗi action ghi quan trọng nên có khung:

```text
load or lock
run use case
write owner state
write journal or audit
commit
```

## Error and retry boundary

External adapter nên trả structured result.

Use case hoặc worker mới là nơi quyết định:

- retry;
- fail;
- backoff;
- journal hoặc audit.
