# 01 — Business

## Mục đích

`01-business/` mô tả business reality mà sản phẩm cần hiểu và phục vụ.

Layer này trả lời:

- Business đang gặp vấn đề gì?
- Business muốn đạt kết quả gì?
- Ai tham gia?
- Business hoạt động thế nào?
- Những rule và policy nào chi phối?
- Business success được đo bằng gì?

Business không mô tả chi tiết:

```text
feature cụ thể
screen
domain model
architecture
technical mechanism
source code
```

Business mô tả:

```text
problem
goal
stakeholder
process
scenario
rule
policy
constraint
metric
success criteria
```

---

# Cấu trúc

`01-business/` dùng mô hình:

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
01-business/
├── README.md
├── discovery/
├── direction/
├── organization/
├── behavior/
├── governance/
└── measurement/
```

Trong đó:

```text
discovery
direction
organization
behavior
governance
measurement
```

là các Concern.

Ví dụ:

```text
01-business/
└── behavior/
    └── processes/
        └── PROC-001-order-fulfillment/
            └── README.md
```

Trong đó:

```text
01-business
= Layer

behavior
= Concern

processes
= Entity Type

PROC-001-order-fulfillment
= Entity Instance
```

---

# 1. Discovery

## Mục đích

`discovery/` quản lý những vấn đề business cần được hiểu trước khi xác định solution.

Concern này trả lời:

- Business đang gặp vấn đề gì?
- Vấn đề xảy ra ở đâu?
- Ai bị ảnh hưởng?
- Hậu quả là gì?
- Nguyên nhân nào đã biết?
- Bằng chứng nào đang tồn tại?

Entity Type phổ biến:

```text
problems/
pain-points/
opportunities/
```

Ví dụ:

```text
discovery/
└── problems/
    └── PROB-001-manual-reconciliation/
        └── README.md
```

Một Problem có thể mô tả:

```text
statement
affected stakeholders
current impact
evidence
known causes
frequency
severity
related processes
status
```

Problem phải mô tả business reality.

Không viết:

```text
Hệ thống chưa có dashboard.
```

nếu chưa chứng minh việc thiếu dashboard là business problem.

Nên viết:

```text
Managers không thể theo dõi cash flow kịp thời,
dẫn đến quyết định chậm và sai lệch.
```

---

# 2. Direction

## Mục đích

`direction/` quản lý những kết quả business muốn đạt tới.

Concern này trả lời:

- Business muốn thay đổi điều gì?
- Kết quả mong muốn là gì?
- Ưu tiên nào quan trọng?
- Điều gì được coi là tiến bộ?

Entity Type phổ biến:

```text
goals/
objectives/
outcomes/
priorities/
```

Ví dụ:

```text
direction/
└── goals/
    └── GOAL-001-reduce-reconciliation-time/
        └── README.md
```

Một Goal có thể mô tả:

```text
statement
reason
priority
target outcome
related problems
time horizon
owner
status
```

Phân biệt:

```text
Problem
→ điều không ổn hiện tại

Goal
→ điều business muốn đạt được
```

Goal không phải Feature.

Không viết:

```text
Xây dashboard tài chính.
```

Nên viết:

```text
Rút ngắn thời gian phát hiện sai lệch dòng tiền.
```

---

# 3. Organization

## Mục đích

`organization/` quản lý các bên tham gia business và trách nhiệm của họ.

Concern này trả lời:

- Ai tham gia?
- Ai bị ảnh hưởng?
- Ai quyết định?
- Ai chịu trách nhiệm?
- Ai cung cấp hoặc nhận giá trị?

Entity Type phổ biến:

```text
stakeholders/
business-roles/
organizations/
teams/
```

Ví dụ:

```text
organization/
└── stakeholders/
    └── STK-001-finance-manager/
        └── README.md
```

Một Stakeholder có thể mô tả:

```text
name
type
role
interests
responsibilities
pain points
authority
affected processes
related goals
```

Phân biệt:

```text
Stakeholder
→ một bên có lợi ích hoặc ảnh hưởng

Business Role
→ vai trò thực hiện trách nhiệm trong business
```

Một stakeholder có thể giữ nhiều role.

Một role cũng có thể được nhiều stakeholder đảm nhiệm.

---

# 4. Behavior

## Mục đích

`behavior/` quản lý cách business thực sự vận hành.

Concern này trả lời:

- Business làm gì?
- Điều gì kích hoạt hoạt động?
- Các bước diễn ra thế nào?
- Ai tham gia?
- Kết quả là gì?
- Nhiều process liên kết thành hành trình end-to-end ra sao?

Entity Type phổ biến:

```text
processes/
scenarios/
```

Ví dụ:

```text
behavior/
├── processes/
│   └── PROC-001-order-fulfillment/
│       └── README.md
│
└── scenarios/
    └── SCN-001-order-to-cash/
        └── README.md
