# 02 — Product

## Mục đích

`02-product/` mô tả sản phẩm phải cung cấp gì để đáp ứng business needs.

Layer này trả lời:

- Product cần giải quyết nhu cầu nào?
- Product cần có capability nào?
- Người dùng hoặc hệ thống cần thực hiện hành vi nào?
- Feature nào được cung cấp?
- Requirement cụ thể là gì?
- Điều kiện nào xác nhận product đã đáp ứng yêu cầu?

Product không mô tả chi tiết:

```text
business reality
screen design
domain model
architecture
technical mechanism
source code
```

Product chuyển từ:

```text
Business Need
```

sang:

```text
Product Responsibility
```

---

# Cấu trúc

`02-product/` dùng mô hình:

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
02-product/
├── README.md
├── needs/
├── capability/
├── behavior/
├── delivery/
├── specification/
└── acceptance/
```

Trong đó:

```text
needs
capability
behavior
delivery
specification
acceptance
```

là các Concern.

Ví dụ:

```text
02-product/
└── delivery/
    └── features/
        └── FE-001-financial-dashboard/
            └── README.md
```

Trong đó:

```text
02-product
= Layer

delivery
= Concern

features
= Entity Type

FE-001-financial-dashboard
= Entity Instance
```

---

# 1. Needs

## Mục đích

`needs/` quản lý những nhu cầu mà Product phải đáp ứng.

Concern này trả lời:

- Product cần đáp ứng nhu cầu nào?
- Nhu cầu này đến từ business problem hoặc goal nào?
- Ai cần nó?
- Kết quả mong đợi là gì?
- Nhu cầu nào quan trọng hơn?

Entity Type phổ biến:

```text
business-requirements/
product-needs/
```

Ví dụ:

```text
needs/
└── business-requirements/
    └── BR-001-automated-reconciliation/
        └── README.md
```

Một Business Requirement có thể mô tả:

```text
statement
source
stakeholders
expected outcome
priority
scope
related business entities
status
```

Ví dụ:

```text
The product must support automated reconciliation
across store-level financial transactions.
```

Business Requirement không nên mô tả solution quá cụ thể.

Sai:

```text
The product must use PostgreSQL triggers
to reconcile transactions.
```

Đúng:

```text
The product must detect and reconcile
financial discrepancies automatically.
```

---

# 2. Capability

## Mục đích

`capability/` quản lý những khả năng mà Product phải có.

Concern này trả lời:

- Product cần có khả năng làm gì?
- Capability nào hỗ trợ Business Requirement nào?
- Capability nào độc lập với UI?
- Capability nào cần được phát triển hoặc cải thiện?

Entity Type phổ biến:

```text
capabilities/
```

Ví dụ:

```text
capability/
└── capabilities/
    └── CAP-001-transaction-reconciliation/
        └── README.md
```

Một Capability có thể mô tả:

```text
statement
purpose
supported requirements
users or actors
inputs
outputs
boundaries
maturity
status
```

Capability mô tả khả năng.

Nó không mô tả:

```text
screen
button
API endpoint
class
database table
```

Ví dụ:

```text
CAP-001

The product can reconcile transactions
from multiple business sources.
```

---

# 3. Behavior

## Mục đích

`behavior/` quản lý cách người dùng hoặc external actor tương tác với Product để đạt mục tiêu.

Concern này trả lời:

- Ai tương tác với Product?
- Actor muốn đạt kết quả gì?
- Product phản hồi thế nào?
- Luồng chính là gì?
- Alternate hoặc exception behavior nào tồn tại?

Entity Type phổ biến:

```text
use-cases/
```

Ví dụ:

```text
behavior/
└── use-cases/
    └── UC-001-review-reconciliation-result/
        └── README.md
