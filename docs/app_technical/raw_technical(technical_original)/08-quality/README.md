# 08 — Quality

## Mục đích

`08-quality/` mô tả cách project xác định, kiểm tra và duy trì chất lượng của sản phẩm.

Layer này trả lời:

- Chất lượng nào quan trọng với project?
- Làm sao biết hệ thống được xây đúng?
- Làm sao biết hệ thống giải quyết đúng nhu cầu?
- Những review và control nào phải được thực hiện?
- Rủi ro chất lượng nào đang tồn tại?
- Defect được quản lý thế nào?
- Chất lượng dài hạn của hệ thống được theo dõi ra sao?
- Khi nào một version đủ điều kiện phát hành?

Quality không chỉ là Testing.

Quality bao gồm:

```text
quality objectives
verification
validation
assurance
risks
defects
maintainability
release readiness
```

Quality có thể kiểm tra mọi layer:

```text
Business
Product
UI
Domain
Architecture
Technical
Implementation
Operation
```

---

# Cấu trúc

```text
08-quality/
├── README.md
├── objectives/
├── verification/
├── validation/
├── assurance/
├── risks/
├── defects/
├── maintainability/
└── release-readiness/
```

Các folder trên là các quality concern ổn định.

Project tự định nghĩa entity type cụ thể bên trong từng concern.

Ví dụ:

```text
verification/
├── unit-tests/
├── integration-tests/
└── architecture-tests/
```

hoặc:

```text
validation/
├── acceptance-tests/
└── user-validation/
```

Không bắt buộc mọi project phải có cùng loại test hoặc quality process.

---

# 1. Objectives

## Mục đích

Mô tả các mục tiêu chất lượng mà project cần đạt.

Trả lời:

- Chất lượng nào quan trọng nhất?
- Mức chất lượng mong muốn là gì?
- Chất lượng nào là bắt buộc?
- Chất lượng nào có thể trade-off?
- Quality objective nào áp dụng cho toàn hệ thống?
- Objective nào chỉ áp dụng cho một phần cụ thể?

Có thể chứa:

```text
correctness/
reliability/
security/
performance/
usability/
accessibility/
maintainability/
availability/
scalability/
data-quality/
```

Ví dụ:

```text
objectives/
├── reliability/
│   └── QO-001-order-processing/
├── performance/
│   └── QO-002-search-response-time/
└── security/
    └── QO-003-admin-access/
```

Một Quality Objective nên mô tả:

```text
mục tiêu
scope
measurement
target
tolerance
priority
```

Ví dụ:

```text
QO-002

Search response time
P95 < 500 ms
under normal production load
```

## Phân biệt với NFR

NFR thuộc Product:

```text
Sản phẩm phải đạt chất lượng gì?
```

Quality Objective thuộc Quality:

```text
Chất lượng đó được quản lý và đánh giá thế nào?
```

Ví dụ:

```text
NFR-001
    ↓ measured_by
QO-002
```

---

# 2. Verification

## Mục đích

Mô tả cách kiểm tra hệ thống có được xây đúng theo specification và design hay không.

Verification trả lời:

```text
Are we building the system right?
```

Trả lời:

- Code có đúng technical design không?
- Implementation có giữ architecture boundary không?
- Contract có được thực hiện đúng không?
- Business rule có được enforce đúng không?
- Regression có được phát hiện không?

Có thể chứa:

```text
unit-tests/
integration-tests/
contract-tests/
architecture-tests/
static-analysis/
schema-validation/
property-tests/
model-evaluation/
```

Ví dụ:

```text
verification/
├── unit-tests/
├── integration-tests/
├── contract-tests/
└── static-analysis/
```

AI system có thể có:

```text
verification/
├── prompt-tests/
├── tool-use-tests/
├── agent-evaluations/
└── deterministic-checks/
```

Verification entity có thể mô tả:

```text
target
scope
method
environment
expected result
automation
```

---

# 3. Validation

## Mục đích

Mô tả cách kiểm tra sản phẩm có giải quyết đúng nhu cầu thực tế hay không.

Validation trả lời:

```text
Are we building the right system?
```

Trả lời:

- Product có đáp ứng Business Requirement không?
- Use Case có hoạt động đúng với người dùng không?
- Feature có giải quyết đúng vấn đề không?
- Acceptance Criteria có thực sự đạt không?
- User có sử dụng được sản phẩm không?

Có thể chứa:

```text
acceptance-tests/
business-validation/
user-validation/
usability-testing/
prototype-validation/
field-validation/
```

Ví dụ:

```text
validation/
├── acceptance-tests/
│   └── AT-001-complete-booking/
└── user-validation/
    └── UV-001-checkout-usability/
```

Quan hệ phổ biến:

```text
Acceptance Test
    --verifies-->
Acceptance Criterion
```

```text
User Validation
    --validates-->
Feature
```

```text
Business Validation
    --validates-->
Business Requirement
```

---

# 4. Assurance

## Mục đích

Mô tả các cơ chế kiểm soát chất lượng ngoài testing.

Trả lời:

- Ai phải review?
- Review loại gì?
- Khi nào cần human approval?
- Có security review không?
- Có architecture review không?
- Có compliance check không?
- Có quality gate nào không?

Có thể chứa:

```text
review-rules/
code-review/
architecture-review/
security-review/
product-review/
compliance/
approval-rules/
quality-gates/
audit/
```

Ví dụ:

```text
assurance/
├── review-rules/
├── architecture-review/
└── security-review/
```

Assurance có thể áp dụng cho nhiều layer.

Ví dụ:

```text
Architecture Change
    ↓
Architecture Review
```

```text
Critical Business Rule Change
    ↓
Human Approval
```

```text
Authentication Change
    ↓
Security Review
```

Assurance không thay thế Verification.

Nó bổ sung:

```text
review
approval
governance
independent checking
```

---

# 5. Risks

## Mục đích

Mô tả những yếu tố có thể làm sản phẩm hoặc hệ thống thất bại.

Trả lời:

- Điều gì có thể sai?
- Khả năng xảy ra là bao nhiêu?
- Mức ảnh hưởng là gì?
- Entity nào bị ảnh hưởng?
- Có mitigation không?
- Rủi ro đã được chấp nhận chưa?

Có thể chứa:

```text
business-risks/
product-risks/
technical-risks/
architecture-risks/
security-risks/
operational-risks/
data-risks/
ai-risks/
```

Ví dụ:

```text
risks/
├── technical-risks/
│   └── RISK-001-shared-database-coupling/
└── operational-risks/
    └── RISK-002-single-region-failure/
```

Một Risk nên mô tả:

```text
description
cause
impact
likelihood
severity
affected entities
mitigation
owner
status
```

Quan hệ phổ biến:

```text
Risk
    --threatens-->
Requirement
```

```text
Risk
    --affects-->
Architecture Entity
```

```text
Mitigation
    --reduces-->
Risk
```

Risk có thể tồn tại dù chưa có defect.

---

# 6. Defects

## Mục đích

Mô tả các lỗi đã được quan sát trong sản phẩm hoặc hệ thống.

Trả lời:

- Lỗi gì đã xảy ra?
- Expected behavior là gì?
- Actual behavior là gì?
- Lỗi ảnh hưởng entity nào?
- Root cause nằm ở đâu?
- Lỗi đã được sửa chưa?
- Có regression risk không?

Có thể chứa:

```text
known-defects/
regressions/
production-defects/
data-defects/
security-defects/
```

Ví dụ:

```text
defects/
├── known-defects/
│   └── DEF-001-duplicate-order/
└── regressions/
    └── DEF-002-login-failure/
```

Một Defect có thể mô tả:

```text
observed behavior
expected behavior
severity
affected versions
affected entities
root cause
resolution
verification
```

Phân biệt:

```text
Risk
→ vấn đề có thể xảy ra

Defect
→ vấn đề đã được quan sát
```

---

# 7. Maintainability

## Mục đích

Mô tả chất lượng dài hạn của hệ thống và khả năng thay đổi an toàn.

Trả lời:

- Technical debt nào đang tồn tại?
- Complexity có đang tăng quá mức không?
- Module nào khó thay đổi?
- Duplication nào cần xử lý?
- Dependency nào đang trở thành legacy?
- Component nào sắp obsolete?

Có thể chứa:

