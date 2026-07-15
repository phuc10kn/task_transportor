---
schema: entity-instance/v1
id: SO-002
slug: translation-review-state
title: Translation Review State
entity_type: StateOwner
layer: 05-architecture
concern: 04-state
status: active
summary: State của queue item dịch, một draft chung và approval outcome trước khi áp vào canonical issue.
theory_basis:
  - TH-AI-GOV-01
  - TH-AI-GOV-04
relations:
  shared_via:
    - DF-005
---
# SO-002 - Translation Review State

## Summary

State của queue item dịch, một draft chung và approval outcome trước khi áp vào canonical issue.

## Meaning

State của queue item dịch, một draft chung và approval outcome trước khi áp vào canonical issue.

## Owner

`Translation`

## Reason

Review lifecycle là concern riêng của translation, tách khỏi canonical issue ownership của `Cis`.

## Write policy

- `Translation` write `translation_queue`.
- `Cis` chỉ apply approved draft vào canonical issue, không nhận ownership review queue.

## Consumers

- `Cis`
- `Dashboard`
- `Jira` đọc snapshot liên quan



## Why this state is central

State của queue item dịch, shared draft và approval outcome trước khi áp vào canonical issue. Ownership phải rõ để consumer không ghi trực tiếp hoặc suy diễn shared ownership.

## What belongs to this state

State, lifecycle và record do Owner nêu trong Meaning/Write policy quản lý thuộc instance này.

## What does not belong here

Business state của module khác, transport detail và state không do Owner quản lý không thuộc instance này.

## Architectural implications

Consumer đọc hoặc yêu cầu thay đổi qua public API/owner path; runtime hoặc shared storage không làm thay đổi ownership.

## Relations

`shared_via` ghi DataFlow expose approved draft tới canonical apply path. Ownership của translation review state không đổi.

## Evidence

- `docs/app/05-architecture/02-boundaries/README.md`
- `src/modules/Translation/TranslationApi.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
