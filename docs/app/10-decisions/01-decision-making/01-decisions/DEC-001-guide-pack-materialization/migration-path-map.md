# Path Migration Map - `task_transportor`

## Phạm Vi

File này giữ provenance của `task_transportor` khi chuyển từ path cũ sang universal baseline hiện hành. Nó là local migration record, không phải guide pack, không phải taxonomy reusable và không áp dụng mặc định cho project khác.

## Path Map

| Old path | Active path | Status | Reason |
| --- | --- | --- | --- |
| `03-ui` | `03-interface` | renamed | Interface bao phủ UI, operator, API và CLI touchpoint. |
| `06-technical/03-persistence` | `06-technical/03-state-and-storage` | renamed | Bao phủ state, storage, cache, queue state và file state. |
| `06-technical/04-communication` | `06-technical/04-exchange` | renamed | Bao phủ HTTP, webhook, message, file, model và tool exchange. |
| `06-technical/06-execution` | `06-technical/06-processing` | renamed | Bao phủ processing và work execution rộng hơn worker/job runtime. |
| `07-implementation/04-data-access` | `07-implementation/04-data-handling` | renamed | Bao phủ repository, mapper, serializer, reader/writer và object/file handling. |
| `07-implementation/05-integration` | `07-implementation/05-external-boundaries` | renamed | Bao phủ mọi boundary với dependency hoặc system bên ngoài. |
| `09-operation/01-runtime` | `09-operation/01-operating-context` | renamed | Bao phủ local, device, CI, orchestrator và service runtime context. |
| `09-operation/02-deployment` | `09-operation/02-release-and-change` | renamed | Bao phủ deploy, release, rollout, publish và change control. |
| `09-operation/03-observability` | `09-operation/03-signals` | renamed | Bao phủ metrics, logs, traces, crash, audit và data-quality signal. |
| `09-operation/05-incidents` | `09-operation/05-operational-events` | renamed | Bao phủ incident, failed run, support event và abnormal production event. |
| `09-operation/06-recovery` | `09-operation/06-continuity` | renamed | Bao phủ backup, restore, rollback, retry, replay và continuity planning. |
| `09-operation/07-capacity` | `09-operation/07-resources` | renamed | Bao phủ quota, cost, storage, compute và resource limit. |
| `05-architecture/06-deployment` | `05-architecture/06-deployment` | kept | Vẫn hợp lệ ở mức architecture deployment topology. |

## Local Rule

- Tài liệu active, template mới và agent instruction của `task_transportor` dùng active path.
- Old path chỉ được nhắc trong local decision, migration provenance hoặc review của project này.
- Không tạo folder/file mới theo old path.
