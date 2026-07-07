# 06 — Technical

## Mục đích

`06-technical/` mô tả các cơ chế kỹ thuật được dùng để hiện thực Architecture.

Layer này trả lời:

- Hệ thống chạy trên nền tảng nào?
- Các thành phần giao tiếp qua interface nào?
- Dữ liệu được lưu trữ bằng cơ chế kỹ thuật nào?
- Các runtime component trao đổi dữ liệu thế nào?
- Security được hiện thực bằng cơ chế gì?
- Work được thực thi thế nào?
- Runtime behavior được cấu hình ra sao?
- Các cơ chế hiệu năng được áp dụng ở đâu?

Technical không mô tả:

- business problem;
- business rule;
- product requirement;
- domain model;
- architecture boundary;
- source code cụ thể.

Technical đứng giữa:

```text
Architecture
    ↓
Technical
    ↓
Implementation
```

Architecture nói:

```text
Cần cơ chế gì.
```

Technical nói:

```text
Dùng technology và technical mechanism nào.
```

Implementation nói:

```text
Code được viết cụ thể thế nào.
```

---

# Cấu trúc

```text
06-technical/
├── README.md
├── platforms/
├── interfaces/
├── persistence/
├── communication/
├── security/
├── execution/
├── configuration/
└── performance/
```

Các folder trên là các technical concern ổn định.

Project tự định nghĩa entity type cụ thể bên trong từng concern.

Ví dụ:

```text
platforms/
├── runtimes/
├── frameworks/
└── databases/
```

hoặc:

```text
platforms/
├── llm-providers/
├── workflow-engines/
└── vector-stores/
```

Không bắt buộc mọi project phải có cùng entity type.

---

# 1. Platforms

## Mục đích

Mô tả các technology platform chính được hệ thống sử dụng.

Trả lời:

- Hệ thống chạy trên runtime nào?
- Framework chính là gì?
- Sử dụng database engine nào?
- Sử dụng cloud service hoặc external platform nào?
- Có AI model hoặc workflow engine nào không?

Có thể chứa:

```text
runtimes/
frameworks/
databases/
cloud-platforms/
external-platforms/
ai-models/
workflow-engines/
```

Ví dụ:

```text
platforms/
├── runtimes/
│   └── nodejs/
├── frameworks/
│   └── nestjs/
└── databases/
    └── postgresql/
```

Hoặc:

```text
platforms/
├── llm-providers/
│   └── openai/
├── workflow-engines/
│   └── langgraph/
└── vector-stores/
    └── pgvector/
```

## Phạm vi

Platform mô tả:

```text
technology được chọn
+
vai trò kỹ thuật
+
constraint chính
```

Không mô tả chi tiết code sử dụng platform đó.

---

# 2. Interfaces

## Mục đích

Mô tả các technical interface mà hệ thống expose hoặc consume.

Trả lời:

- Hệ thống cung cấp interface nào?
- Hệ thống tiêu thụ interface nào?
- Interface dùng cho người, máy hay hệ thống khác?
- Interface có contract gì?

Có thể chứa:

```text
apis/
cli/
webhooks/
protocols/
file-formats/
sdk-contracts/
event-contracts/
```

Ví dụ:

```text
interfaces/
├── apis/
│   └── public-rest-api/
├── webhooks/
│   └── payment-webhook/
└── file-formats/
    └── import-csv/
```

Interface có thể mô tả:

- direction;
- purpose;
- consumer;
- provider;
- contract;
- versioning;
- compatibility.

Chi tiết implementation của controller, handler hoặc adapter thuộc `07-implementation/`.

---

# 3. Persistence

## Mục đích

Mô tả cách state và dữ liệu được lưu trữ bằng cơ chế kỹ thuật.

Trả lời:

- Dữ liệu được lưu ở đâu?
- Dùng storage model nào?
- Transaction được xử lý thế nào?
- Indexing được tổ chức ra sao?
- Migration và retention được quản lý thế nào?

