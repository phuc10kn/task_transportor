# 05 — Architecture

## Mục đích

`05-architecture/` mô tả cấu trúc cấp hệ thống của ứng dụng.

Layer này trả lời:

- Hệ thống gồm những phần lớn nào?
- Ranh giới trách nhiệm nằm ở đâu?
- Các phần tương tác với nhau như thế nào?
- State được đặt ở đâu và ai sở hữu?
- Dữ liệu được sở hữu, chia sẻ và di chuyển như thế nào?
- Hệ thống được triển khai theo cấu trúc nào?
- Những concern nào ảnh hưởng xuyên suốt toàn hệ thống?

Architecture không giả định project phải sử dụng một kiểu kiến trúc cụ thể.

Project có thể là:

- monolith;
- modular monolith;
- microservices;
- mobile application;
- desktop application;
- CLI;
- AI system;
- multi-agent system;
- data pipeline;
- library;
- plugin system.

---

# Cấu trúc

```text
05-architecture/
├── README.md
├── structure/
├── boundaries/
├── interactions/
├── state/
├── data/
├── deployment/
└── cross-cutting/
```

Các folder trên là các architecture concern ổn định.

Project tự định nghĩa các entity type cụ thể bên trong từng concern.

Ví dụ:

```text
structure/
└── modules/
```

hoặc:

```text
structure/
└── services/
```

hoặc:

```text
structure/
└── agents/
```

---

# 1. Structure

## Mục đích

Mô tả các architectural unit chính của hệ thống.

Trả lời:

- Hệ thống gồm những phần nào?
- Mỗi phần có responsibility gì?
- Các phần được tổ chức theo mô hình nào?

Entity type cụ thể phụ thuộc vào project.

Ví dụ:

```text
modules/
services/
subsystems/
components/
packages/
agents/
pipelines/
plugins/
applications/
```

Ví dụ:

```text
structure/
└── modules/
    ├── MOD-001-orders/
    └── MOD-002-payments/
```

---

# 2. Boundaries

## Mục đích

Mô tả ranh giới giữa các phần của hệ thống.

Trả lời:

- Một unit sở hữu trách nhiệm gì?
- Một unit không được phép sở hữu gì?
- Dependency nào được phép?
- Dependency nào bị cấm?
- Boundary nào cần được bảo vệ?

Có thể chứa:

```text
module-boundaries/
service-boundaries/
ownership-boundaries/
trust-boundaries/
dependency-rules/
```

Boundary có thể liên quan đến:

- behavior;
- responsibility;
- data;
- state;
- dependency;
- security;
- trust.

---

# 3. Interactions

## Mục đích

Mô tả cách các architectural unit tương tác với nhau.

Trả lời:

- Ai giao tiếp với ai?
- Giao tiếp theo hướng nào?
- Đồng bộ hay bất đồng bộ?
- Dữ liệu hoặc control đi qua những phần nào?

Có thể chứa:

```text
request-flows/
event-flows/
message-flows/
integration-flows/
agent-flows/
pipeline-flows/
```

Ví dụ:

```text
Client
   ↓
Application
   ↓
Order Module
   ↓
Payment Module
   ↓
External Payment Provider
```

Interaction ở Architecture tập trung vào:

```text
architectural unit
→ architectural unit
```

Chi tiết protocol hoặc implementation thuộc `06-technical/`.

---

# 4. State

## Mục đích

Mô tả state ở cấp kiến trúc.

Trả lời:

- State nào tồn tại?
- State nằm ở đâu?
- Ai sở hữu state?
- State nào là canonical?
- State nào chỉ là temporary hoặc derived?
- State được đồng bộ như thế nào?

Có thể chứa:

```text
state-ownership/
canonical-state/
workflow-state/
session-state/
agent-state/
cache-state/
state-transitions/
consistency-models/
```

Ví dụ:

```text
PostgreSQL
→ canonical application state

Workflow Engine
→ execution state

Cache
→ derived state
```

---

# 5. Data

## Mục đích

Mô tả dữ liệu ở cấp kiến trúc.

Trả lời:

- Ai sở hữu dữ liệu?
- Dữ liệu được chia sẻ thế nào?
- Dữ liệu đi qua những boundary nào?
- Dữ liệu nào là canonical?
- Dữ liệu nào là derived?
- Dữ liệu được replicate hoặc synchronize thế nào?

Có thể chứa:

```text
data-ownership/
data-boundaries/
data-flows/
data-sharing/
replication/
synchronization/
lineage/
```

Phân biệt:

```text
Architecture Data
→ ownership
→ boundary
→ movement
→ responsibility

Technical Persistence
→ database schema
→ table
→ index
→ transaction
```

Chi tiết persistence nằm trong `06-technical/`.

---

# 6. Deployment

## Mục đích

Mô tả cấu trúc triển khai của hệ thống.

Trả lời:

- Các architectural unit chạy ở đâu?
- Unit nào được deploy cùng nhau?
- Unit nào được deploy độc lập?
- Boundary runtime nằm ở đâu?
- Hệ thống phụ thuộc vào runtime environment nào?

Có thể chứa:

```text
deployment-units/
topologies/
runtime-boundaries/
network-boundaries/
regions/
zones/
nodes/
clusters/
```

Ví dụ:

```text
Web Application
    ↓
Application Runtime
    ↓
PostgreSQL
Redis
Object Storage
```

Chi tiết deployment procedure thuộc `09-operation/`.

