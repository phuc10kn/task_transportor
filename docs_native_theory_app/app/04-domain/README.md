# 04 — Domain

## Mục đích

`04-domain/` mô tả business meaning cốt lõi và mô hình khái niệm mà hệ thống dùng để hiểu domain.

Layer này trả lời:

- Domain đang nói về những khái niệm nào?
- Những đối tượng nào có identity?
- Những giá trị nào cần được mô hình hóa riêng?
- Aggregate boundary nằm ở đâu?
- Rule nào luôn phải đúng?
- Domain behavior được biểu diễn thế nào?
- Domain event nào có ý nghĩa?
- Lifecycle của domain object diễn ra ra sao?

Domain không mô tả chi tiết:

```text
business problem
product feature
screen
architecture topology
technical mechanism
source code
```

Domain chuyển từ:

```text
Business Meaning
```

sang:

```text
Explicit Domain Model
```

---

# Cấu trúc

`04-domain/` dùng mô hình:

```text
Layer
    ↓
Concern
    ↓
Entity Type
    ↓
Entity Instance
```

Cấu trúc:

```text
04-domain/
├── README.md
├── language/
├── model/
├── rules/
├── behavior/
└── lifecycle/
```

Trong đó:

```text
language
model
rules
behavior
lifecycle
```

là các Concern.

Ví dụ:

```text
04-domain/
└── model/
    └── entities/
        └── ENT-001-order/
            └── README.md
```

Trong đó:

```text
04-domain
= Layer

model
= Concern

entities
= Entity Type

ENT-001-order
= Entity Instance
```

---

# 1. Language

## Mục đích

`language/` quản lý ngôn ngữ chuyên biệt của domain.

Concern này trả lời:

- Domain đang dùng những khái niệm nào?
- Khái niệm này có meaning chính xác gì?
- Có thuật ngữ nào dễ bị nhầm?
- Thuật ngữ nào là canonical trong domain model?

Entity Type phổ biến:

```text
domain-concepts/
domain-terms/
classification-schemes/
```

Ví dụ:

```text
language/
└── domain-concepts/
    └── DC-001-reconciliation/
        └── README.md
```

Một Domain Concept có thể mô tả:

```text
name
definition
meaning
boundaries
examples
non-examples
related business terms
related domain entities
```

Ví dụ:

```text
Reconciliation

Quá trình xác định sự phù hợp hoặc sai lệch
giữa hai tập dữ liệu tài chính có liên quan.
```

Phân biệt:

```text
Context Glossary
→ meaning dùng chung toàn project

Domain Concept
→ meaning chuyên biệt trong domain model
```

---

# 2. Model

## Mục đích

`model/` quản lý những loại object cấu thành domain model.

Concern này trả lời:

- Object nào có identity?
- Value nào được nhận diện bằng thuộc tính?
- Aggregate boundary nằm ở đâu?
- Object nào kiểm soát consistency boundary?

Entity Type phổ biến:

```text
entities/
value-objects/
aggregates/
```

Ví dụ:

```text
model/
├── entities/
│   └── ENT-001-order/
│       └── README.md
│
├── value-objects/
│   └── VO-001-money/
│       └── README.md
│
└── aggregates/
    └── AGG-001-order/
        └── README.md
```

---

## Entity

Entity là domain object có identity ổn định theo thời gian.

Ví dụ:

```text
Order
Customer
Invoice
Transaction
```

Một Entity có thể mô tả:

```text
identity
meaning
properties
allowed behavior
invariants
lifecycle
related entities
```

Phân biệt:

```text
Entity
→ được nhận diện bằng identity

Value Object
→ được nhận diện bằng value
```

---

## Value Object

Value Object là object không cần identity riêng.

Ví dụ:

```text
Money
DateRange
Address
Percentage
```

Một Value Object có thể mô tả:

```text
meaning
attributes
validity rules
equality semantics
operations
```

Value Object thường nên:

```text
immutable
self-validating
meaningful
```

---

## Aggregate

Aggregate là một consistency boundary trong domain.

Một Aggregate có thể mô tả:

```text
aggregate root
members
invariants
allowed external access
transaction boundary
creation rules
lifecycle
```

Ví dụ:

```text
AGG-001 — Order Aggregate
```

Phân biệt:

```text
Entity
= object có identity

Aggregate
= boundary kiểm soát consistency
```

Không phải mọi Entity đều cần là Aggregate Root.

---

# 3. Rules

## Mục đích

`rules/` quản lý những điều phải luôn đúng trong domain.

Concern này trả lời:

- State nào là hợp lệ?
- Điều kiện nào luôn phải được giữ?
- Domain policy nào quyết định behavior?
- Điều gì không bao giờ được phép xảy ra?

Entity Type phổ biến:

```text
invariants/
domain-policies/
```

Ví dụ:

```text
rules/
├── invariants/
│   └── INV-001-order-total-non-negative/
│       └── README.md
│
└── domain-policies/
    └── DPOL-001-credit-approval/
        └── README.md
```

---

## Invariant

Invariant là điều phải luôn đúng trong một scope domain nhất định.

Ví dụ:

