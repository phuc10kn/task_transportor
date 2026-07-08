# 05 - Architecture

`05-architecture/` mô tả cấu trúc cấp hệ thống của ứng dụng.

Layer này trả lời:

- hệ thống gồm những unit lớn nào;
- boundary trách nhiệm nằm ở đâu;
- các unit tương tác với nhau thế nào;
- state và data được đặt ở đâu;
- deployment topology ở mức kiến trúc được tổ chức ra sao;
- concern nào tác động xuyên suốt toàn hệ thống.

## Concern Canonical

- `01-structure/`
- `02-boundaries/`
- `03-interactions/`
- `04-state/`
- `05-data/`
- `06-deployment/`
- `07-cross-cutting/`

## Universal Boundary

Architecture không giả định project phải là một pattern cụ thể. Project có thể là monolith, modular monolith, microservices, mobile app, desktop app, CLI, AI system, data pipeline hoặc library.

`06-deployment/` ở layer này giữ deployment topology ở mức kiến trúc, không thay thế runbook vận hành trong `09-operation/`.

Layer này không giữ:

- technical protocol hoặc schema detail;
- source code organization chi tiết;
- production runbook hoặc incident response.

## Concern Guide

| Concern | Trả lời | Không chứa |
| --- | --- | --- |
| `01-structure/` | Architectural unit chính là gì và responsibility của từng unit ra sao. | Source file layout chi tiết. |
| `02-boundaries/` | Ownership, dependency, trust, data/state boundary và guardrail nào cần bảo vệ. | Business policy hoặc coding style thuần. |
| `03-interactions/` | Architectural unit tương tác theo flow nào, hướng nào, đồng bộ hay bất đồng bộ. | UI click path hoặc technical protocol detail. |
| `04-state/` | State nào tồn tại, nằm ở đâu, ai sở hữu, state nào canonical hoặc derived. | Database schema hoặc migration file. |
| `05-data/` | Data ownership, data flow, canonical data và sharing rule ở mức architecture. | Field-level implementation mapping dài. |
| `06-deployment/` | Deployment unit, distribution topology và architecture-level runtime shape. | Step-by-step deploy/release runbook. |
| `07-cross-cutting/` | Architecture rule hoặc concern ảnh hưởng nhiều unit/layer. | Generic theory không gắn app. |

## Entity Type Rule

Project tự định nghĩa entity type cụ thể bên trong từng concern, ví dụ:

- `01-structure/modules/`
- `01-structure/services/`
- `01-structure/agents/`
- `03-interactions/request-flows/`
- `04-state/state-owners/`
- `07-cross-cutting/security-rules/`