Có thể chứa:

```text
storage-models/
schemas/
transactions/
indexing/
migrations/
retention/
archiving/
```

Ví dụ:

```text
persistence/
├── schemas/
│   └── application-database/
├── transactions/
│   └── order-transaction/
└── indexing/
    └── search-indexes/
```

## Phân biệt với Architecture Data

Architecture nói:

```text
Ai sở hữu dữ liệu?
Dữ liệu đi qua boundary nào?
Dữ liệu nào là canonical?
```

Technical nói:

```text
Dùng PostgreSQL hay object storage?
Schema được tổ chức thế nào?
Transaction isolation là gì?
Index nào được dùng?
```

Ví dụ:

```text
Architecture:

Order Module owns Order data.
```

Technical:

```text
Order data is stored in PostgreSQL.
```

Implementation:

```text
OrderRepository
orders table
migration file
```

---

# 4. Communication

## Mục đích

Mô tả các cơ chế kỹ thuật dùng để các runtime component giao tiếp.

Trả lời:

- Giao tiếp đồng bộ hay bất đồng bộ?
- Dùng protocol nào?
- Dùng message broker hay direct call?
- Retry, timeout và delivery semantics được xử lý thế nào?

Có thể chứa:

```text
http/
rpc/
events/
queues/
streams/
websocket/
messaging/
```

Ví dụ:

```text
communication/
├── http/
│   └── internal-http/
├── events/
│   └── domain-event-transport/
└── queues/
    └── background-job-queue/
```

## Phân biệt với Architecture Interactions

Architecture nói:

```text
Order Module
    ↓ async
Payment Module
```

Technical nói:

```text
Kafka
Topic: order-created
Delivery: at-least-once
Retry: exponential backoff
```

Implementation nói:

```text
OrderCreatedPublisher
PaymentEventConsumer
```

---

# 5. Security

## Mục đích

Mô tả các cơ chế kỹ thuật dùng để bảo vệ hệ thống.

Trả lời:

- Authentication hoạt động thế nào?
- Authorization được enforce bằng cơ chế gì?
- Secret được quản lý ra sao?
- Dữ liệu được mã hóa thế nào?
- Session và token được xử lý thế nào?

Có thể chứa:

```text
authentication/
authorization/
encryption/
secrets/
sessions/
tokens/
network-security/
```

Ví dụ:

```text
security/
├── authentication/
│   └── oauth2/
├── authorization/
│   └── role-based-access/
└── secrets/
    └── secret-management/
```

Security Technical tập trung vào:

```text
mechanism
protocol
technology
enforcement model
```

Security requirement thuộc Product hoặc Quality.

Security boundary thuộc Architecture.

Security code thuộc Implementation.

---

# 6. Execution

## Mục đích

Mô tả cách work được thực thi trong runtime.

Trả lời:

- Request được xử lý thế nào?
- Background work chạy thế nào?
- Scheduler hoạt động ra sao?
- Pipeline được thực thi thế nào?
- Agent hoặc workflow được orchestration thế nào?

Có thể chứa:

```text
request-processing/
background-jobs/
schedulers/
pipelines/
workflows/
agent-execution/
batch-processing/
```

Ví dụ:

```text
execution/
├── request-processing/
│   └── api-request-lifecycle/
├── background-jobs/
│   └── async-job-processing/
└── schedulers/
    └── scheduled-maintenance/
```

AI system có thể có:

```text
execution/
├── agent-execution/
├── workflow-execution/
└── model-invocation/
```

Execution mô tả cơ chế runtime.

Nó không mô tả business process.

---

# 7. Configuration

## Mục đích

Mô tả cách runtime behavior được cấu hình.

Trả lời:

- Configuration đến từ đâu?
- Environment-specific value được quản lý thế nào?
- Feature flag hoạt động ra sao?
- Secret và configuration có tách biệt không?
- Configuration nào có thể thay đổi khi runtime?