```

Một Use Case có thể mô tả:

```text
actor
goal
preconditions
trigger
main flow
alternative flows
exceptions
postconditions
related capabilities
```

Use Case mô tả behavior ở mức Product.

Không mô tả UI detail.

Sai:

```text
User clicks the blue button
on the top-right corner.
```

Đúng:

```text
The manager requests a reconciliation review.
```

---

# 4. Delivery

## Mục đích

`delivery/` quản lý những đơn vị giá trị Product thực sự cung cấp.

Concern này trả lời:

- Product cung cấp feature nào?
- Feature phục vụ capability hoặc use case nào?
- Feature nằm trong release nào?
- Feature nào đang planned, active hoặc retired?

Entity Type phổ biến:

```text
features/
releases/
```

Ví dụ:

```text
delivery/
├── features/
│   └── FE-001-reconciliation-dashboard/
│       └── README.md
│
└── releases/
    └── REL-001-phase-a/
        └── README.md
```

---

## Feature

Feature là một đơn vị chức năng có giá trị rõ ràng đối với người dùng hoặc Product.

Một Feature có thể mô tả:

```text
statement
value
scope
supported capabilities
supported use cases
requirements
priority
release
status
```

Ví dụ:

```text
FE-001 — Reconciliation Dashboard
```

Feature không nên chứa implementation detail.

---

## Release

Release là một tập hợp Product changes được đưa ra cùng một mốc delivery.

Một Release có thể mô tả:

```text
goal
scope
included features
excluded features
dependencies
entry criteria
exit criteria
status
```

Release không phải Git release hoặc deployment record.

Phân biệt:

```text
Product Release
→ scope giá trị được cung cấp

Operation Deployment
→ lần triển khai thực tế
```

---

# 5. Specification

## Mục đích

`specification/` quản lý những yêu cầu cụ thể Product phải đáp ứng.

Concern này trả lời:

- Product phải làm gì?
- Điều kiện hành vi cụ thể là gì?
- Constraint chất lượng là gì?
- Requirement nào bắt buộc?
- Requirement nào hỗ trợ Feature nào?

Entity Type phổ biến:

```text
functional-requirements/
non-functional-requirements/
```

Ví dụ:

```text
specification/
├── functional-requirements/
│   └── FR-001-detect-discrepancy/
│       └── README.md
│
└── non-functional-requirements/
    └── NFR-001-reconciliation-latency/
        └── README.md
```

---

## Functional Requirement

Functional Requirement mô tả Product phải thực hiện hành vi nào.

Ví dụ:

```text
The product must identify transactions
whose recorded totals do not match expected totals.
```

Một Functional Requirement có thể mô tả:

```text
statement
trigger
conditions
expected behavior
exceptions
related feature
related use case
priority
status
```

Functional Requirement phải đủ cụ thể để:

```text
review
implement
verify
```

---

## Non-functional Requirement

Non-functional Requirement mô tả quality, constraint hoặc operating expectation của Product.

Ví dụ:

```text
Reconciliation results must be available
within five minutes after source data is received.
```

Một NFR có thể mô tả:

```text
quality attribute
statement
measurement
threshold
scope
conditions
priority
status
```

NFR có thể liên quan:

```text
performance
security
availability
usability
accessibility
scalability
maintainability
compliance
```

NFR không mô tả technical solution.

Sai:

```text
Use Redis to achieve low latency.
```

Đúng:

```text
95% of reconciliation queries
must complete within two seconds.
```

---

# 6. Acceptance

## Mục đích

`acceptance/` quản lý điều kiện dùng để xác nhận Product đã đáp ứng requirement.

Concern này trả lời:

- Khi nào requirement được coi là đạt?
- Điều kiện cụ thể nào phải đúng?
- Ai có thể xác nhận?
- Acceptance áp dụng cho Feature, Use Case hay Requirement nào?

Entity Type phổ biến:

```text
acceptance-criteria/
```

Ví dụ:

```text
acceptance/
└── acceptance-criteria/
    └── AC-001-discrepancy-visible/
        └── README.md
