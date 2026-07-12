# Workbench

> STATUS: ACTIVE cho scope `cis/` theo [DEC-003](../app/10-decisions/01-decision-making/01-decisions/DEC-003-workbench-activation-policy/README.md).

`docs/workbench/` là workspace local hỗ trợ luồng documentation chuẩn. Nó không tạo source of truth song song.

Activation authority: [DEC-003](../app/10-decisions/01-decision-making/01-decisions/DEC-003-workbench-activation-policy/README.md)  
Workflow bind: [workflow-profile.md](../app/10-decisions/01-decision-making/01-decisions/DEC-003-workbench-activation-policy/workflow-profile.md)  
Guide boundary/workflow: [use-workbench.md](../guide/workflows/use-workbench.md) · [workbench-model.md](../guide/concepts/workbench-model.md)

## Không Được Dùng Như Canonical Truth

- không ghi app truth thay `docs/app`;
- không thay `docs/meta` hoặc `docs/theories`;
- không materialize entity/relation chỉ vì item tồn tại;
- không cite Workbench item như authority cho claim active.

## Scope Hiện Có

| Folder | Status | Ghi chú |
| --- | --- | --- |
| `cis/` | active | Temporary knowledge staging cho Central Sync Hub / CIS |

## Khi Nào Dùng

Dùng Workbench khi canonical home/contract/modeling chưa xác định và DEC-003 còn hiệu lực. Task đã biết home đi thẳng luồng canonical.