Có thể chứa:

```text
environment-variables/
service-config/
feature-flags/
runtime-config/
secrets-config/
tenant-config/
```

Ví dụ:

```text
configuration/
├── environment-variables/
├── feature-flags/
└── runtime-config/
```

Configuration nên mô tả:

- source;
- scope;
- precedence;
- validation;
- reload behavior;
- security sensitivity.

Chi tiết file config hoặc code đọc config thuộc Implementation.

---

# 8. Performance

## Mục đích

Mô tả các cơ chế kỹ thuật dùng để đáp ứng yêu cầu hiệu năng.

Trả lời:

- Caching được dùng ở đâu?
- Batching được áp dụng thế nào?
- Pagination dùng chiến lược nào?
- Connection pooling được cấu hình ra sao?
- Rate limiting và throttling hoạt động thế nào?

Có thể chứa:

```text
caching/
batching/
pagination/
connection-pooling/
rate-limiting/
compression/
prefetching/
parallelism/
```

Ví dụ:

```text
performance/
├── caching/
│   └── application-cache/
├── batching/
│   └── bulk-processing/
└── rate-limiting/
    └── public-api-limit/
```

Performance Technical mô tả:

```text
mechanism
strategy
technology
constraint
```

Performance objective thuộc `08-quality/`.

---

# Quan hệ với các layer khác

## Theory → Technical

Technical entity có thể tham chiếu trực tiếp tới Theory.

Ví dụ:

```yaml
theory_basis:
  - TH-DIST-01
  - TH-SEC-03
```

Luồng:

```text
Theory
   ↓
Technical Rule
   ↓
Implementation
```

Theory cung cấp principle.

Technical áp dụng principle thành technical mechanism.

---

## Architecture → Technical

Architecture là input chính của Technical.

Architecture xác định:

- structure;
- boundary;
- interaction;
- state;
- data;
- deployment;
- cross-cutting concern.

Technical xác định:

- platform;
- protocol;
- storage;
- runtime mechanism;
- configuration;
- technical strategy.

Ví dụ:

```text
Architecture:

Canonical state must be separated
from workflow execution state.
```

Technical:

```text
PostgreSQL
→ canonical state

LangGraph checkpoint store
→ workflow execution state
```

---

## Product → Technical

Một số requirement ảnh hưởng trực tiếp đến Technical.

Ví dụ:

```text
NFR: response time < 500 ms
        ↓
Technical performance strategy
```

Hoặc:

```text
FR: external system integration
        ↓
Technical interface
```

Technical không định nghĩa lại requirement.

---

## UI → Technical

UI có thể tạo ra technical requirement như:

- realtime communication;
- offline storage;
- media delivery;
- client caching;
- session mechanism.

Ví dụ:

```text
UI needs realtime notification
        ↓
WebSocket technical design
```

---

## Domain → Technical

Domain có thể ảnh hưởng đến:

- persistence model;
- transaction boundary;
- event serialization;
- concurrency handling.

Ví dụ:

```text
Domain Invariant
        ↓
Transaction Strategy
```

Technical không thay thế Domain Model.

---

## Technical → Implementation

Technical xác định:

```text
Dùng cơ chế gì.
```

Implementation xác định:

```text
Code cơ chế đó thế nào.
```

Ví dụ:

```text
Technical:

REST API
JWT authentication
PostgreSQL
Redis cache
```

Implementation:

```text
AuthController
JwtGuard
UserRepository
RedisCacheAdapter
```

---

## Technical → Quality

Technical design có thể tạo ra quality concern.

Ví dụ:

```text
Queue
    ↓
reliability testing

Cache
    ↓
consistency testing

External API
    ↓
resilience testing
```

Quality kiểm tra Technical có đáp ứng yêu cầu hay không.

---

## Technical → Operation

Technical cung cấp thông tin cho Operation về:

- runtime dependencies;
- configuration;
- storage;
- communication;
- security;
- performance mechanism.

