# 00 — Context

## Mục đích

`00-context/` mô tả bối cảnh nền tảng mà toàn bộ ứng dụng phải được hiểu dựa trên đó.

Layer này trả lời:

- Ứng dụng này là gì?
- Phạm vi hiện tại là gì?
- Điều gì nằm ngoài phạm vi?
- Những giả định nào đang được sử dụng?
- Những constraint tổng quát nào tồn tại?
- Những thuật ngữ nào cần được hiểu thống nhất?
- Ứng dụng tồn tại trong ecosystem nào?
- Những environment nào có ý nghĩa với project?

Context không mô tả chi tiết:

```text
business process
feature
screen
domain model
architecture
technical mechanism
source code
```

Context chỉ cung cấp bối cảnh chung cho các layer khác.

---

# Cấu trúc

`00-context/` dùng mô hình:

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
00-context/
├── README.md
├── overview/
├── scope/
├── premises/
├── language/
├── ecosystem/
└── environment/
```

Trong đó:

```text
overview
scope
premises
language
ecosystem
environment
```

là các Concern.

Bên trong mỗi Concern, project định nghĩa các Entity Type phù hợp.

Ví dụ:

```text
00-context/
└── premises/
    └── assumptions/
        └── ASM-001-single-region/
            └── README.md
```

Trong đó:

```text
00-context
= Layer

premises
= Concern

assumptions
= Entity Type

ASM-001-single-region
= Entity Instance
```

---

# 1. Overview

## Mục đích

`overview/` quản lý bức tranh tổng quan của ứng dụng.

Concern này trả lời:

- Ứng dụng là gì?
- Mục đích tổng quát là gì?
- Ai sử dụng?
- Giá trị chính là gì?
- Có những phần lớn nào cần biết ngay từ đầu?

Entity Type có thể gồm:

```text
applications/
products/
platforms/
sub-applications/
```

Ví dụ:

```text
overview/
└── applications/
    └── APP-001-spec-to-prod/
        └── README.md
```

Một overview entity có thể mô tả:

```text
name
purpose
primary users
main value
high-level scope
major parts
lifecycle stage
```

Overview không thay thế:

```text
Business Goal
Product Requirement
Architecture Overview
```

Nó chỉ cung cấp bức tranh nền tảng.

---

# 2. Scope

## Mục đích

`scope/` quản lý ranh giới phạm vi.

Concern này trả lời:

- Điều gì thuộc phạm vi?
- Điều gì không thuộc phạm vi?
- Scope áp dụng cho toàn app hay một phase?
- Scope có giới hạn theo release, subsystem hoặc initiative không?

Entity Type có thể gồm:

```text
application-scopes/
phase-scopes/
release-scopes/
subsystem-scopes/
initiative-scopes/
```

Ví dụ:

```text
scope/
└── phase-scopes/
    └── SCOPE-001-phase-a/
        └── README.md
```

Một Scope entity có thể mô tả:

```text
in scope
out of scope
boundary
reason
related entities
status
```

Ví dụ:

```text
In Scope

- Business documentation
- Architecture documentation
- Technical design
- AI-assisted implementation

Out of Scope

- Fully autonomous deployment
- Multi-project orchestration
```

Scope giúp ngăn:

```text
feature creep
architecture overreach
agent assumption
uncontrolled expansion
```

---

# 3. Premises

## Mục đích

`premises/` quản lý những điều kiện nền tảng mà project đang dựa vào.

Concern này trả lời:

- Điều gì đang được giả định?
- Điều gì đang giới hạn project?
- Điều kiện nào có thể thay đổi?
- Nếu một premise sai thì phần nào bị ảnh hưởng?

Entity Type phổ biến:

```text
assumptions/
constraints/
```

Ví dụ:

```text
premises/
├── assumptions/
│   └── ASM-001-single-region/
│       └── README.md
│
└── constraints/
    └── CON-001-solo-developer/
        └── README.md
```

---

## Assumption

Assumption là điều project đang tạm coi là đúng.

Ví dụ:

```text
Phase A chỉ cần một region.
```

Một Assumption có thể mô tả:

```text
statement
reason
confidence
affected entities
validation method
review trigger
status
```

Assumption không phải Fact.

Không viết:

```text
Users always use desktop.
```

nếu chưa được xác minh.

Nên viết:

```text
Assumption:

Most users are expected to use desktop devices.
```

---

## Constraint

Constraint là giới hạn mà project phải tuân thủ.

Ví dụ:

```text
Phase A được phát triển bởi một developer chính.
```

Một Constraint có thể mô tả:

```text
statement
source
scope
strength
affected layers
affected entities
exceptions
status
```

Constraint có thể đến từ:

```text
organization
time
budget
regulation
technology
platform
contract
```

Phân biệt:

```text
Assumption
→ điều project đang tạm coi là đúng