```

Một Acceptance Criterion có thể mô tả:

```text
condition
expected result
related requirement
related feature
validation method
status
```

Ví dụ:

```text
Given a transaction total differs from the expected total,
when reconciliation completes,
then the discrepancy is available for review.
```

Acceptance Criterion mô tả điều kiện chấp nhận.

Nó không phải full test case.

---

# Quan hệ giữa các Concern

Các Concern không phải pipeline cứng.

Quan hệ điển hình:

```text
Business Requirement
    ↓ satisfied_by
Capability
```

```text
Capability
    ↓ exercised_by
Use Case
```

```text
Capability
    ↓ delivered_by
Feature
```

```text
Feature
    ↓ specified_by
Functional Requirement
```

```text
Feature
    ↓ constrained_by
Non-functional Requirement
```

```text
Requirement
    ↓ accepted_by
Acceptance Criterion
```

Mô hình khái quát:

```text
Needs
    ↓
Capability

Capability
    ↓
Behavior + Delivery

Delivery
    ↓
Specification

Specification
    ↓
Acceptance
```

Đây là relation knowledge.

Không bắt buộc mọi entity phải đi qua toàn bộ chain.

---

# Không ép Product thành Pipeline duy nhất

Một Business Requirement có thể được đáp ứng bởi nhiều Capability.

```text
BR-001
    ↓
CAP-001
CAP-002
```

Một Capability có thể hỗ trợ nhiều Use Case.

```text
CAP-001
    ↓
UC-001
UC-002
```

Một Feature có thể hỗ trợ nhiều Capability.

```text
FE-001
    ↓
CAP-001
CAP-003
```

Một Requirement cũng có thể áp dụng cho nhiều Feature.

Product là graph knowledge, không phải cây tuyến tính.

---

# Quan hệ với Business

Business định nghĩa:

```text
why
problem
goal
business behavior
business governance
success
```

Product định nghĩa:

```text
what the product must provide
```

Quan hệ điển hình:

```text
Problem
    --addressed_by-->
Business Requirement
```

```text
Goal
    --supported_by-->
Capability
```

```text
Business Process
    --supported_by-->
Use Case
```

```text
Business Rule
    --realized_by-->
Functional Requirement
```

Không copy Business content vào Product.

Product reference entity nguồn.

---

# Quan hệ với UI

Product định nghĩa behavior và value.

UI định nghĩa cách người dùng trải nghiệm và tương tác.

Ví dụ:

```text
Use Case
    --represented_by-->
User Flow
```

```text
Feature
    --represented_by-->
Screen
```

```text
Functional Requirement
    --realized_in-->
UI Interaction
```

Product không định nghĩa:

```text
layout
color
component hierarchy
screen transition detail
```

---

# Quan hệ với Domain

Product mô tả external behavior.

Domain mô tả business meaning và internal domain rules.

Ví dụ:

```text
Use Case
    --uses-->
Domain Concept
```

```text
Functional Requirement
    --constrained_by-->
Domain Invariant
```

```text
Feature
    --operates_on-->
Domain Entity
```

Product không tự định nghĩa Aggregate hoặc Value Object.

---

# Quan hệ với Architecture

Product tạo input cho Architecture.

Ví dụ:

```text
Capability
    --realized_by-->
Architecture Unit
```

```text
Use Case
    --supported_by-->
Architecture Interaction
```

```text
NFR
    --constrains-->
Architecture
```

Architecture không thay thế Product Specification.

---

# Quan hệ với Technical

Product Requirement có thể ảnh hưởng technical design.

Ví dụ:

```text
NFR
    --constrains-->
Technical Mechanism
```

```text
Functional Requirement
    --supported_by-->
Technical Interface
```

Technical không được dùng để viết ngược requirement.

---

# Quan hệ với Implementation

Product không nên map trực tiếp mọi entity tới code.

Một số relation hợp lý:

```text
Feature
    --implemented_by-->
