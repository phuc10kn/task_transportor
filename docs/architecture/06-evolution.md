# Evolution

Lý thuyết generic về evolution và trade-off vẫn nằm ở:

- [custom_modular_monolith_theory/evolution.md](custom_modular_monolith_theory/evolution.md)
- [custom_modular_monolith_theory/tradeoffs_and_antipatterns.md](custom_modular_monolith_theory/tradeoffs_and_antipatterns.md)

File này chốt lộ trình kế thừa riêng của `task_transportor`.

## Lite

Lite là bản pull-first:

```text
Backlog manual or scheduled pull -> CIS -> optional review -> Jira
```

Lite bật tối thiểu:

- Backlog -> CIS bằng manual pull
- Scheduled pull là optional sau manual pull ổn
- Translation review
- Mapping approval
- Dry-run Jira
- Jira push
- Job, journal, audit

Lite được cắt scope nhưng không được cắt nền móng: schema, state, normalizer, module boundary và job model phải đủ cho Medium kế thừa.

## Medium

Medium thêm inbound theo event và vận hành hằng ngày:

- Backlog webhook
- Jira webhook
- Jira manual pull hoặc inbound recovery
- Attachment handling đầy đủ hơn
- Anomaly MVP đầy đủ hơn
- AI mapping proposal nếu cần

Medium phải dùng lại CIS core, normalizer pattern, job model và boundary hiện có.

## Full

Full thêm sync hai chiều và năng lực vận hành dài hạn:

- CIS -> Backlog
- Replay hoặc rollback tooling
- Learning từ review, mapping, anomaly
- Notification ngoài UI
- Worker split nếu cần
- DB upgrade nếu cần

## Trigger thay đổi runtime

Chỉ cân nhắc tách worker hoặc nâng DB khi có trigger rõ:

- API admin bị chậm vì latency AI, Backlog hoặc Jira
- Job backlog tăng liên tục
- Cần restart worker độc lập
- Cần rate-limit riêng theo integration
- Cần nhiều writer concurrent hoặc journal quá lớn cho SQLite

Khi runtime đổi, product model của repo vẫn giữ:

```text
System -> CIS -> System
```
