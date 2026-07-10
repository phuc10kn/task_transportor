# Entity Map Packs

## Mục Đích

`packs/` là thư viện stable base xuyên dự án cho universal baseline, generic taxonomy và methodology template. Pack không phải app truth, không phải runtime configuration và không thay thế canonical contract active trong `docs/meta/` của từng project.

## Boundary

- Mỗi pack chỉ giữ type, relation, taxonomy và template đã có reusable meaning ổn định.
- Pack không giữ migration, lifecycle, adoption, divergence, provenance, decision, evidence hoặc canonical graph của một project.
- Project tự vận hành việc áp dụng source base trong local `docs/meta/`, `docs/app/`, `docs/theories/` và `docs/AGENT_SKILLS/`.
- Khi một kết quả local đã được review là reusable, nó được biên soạn thành stable pack mới hoặc cập nhật stable pack hiện có. Log của project không đi vào pack.

## Catalog

| Pack | Class | Stable scope |
| --- | --- | --- |
| [Universal base](universal/README.md) | Universal base | Layer/concern `00`–`06`, `08`–`10`; `07-implementation` không có pack taxonomy; generic taxonomy hiện có ở `06`, `08`, `09`. |
| [DDD tactical base](variants/ddd/README.md) | Methodology base | DDD tactical cho `04-domain`. |
| [Modular monolith base](variants/modular-monolith/README.md) | Methodology base | Stable architecture taxonomy cho `05-architecture`. |

## Ownership Rule

Guide pack giữ stable reusable source. `docs/meta/` giữ canonical contract của project; `docs/app/` giữ project truth và entity instance; `docs/theories/` và `docs/AGENT_SKILLS/` do project tự vận hành.