Implementation Unit
```

```text
Functional Requirement
    --implemented_by-->
Code Behavior
```

Traceability phải đủ để impact analysis.

Không cần document từng function.

---

# Quan hệ với Quality

Acceptance và Requirement là input chính cho Quality.

Ví dụ:

```text
Acceptance Criterion
    --verified_by-->
Verification
```

```text
Business Requirement
    --validated_by-->
Validation
```

```text
NFR
    --measured_by-->
Quality Metric
```

Phân biệt:

```text
Acceptance
→ điều kiện Product được chấp nhận

Verification
→ kiểm tra implementation có đúng spec không

Validation
→ kiểm tra Product có giải quyết đúng nhu cầu không
```

---

# Quan hệ với Decisions

Product conflict có thể tạo Decision.

Ví dụ:

```text
Requirement Conflict
    --motivates-->
Decision
```

```text
Scope Trade-off
    --motivates-->
Decision
```

```text
Feature Alternative
    --evaluated_by-->
Decision
```

Decision nên reference Product Entities liên quan.

---

# Quan hệ với Theory

Product Entity có thể reference Theory khi một principle thực sự ảnh hưởng đến:

```text
requirement design
capability decomposition
feature boundaries
acceptance strategy
```

Ví dụ:

```yaml
theory_basis:
  - TH-PROD-02
```

Không reference Theory mặc định cho mọi Product Entity.

---

# Nguyên tắc

## Product mô tả What, không mô tả How kỹ thuật

Sai:

```text
Use Kafka to process reconciliation.
```

Đúng:

```text
The product must process reconciliation asynchronously
without blocking normal user activity.
```

---

## Business Requirement phải có nguồn

Mỗi Business Requirement quan trọng nên trace về:

```text
Problem
Goal
Stakeholder
Process
Business Rule
```

---

## Capability không phải Feature

```text
Capability
= Product có khả năng gì

Feature
= Product cung cấp đơn vị giá trị nào
```

Một Capability có thể được cung cấp bởi nhiều Feature.

---

## Use Case không phải User Flow

```text
Use Case
= interaction goal ở Product level

User Flow
= trải nghiệm và navigation ở UI level
```

---

## Feature không phải Requirement

```text
Feature
= đơn vị giá trị được cung cấp

Requirement
= điều Product phải đáp ứng
```

Một Feature thường được mô tả bởi nhiều Requirement.

---

## Functional Requirement phải kiểm chứng được

Requirement tốt phải có thể:

```text
review
implement
verify
```

Không dùng statement mơ hồ.

---

## NFR phải đo được khi có thể

Sai:

```text
The system should be fast.
```

Đúng:

```text
95% of requests must complete within two seconds.
```

---

## Acceptance Criterion không phải Test Case

Acceptance Criterion định nghĩa:

```text
what must be true
```

Test Case định nghĩa:

```text
how verification is executed
```

---

## Không ép mọi Product Entity thành một chain tuyến tính

Canonical Product knowledge là graph.

Ví dụ:

```text
Business Requirement
    ↓
Capability
    ↓
Use Case
    ↓
Feature
    ↓
Requirement
    ↓
Acceptance Criterion
```

chỉ là một đường trace phổ biến.

Nó không phải schema bắt buộc cho mọi entity.

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
02-product/
├── needs/
│   → Product cần đáp ứng nhu cầu nào
│
├── capability/
│   → Product cần có khả năng gì
│
├── behavior/
│   → Actor tương tác với Product thế nào
│
├── delivery/
│   → Product cung cấp feature và release nào
│
├── specification/
│   → Product phải đáp ứng requirement cụ thể nào
│
└── acceptance/
    → Khi nào Product được coi là đạt
```

Mô hình:

```text
02-product
    ↓
Concern
    ↓
Entity Type
    ↓
Entity Instance
```