```text
technical-debt/
complexity/
duplication/
legacy/
obsolete-components/
dependency-health/
documentation-debt/
test-debt/
```

Ví dụ:

```text
maintainability/
├── technical-debt/
│   └── DEBT-001-shared-service/
├── complexity/
│   └── COMP-001-order-module/
└── dependency-health/
    └── DEP-001-legacy-library/
```

Một maintainability entity nên mô tả:

```text
problem
scope
impact
reason
urgency
remediation
affected entities
```

Quan hệ phổ biến:

```text
Technical Debt
    --affects-->
Implementation Entity
```

```text
Complexity Issue
    --affects-->
Module
```

```text
Documentation Debt
    --affects-->
App Entity
```

---

# 8. Release Readiness

## Mục đích

Mô tả điều kiện để một version hoặc release được phép phát hành.

Trả lời:

- Những check nào phải pass?
- Defect nào được phép còn tồn tại?
- Risk nào cần được chấp nhận?
- Test nào bắt buộc phải chạy?
- Ai có quyền approve?
- Khi nào phải dừng release?

Có thể chứa:

```text
release-checklists/
quality-gates/
go-no-go/
release-criteria/
approval-status/
exceptions/
```

Ví dụ:

```text
release-readiness/
├── release-checklists/
│   └── RELCHK-001-production-release/
└── quality-gates/
    └── QG-001-main-branch/
```

Một release gate có thể yêu cầu:

```text
all critical tests pass
no unresolved critical defects
security review complete
migration verified
rollback plan available
```

Quan hệ phổ biến:

```text
Release
    --requires-->
Quality Gate
```

```text
Quality Gate
    --checks-->
Test Result
```

```text
Quality Gate
    --blocks-->
Release
```

---

# Quan hệ với các layer khác

## Theory → Quality

Quality entity có thể tham chiếu trực tiếp tới Theory.

Ví dụ:

```yaml
theory_basis:
  - TH-TEST-01
  - TH-SEC-03
```

Luồng:

```text
Theory
   ↓
Quality Principle
   ↓
Verification / Validation / Assurance
```

Ví dụ:

```text
Theory:

High-impact decisions require independent review.
```

Quality:

```text
Critical Architecture Changes
MUST receive architecture review.
```

---

## Business → Quality

Business tạo ra:

- criticality;
- success criteria;
- regulatory risk;
- business impact.

Ví dụ:

```text
Business Goal
    ↓ measured_by
Quality Objective
```

```text
Business Rule
    ↓ verified_by
Business Validation
```

---

## Product → Quality

Product là một trong những nguồn chính của Quality.

Ví dụ:

```text
Functional Requirement
    ↓ verified_by
Test
```

```text
Acceptance Criterion
    ↓ verified_by
Acceptance Test
```

```text
NFR
    ↓ measured_by
Quality Objective
```

Quality không định nghĩa lại Product Requirement.

---

## UI → Quality

UI có thể được kiểm tra bởi:

```text
usability testing
accessibility validation
visual regression
interaction testing
```

Ví dụ:

```text
Screen
    ↓ validated_by
Usability Test
```

```text
Accessibility Requirement
    ↓ verified_by
Accessibility Check
```

---

## Domain → Quality

Domain có thể được kiểm tra bởi:

```text
invariant tests
property tests
state transition tests
domain scenario tests
```

Ví dụ:

```text
Domain Invariant
    ↓ verified_by
Property Test
```

---

## Architecture → Quality

Architecture có thể được kiểm tra bởi:

```text
architecture tests
dependency checks
boundary review
resilience validation
```

Ví dụ:

```text
Module Boundary
    ↓ verified_by
Architecture Test
```

```text
Architecture Risk
    ↓ mitigated_by
Architecture Review
```

---

## Technical → Quality

Technical design tạo ra quality concern cụ thể.

Ví dụ:

```text
Queue
    ↓
delivery reliability tests
```

```text
Cache
    ↓
consistency tests
```

```text
External API
    ↓
timeout and retry tests
```

```text
Authentication
    ↓
security tests
```

---

## Implementation → Quality

Implementation là đối tượng được kiểm tra trực tiếp nhiều nhất.

Ví dụ:

```text
Handler
    ↓ verified_by
Unit Test
```

