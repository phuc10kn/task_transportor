# Theory And Decision Model

## Theory

Theory là reasoning nền do project sở hữu.

Theory trả lời:

```text
Project tin điều gì?
Tại sao?
Principle nào tái dùng được?
Tension nào còn mở?
```

Canonical home:

```text
docs/theories/
```

Unit template: [theory](../unit-structure/theory/README.md).

Schema canonical: [theory-package.md](../../meta/00-schemas/theory-package.md).

Theory không nhắc app-specific detail như Jira, Backlog, module cụ thể hoặc source path.

## App application

App docs áp dụng theory vào bối cảnh cụ thể.

Ví dụ:

```text
Theory:
Outbound write cần guardrail.

App:
CIS -> Jira phải dry-run trước sync thật.
```

App-specific truth nằm ở `docs/app/`.

## Decision

Decision ghi lại lựa chọn có ý nghĩa dài hạn.

Decision trả lời:

```text
đã chọn gì
tại sao
alternative nào bị loại
trade-off gì
khi nào review lại
```

Canonical home:

```text
docs/app/10-decisions/
```

Unit template: [decision](../unit-structure/decision/README.md).

Schema canonical: [decision.md](../../meta/00-schemas/decision.md).

## Khi nào dùng cái nào

| Tình huống | Dùng |
| --- | --- |
| Nguyên lý reusable, không gắn app cụ thể | Theory |
| App áp dụng nguyên lý vào Central Sync Hub | App docs |
| Lựa chọn dài hạn/trade-off | Decision |
| Ý tưởng chưa chín | Backlog theories |
