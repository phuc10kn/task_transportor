---
id: SO-001
slug: canonical-issue-state
entity_type: StateOwner
layer: 05-architecture
concern: 04-state
status: active
theory_basis:
  - TH-CANON-01
  - TH-CANON-04
---

# SO-001 - Canonical Issue State

## Meaning

State canonical của issue nội bộ sau khi dữ liệu đã đi vào CIS.

## Why this state is central

Đây là source-of-truth nội bộ mà các flow review, dry-run, sync outbound và manual edit cùng dựa vào. Nếu state này bị chia owner, toàn bộ kiến trúc sẽ mất trục chính.

## Owner

`Cis`

## Reason

Toàn bộ mô hình sản phẩm hiện tại đặt CIS làm trung tâm nên canonical issue state phải thuộc `Cis`, không thuộc `Backlog` hay `Jira`.

## What belongs to this state

- issue fields canonical
- revision history liên quan
- comment/attachment/worklog metadata gắn với issue
- sync-related flags và một phần integration outcome nội bộ

## What does not belong here

- translation review queue lifecycle
- sync execution queue state
- project integration configuration
- external source raw ownership

## Write policy

- `Cis` write trực tiếp.
- Module khác chỉ yêu cầu thay đổi qua `CisApi`.

## Consumers

- `Dashboard`
- `Translation`
- `Jira`

## Architectural implications

- Mọi integration outbound phải đọc từ đây hoặc từ snapshot build ra từ đây.
- Mọi manual edit nghiêm túc phải quay về đây.
- Mọi review flow chỉ được apply vào đây qua owner API.

## Evidence

- `docs/app/05-architecture/02-boundaries/README.md`
- `src/modules/Cis/CisApi.js`