```text
Adapter
    ↓ verified_by
Integration Test
```

```text
Coding Rule
    ↓ checked_by
Static Analysis
```

Quality không thay thế Source Code.

---

## Quality → Operation

Quality tạo ra nhiều input cho Operation.

Ví dụ:

```text
Reliability Objective
    ↓
Monitoring Requirement
```

```text
Operational Risk
    ↓
Runbook
```

```text
Performance Objective
    ↓
Production Metric
```

```text
Release Gate
    ↓
Deployment Approval
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
08-quality/
└── risks/
    └── technical-risks/
        └── RISK-001-shared-state/
            └── README.md
```

Hoặc:

```text
08-quality/
└── verification/
    └── architecture-tests/
        └── TEST-001-module-boundaries/
            └── README.md
```

Hoặc:

```text
08-quality/
└── maintainability/
    └── technical-debt/
        └── DEBT-001-legacy-query-layer/
            └── README.md
```

Không bắt buộc mọi project phải có cùng entity type.

---

# Quan hệ giữa các concern

Các concern không tạo thành pipeline cố định.

Quan hệ phổ biến:

```text
Objectives
    ↓
Verification
```

```text
Objectives
    ↓
Validation
```

```text
Risks
    ↓
Assurance
```

```text
Defects
    ↓
Verification
```

```text
Maintainability
    ↓
Risks
```

```text
Verification
Validation
Assurance
    ↓
Release Readiness
```

Mô hình tổng quát:

```text
                   Objectives
                 ┌─────┼─────┐
                 ▼     ▼     ▼
          Verification Validation Assurance
                 │     │     │
                 └─────┼─────┘
                       ▼
                Release Readiness

        Risks ───────────────┐
                             ▼
        Defects ──────── Quality Control

        Maintainability ─────┘
```

---

# Nguyên tắc

## Quality không đồng nghĩa với Testing

Testing chỉ là một phần của:

```text
verification
validation
```

Quality còn bao gồm:

```text
objectives
assurance
risks
defects
maintainability
release readiness
```

---

## Không ép mọi project dùng cùng test model

Project có thể dùng:

```text
unit tests
integration tests
model evaluation
manual validation
simulation
field testing
```

theo loại hệ thống thực tế.

---

## Concern là khung ổn định

Các concern chuẩn:

```text
objectives
verification
validation
assurance
risks
defects
maintainability
release-readiness
```

---

## Quality entity có thể dùng Theory

Không copy Theory vào Quality.

Dùng:

```text
Theory ID
+
Project Context
+
Quality Rule
```

---

## Quality phải trace được lên các layer khác

Một quality entity nên trả lời được:

```text
Nó kiểm tra hoặc bảo vệ cái gì?
```

Ví dụ:

```yaml
verifies:
  - FR-015
  - AC-004
```

Hoặc:

```yaml
affects:
  - ARCH-MOD-003
  - IMPL-ADP-002
```

---

## Risk và Defect không được trộn

```text
Risk
→ có thể xảy ra

Defect
→ đã xảy ra hoặc đã quan sát
```

---

## Verification và Validation không được trộn

```text
Verification
→ xây đúng theo spec/design chưa?

Validation
→ có xây đúng thứ cần xây không?
```

---

## Quality Objective phải đo được khi có thể

Tốt:

```text
P95 response time < 500 ms
```

Kém:

```text
System should be fast.
```

---

## Release Readiness phải dựa trên evidence

Không dùng:

```text
cảm thấy ổn
```

Nên dựa trên:

```text
test result
review result
risk acceptance
defect status
quality gate
```

---

# Tóm tắt

```text
08-quality/
├── objectives/
│   → chất lượng nào project cần đạt
│
├── verification/
│   → hệ thống có được xây đúng không
│
├── validation/
│   → có xây đúng thứ cần xây không
│
├── assurance/
│   → review, approval và quality control nào cần có
│
├── risks/
│   → điều gì có thể làm sản phẩm thất bại
│
├── defects/
│   → lỗi nào đã được quan sát
│
├── maintainability/
│   → chất lượng dài hạn được quản lý thế nào
│
└── release-readiness/
    → khi nào một version đủ điều kiện phát hành
```