# 10 — Decisions

## Mục đích

`10-decisions/` lưu lại các quyết định quan trọng của project.

Layer này trả lời:

- Project đã quyết định điều gì?
- Tại sao quyết định như vậy?
- Những phương án nào đã được cân nhắc?
- Trade-off nào được chấp nhận?
- Theory nào ảnh hưởng đến quyết định?
- Entity nào bị ảnh hưởng?
- Quyết định nào đang còn hiệu lực?
- Quyết định nào đã bị thay thế?
- Khi nào cần xem lại quyết định?

Decision không chỉ dành cho Architecture.

Một decision có thể liên quan đến:

```text
Context
Business
Product
UI
Domain
Architecture
Technical
Implementation
Quality
Operation
Theory
```

Do đó `10-decisions/` là layer cross-cutting.

Nó không nằm trong pipeline đơn giản:

```text
09-operation
    ↓
10-decisions
```

Đúng hơn:

```text
                  Decisions
                      │
      ┌───────────────┼───────────────┐
      ▼               ▼               ▼
   Business       Architecture     Operation
      │               │               │
      └───────────────┼───────────────┘
                      ▼
                 Project Evolution
```

---

# Cấu trúc

```text
10-decisions/
├── README.md
├── decisions/
├── alternatives/
└── superseded/
```

Cấu trúc này giữ đơn giản:

```text
decisions/
→ quyết định hiện tại hoặc đang được xem xét

alternatives/
→ phương án đáng lưu lại nhưng không được chọn

superseded/
→ quyết định không còn hiệu lực
```

Không chia mặc định thành:

```text
business-decisions/
product-decisions/
architecture-decisions/
technical-decisions/
```

vì một decision có thể ảnh hưởng nhiều layer cùng lúc.

Ví dụ:

```text
DEC-001

Use PostgreSQL as canonical knowledge store.
```

Decision này có thể ảnh hưởng:

```text
Architecture
Technical
Implementation
Operation
```

Nếu ép vào một folder layer cụ thể sẽ làm mất bản chất cross-layer.

---

# 1. Decisions

## Mục đích

Lưu các quyết định quan trọng mà project đã đưa ra.

Ví dụ:

```text
10-decisions/
└── decisions/
    ├── DEC-001-use-postgresql/
    │   └── README.md
    │
    ├── DEC-002-keep-modular-monolith/
    │   └── README.md
    │
    └── DEC-003-human-approval-for-critical-spec/
        └── README.md
```

Một Decision có thể thuộc các trạng thái:

```text
proposed
accepted
rejected
deprecated
superseded
```

Có thể mở rộng nếu project cần.

---

## Nội dung tối thiểu của một Decision

Một decision nên trả lời:

```text
Quyết định là gì?

Tại sao cần quyết định?

Context hiện tại là gì?

Những phương án nào đã được cân nhắc?

Phương án nào được chọn?

Trade-off là gì?

Entity nào bị ảnh hưởng?

Theory nào là cơ sở?

Khi nào cần review lại?
```

Ví dụ:

```md
# DEC-001 — Use PostgreSQL as Canonical Knowledge Store

## Status

accepted

## Decision

PostgreSQL là canonical knowledge store của application.

Workflow engine state không được coi là canonical domain state.

## Context

Application có:

- workflow execution state;
- canonical knowledge state;
- temporary agent state.

Các loại state này có lifecycle và responsibility khác nhau.

## Theory Basis

- TH-STATE-01
- TH-KNOWLEDGE-03

## Affected Layers

- architecture
- technical
- implementation
- operation

## Affected Entities

- ARCH-STATE-001
- TECH-DB-001
- IMPL-REPO-003

## Alternatives Considered

- workflow engine as canonical store
- document files as canonical store

## Consequences

Positive:

- canonical state có ownership rõ;
- workflow engine có thể thay đổi độc lập;
- dễ audit và query.

Negative:

- cần synchronization giữa workflow và canonical state;
- tăng số lượng persistence mechanism.

## Review Triggers

Review lại khi:

- canonical data model thay đổi lớn;
- workflow engine trở thành primary product runtime;
- PostgreSQL không còn đáp ứng scale requirement.
```