Ví dụ:

```text
Technical:

PostgreSQL replication
```

Operation:

```text
monitor replication lag
restore procedure
failover runbook
```

---

# Mô hình tổ chức entity

Mỗi concern có thể chứa một hoặc nhiều entity type.

```text
Concern
    ↓
Entity Type
    ↓
Entity Instance
```

Ví dụ:

```text
06-technical/
└── interfaces/
    └── apis/
        └── API-001-public-api/
            └── README.md
```

Hoặc:

```text
06-technical/
└── persistence/
    └── data-stores/
        └── STORE-001-primary-database/
            └── README.md
```

Hoặc:

```text
06-technical/
└── execution/
    └── agent-execution/
        └── EXEC-001-research-workflow/
            └── README.md
```

Không bắt buộc mọi project phải có cùng entity type.

---

# Quan hệ giữa các concern

Các concern không tạo thành pipeline cố định.

Quan hệ phổ biến:

```text
Platforms
    ↓
Interfaces
```

```text
Platforms
    ↓
Persistence
```

```text
Interfaces
    ↓
Communication
```

```text
Execution
    ↓
Communication
```

```text
Execution
    ↓
Persistence
```

```text
Configuration
    ↓
All Technical Concerns
```

```text
Security
    ↓
All Technical Concerns
```

```text
Performance
    ↓
Interfaces
    ↓
Communication
    ↓
Persistence
    ↓
Execution
```

Mô hình tổng quát:

```text
                     Platforms
                 ┌──────┼──────┐
                 ▼      ▼      ▼
            Interfaces Persistence Execution
                 │      │      │
                 └──────┼──────┘
                        ▼
                  Communication

        Security / Configuration / Performance
                        │
                        ▼
              All Technical Concerns
```

---

# Nguyên tắc

## Technical mô tả cơ chế kỹ thuật

Không mô tả business logic.

---

## Không ép entity type cố định

Project tự định nghĩa:

```text
api
queue
database
agent-runtime
workflow-engine
file-format
cache
```

theo hệ thống thực tế.

---

## Concern là khung ổn định

Các concern chuẩn:

```text
platforms
interfaces
persistence
communication
security
execution
configuration
performance
```

---

## Technical entity có thể dùng Theory

Không copy Theory vào Technical.

Dùng:

```text
Theory ID
+
Project Context
+
Technical Rule
```

---

## Technical không định nghĩa lại Architecture

Architecture nói:

```text
Module A communicates asynchronously with Module B.
```

Technical nói:

```text
Communication uses Kafka.
```

Technical không tự thay đổi boundary.

---

## Technical không chứa chi tiết source code

Technical nói:

```text
JWT authentication
```

Implementation nói:

```text
JwtGuard
TokenService
AuthMiddleware
```

---

## Technical phải truy ngược được Architecture

Một technical entity nên có thể trả lời:

```text
Nó hiện thực architecture concern nào?
```

Ví dụ:

```yaml
implements_architecture:
  - ARCH-INT-003
```

---

## Technical có thể bị kiểm tra bởi Quality

Một technical mechanism nên có thể liên kết đến:

```text
quality objective
test strategy
risk
```

Ví dụ:

```text
CACHE-001
    ↓ tested_by
PERF-TEST-003
```

---

# Tóm tắt

```text
06-technical/
├── platforms/
│   → hệ thống dùng technology và platform nào
│
├── interfaces/
│   → hệ thống expose và consume interface nào
│
├── persistence/
│   → dữ liệu được lưu bằng cơ chế kỹ thuật nào
│
├── communication/
│   → runtime component giao tiếp thế nào
│
├── security/
│   → security được hiện thực bằng cơ chế gì
│
├── execution/
│   → work được thực thi thế nào
│
├── configuration/
│   → runtime behavior được cấu hình ra sao
│
└── performance/
    → cơ chế hiệu năng được áp dụng thế nào
```