---

# 7. Cross-Cutting

## Mục đích

Mô tả các architecture concern ảnh hưởng đến nhiều phần của hệ thống.

Có thể bao gồm:

```text
security/
reliability/
resilience/
availability/
scalability/
observability/
privacy/
compliance/
multi-tenancy/
governance/
```

Ví dụ:

```text
Authentication
→ ảnh hưởng nhiều module

Observability
→ ảnh hưởng mọi runtime component

Multi-tenancy
→ ảnh hưởng data, state và boundaries
```

Một concern chỉ nên nằm ở đây khi nó thực sự ảnh hưởng xuyên nhiều architectural unit.

---

# Quan hệ với các layer khác

## Context → Architecture

Context cung cấp:

- phạm vi hệ thống;
- môi trường;
- external systems;
- constraint tổng quát.

```text
Context
   ↓
Architecture
```

---

## Business → Architecture

Business có thể tạo ra:

- boundary;
- ownership;
- isolation requirement;
- regulatory constraint;
- organizational constraint.

```text
Business
   ↓
Architecture
```

Architecture không định nghĩa lại business rule.

---

## Product → Architecture

Product cung cấp:

- capability;
- use case;
- feature;
- requirement.

Architecture xác định cấu trúc hệ thống cần thiết để hỗ trợ chúng.

```text
Product
   ↓
Architecture
```

---

## UI → Architecture

UI có thể ảnh hưởng đến:

- client architecture;
- interaction model;
- realtime requirement;
- offline capability;
- session model.

```text
UI
   ↓
Architecture
```

---

## Domain → Architecture

Domain có thể ảnh hưởng đến:

- module boundary;
- ownership;
- state boundary;
- dependency;
- integration.

```text
Domain
   ↓
Architecture
```

Architecture không thay thế Domain Model.

---

## Theory → Architecture

Architecture entity có thể tham chiếu trực tiếp đến Theory.

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
Architecture Rule
   ↓
Technical Design
   ↓
Implementation
```

Theory cung cấp principle.

Architecture áp dụng principle vào context cụ thể của app.

---

## Architecture → Technical

Architecture mô tả:

```text
cần có cấu trúc và boundary nào
```

Technical mô tả:

```text
dùng cơ chế và công nghệ nào để hiện thực
```

Ví dụ:

```text
Architecture:

Order Module
    ↓ async interaction
Payment Module
```

Technical:

```text
Kafka Topic
JSON Event Schema
Consumer Group
Retry Policy
```

---

## Architecture → Implementation

Architecture xác định:

- unit;
- boundary;
- dependency;
- ownership.

Implementation xác định:

- source structure;
- contract;
- class;
- package;
- adapter;
- handler.

```text
Architecture
   ↓
Technical
   ↓
Implementation
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
05-architecture/
└── structure/
    └── modules/
        └── MOD-001-orders/
            └── README.md
```

Hoặc:

```text
05-architecture/
└── interactions/
    └── event-flows/
        └── FLOW-001-order-created/
            └── README.md
```

Không bắt buộc mọi project phải có cùng entity type.

---

# Quan hệ giữa các concern

Các concern không tạo thành pipeline cố định.

Quan hệ có thể là:

```text
Structure
    ↓
Boundaries
```

```text
Structure
    ↓
Interactions
```

```text
Boundaries
    ↓
State Ownership
```

```text
Boundaries
    ↓
Data Ownership
```

```text
Structure
    ↓
Deployment
```

```text
Cross-Cutting
    ↓
All Architecture Concerns
```

Mô hình tổng quát:

```text
                    Structure
                 ┌─────┼─────┐
                 ▼     ▼     ▼
            Boundaries │ Deployment
                 │      │
          ┌──────┼──────┐
          ▼      ▼      ▼
     Interactions State Data

          Cross-Cutting
                │
                ▼
        All Architecture Concerns
```

---

# Nguyên tắc

## Architecture mô tả cấu trúc hệ thống

Không mô tả chi tiết code.

---

## Không ép entity type cố định

Project tự định nghĩa:

```text
module
service
agent
pipeline
package
plugin
```

theo kiến trúc thật.

---

## Concern là khung ổn định

Các concern chuẩn:

```text
structure
boundaries
interactions
state
data
deployment
cross-cutting
```

---

## Architecture entity có thể dùng Theory

Không copy Theory vào Architecture.

Dùng:

```text
Theory ID
+
Project Context
+
Architecture Rule
```

---

## Architecture không chứa chi tiết Technical

Architecture nói:

```text
asynchronous communication
```

Technical mới nói:

```text
Kafka
```

Architecture nói:

```text
canonical state
```

Technical mới nói:

```text
PostgreSQL
```

---

## Architecture không chứa chi tiết Implementation

Architecture nói:

```text
Order Module
```

Implementation mới nói:

```text
src/modules/orders/
```

---

# Tóm tắt

```text
05-architecture/
├── structure/
│   → hệ thống gồm những phần nào
│
├── boundaries/
│   → ranh giới và ownership nằm ở đâu
│
├── interactions/
│   → các phần tương tác thế nào
│
├── state/
│   → state nằm ở đâu và ai sở hữu
│
├── data/
│   → dữ liệu được sở hữu và di chuyển thế nào
│
├── deployment/
│   → các phần chạy ở đâu
│
└── cross-cutting/
    → concern nào ảnh hưởng toàn hệ thống
```