---

# 2. Alternatives

## Mục đích

Lưu các phương án đáng chú ý đã được cân nhắc nhưng không được chọn.

Không phải mọi phương án bị loại đều cần document.

Chỉ lưu khi phương án:

```text
có khả năng được đề xuất lại
có trade-off đáng nhớ
đã tốn nhiều thời gian nghiên cứu
giúp giải thích decision hiện tại
```

Ví dụ:

```text
10-decisions/
└── alternatives/
    ├── ALT-001-use-neo4j/
    │   └── README.md
    └── ALT-002-use-microservices/
        └── README.md
```

Một Alternative nên mô tả:

```text
proposal
benefits
drawbacks
why not selected
related decision
conditions for reconsideration
```

Ví dụ:

```md
# ALT-001 — Use Neo4j as Primary Knowledge Store

## Status

not-selected

## Related Decision

- DEC-001

## Proposal

Dùng Neo4j làm canonical knowledge store.

## Benefits

- graph traversal tự nhiên;
- graph query expressive;
- relationship là first-class.

## Drawbacks

- thêm database technology;
- transaction với relational data phức tạp hơn;
- operational complexity cao hơn.

## Why Not Selected

Current system có relational requirements mạnh hơn graph traversal requirements.

PostgreSQL đủ cho core use case hiện tại.

## Reconsider When

- graph traversal trở thành workload chính;
- relation depth tăng đáng kể;
- PostgreSQL graph model trở thành bottleneck.
```

---

# 3. Superseded

## Mục đích

Lưu các decision không còn hiệu lực nhưng vẫn cần giữ lịch sử.

Ví dụ:

```text
10-decisions/
└── superseded/
    └── DEC-004-use-json-files/
        └── README.md
```

Không xóa decision cũ chỉ vì nó không còn hiệu lực.

Decision cũ giải thích:

```text
tại sao project từng làm như vậy
```

Decision mới giải thích:

```text
tại sao project thay đổi
```

Ví dụ:

```text
DEC-004
    ↓ superseded_by
DEC-019
```

Một superseded decision nên giữ:

```text
original decision
original context
original consequences
superseded_by
superseded_at
reason for replacement
```

---

# Decision là gì?

Decision là một lựa chọn có ý nghĩa lâu dài đối với project.

Ví dụ nên tạo Decision:

```text
Chọn architecture style.

Xác định canonical state owner.

Chọn persistence strategy.

Thay đổi business policy quan trọng.

Chọn cách AI được phép sửa canonical docs.

Quy định human approval cho critical changes.

Chọn deployment topology.

Chấp nhận một major trade-off.

Thay đổi public contract strategy.
```

Không cần tạo Decision cho mọi thay đổi nhỏ.

Ví dụ thường không cần:

```text
đổi tên biến

sửa typo

thêm một private helper

thay CSS spacing

refactor nhỏ không đổi behavior
```

Rule đơn giản:

```text
Nếu sau 6 tháng có khả năng ai đó hỏi:

"Tại sao project lại làm như vậy?"

thì có thể cần Decision.
```

---

# Decision không phải History Log

Git đã giữ:

```text
what changed
when
who changed
diff
```

Decision giữ:

```text
why changed
what was considered
what trade-off was accepted
```

Không dùng Decision để copy Git history.

Sai:

```text
2026-07-01
changed class A

2026-07-02
renamed function B
```

Đúng:

```text
Decision:

Use one shared graph persistence layer.

Reason:

Multiple modules need graph traversal,
but business policy must remain module-owned.
```

---

# Decision không phải Documentation Update

Không phải mọi thay đổi docs đều cần Decision.

Ví dụ:

```text
Business Requirement được làm rõ hơn
```

có thể chỉ là edit bình thường.

Nhưng:

```text
Business policy thay đổi
và ảnh hưởng nhiều requirement
```

có thể cần Decision.

---

# Decision không phải Theory

Theory nói:

