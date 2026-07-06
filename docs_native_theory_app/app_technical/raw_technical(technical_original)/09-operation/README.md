# 09 — Operation

## Mục đích

`09-operation/` mô tả cách hệ thống được chạy, quan sát, duy trì và phục hồi trong môi trường thực tế.

Layer này trả lời:

- Hệ thống chạy trong môi trường nào?
- Thay đổi được đưa vào production thế nào?
- Làm sao biết hệ thống đang hoạt động ra sao?
- Làm sao duy trì reliability?
- Khi có sự cố thì xử lý thế nào?
- Khi mất dữ liệu hoặc hệ thống hỏng thì phục hồi ra sao?
- Capacity và resource được quản lý thế nào?
- Hệ thống được duy trì dài hạn như thế nào?

Operation tập trung vào:

```text
running system
+
production reality
+
operational control
```

Operation đứng sau:

```text
Architecture
    ↓
Technical
    ↓
Implementation
    ↓
Quality
    ↓
Operation
```

Nhưng Operation cũng tạo feedback ngược lại:

```text
Operation Reality
        ↓
Risk
Defect
Architecture Change
Technical Change
Theory Challenge
```

---

# Cấu trúc

```text
09-operation/
├── README.md
├── runtime/
├── deployment/
├── observability/
├── reliability/
├── incidents/
├── recovery/
├── capacity/
└── maintenance/
```

Các folder trên là các operation concern ổn định.

Project tự định nghĩa entity type cụ thể bên trong từng concern.

Ví dụ:

```text
observability/
├── dashboards/
├── alerts/
└── log-streams/
```

hoặc:

```text
runtime/
├── environments/
├── clusters/
└── service-instances/
```

Không bắt buộc mọi project phải có cùng entity type.

---

# 1. Runtime

## Mục đích

Mô tả hệ thống thực sự chạy trong môi trường nào và dưới điều kiện nào.

Trả lời:

- Có những runtime environment nào?
- Thành phần nào đang chạy?
- Runtime dependency nào tồn tại?
- Configuration nào áp dụng cho từng environment?
- Runtime topology hiện tại là gì?
- Có external dependency nào ảnh hưởng trực tiếp đến hệ thống?

Có thể chứa:

```text
environments/
runtime-config/
service-instances/
clusters/
nodes/
runtime-dependencies/
regions/
tenants/
```

Ví dụ:

```text
runtime/
├── environments/
│   ├── production/
│   └── staging/
├── runtime-dependencies/
│   └── payment-provider/
└── clusters/
    └── primary-cluster/
```

Một runtime entity có thể mô tả:

```text
purpose
environment
location
owner
dependencies
configuration source
criticality
status
```

## Phân biệt với Architecture Deployment

Architecture nói:

```text
Hệ thống cần các deployment unit nào.
```

Operation nói:

```text
Các deployment unit hiện đang chạy ở đâu.
```

Ví dụ:

```text
Architecture:

Web Application
Worker
PostgreSQL
```

Operation:

```text
Production:

3 web instances
2 workers
1 primary PostgreSQL
1 replica
```

---

# 2. Deployment

## Mục đích

Mô tả cách thay đổi được đưa vào môi trường chạy.

Trả lời:

- Code được deploy thế nào?
- Release được promote giữa các environment ra sao?
- Có rollout strategy nào?
- Khi deployment lỗi thì rollback thế nào?
- Database migration chạy ở bước nào?
- Deployment có cần approval không?

Có thể chứa:

```text
deployment-process/
release-process/
rollout/
rollback/
promotion/
migration-runbooks/
deployment-gates/
```

Ví dụ:

```text
deployment/
├── deployment-process/
│   └── production-deployment/
├── rollout/
│   └── rolling-rollout/
└── rollback/
    └── production-rollback/
```

Một deployment entity có thể mô tả:

```text
trigger
inputs
steps
preconditions
verification
rollback
owner
approval
```

## Phân biệt với Implementation Evolution

Implementation Evolution nói:

```text
Migration hoặc compatibility change được viết thế nào.
```

Operation Deployment nói:

```text
Migration hoặc compatibility change được chạy thế nào.
```

---

# 3. Observability

## Mục đích

Mô tả cách hệ thống được quan sát trong runtime.

Trả lời:

- Có thể quan sát điều gì?
- Signal nào được thu thập?
- Dashboard nào tồn tại?
- Alert nào được phát?
- Làm sao trace một request hoặc workflow?
- Làm sao phát hiện hệ thống bất thường?

Có thể chứa:

```text
logging/
metrics/
tracing/
dashboards/
alerts/
health-signals/
audit-logs/
business-observability/
```

Ví dụ:

```text
observability/
├── logging/
│   └── application-logs/
├── metrics/
│   └── api-metrics/
├── dashboards/
│   └── production-overview/
└── alerts/
    └── high-error-rate/
```

Một observability entity có thể mô tả:

```text
signal
source
collection
aggregation
retention
threshold
consumer
response
```

Ví dụ:

```text
Metric:

checkout_failure_rate
```

```text
Alert:

checkout_failure_rate > 5%
for 10 minutes
```

## Phân biệt với Technical Observability

Technical có thể định nghĩa:

```text
OpenTelemetry
structured logging
metrics exporter
```

Operation định nghĩa:

```text
dashboard nào được dùng
alert nào được theo dõi
signal nào cần phản ứng
```

---

# 4. Reliability

## Mục đích

Mô tả cách hệ thống duy trì khả năng hoạt động trong điều kiện thực tế.

Trả lời:

- Hệ thống có availability target nào?
- Failure nào được phép?
- Failure nào phải được tự động xử lý?
- Có redundancy không?
- Có health check không?
- Có circuit breaker hoặc fallback không?
- Dependency failure được xử lý thế nào?

Có thể chứa:

```text
availability/
fault-tolerance/
redundancy/
health-checks/
failover/
degradation/
dependency-failure/
service-levels/
```

Ví dụ:

```text
reliability/
├── availability/
│   └── production-availability/
├── health-checks/
│   └── application-health/
└── failover/
    └── database-failover/
```

Một reliability entity có thể mô tả:

```text
target
failure mode
detection
response
fallback
recovery
owner
```

Ví dụ:

```text
Payment Provider unavailable
        ↓
Detect timeout
        ↓
Retry
        ↓
Open circuit
        ↓
Queue payment retry
```

## Phân biệt với Quality Objective

Quality nói:

```text
Availability target = 99.9%
```

Operation Reliability nói:

```text
Làm sao duy trì và theo dõi 99.9%.
```

---

# 5. Incidents

## Mục đích

Mô tả cách xử lý sự cố trong hệ thống đang chạy.

Trả lời:

- Incident được phát hiện thế nào?
- Severity được xác định ra sao?
- Ai chịu trách nhiệm xử lý?
- Khi nào phải escalation?
- Communication được thực hiện thế nào?
- Sau incident có postmortem không?

Có thể chứa:

```text
incident-response/
severity-model/
escalation/
communications/
active-incidents/
postmortems/
incident-history/
```

Ví dụ:

```text
incidents/
├── severity-model/
├── incident-response/
└── postmortems/
    └── INC-001-payment-outage/
```

Một incident entity có thể mô tả:

```text
detected_at
impact
severity
affected entities
timeline
response
root cause
resolution
follow-up actions
```

## Incident không phải Defect

```text
Incident
→ sự kiện vận hành thực tế
```

```text
Defect
→ lỗi trong sản phẩm hoặc hệ thống
```

Một incident có thể tạo ra:

```text
Defect
Risk
Technical Debt
Architecture Change
Runbook Update
```

---

# 6. Recovery

## Mục đích

Mô tả cách hệ thống và dữ liệu được phục hồi sau failure.

Trả lời:

- Dữ liệu được backup thế nào?
- Restore được thực hiện ra sao?
- Có disaster recovery plan không?
- RPO và RTO là gì?
- Có thể phục hồi từng phần hay toàn hệ thống?
- Recovery procedure đã được test chưa?

