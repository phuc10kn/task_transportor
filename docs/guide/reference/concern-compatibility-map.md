# Concern Compatibility Map

File này là bảng dịch lịch sử từ path cũ sang canonical path mới.

Old path trong file này là historical alias, không phải path active song song.

## Path Map

| Old path | New path | Status | Reason |
| --- | --- | --- | --- |
| `03-ui` | `03-interface` | renamed | Interface universal hơn UI và bao phủ cả operator/API/CLI touchpoint. |
| `06-technical/03-persistence` | `06-technical/03-state-and-storage` | renamed | Bao phủ state, storage, cache, queue state và file state chứ không chỉ persistence/database. |
| `06-technical/04-communication` | `06-technical/04-exchange` | renamed | Bao phủ HTTP, webhook, message, file, model hoặc tool exchange. |
| `06-technical/06-execution` | `06-technical/06-processing` | renamed | Bao phủ processing/work execution rộng hơn worker/job runtime. |
| `07-implementation/04-data-access` | `07-implementation/04-data-handling` | renamed | Bao phủ repository, mapper, serializer, reader/writer và object/file handling. |
| `07-implementation/05-integration` | `07-implementation/05-external-boundaries` | renamed | Bao phủ mọi boundary với dependency hoặc system bên ngoài, không chỉ service integration. |
| `09-operation/01-runtime` | `09-operation/01-operating-context` | renamed | Bao phủ local, device, CI, orchestrator hoặc service runtime context. |
| `09-operation/02-deployment` | `09-operation/02-release-and-change` | renamed | Bao phủ deploy, release, rollout, publish và change control. |
| `09-operation/03-observability` | `09-operation/03-signals` | renamed | Bao phủ metrics, logs, traces, crash, audit và data-quality signal. |
| `09-operation/05-incidents` | `09-operation/05-operational-events` | renamed | Bao phủ incident và cả failed run, support event hoặc abnormal production event. |
| `09-operation/06-recovery` | `09-operation/06-continuity` | renamed | Bao phủ backup, restore, rollback, retry, replay và continuity planning. |
| `09-operation/07-capacity` | `09-operation/07-resources` | renamed | Bao phủ quota, cost, storage, compute và resource limit rộng hơn capacity. |
| `05-architecture/06-deployment` | `05-architecture/06-deployment` | kept | Vẫn hợp lệ ở mức architecture deployment topology. |

## Alias Policy

- Old path chỉ được giữ trong migration history, provenance hoặc review diff cũ.
- Tài liệu active, template mới, workflow hướng dẫn và agent instruction phải dùng new path.
- Nếu cần nhắc old path trong tài liệu mới, câu đó phải nói rõ đây là historical alias và link về file này.
- Không tạo folder/file mới theo old path sau khi migration pass.