```text
Project tin điều gì nói chung?
```

Decision nói:

```text
Trong context cụ thể này,
project chọn làm gì?
```

Ví dụ:

```text
Theory:

Shared infrastructure có thể tồn tại
nếu không sở hữu business policy.
```

Decision:

```text
spec-graph sẽ là shared infrastructure unit.
```

Theory không nhắc:

```text
spec-graph
```

Decision được phép nhắc.

---

# Quan hệ với Theory

Decision có thể tham chiếu trực tiếp đến Theory.

Ví dụ:

```yaml
theory_basis:
  - TH-MOD-01
  - TH-MOD-05
```

Luồng:

```text
Theory
    ↓
Decision
    ↓
App Entity Changes
```

Ví dụ:

```text
TH-MOD-05
    ↓ influences
DEC-021
    ↓ affects
ARCH-MOD-003
```

Một Decision có thể:

```text
apply Theory
adapt Theory
challenge Theory
expose conflict with Theory
```

Nếu Decision mâu thuẫn với Theory hiện tại:

```text
Decision
    ↓
Theory Challenge
```

Không nên âm thầm bỏ qua mâu thuẫn.

---

# Quan hệ với Context

Context có thể tạo nhu cầu đưa ra Decision.

Ví dụ:

```text
Constraint:

Team chỉ có một developer.
```

Decision:

```text
Use Modular Monolith instead of Microservices.
```

Quan hệ:

```text
Constraint
    ↓ motivates
Decision
```

---

# Quan hệ với Business

Business Decision có thể ảnh hưởng:

```text
business rules
policies
goals
processes
constraints
```

Ví dụ:

```text
DEC-030

Require human approval
for all refund requests over $10,000.
```

Affected entities:

```text
Business Rule
Process
Product Requirement
UI
Implementation
```

Một Business Decision có thể tạo thay đổi xuyên nhiều layer.

---

# Quan hệ với Product

Product Decision có thể ảnh hưởng:

```text
capabilities
use cases
features
requirements
release scope
```

Ví dụ:

```text
DEC-041

Offline mode is not included in Phase A.
```

Affected entities:

```text
Feature
NFR
UI Flow
Architecture
Technical
```

---

# Quan hệ với UI

UI Decision có thể liên quan:

```text
navigation model
interaction model
design system
accessibility strategy
platform behavior
```

Ví dụ:

```text
DEC-052

Use task-based navigation
instead of module-based navigation.
```

Affected entities:

```text
User Flow
Navigation
Screen
Feature
```

---

# Quan hệ với Domain

Domain Decision có thể ảnh hưởng:

```text
concept boundary
aggregate boundary
identity
lifecycle
invariant
ownership
```

Ví dụ:

```text
DEC-061

Coupon redemption is owned by Coupon domain,
not Order domain.
```

Affected entities:

```text
Domain Entity
Business Rule
Module Boundary
Implementation
```

---

# Quan hệ với Architecture

Architecture là nguồn Decision rất phổ biến.

Ví dụ:

```text
Choose Modular Monolith.

Separate canonical state from workflow state.

Allow shared graph infrastructure.

Keep module behavior ownership strict.
```

Relation:

```text
Decision
    ↓ affects
Architecture Entity
```

Không nên nhét toàn bộ decision reasoning vào architecture entity.

Architecture entity có thể chỉ ghi:

```yaml
decision_basis:
  - DEC-021
```

---

# Quan hệ với Technical

Technical Decision có thể liên quan:

```text
database
protocol
framework
message broker
cache
security mechanism
execution engine
```

Ví dụ:

```text
DEC-071

Use PostgreSQL full-text search
before introducing Elasticsearch.
```

Affected:

```text
Technical Search
Implementation
Operation
Quality
```

---

# Quan hệ với Implementation

Implementation Decision có thể liên quan:

```text
source organization
public API
coding rule
migration strategy
integration pattern
```

Ví dụ:

```text
DEC-081

Modules expose only one public entry point.
```

Affected:

```text
Source Organization
Contract
Dependency Rule
Code Review
```