Có thể chứa:

```text
backup/
restore/
disaster-recovery/
data-recovery/
service-recovery/
recovery-testing/
business-continuity/
```

Ví dụ:

```text
recovery/
├── backup/
│   └── database-backup/
├── restore/
│   └── database-restore/
└── disaster-recovery/
    └── region-failure/
```

Một recovery entity có thể mô tả:

```text
scope
trigger
prerequisites
procedure
validation
RPO
RTO
owner
test status
```

Ví dụ:

```text
Database failure
        ↓
Promote replica
        ↓
Verify consistency
        ↓
Restore service
```

## Phân biệt với Reliability

Reliability tập trung:

```text
Giữ hệ thống tiếp tục hoạt động.
```

Recovery tập trung:

```text
Phục hồi sau khi failure đã xảy ra.
```

---

# 7. Capacity

## Mục đích

Mô tả cách hệ thống quản lý resource, tải và tăng trưởng.

Trả lời:

- Capacity hiện tại là bao nhiêu?
- Limit nằm ở đâu?
- Khi nào cần scale?
- Scale theo chiều ngang hay chiều dọc?
- Bottleneck nào đang tồn tại?
- Cost thay đổi thế nào khi tải tăng?

Có thể chứa:

```text
scaling/
capacity-planning/
resource-limits/
load-profile/
bottlenecks/
cost-management/
quotas/
growth-planning/
```

Ví dụ:

```text
capacity/
├── scaling/
│   └── web-scaling/
├── resource-limits/
│   └── database-connections/
└── capacity-planning/
    └── annual-growth-plan/
```

Một capacity entity có thể mô tả:

```text
resource
current usage
limit
growth rate
threshold
scaling strategy
cost impact
```

Ví dụ:

```text
Database Connections

Current:
200

Threshold:
350

Maximum:
500
```

## Quan hệ với Quality

Quality có thể định nghĩa:

```text
Performance target
```

Operation Capacity theo dõi:

```text
Runtime resource có đủ để đạt target không.
```

---

# 8. Maintenance

## Mục đích

Mô tả cách hệ thống được duy trì trong thời gian dài.

Trả lời:

- Dependency được nâng cấp thế nào?
- Runtime được patch thế nào?
- Data maintenance được thực hiện ra sao?
- Scheduled maintenance được quản lý thế nào?
- Thành phần cũ được decommission thế nào?
- Certificate, key hoặc secret được rotate thế nào?

Có thể chứa:

```text
upgrades/
dependency-maintenance/
runtime-maintenance/
data-maintenance/
scheduled-maintenance/
rotation/
decommissioning/
cleanup/
```

Ví dụ:

```text
maintenance/
├── upgrades/
│   └── postgresql-upgrade/
├── scheduled-maintenance/
│   └── monthly-maintenance/
└── decommissioning/
    └── legacy-api-removal/
```

Một maintenance entity có thể mô tả:

```text
scope
schedule
owner
procedure
impact
verification
rollback
```

Maintenance không chỉ là sửa lỗi.

Nó bao gồm:

```text
preventive maintenance
planned maintenance
lifecycle maintenance
```

---

# Quan hệ với các layer khác

## Theory → Operation

Operation entity có thể tham chiếu trực tiếp tới Theory.

Ví dụ:

```yaml
theory_basis:
  - TH-REL-01
  - TH-OBS-02
```

Luồng:

```text
Theory
   ↓
Operational Principle
   ↓
Runbook / Alert / Recovery Rule
```

Ví dụ:

```text
Theory:

Failure must be observable before it can be managed.
```

Operation:

```text
Every critical asynchronous workflow
MUST expose failure metrics.
```

---

## Context → Operation

Context cung cấp:

- environment;
- geographic constraint;
- organization;
- external dependency;
- operating assumption.

Ví dụ:

```text
Context:

System operates only in Japan.
```

Operation:

```text
Primary runtime region:
Tokyo
```

---

## Business → Operation

Business có thể tạo ra:

- operating hours;
- critical periods;
- support requirement;
- regulatory requirement;
- continuity requirement.

Ví dụ:

```text
Business Process runs 24/7
        ↓
Operational availability requirement
```

---

## Product → Operation

Product có thể tạo ra:

- usage pattern;
- peak period;
- user-facing reliability expectation;
- release constraint.

Ví dụ:

```text
Realtime notification feature
        ↓
Runtime monitoring
        ↓
Delivery alert
```

---

## UI → Operation

UI có thể ảnh hưởng đến Operation thông qua:

```text
client error monitoring
frontend performance
availability
CDN behavior
mobile crash reporting
```

Ví dụ:

```text
Screen
    ↓ observed_by
Frontend Error Dashboard
```

---

## Architecture → Operation

Architecture tạo ra cấu trúc cần được vận hành.

Ví dụ:

```text
Architecture:

Web App
Worker
Database
Cache
```

Operation:

```text
runtime instances
health checks
deployment process
monitoring
recovery
```

Architecture Deployment mô tả:

```text
cần chạy cái gì
```

Operation Runtime mô tả:

```text
đang chạy cái gì
```

---

## Technical → Operation

Technical cung cấp thông tin về:

```text
platform
communication
persistence
security
execution
configuration
performance
```

Operation dùng thông tin đó để:

```text
deploy
monitor
recover
scale
maintain
```

Ví dụ:

```text
Technical:

PostgreSQL replication
```

Operation:

```text
replication lag alert
failover procedure
replica health dashboard
```

---

## Implementation → Operation

Implementation tạo ra các runtime artifact.

Ví dụ:

```text
application binary
container image
migration
worker
scheduled job
script
```

Operation quản lý:

```text
deployment
execution
monitoring
rollback
maintenance
```

---

## Quality → Operation

Quality cung cấp:

```text
quality objectives
risks
release gates
verification results
```

Operation biến chúng thành runtime control.

Ví dụ:

```text
Quality Objective:

P95 < 500 ms
```

Operation:

```text
latency dashboard
latency alert
capacity threshold
```

Ví dụ:

```text
Operational Risk
        ↓
Runbook
```

---

## Operation → Quality

Operation tạo feedback thực tế.

Ví dụ:

```text
Incident
    ↓
Defect
```

```text
Metric Degradation
    ↓
Quality Risk
```

```text
Repeated Failure
    ↓
Technical Debt
```

Operation không chỉ nhận tài liệu từ layer trước.

Nó là nguồn evidence của system reality.

---

## Operation → Architecture

Project reality có thể buộc Architecture thay đổi.

Ví dụ:

```text
Repeated Database Bottleneck
        ↓
Architecture Review
```

```text
Service Isolation Failure
        ↓
Boundary Review
```

```text
Operational Complexity Too High
        ↓
Architecture Simplification
```

---

## Operation → Theory

Trong một số trường hợp:

```text
Project Reality
        ↓
Theory Challenge
```

Ví dụ:

```text
Theory:

Shared infrastructure is acceptable.
```

Nhưng runtime thực tế cho thấy:

```text
shared infrastructure
→ repeated cross-module outages
```

Có thể tạo:

```text
Challenge
```

cho Theory.

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
09-operation/
└── incidents/
    └── postmortems/
        └── INC-001-payment-outage/
            └── README.md
```

Hoặc:

```text
09-operation/
└── observability/
    └── alerts/
        └── ALERT-001-high-error-rate/
            └── README.md
```

Hoặc:

```text
09-operation/
└── recovery/
    └── runbooks/
        └── REC-001-database-restore/
            └── README.md
```

Không bắt buộc mọi project phải có cùng entity type.

---

# Quan hệ giữa các concern

Các concern không tạo thành pipeline cố định.

Quan hệ phổ biến:

```text
Runtime
    ↓
Observability
```

```text
Runtime
    ↓
