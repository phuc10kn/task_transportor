# 07 — Implementation

## Mục đích

`07-implementation/` mô tả cách Architecture và Technical Design được hiện thực thành source code.

Layer này trả lời:

- Source code được tổ chức thế nào?
- Các phần code giao tiếp với nhau qua contract nào?
- Application behavior được hiện thực theo mô hình nào?
- Code truy cập dữ liệu thế nào?
- Code tích hợp với external dependency ra sao?
- Code và dữ liệu được thay đổi an toàn thế nào?
- Những phần nào được tự động hóa?
- Code phải tuân theo các rule nào?

Implementation đứng giữa:

```text
Technical
    ↓
Implementation
    ↓
Source Code
```

Technical nói:

```text
Dùng cơ chế kỹ thuật nào.
```

Implementation nói:

```text
Cơ chế đó được tổ chức trong source code thế nào.
```

Source Code là hiện thực thực tế.

---

# Cấu trúc

```text
07-implementation/
├── README.md
├── organization/
├── contracts/
├── behavior/
├── data-access/
├── integration/
├── evolution/
├── automation/
└── coding-rules/
```

Các folder trên là các implementation concern ổn định.

Project tự định nghĩa entity type cụ thể bên trong từng concern.

Ví dụ:

```text
behavior/
├── commands/
├── queries/
└── handlers/
```

hoặc:

```text
behavior/
├── services/
└── workflows/
```

hoặc:

```text
behavior/
├── agents/
└── tools/
```

Không bắt buộc mọi project phải có cùng entity type.

---

# 1. Organization

## Mục đích

Mô tả cách source code được tổ chức.

Trả lời:

- Source code được chia thành những phần nào?
- Folder và package được tổ chức ra sao?
- Architectural unit được map vào source thế nào?
- Dependency giữa các phần code được kiểm soát ra sao?
- Public và internal code được phân biệt thế nào?

Có thể chứa:

```text
source-structure/
packages/
modules/
components/
applications/
libraries/
dependency-rules/
public-surfaces/
internal-structure/
```

Ví dụ:

```text
organization/
├── source-structure/
├── modules/
└── dependency-rules/
```

Ví dụ mapping:

```text
Architecture:

Order Module
```

Implementation:

```text
src/modules/orders/
```

Organization không định nghĩa Architecture.

Nó chỉ mô tả cách Architecture được thể hiện trong source code.

---

# 2. Contracts

## Mục đích

Mô tả các contract ở cấp source code.

Trả lời:

- Các phần code phụ thuộc nhau qua interface nào?
- Public surface của một module là gì?
- Input và output được định nghĩa thế nào?
- Contract nào ổn định?
- Contract nào chỉ dùng nội bộ?

Có thể chứa:

```text
interfaces/
ports/
public-apis/
schemas/
events/
messages/
types/
protocols/
```

Ví dụ:

```text
contracts/
├── public-apis/
│   └── order-module-api/
├── events/
│   └── order-created-event/
└── schemas/
    └── order-command-schema/
```

Contract có thể mô tả:

- purpose;
- owner;
- consumer;
- input;
- output;
- compatibility;
- versioning;
- error behavior.

## Phân biệt với Technical Interface

Technical nói:

```text
REST API
Kafka Event
Webhook
```

Implementation nói:

```text
CreateOrderRequest
OrderCreatedEvent
PaymentWebhookPayload
```

---

# 3. Behavior

## Mục đích

Mô tả cách application behavior được tổ chức trong source code.

Trả lời:

- Một use case được thực thi bởi phần code nào?
- Behavior được chia theo command, service, handler hay workflow?
- Business behavior được orchestration thế nào?
- Side effect được thực hiện ở đâu?

Có thể chứa:

```text
commands/
queries/
handlers/
services/
workflows/
use-case-implementations/
agents/
processors/
controllers/
```

Ví dụ CQRS:

```text
behavior/
├── commands/
├── queries/
└── handlers/
```

Ví dụ application service:

```text
behavior/
└── services/
```

Ví dụ AI system:

```text
behavior/
├── agents/
├── workflows/
└── tools/
```

Behavior concern không bắt buộc project phải dùng một paradigm cụ thể.

## Phân biệt với Business Process

Business Process mô tả:

```text
Nghiệp vụ diễn ra thế nào.
```

Implementation Behavior mô tả:

```text
Source code thực thi behavior đó thế nào.
```

---

# 4. Data Access

## Mục đích

Mô tả cách source code đọc, ghi và biến đổi dữ liệu.

Trả lời:

- Code truy cập persistence qua abstraction nào?
- Query được tổ chức ở đâu?
- Mapping giữa domain và storage được xử lý thế nào?
- Transaction được mở và quản lý ở đâu?

Có thể chứa:

```text
repositories/
queries/
mappers/
orm-models/
data-gateways/
transaction-boundaries/
projections/
```

Ví dụ:

```text
data-access/
├── repositories/
│   └── order-repository/
├── mappers/
│   └── order-mapper/
└── queries/
    └── order-search-query/
```

Một project không dùng Repository Pattern thì không cần:

```text
repositories/
```

Data Access phải phản ánh implementation thực tế.

## Phân biệt với Technical Persistence

Technical nói:

```text
PostgreSQL
Transaction isolation
Index strategy
```

Implementation nói:

```text
OrderRepository
OrderMapper
SQL Query
ORM Model
```

---

# 5. Integration

## Mục đích

Mô tả cách source code tích hợp với external system hoặc external dependency.

Trả lời:

- External service được gọi qua lớp nào?
- Dependency bên ngoài được che giấu thế nào?
- Mapping giữa external model và internal model nằm ở đâu?
- Failure từ dependency bên ngoài được xử lý thế nào?

Có thể chứa:

```text
clients/
adapters/
gateways/
connectors/
providers/
webhook-handlers/
external-mappers/
```

Ví dụ:

```text
integration/
├── clients/
│   └── payment-api-client/
├── adapters/
│   └── object-storage-adapter/
└── webhook-handlers/
    └── payment-webhook-handler/
```

Integration nên giữ boundary rõ giữa:

```text
internal model
```

và:

```text
external model
```

---

# 6. Evolution

## Mục đích

Mô tả cách source code, data và contract thay đổi an toàn theo thời gian.

Trả lời:

- Database thay đổi thế nào?
- Data cũ được backfill ra sao?
- Contract thay đổi có giữ compatibility không?
- Feature cũ bị deprecate thế nào?
- Version được chuyển đổi ra sao?

Có thể chứa:

```text
migrations/
backfills/
compatibility/
deprecation/
versioning/
upgrade-paths/
data-transforms/
```

Ví dụ:

```text
evolution/
├── migrations/
├── backfills/
└── compatibility/
```

Evolution có thể liên quan đến:

- database;
- event contract;
- public API;
- configuration;
- file format;
- cached data;
- search index.

## Phân biệt với Operation

Implementation Evolution nói:

```text
Thay đổi được implement thế nào.
```

Operation nói:

```text
Thay đổi được rollout trong môi trường chạy thế nào.
```

---

# 7. Automation

## Mục đích

Mô tả các cơ chế tự động hóa liên quan trực tiếp đến implementation.

Trả lời:

- Code nào được generate?
- Build được tự động hóa thế nào?
- Lint và format được chạy ra sao?
- AI Agent được phép sửa code thế nào?
- Script nội bộ được tổ chức ở đâu?

Có thể chứa:

```text
code-generation/
build/
linting/
formatting/
scripts/
ai-coding/
scaffolding/
```

Ví dụ:

```text
automation/
├── code-generation/
├── build/
└── ai-coding/
```

Automation có thể mô tả:

- input;
- output;
- trigger;
- ownership;
- allowed scope;
- validation;
- rollback.

Đối với AI coding, có thể định nghĩa:

```text
AI được phép đọc gì?
AI được phép sửa gì?
AI phải verify gì?
Khi nào cần human review?
```

---

# 8. Coding Rules

## Mục đích

Mô tả các rule source code phải tuân thủ.

Trả lời:

- Naming rule là gì?
- Error được xử lý thế nào?
- Logging được thực hiện ra sao?
- Dependency nào bị cấm?
- Public API được thiết kế thế nào?
- Code review dựa trên rule nào?

Có thể chứa:

```text
naming/
error-handling/
logging/
dependency-rules/
public-api-rules/
testing-conventions/
concurrency-rules/
security-coding-rules/
```

Ví dụ:

```text
coding-rules/
├── naming/
├── error-handling/
├── logging/
└── dependency-rules/
```

Coding Rule nên là rule có thể:

- đọc được bởi người;
- kiểm tra được bởi Agent;
- enforce được bởi tooling khi có thể.

Ví dụ:

```text
Internal module code
MUST NOT
be imported directly by another module.
```

---

# Quan hệ với các layer khác

## Theory → Implementation

Implementation entity có thể tham chiếu trực tiếp tới Theory.

Ví dụ:

```yaml
theory_basis:
  - TH-MOD-03
  - TH-INFO-01
```

Luồng:

```text
Theory
   ↓
Implementation Rule
   ↓
Source Code
```

Ví dụ:

```text
Theory:

Internal complexity should be hidden.
```

Implementation:

```text
Only module public API may be imported externally.
```

Source Code:

```text
src/modules/orders/public/
```

---

## Architecture → Implementation

Architecture xác định:

- unit;
- boundary;
- ownership;
- dependency;
- interaction.

Implementation ánh xạ các khái niệm đó vào source code.

Ví dụ:

```text
Architecture:

Order Module
```

Implementation:

```text
src/modules/orders/
```

Architecture:

```text
Other modules may only use Order public surface.
```

Implementation:

```text
src/modules/orders/index.ts
```

---

## Technical → Implementation

Technical là input trực tiếp nhất của Implementation.

Ví dụ:

```text
Technical:

PostgreSQL
```

Implementation:

```text
OrderRepository
SQL migration
query implementation
```

Ví dụ:

```text
Technical:

Kafka event transport
```

Implementation:

```text
OrderCreatedPublisher
PaymentConsumer
```

---

## Product → Implementation

Một implementation entity có thể trace trực tiếp đến Product entity.

Ví dụ:

```text
UC-001
    ↓ implemented_by
CMD-001
```

Hoặc:

```text
FR-015
    ↓ implemented_by
HANDLER-004
```

Không bắt buộc mọi implementation entity phải nối trực tiếp đến Product.

Có thể đi qua Architecture hoặc Technical.

---

## Domain → Implementation

Domain có thể được hiện thực bởi:

- domain entity;
- value object;
- invariant enforcement;
- domain service;
- domain event.

Ví dụ:

```text
Domain Invariant
    ↓ implemented_by
Validation Logic
```

Implementation không được tự thay đổi meaning của Domain.

---

## Implementation → Quality

Implementation là đối tượng được Quality kiểm tra.

Ví dụ:

```text
Handler
    ↓ verified_by
Integration Test
```

```text
Coding Rule
    ↓ checked_by
Static Analysis
```

```text
Module Boundary
    ↓ verified_by
Architecture Test
```

---

## Implementation → Operation

Implementation tạo ra các artifact được vận hành.

Ví dụ:

```text
Application Binary
Container Image
Migration
Background Worker
Scheduled Job
```

Operation mô tả cách chúng được:

- deploy;
- monitor;
- rollback;
- recover;
- maintain.

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
07-implementation/
└── behavior/
    └── commands/
        └── CMD-001-create-order/
            └── README.md
```

Hoặc:

```text
07-implementation/
└── integration/
    └── adapters/
        └── ADP-001-payment-provider/
            └── README.md
```

Hoặc:

```text
07-implementation/
└── coding-rules/
    └── dependency-rules/
        └── RULE-001-module-imports/
            └── README.md
```

Không bắt buộc mọi project phải có cùng entity type.

---

# Quan hệ giữa các concern

Các concern không tạo thành pipeline cố định.

Quan hệ phổ biến:

```text
Organization
    ↓
Contracts
```

```text
Organization
    ↓
Behavior
```

```text
Behavior
    ↓
Data Access
```

```text
Behavior
    ↓
Integration
```

```text
Evolution
    ↓
Data Access
```

```text
Coding Rules
    ↓
All Implementation Concerns
```

```text
Automation
    ↓
All Implementation Concerns
```

Mô hình tổng quát:

```text
                    Organization
                 ┌──────┼──────┐
                 ▼      ▼      ▼
             Contracts Behavior Integration
                         │
                         ▼
                     Data Access

                       Evolution
                          │
                          ▼
              Data / Contract Changes

              Automation / Coding Rules
                          │
                          ▼
            All Implementation Concerns
```

---

# Nguyên tắc

## Implementation mô tả cách source code được tổ chức

Không định nghĩa lại Business, Product hoặc Architecture.

---

## Không ép implementation paradigm

Project có thể dùng:

```text
commands
services
handlers
workflows
agents
processors
```

hoặc mô hình khác.

Không bắt mọi project dùng CQRS, Repository Pattern hoặc Clean Architecture.

---

## Concern là khung ổn định

Các concern chuẩn:

```text
organization
contracts
behavior
data-access
integration
evolution
automation
coding-rules
```

---

## Implementation entity có thể dùng Theory

Không copy Theory vào Implementation.

Dùng:

```text
Theory ID
+
Project Context
+
Implementation Rule
```

---

## Implementation phải trace được lên trên

Một implementation entity nên có thể trả lời:

```text
Nó hiện thực cái gì?
```

Có thể trace đến:

```text
Product
Architecture
Technical
Domain
```

Ví dụ:

```yaml
implements:
  - FR-015
  - TECH-API-003
```

---

## Documentation không thay thế source code

Implementation docs mô tả:

- structure;
- contract;
- rule;
- mapping;
- convention.

Source code vẫn là hiện thực thực tế.

Không copy toàn bộ code vào docs.

---

## Không document mọi class

Chỉ tạo implementation entity khi nó có giá trị kiến thức.

Ví dụ nên document:

```text
public contract
important handler
critical adapter
migration strategy
dependency rule
shared implementation mechanism
```

Không cần tạo docs riêng cho mọi:

```text
class
function
private helper
DTO nhỏ
```

---

## Coding Rules phải đủ rõ để Agent kiểm tra

Rule tốt:

```text
Business module MUST NOT import
another module's internal implementation.
```

Rule kém:

```text
Keep modules clean.
```

---

# Tóm tắt

```text
07-implementation/
├── organization/
│   → source code được tổ chức thế nào
│
├── contracts/
│   → các phần code giao tiếp qua contract nào
│
├── behavior/
│   → application behavior được hiện thực thế nào
│
├── data-access/
│   → code đọc và ghi dữ liệu thế nào
│
├── integration/
│   → code tích hợp external dependency thế nào
│
├── evolution/
│   → code, data và contract thay đổi an toàn thế nào
│
├── automation/
│   → implementation được tự động hóa ra sao
│
└── coding-rules/
    → source code phải tuân theo rule nào
```