Không tạo Decision cho từng class.

Chỉ tạo khi lựa chọn có ảnh hưởng đáng kể.

---

# Quan hệ với Quality

Quality Decision có thể liên quan:

```text
test strategy
review requirement
risk acceptance
quality gate
release condition
```

Ví dụ:

```text
DEC-091

Critical architecture changes require
independent Agent review and human approval.
```

Affected:

```text
Assurance
Release Readiness
Architecture Change Process
```

---

# Quan hệ với Operation

Operation Decision có thể liên quan:

```text
deployment strategy
monitoring strategy
recovery model
incident process
capacity policy
maintenance policy
```

Ví dụ:

```text
DEC-101

Production database backup
must support point-in-time recovery.
```

Affected:

```text
Recovery
Runtime
Technical Persistence
Quality Objective
```

---

# Mô hình tổ chức Decision

Mỗi Decision là một entity instance.

```text
10-decisions/
└── decisions/
    └── DEC-001-use-postgresql/
        └── README.md
```

Không cần chia Decision theo concern trước.

Metadata của Decision xác định scope.

Ví dụ:

```yaml
id: DEC-001
status: accepted

affected_layers:
  - architecture
  - technical
  - implementation

theory_basis:
  - TH-STATE-01

affected_entities:
  - ARCH-STATE-001
  - TECH-DB-001
  - IMPL-REPO-001
```

---

# Cấu trúc Decision đề xuất

```md
# DEC-XXX — Title

## Status

## Decision

## Context

## Theory Basis

## Affected Layers

## Affected Entities

## Alternatives Considered

## Consequences

## Review Triggers
```

Không bắt buộc mọi Decision phải có toàn bộ section.

Decision nhỏ có thể ngắn hơn.

---

# Status

Status tối thiểu:

```text
proposed
accepted
rejected
deprecated
superseded
```

Ý nghĩa:

```text
proposed
→ đang được cân nhắc

accepted
→ hiện đang có hiệu lực

rejected
→ đã xem xét nhưng không chọn

deprecated
→ vẫn còn tồn tại nhưng không nên dùng cho lựa chọn mới

superseded
→ đã bị decision khác thay thế
```

---

# Alternatives Considered

Không cần ghi mọi ý tưởng đã xuất hiện.

Chỉ ghi alternative thực sự được cân nhắc.

Ví dụ:

```text
Option A
→ PostgreSQL only

Option B
→ PostgreSQL + Neo4j

Option C
→ Neo4j only
```

Mỗi alternative nên có:

```text
benefit
cost
risk
reason not selected
```

---

# Consequences

Decision phải ghi cả:

```text
positive consequences
negative consequences
```

Không chỉ ghi lợi ích.

Ví dụ:

```text
Positive:

- giảm operational complexity;
- một source of truth;
- dễ transaction.

Negative:

- graph traversal có giới hạn;
- schema relational phức tạp hơn;
- có thể phải migrate sau này.
```

Decision tốt phải làm trade-off rõ ràng.

---

# Review Triggers

Không phải Decision nào cũng cần review date cố định.

Có thể dùng trigger.

Ví dụ:

```text
Review when:

- system exceeds 10 million graph edges;
- query latency exceeds target;
- graph traversal depth increases significantly.
```

Trigger thường hữu ích hơn:

```text
review in 6 months
```

---

# Relation giữa các Decision

Decision có thể liên kết với Decision khác.

Ví dụ:

```text
DEC-001
    --superseded_by-->
DEC-014
```

```text
DEC-020
    --depends_on-->
DEC-003
```

```text
DEC-021
    --conflicts_with-->
DEC-011
```

```text
DEC-030
    --refines-->
DEC-005
```

Relation cụ thể phải được định nghĩa trong:

```text
docs/meta/relation-types/
docs/meta/rules/
```

---

# Decision và Alternative

Một Alternative có thể liên kết:

```text
ALT-001
    --considered_by-->
DEC-001
```

Một Decision có thể có nhiều Alternative.

```text
DEC-001
├── ALT-001
├── ALT-002
└── ALT-003
```