Reliability
```

```text
Observability
    ↓
Incidents
```

```text
Incidents
    ↓
Recovery
```

```text
Runtime
    ↓
Capacity
```

```text
Deployment
    ↓
Runtime
```

```text
Maintenance
    ↓
Runtime
```

Mô hình tổng quát:

```text
                    Deployment
                        │
                        ▼
                      Runtime
                 ┌──────┼──────┐
                 ▼      ▼      ▼
          Observability Reliability Capacity
                 │      │
                 └──┬───┘
                    ▼
                 Incidents
                    │
                    ▼
                  Recovery

                 Maintenance
                    │
                    ▼
             All Runtime Concerns
```

---

# Nguyên tắc

## Operation mô tả running system

Không mô tả system chỉ ở trạng thái design.

Operation phải phản ánh:

```text
production reality
runtime state
operational procedure
observed evidence
```

---

## Không ép mọi project dùng cùng operation model

Project có thể chạy:

```text
single server
cloud platform
Kubernetes
mobile application
desktop application
serverless
embedded system
AI workflow
data pipeline
```

Concern vẫn giữ nguyên, nhưng entity type khác nhau.

---

## Concern là khung ổn định

Các concern chuẩn:

```text
runtime
deployment
observability
reliability
incidents
recovery
capacity
maintenance
```

---

## Operation entity có thể dùng Theory

Không copy Theory vào Operation.

Dùng:

```text
Theory ID
+
Project Context
+
Operational Rule
```

---

## Operation phải trace được đến system entity

Một operation entity nên trả lời được:

```text
Nó vận hành cái gì?
```

Ví dụ:

```yaml
operates:
  - ARCH-SVC-001
```

Hoặc:

```yaml
monitors:
  - TECH-QUEUE-003
```

Hoặc:

```yaml
recovers:
  - DATA-STORE-001
```

---

## Runtime Reality phải tạo được feedback

Không để operational knowledge bị cô lập.

Ví dụ:

```text
Incident
    ↓
Defect

Incident
    ↓
Risk

Incident
    ↓
Architecture Review

Incident
    ↓
Theory Challenge
```

---

## Observability phải dẫn đến action

Không tạo metric chỉ vì có thể đo.

Một signal quan trọng nên trả lời:

```text
Ai xem?
Khi nào xem?
Threshold nào?
Nếu vượt threshold thì làm gì?
```

---

## Alert phải actionable

Alert tốt:

```text
Payment failure rate > 10%
for 5 minutes

Action:
Open payment incident runbook
```

Alert kém:

```text
CPU high
```

mà không biết phải làm gì.

---

## Recovery phải được test

Runbook chưa từng được thử không nên được coi là đáng tin cậy.

Cần biết:

```text
last tested
result
known issue
owner
```

---

## Incident phải tạo knowledge

Incident quan trọng nên có:

```text
timeline
impact
root cause
resolution
follow-up
```

Không chỉ đóng incident sau khi service hoạt động lại.

---

## Capacity phải dựa trên trend

Không chỉ ghi:

```text
current usage
```

Cần quan tâm:

```text
growth
threshold
limit
time to exhaustion
```

---

## Maintenance phải có ownership

Mỗi maintenance concern quan trọng nên có:

```text
owner
schedule
trigger
verification
```

---

# Tóm tắt

```text
09-operation/
├── runtime/
│   → hệ thống thực sự đang chạy ở đâu và thế nào
│
├── deployment/
│   → thay đổi được đưa vào môi trường chạy ra sao
│
├── observability/
│   → làm sao biết hệ thống đang hoạt động thế nào
│
├── reliability/
│   → làm sao duy trì khả năng hoạt động
│
├── incidents/
│   → sự cố được phát hiện và xử lý thế nào
│
├── recovery/
│   → hệ thống và dữ liệu được phục hồi ra sao
│
├── capacity/
│   → resource và tăng trưởng được quản lý thế nào
│
└── maintenance/
    → hệ thống được duy trì lâu dài thế nào
```