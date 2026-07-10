# 08 - Quality

`08-quality/` mô tả cách project xác định, kiểm tra và duy trì chất lượng của sản phẩm.

Layer này trả lời:

- chất lượng nào quan trọng;
- làm sao biết hệ thống được xây đúng;
- làm sao biết hệ thống giải quyết đúng nhu cầu;
- review, control, risk, defect và release gate nào cần tồn tại.

## Covered Universal Concerns

- `01-objectives/`
- `02-verification/`
- `03-validation/`
- `04-assurance/`
- `05-risks/`
- `06-defects/`
- `07-maintainability/`
- `08-release-readiness/`

## Generic Entity-Type Taxonomy

Các entity type dưới từng concern là vocabulary generic tái dùng được, không phụ thuộc methodology cụ thể.

Chúng là stable template/reference; type, relation slot và valid triple active thuộc `docs/meta/` của từng project.

## Universal Boundary

Quality không chỉ là testing. Layer này có thể đánh giá mọi layer khác, nhưng không thay thế:

- product scope;
- business decision;
- operation runbook;
- implementation diff.

## Concern Guide

| Concern | Trả lời | Không chứa |
| --- | --- | --- |
| `01-objectives/` | Quality attribute, target, tolerance, measurement và priority nào quan trọng. | Product feature scope. |
| `02-verification/` | Automated/manual check nào xác nhận hệ thống được xây đúng theo spec/design. | Test implementation code dài. |
| `03-validation/` | Acceptance, usability, business validation hoặc user validation nào xác nhận đúng nhu cầu. | Business process gốc. |
| `04-assurance/` | Review, audit, gate, sign-off hoặc control nào giữ chất lượng ổn định. | Business policy nếu không phải quality control. |
| `05-risks/` | Quality risk, mitigation, likelihood, impact và owner nào đang tồn tại. | Incident record vận hành cụ thể. |
| `06-defects/` | Known issue, regression, production defect hoặc defect lifecycle được quản lý thế nào. | Feature planning thông thường. |
| `07-maintainability/` | Debt, code/docs health, long-term maintainability và upkeep risk. | Refactor diff cụ thể. |
| `08-release-readiness/` | Go/no-go, release gate, readiness evidence và blocking issue trước release. | Deployment runbook chi tiết. |

## Entity Type Rule

Project tự định nghĩa entity type cụ thể bên trong từng concern, ví dụ:

- `02-verification/unit-tests/`
- `02-verification/architecture-tests/`
- `03-validation/acceptance-tests/`
- `05-risks/risk-records/`
- `08-release-readiness/release-gates/`