Không bắt buộc Alternative phải là folder riêng nếu rất ngắn.

Có thể ghi trực tiếp trong Decision.

Folder `alternatives/` dành cho phương án đủ lớn để có knowledge riêng.

---

# Decision và Supersession

Khi Decision bị thay thế:

```text
DEC-001
    ↓ superseded_by
DEC-019
```

Quy trình:

```text
1. Tạo Decision mới.

2. Decision mới reference Decision cũ.

3. Decision cũ đổi status thành superseded.

4. Decision cũ ghi superseded_by.

5. Impact review các entity bị ảnh hưởng.

6. Move hoặc index vào superseded/.
```

Không sửa lịch sử để làm Decision cũ trông như chưa từng tồn tại.

---

# Decision và Impact Analysis

Decision có thể ảnh hưởng nhiều entity.

Ví dụ:

```text
DEC-021
    ↓ affects

BR-003
FE-010
ARCH-MOD-004
TECH-API-002
IMPL-ADP-006
OPS-RUN-003
```

Khi Decision thay đổi:

```text
Decision
    ↓
Impact Analysis
    ↓
Affected Entities
    ↓
Review / Update
```

Stable ID giúp Agent search toàn repo.

Không bắt buộc cần Graph DB.

Có thể dùng:

```text
repository search
+
stable IDs
```

---

# Agent Reading Strategy

Agent không đọc toàn bộ Decision history.

Task bình thường:

```text
1. Đọc entity liên quan.

2. Đọc decision_basis.

3. Mở Decision được reference.

4. Chỉ mở Alternative nếu cần hiểu trade-off.

5. Chỉ mở superseded Decision nếu cần history.
```

Ví dụ:

```text
Task:
Change canonical state architecture.

Agent reads:

ARCH-STATE-001
    ↓
DEC-001
    ↓
related Theory

Only if needed:
superseded decisions
alternatives
```

---

# Agent Decision Review

Khi review một Decision, Agent nên kiểm tra:

```text
Decision có rõ không?

Context có đủ không?

Theory Basis có phù hợp không?

Affected entities có đầy đủ không?

Alternative quan trọng có bị bỏ qua không?

Negative consequence có được ghi không?

Có conflict với Decision khác không?

Có conflict với Theory không?

Có cần impact review không?
```

---

# Agent Decision Creation

Agent có thể tạo Draft Decision.

Nhưng với decision quan trọng:

```text
Agent
    ↓
Draft
    ↓
Review
    ↓
Human Approval
    ↓
Accepted
```

Không nên mặc định cho Agent tự chấp nhận các decision có impact lớn.

Mức approval có thể phụ thuộc:

```text
impact
reversibility
risk
affected layers
```

---

# Decision Scope

Một Decision có thể có scope:

```text
project-wide
layer
subsystem
module
feature
release
temporary
```

Ví dụ:

```yaml
scope: project-wide
```

hoặc:

```yaml
scope:
  type: module
  target: MOD-003
```

Scope giúp Agent không áp dụng Decision quá rộng.

---

# Temporary Decision

Một số Decision chỉ có hiệu lực tạm thời.

Ví dụ:

```text
Use polling during Phase A.
```

Có thể ghi:

```yaml
temporary: true
expires_when:
  - realtime requirement becomes mandatory
```

Temporary Decision vẫn nên được lưu nếu nó tạo trade-off đáng kể.

---

# Rejected Decision

Một Decision proposal bị rejected vẫn có thể đáng lưu.

Ví dụ:

```text
DEC-044

Proposal:
Move to microservices.

Status:
rejected
```

Lý do giữ:

```text
tránh lặp lại cùng một cuộc tranh luận
```

Nhưng không cần giữ mọi proposal nhỏ.

---

# Decision Quality

Một Decision tốt phải có:

```text
clear choice
clear context
clear consequence
clear scope
```

Decision kém:

```text
Use PostgreSQL because it is good.
```

Decision tốt:

```text
Use PostgreSQL as canonical knowledge store
because current consistency and relational requirements
are stronger than graph traversal requirements.

Accept reduced native graph capability
in exchange for simpler transactions and operations.
```