Constraint
→ giới hạn project phải tuân thủ
```

---

# 4. Language

## Mục đích

`language/` quản lý meaning chung trong project.

Concern này trả lời:

- Thuật ngữ này có nghĩa gì?
- Thuật ngữ nào là canonical?
- Có alias nào không?
- Thuật ngữ nào dễ bị nhầm?
- Meaning có áp dụng toàn project hay chỉ trong một scope?

Entity Type có thể gồm:

```text
glossary-terms/
shared-concepts/
acronyms/
naming-definitions/
```

Ví dụ:

```text
language/
└── glossary-terms/
    └── GLO-001-canonical-state/
        └── README.md
```

Một Glossary Term có thể mô tả:

```text
term
definition
aliases
not to be confused with
scope
related entities
```

Ví dụ:

```text
Canonical State

State được coi là source of truth chính thức của application.
```

Không nhầm với:

```text
workflow state
cache state
derived index
temporary state
```

Language không định nghĩa Business Rule.

Nó giữ meaning nhất quán.

---

# 5. Ecosystem

## Mục đích

`ecosystem/` quản lý các đối tượng bên ngoài mà ứng dụng tồn tại cùng hoặc phụ thuộc vào.

Concern này trả lời:

- External system nào tồn tại?
- Organization nào có quan hệ với app?
- Partner nào tham gia?
- External source nào cung cấp dữ liệu?
- Dependency bên ngoài nào quan trọng?

Entity Type có thể gồm:

```text
external-systems/
external-services/
partner-systems/
legacy-systems/
external-data-sources/
organizations/
```

Ví dụ:

```text
ecosystem/
└── external-systems/
    └── EXT-001-payment-provider/
        └── README.md
```

Một External System có thể mô tả:

```text
name
owner
purpose
relationship
data exchanged
criticality
dependency level
known limitations
```

Ví dụ:

```text
EXT-001 — Payment Provider

Relationship:
Application consumes payment processing service.

Data Exchanged:
- payment request;
- transaction status;
- refund result.

Criticality:
high
```

Phân biệt:

```text
Context / Ecosystem
→ external system nào tồn tại?

Architecture
→ boundary với nó ở đâu?

Technical
→ giao tiếp bằng mechanism nào?

Implementation
→ adapter hoặc client nào thực hiện?
```

---

# 6. Environment

## Mục đích

`environment/` quản lý các environment có ý nghĩa ở mức project context.

Concern này trả lời:

- Có những environment nào?
- Mỗi environment dùng để làm gì?
- Environment nào production-like?
- Có constraint hoặc difference lớn nào?
- Ai được sử dụng environment đó?

Entity Type có thể gồm:

```text
environments/
execution-contexts/
deployment-contexts/
regional-contexts/
```

Ví dụ:

```text
environment/
└── environments/
    ├── ENV-001-development/
    ├── ENV-002-staging/
    └── ENV-003-production/
```

Một Environment có thể mô tả:

```text
purpose
users
data sensitivity
external dependencies
availability expectation
production similarity
```

Phân biệt:

```text
Context Environment
→ environment nào tồn tại và có ý nghĩa gì?

Operation Runtime
→ environment hiện đang chạy những instance nào?
```

---

# Quan hệ với Theory

Context entity có thể tham chiếu Theory khi cần.

Ví dụ:

```yaml
theory_basis:
  - TH-KNOW-01
```

Tuy nhiên không phải mọi Context entity đều cần Theory.

Chỉ reference khi Theory thực sự ảnh hưởng đến cách project hiểu Context.

Ví dụ:

```text
Theory
    ↓ influences
Scope

Theory
    ↓ influences
Assumption

Theory
    ↓ influences
Context Constraint
```

Theory không được copy vào Context.

Dùng:

```text
Theory ID
+
Context-specific meaning
```

---

# Quan hệ với Business

Context là input trực tiếp của Business.

Ví dụ:

```text
Scope
    --constrains-->
Business Goal
```

```text
External System
    --participates_in-->
Business Process
```

```text
Assumption
    --influences-->
Business Analysis
```

```text
Constraint
    --constrains-->
Business Process
```

Context không định nghĩa Business Process.

---

# Quan hệ với Product

Context có thể ảnh hưởng:

```text
product scope
requirement scope
release scope
feature scope
```

Ví dụ:

```text
Phase Scope
    --limits-->
Feature Set
```

```text
Assumption
    --influences-->
Requirement
```

---

# Quan hệ với UI

Context có thể ảnh hưởng:

```text
target device
locale
user environment
platform
accessibility context
```

Ví dụ:

```text
Environment Context
    ↓
UI Interaction Constraint
```

---

# Quan hệ với Domain

Language có thể ảnh hưởng Domain.

Ví dụ:

```text
Glossary Term
    --clarifies-->
Domain Concept
```

Context không định nghĩa Domain Entity.

---

# Quan hệ với Architecture

Context là input quan trọng của Architecture.

Ví dụ:

```text
Constraint
    --constrains-->
Architecture
```

```text
External System
    --requires-->
Integration Boundary
```

```text
Environment
    --influences-->