```text
Order total must never be negative.
```

Một Invariant có thể mô tả:

```text
statement
scope
affected model
violation meaning
enforcement expectation
related business rules
```

Invariant khác Business Rule ở chỗ:

```text
Business Rule
→ rule của business

Domain Invariant
→ condition mà domain model phải luôn giữ
```

Business Rule có thể được refined thành một hoặc nhiều Domain Invariant.

---

## Domain Policy

Domain Policy là rule quyết định cách domain behavior được lựa chọn.

Ví dụ:

```text
Credit approval depends on
customer risk level and order amount.
```

Một Domain Policy có thể mô tả:

```text
purpose
inputs
decision logic
outputs
applicable conditions
exceptions
related entities
```

Domain Policy không mô tả technical policy.

---

# 4. Behavior

## Mục đích

`behavior/` quản lý những hành vi domain có meaning riêng.

Concern này trả lời:

- Domain object có thể làm gì?
- Behavior nào không thuộc tự nhiên về một Entity cụ thể?
- Domain event nào biểu diễn sự kiện có meaning?

Entity Type phổ biến:

```text
domain-services/
domain-events/
```

Ví dụ:

```text
behavior/
├── domain-services/
│   └── DSVC-001-reconciliation/
│       └── README.md
│
└── domain-events/
    └── DEVT-001-order-confirmed/
        └── README.md
```

---

## Domain Service

Domain Service chứa domain behavior không thuộc tự nhiên về một Entity hoặc Value Object cụ thể.

Một Domain Service có thể mô tả:

```text
purpose
inputs
outputs
business meaning
rules used
affected model
```

Ví dụ:

```text
Reconciliation Service
```

Không dùng Domain Service để chứa mọi business logic.

Ưu tiên behavior ở nơi gần meaning nhất.

---

## Domain Event

Domain Event biểu diễn một sự kiện có ý nghĩa trong domain.

Ví dụ:

```text
OrderConfirmed
PaymentReceived
ReconciliationCompleted
```

Một Domain Event có thể mô tả:

```text
meaning
trigger
source aggregate
payload meaning
consumers
consequences
ordering expectations
```

Phân biệt:

```text
Domain Event
→ business-significant event

Technical Event
→ transport or integration mechanism
```

---

# 5. Lifecycle

## Mục đích

`lifecycle/` quản lý sự tiến hóa trạng thái của domain object.

Concern này trả lời:

- Object được tạo khi nào?
- Nó đi qua những trạng thái nào?
- Transition nào hợp lệ?
- Transition nào bị cấm?
- Điều gì kết thúc lifecycle?

Entity Type phổ biến:

```text
lifecycles/
state-models/
transition-rules/
```

Ví dụ:

```text
lifecycle/
└── lifecycles/
    └── LC-001-order-lifecycle/
        └── README.md
```

Một Lifecycle có thể mô tả:

```text
initial state
states
allowed transitions
transition triggers
terminal states
invalid transitions
related invariants
```

Ví dụ:

```text
Draft
    ↓
Confirmed
    ↓
Fulfilled
    ↓
Completed
```

Lifecycle không phải workflow engine configuration.

---

# Quan hệ giữa các Concern

Các Concern không tạo thành pipeline cứng.

Quan hệ điển hình:

```text
Domain Concept
    ↓ represented_by
Entity / Value Object
```

```text
Aggregate
    ↓ contains
Entity
```

```text
Invariant
    ↓ constrains
Aggregate
```

```text
Domain Policy
    ↓ governs
Domain Behavior
```

```text
Domain Event
    ↓ emitted_by
Aggregate
```

```text
Lifecycle
    ↓ applies_to
Entity / Aggregate
```

Mô hình khái quát:

```text
Language
    ↓
Model

Rules
    ↓
Model + Behavior

Behavior
    ↔
Model

Lifecycle
    ↓
Model
```

Đây là relation knowledge.

Không phải thứ tự triển khai bắt buộc.

---

# Quan hệ với Context

Domain nhận meaning chung từ Context.

Ví dụ:

```text
Glossary Term
    --clarifies-->
Domain Concept
```

```text
Context Constraint
    --constrains-->
Domain Model
```

```text
External System
    --introduces-->
External Domain Concept
```

Domain không copy lại Context.

---

# Quan hệ với Business

Business cung cấp:

```text
process
rule
policy
business concept
```

Domain refinement các input đó thành model rõ ràng hơn.

Ví dụ:

```text
Business Concept
    --refined_into-->
Domain Concept
```

```text
Business Rule
    --enforced_by-->
Domain Invariant
```

```text
Business Process
    --uses-->
Domain Concept
```

```text
Policy
    --refined_into-->
Domain Policy
```

Business mô tả reality.

Domain mô tả model.

---

# Quan hệ với Product

Product mô tả external behavior.

Domain mô tả meaning và consistency.

Ví dụ:

```text
Use Case
    --uses-->
Domain Concept
```

```text
Feature
    --operates_on-->
Domain Entity
```

```text
Functional Requirement
    --constrained_by-->
Domain Invariant
```

Product không định nghĩa Aggregate boundary.

---