---

# Anti-patterns

## Decision as Meeting Notes

Không:

```text
A nói...
B nói...
Sau đó mọi người đồng ý...
```

Chỉ giữ thông tin cần thiết cho project knowledge.

---

## Decision Without Context

Không:

```text
Use Kafka.
```

Cần biết:

```text
vấn đề gì
tại sao
trade-off gì
```

---

## Decision Without Consequence

Không chỉ ghi:

```text
Selected Option A.
```

Cần ghi:

```text
chúng ta nhận được gì
chúng ta mất gì
```

---

## Decision Duplicate

Không tạo nhiều Decision cho cùng một lựa chọn mà không có relation rõ.

Dùng:

```text
refines
supersedes
depends_on
```

---

## Hidden Decision

Không để quyết định quan trọng chỉ tồn tại trong:

```text
chat
code comment
commit message
pull request
```

Nếu decision có giá trị lâu dài, đưa vào `10-decisions/`.

---

## Decision as Theory

Không viết:

```text
All good systems should use PostgreSQL.
```

Đó không phải Decision của app.

Decision phải có context cụ thể.

---

# Quan hệ giữa các phần

```text
Theory
    ↓
Decision
    ↓
App Entities
    ↓
Implementation
    ↓
Operation Reality
    ↓
New Decision
```

Project evolution có thể tạo vòng lặp:

```text
Decision
    ↓
Implementation
    ↓
Operation
    ↓
Observed Problem
    ↓
New Evidence
    ↓
Decision Review
    ↓
Keep / Refine / Supersede
```

---

# Nguyên tắc

## Decision là cross-layer

Không ép Decision vào một layer duy nhất.

---

## Decision phải giải thích Why

Git giữ:

```text
what changed
```

Decision giữ:

```text
why changed
```

---

## Decision có thể dùng Theory

Dùng:

```text
Theory ID
+
Context
+
Choice
+
Trade-off
```

---

## Decision phải trace được impact

Một Decision quan trọng nên biết:

```text
ảnh hưởng layer nào
ảnh hưởng entity nào
```

---

## Không tạo Decision cho mọi thay đổi

Chỉ tạo khi knowledge có giá trị lâu dài.

---

## Không xóa Decision cũ

Dùng:

```text
superseded
deprecated
rejected
```

để giữ lịch sử reasoning.

---

## Alternative không phải bắt buộc

Chỉ lưu alternative có giá trị.

---

## Accepted Decision có hiệu lực

Entity và Agent phải tuân theo Decision đang accepted trong scope tương ứng.

---

## Superseded Decision không còn hiệu lực

Nhưng vẫn giữ để giải thích lịch sử.

---

## Decision có thể challenge Theory

Nếu project reality không còn phù hợp Theory:

```text
Decision Review
    ↓
Theory Challenge
```

Không âm thầm tạo rule trái với Theory.

---

# Tóm tắt

```text
10-decisions/
├── decisions/
│   → các quyết định đang được đề xuất hoặc có hiệu lực
│
├── alternatives/
│   → các phương án đáng lưu nhưng không được chọn
│
└── superseded/
    → các quyết định không còn hiệu lực nhưng cần giữ lịch sử
```

Mỗi Decision nên trả lời:

```text
What?
Why?
Context?
Theory Basis?
Alternatives?
Trade-offs?
Affected Entities?
Review Triggers?
```

Mô hình tổng quát:

```text
                     Theory
                        │
                        ▼
                      Context
                        │
                        ▼
                   Alternatives
                        │
                        ▼
                     Decision
                  ┌─────┼─────┐
                  ▼     ▼     ▼
              Business Architecture Technical
                  │     │     │
                  └─────┼─────┘
                        ▼
                 Implementation
                        │
                        ▼
                    Operation
                        │
                        ▼
                 Observed Reality
                        │
                        ▼
                 Decision Review
                  ┌─────┼─────┐
                  ▼     ▼     ▼
                 Keep Refine Supersede
```