```

---

## Process

Process là một đơn vị hành vi nghiệp vụ.

Một Process thường có:

```text
trigger
participants
inputs
steps
decisions
outputs
outcomes
rules
exceptions
related processes
```

Ví dụ:

```text
PROC-001 — Order Fulfillment
```

Process không mô tả technical implementation.

Không viết:

```text
API gọi service rồi lưu PostgreSQL.
```

Nên viết:

```text
Sau khi đơn hàng được xác nhận,
business kiểm tra khả năng thực hiện,
chuẩn bị hàng và hoàn tất giao hàng.
```

---

## Scenario

Scenario mô tả một luồng end-to-end kết hợp nhiều Process.

Ví dụ:

```text
SCN-001 — Order to Cash
```

Có thể bao gồm:

```text
PROC-001 Order Capture
PROC-002 Fulfillment
PROC-003 Payment Settlement
PROC-004 Revenue Recognition
```

Phân biệt:

```text
Process
= một đơn vị hành vi business

Scenario
= một composition end-to-end của nhiều Process
```

Không tạo `BusinessFlow` như canonical Entity Type nếu meaning đã được Process hoặc Scenario bao phủ.

Flow diagram chỉ là view.

---

# 5. Governance

## Mục đích

`governance/` quản lý những điều kiểm soát và ràng buộc business behavior.

Concern này trả lời:

- Điều gì bắt buộc phải đúng?
- Ai được phép làm gì?
- Business phải tuân theo policy nào?
- Điều kiện nào giới hạn hoạt động?
- Exception nào được cho phép?

Entity Type phổ biến:

```text
business-rules/
policies/
business-constraints/
```

Ví dụ:

```text
governance/
├── business-rules/
│   └── BRULE-001-credit-limit/
│       └── README.md
│
├── policies/
│   └── POL-001-refund-policy/
│       └── README.md
│
└── business-constraints/
    └── BCON-001-regulatory-reporting/
        └── README.md
```

---

## Business Rule

Business Rule là rule có thể được đánh giá đúng hoặc sai.

Ví dụ:

```text
Một đơn hàng vượt credit limit
phải được phê duyệt trước khi xác nhận.
```

Một Business Rule có thể mô tả:

```text
statement
condition
outcome
scope
owner
exceptions
affected processes
status
```

---

## Policy

Policy là định hướng hoặc chính sách quản trị.

Ví dụ:

```text
Refund trên một mức nhất định
cần manager approval.
```

Policy thường rộng hơn một rule riêng lẻ.

Một Policy có thể sinh ra nhiều Business Rule.

---

## Business Constraint

Business Constraint là giới hạn riêng của business.

Ví dụ:

```text
Báo cáo tài chính phải tuân thủ quy định hiện hành.
```

Phân biệt:

```text
Context Constraint
→ giới hạn chung của toàn project

Business Constraint
→ giới hạn riêng của business operation
```

---

# 6. Measurement

## Mục đích

`measurement/` quản lý cách business đánh giá hiện trạng và kết quả.

Concern này trả lời:

- Business đo điều gì?
- Hiệu suất hiện tại là bao nhiêu?
- Khi nào Goal được coi là đạt?
- Success được xác nhận bằng tiêu chí nào?

Entity Type phổ biến:

```text
metrics/
success-criteria/
```

Ví dụ:

```text
measurement/
├── metrics/
│   └── METRIC-001-reconciliation-time/
│       └── README.md
│
└── success-criteria/
    └── SC-001-reconciliation-target/
        └── README.md
```

---

## Metric

Metric là đại lượng được đo.

Ví dụ:

```text
Average reconciliation time
```

Một Metric có thể mô tả:

```text
name
definition
calculation
unit
source
frequency
owner
baseline
```

---

## Success Criterion

Success Criterion là điều kiện dùng để xác định một kết quả đã đạt hay chưa.

Ví dụ:

```text
90% daily reconciliation
hoàn thành trước 10:00 sáng ngày kế tiếp.
```

Phân biệt:

```text
Metric
→ đo cái gì

Success Criterion
→ mức nào được coi là thành công
```

---

# Quan hệ giữa các Concern

Các Concern không phải pipeline cứng.

Quan hệ phổ biến:

```text
Problem
    ↓ motivates
Goal
```

```text
Stakeholder
    ↓ participates_in
Process
```

```text
Business Rule
    ↓ governs
Process
```

```text
Policy
    ↓ establishes
Business Rule
```

```text
Business Constraint
    ↓ constrains
Process
```

```text
Metric
    ↓ measures
Goal / Process
```

```text
Success Criterion
    ↓ evaluates
Goal
```

Mô hình khái quát:

```text
Discovery
    ↓
Direction

Organization
    ↓
Behavior

Governance
    ↓
Behavior

Measurement
    ↓
Direction + Behavior
```

Đây là relation knowledge, không phải thứ tự folder bắt buộc.

---

# Quan hệ với Context

Business nhận bối cảnh từ `00-context/`.

Ví dụ:

```text
Scope
    --constrains-->
Business Goal
```

```text
Assumption
    --influences-->
Business Analysis
```

```text
External System
    --participates_in-->
Business Process
```

```text
Context Constraint
    --constrains-->