# Quan hệ với UI

UI trình bày Domain meaning.

Ví dụ:

```text
Screen
    --presents-->
Domain Concept
```

```text
Form
    --captures-->
Value Object
```

```text
UI State
    --reflects-->
Domain State
```

UI không nên tạo Domain Rule riêng.

---

# Quan hệ với Architecture

Domain là input quan trọng cho Architecture boundary.

Ví dụ:

```text
Aggregate
    --owned_by-->
Architecture Unit
```

```text
Domain Boundary
    --influences-->
Module Boundary
```

```text
Domain Event
    --crosses-->
Architecture Boundary
```

Architecture không được làm méo meaning của Domain chỉ để phù hợp code structure.

---

# Quan hệ với Technical

Technical layer chọn mechanism để lưu trữ và truyền tải Domain.

Ví dụ:

```text
Aggregate
    --persisted_by-->
Persistence Mechanism
```

```text
Domain Event
    --transported_by-->
Communication Mechanism
```

```text
Value Object
    --serialized_by-->
Technical Schema
```

Domain không định nghĩa:

```text
ORM
table
queue
framework
```

---

# Quan hệ với Implementation

Implementation hiện thực hóa Domain.

Ví dụ:

```text
Entity
    --implemented_by-->
Domain Class
```

```text
Domain Service
    --implemented_by-->
Code Unit
```

```text
Invariant
    --enforced_by-->
Implementation Rule
```

Không cần map mọi field và method.

Chỉ giữ trace có giá trị.

---

# Quan hệ với Quality

Domain tạo input cho verification.

Ví dụ:

```text
Invariant
    --verified_by-->
Domain Test
```

```text
Lifecycle
    --verified_by-->
State Transition Test
```

```text
Domain Policy
    --verified_by-->
Rule Verification
```

Domain correctness là một phần của Quality.

---

# Quan hệ với Operation

Operation có thể tạo feedback ngược về Domain.

Ví dụ:

```text
Observed Invalid State
    ↓
Domain Defect
```

```text
Incident
    ↓
Invariant Review
```

```text
Operational Pattern
    ↓
Lifecycle Review
```

Operation không trực tiếp sửa Domain meaning.

---

# Quan hệ với Decisions

Domain conflict có thể tạo Decision.

Ví dụ:

```text
Aggregate Boundary Alternative
    --evaluated_by-->
Decision
```

```text
Invariant Conflict
    --motivates-->
Decision
```

```text
Domain Model Change
    --decided_by-->
Decision
```

Decision nên reference Domain Entity liên quan.

---

# Quan hệ với Theory

Domain Entity có thể reference Theory khi principle thực sự ảnh hưởng đến:

```text
modeling
boundary design
invariant design
event design
lifecycle design
```

Ví dụ:

```yaml
theory_basis:
  - TH-DOM-02
```

Không reference Theory mặc định cho mọi Domain Entity.

---

# Nguyên tắc

## Domain giữ meaning, không giữ implementation

Sai:

```text
Order is an Eloquent model.
```

Đúng:

```text
Order is a domain entity representing
a committed commercial transaction.
```

---

## Domain Concept không phải Database Table

```text
Domain Concept
≠
Table
```

Một concept có thể:

- trải trên nhiều bảng;
- không cần bảng;
- được derived.

---

## Entity không phải DTO

Entity có:

```text
identity
behavior
rules
lifecycle
```

DTO chỉ vận chuyển dữ liệu.

---

## Value Object không chỉ là Data Structure

Value Object cần có meaning.

Ví dụ:

```text
Money
```

không chỉ là:

```text
amount
currency
```

mà còn có:

```text
validity
equality
operations
```

---

## Aggregate không phải Folder Group

Aggregate là:

```text
consistency boundary
```

Không phải chỉ là nhóm class có tên gần nhau.

---

## Invariant phải luôn đúng trong scope của nó

Invariant không phải recommendation.

Nếu có exception thường xuyên, cần xem lại:

```text
scope
definition
model
```

---

## Domain Service phải có Domain Meaning

Không dùng Domain Service như nơi đặt logic không biết để đâu.

---

## Domain Event phải có ý nghĩa business

Không biến mọi state change thành Domain Event.

Chỉ dùng khi event có meaning đối với domain.

---

## Lifecycle không phải Workflow Engine Config

Lifecycle mô tả:

```text
domain-valid state evolution
```

Technical workflow mô tả:

```text
execution mechanism
```

---

## Relation phải dùng canonical vocabulary

Không tự đặt relation tùy ý trong README.

Relation Type và valid combinations phải được định nghĩa trong:

```text
docs/meta/
```

---

# Tóm tắt

```text
04-domain/
├── language/
│   → domain đang dùng những khái niệm nào
│
├── model/
│   → domain gồm những object và boundary nào
│
├── rules/
│   → điều gì phải luôn đúng
│
├── behavior/
│   → domain thực hiện và phát sinh hành vi gì
│
└── lifecycle/
    → domain object thay đổi trạng thái thế nào
```

Mô hình:

```text
04-domain
    ↓
Concern
    ↓
Entity Type
    ↓
Entity Instance
```