Deployment Architecture
```

---

# Quan hệ với Technical

Premises và Environment có thể ảnh hưởng technical choice.

Ví dụ:

```text
Technology Constraint
    --constrains-->
Platform Selection
```

```text
Environment
    --influences-->
Configuration Strategy
```

---

# Quan hệ với Quality

Context có thể tạo ra:

```text
risk
validation need
test condition
quality priority
```

Ví dụ:

```text
Assumption
    --validated_by-->
Validation
```

```text
Constraint
    --checked_by-->
Assurance
```

---

# Quan hệ với Operation

Environment và Ecosystem ảnh hưởng trực tiếp Operation.

Ví dụ:

```text
Environment
    --realized_as-->
Runtime Environment
```

```text
External System
    --creates-->
Operational Dependency
```

---

# Quan hệ với Decisions

Context thường là nguồn tạo Decision.

Ví dụ:

```text
Constraint
    --motivates-->
Decision
```

```text
Assumption
    --influences-->
Decision
```

```text
External System Limitation
    --motivates-->
Decision
```

Decision nên reference Context Entity thay vì copy lại toàn bộ bối cảnh.

---

# Quan hệ giữa các Concern

Các Concern không tạo thành pipeline cứng.

Quan hệ phổ biến:

```text
Overview
    ↓
Scope
```

```text
Premises
    ↓
Scope
```

```text
Ecosystem
    ↓
Premises
```

```text
Language
    ↓
All Context Concerns
```

```text
Environment
    ↓
Technical / Operation
```

Mô hình tổng quát:

```text
                   Overview
                      │
                      ▼
                    Scope
               ┌──────┼──────┐
               ▼      ▼      ▼
           Premises Language Ecosystem
               │              │
               └──────┬───────┘
                      ▼
                 Other Layers

                  Environment
                      │
                      ▼
            Technical / Operation
```

---

# Mô hình tổ chức Entity

Mỗi Concern có thể chứa một hoặc nhiều Entity Type.

```text
Concern
    ↓
Entity Type
    ↓
Entity Instance
```

Ví dụ:

```text
00-context/
└── premises/
    └── assumptions/
        └── ASM-001-single-region/
            └── README.md
```

Hoặc:

```text
00-context/
└── ecosystem/
    └── external-systems/
        └── EXT-001-payment-provider/
            └── README.md
```

Không bắt buộc mọi project phải có cùng Entity Type.

---

# Nguyên tắc

## Context giữ bối cảnh chung

Không dùng `00-context/` làm nơi chứa mọi knowledge chưa biết đặt ở đâu.

Một entity chỉ thuộc Context khi nó mô tả:

```text
overview
scope
premise
shared language
ecosystem
environment
```

---

## Concern là lớp tổ chức

Các folder cấp đầu:

```text
overview
scope
premises
language
ecosystem
environment
```

là Concern.

Chúng không phải Entity Type.

---

## Entity Type nằm bên trong Concern

Ví dụ:

```text
premises/
├── assumptions/
└── constraints/
```

Trong đó:

```text
premises
= Concern

assumptions
constraints
= Entity Type
```

---

## Scope phải có Out of Scope

Chỉ ghi `In Scope` thường không đủ.

`Out of Scope` giúp:

- người;
- Agent;
- reviewer

không tự mở rộng project.

---

## Assumption phải được nhận diện rõ

Không viết Assumption như Fact.

---

## Constraint phải có nguồn

Một Constraint quan trọng nên biết nó đến từ đâu.

---

## Language phải giữ meaning nhất quán

Nếu có alias:

```text
canonical term
+
aliases
```

phải được ghi rõ.

---

## Ecosystem không thay thế Integration Docs

Context giữ identity và relationship tổng quát.

Chi tiết integration thuộc:

```text
Architecture
Technical
Implementation
```

---

## Environment không thay thế Runtime

Context định nghĩa:

```text
production là gì
staging dùng để làm gì
```

Operation định nghĩa:

```text
production đang chạy những gì
```

---

## Context có thể dùng Theory

Nhưng chỉ khi thực sự cần.

Không reference Theory mặc định cho mọi entity.

---

## Context phải tối ưu cho Agent đọc đầu tiên

Agent có thể bắt đầu bằng:

```text
00-context/README.md
```

sau đó route tới Concern và Entity liên quan.

Không đọc toàn bộ Context cho mọi task.

---

# Tóm tắt

```text
00-context/
├── overview/
│   → ứng dụng là gì
│
├── scope/
│   → điều gì nằm trong và ngoài phạm vi
│
├── premises/
│   → project đang giả định và bị giới hạn bởi điều gì
│
├── language/
│   → meaning nào cần được hiểu thống nhất
│
├── ecosystem/
│   → ứng dụng tồn tại cùng và phụ thuộc vào ai
│
└── environment/
    → những environment nào có ý nghĩa với project
```

Mô hình:

```text
00-context
    ↓
Concern
    ↓
Entity Type
    ↓
Entity Instance
```