Business Operation
```

Business không copy lại Context.

Chỉ reference entity liên quan.

---

# Quan hệ với Product

Business định nghĩa:

```text
why
what business needs
what outcome matters
```

Product định nghĩa:

```text
what product must provide
```

Quan hệ điển hình:

```text
Problem
    ↓ addressed_by
Business Requirement
```

```text
Goal
    ↓ supported_by
Capability
```

```text
Process
    ↓ supported_by
Use Case
```

```text
Business Rule
    ↓ realized_by
Product Requirement
```

Không ép tất cả relation thành một pipeline duy nhất.

---

# Quan hệ với UI

Business có thể ảnh hưởng UI thông qua:

```text
Stakeholder
Business Role
Process
Scenario
```

Ví dụ:

```text
Business Role
    --represented_by-->
Persona
```

```text
Process
    --supported_by-->
User Flow
```

Business không định nghĩa Screen.

---

# Quan hệ với Domain

Business cung cấp input quan trọng cho Domain.

Ví dụ:

```text
Business Concept
    ↓ refined_into
Domain Concept
```

```text
Business Rule
    ↓ enforced_by
Domain Invariant
```

```text
Business Process
    ↓ uses
Domain Concept
```

Business không định nghĩa Entity, Aggregate hoặc Value Object.

---

# Quan hệ với Architecture

Business ảnh hưởng:

```text
boundary
responsibility
critical flow
business ownership
```

Ví dụ:

```text
Business Capability
    ↓ realized_by
Architecture Unit
```

```text
Business Constraint
    ↓ constrains
Architecture
```

---

# Quan hệ với Quality

Business tạo input cho Quality.

Ví dụ:

```text
Success Criterion
    ↓ validated_by
Validation
```

```text
Business Rule
    ↓ verified_by
Verification
```

```text
Business Risk
    ↓ influences
Quality Risk
```

---

# Quan hệ với Decisions

Business reality thường tạo ra Decision.

Ví dụ:

```text
Business Constraint
    --motivates-->
Decision
```

```text
Goal Conflict
    --motivates-->
Decision
```

```text
Policy
    --constrains-->
Decision
```

Decision nên reference Business Entity liên quan thay vì copy lại toàn bộ reasoning.

---

# Quan hệ với Theory

Business Entity có thể reference Theory khi cần.

Ví dụ:

```yaml
theory_basis:
  - TH-BIZ-01
```

Theory có thể ảnh hưởng:

```text
problem framing
goal formulation
process modeling
governance design
measurement strategy
```

Không reference Theory cho mọi entity mặc định.

Chỉ dùng khi Theory thực sự ảnh hưởng đến cách mô hình hóa hoặc đánh giá entity.

---

# Nguyên tắc

## Business mô tả reality, không mô tả solution

Không viết Business Problem như Feature request.

Sai:

```text
Cần thêm dashboard.
```

Đúng:

```text
Managers không có thông tin kịp thời để theo dõi cash flow.
```

---

## Goal phải mô tả outcome

Sai:

```text
Xây hệ thống automation.
```

Đúng:

```text
Giảm thời gian xử lý reconciliation.
```

---

## Process không chứa implementation

Sai:

```text
Laravel job gọi PostgreSQL.
```

Đúng:

```text
Business kiểm tra, đối chiếu và xác nhận giao dịch.
```

---

## Business Rule phải kiểm chứng được

Một Business Rule tốt có thể trả lời:

```text
Rule có đang được tuân thủ không?
```

---

## Policy không phải Rule đơn lẻ

Một Policy có thể tạo ra nhiều Rule.

Không trộn hai khái niệm nếu chúng có lifecycle khác nhau.

---

## Metric không phải Success Criterion

```text
Metric
→ giá trị được đo

Success Criterion
→ điều kiện thành công
```

---

## Không tạo Entity Type chỉ vì có một file

Entity Type phải đại diện cho một loại knowledge có ý nghĩa và có thể có nhiều instance.

---

## Không dùng Business như nơi chứa Product Requirement

Business dừng ở:

```text
problem
goal
stakeholder
behavior
governance
measurement
```

Product bắt đầu từ:

```text
requirement
capability
use case
feature
specification
acceptance
```

---

## Business phải giữ traceability

Một chain điển hình có thể là:

```text
Problem
    ↓
Goal
    ↓
Business Requirement
    ↓
Capability
```

Nhưng relation cụ thể phải tuân theo canonical relation types trong `docs/meta/`.

---

# Tóm tắt

```text
01-business/
├── discovery/
│   → business đang gặp vấn đề hoặc cơ hội gì
│
├── direction/
│   → business muốn đạt kết quả gì
│
├── organization/
│   → ai tham gia và chịu trách nhiệm
│
├── behavior/
│   → business hoạt động thế nào
│
├── governance/
│   → rule, policy và constraint nào chi phối
│
└── measurement/
    → business đo hiện trạng và success thế nào
```

Mô hình:

```text
01-business
    ↓
Concern
    ↓
Entity Type
    ↓
Entity Instance
```