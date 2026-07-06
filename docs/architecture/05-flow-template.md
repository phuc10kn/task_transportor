# Workflow Map

Template generic về flow vẫn nằm ở:

- [custom_modular_monolith_theory/flow_template.md](custom_modular_monolith_theory/flow_template.md)
- [custom_modular_monolith_theory/flow_examples.md](custom_modular_monolith_theory/flow_examples.md)

File này là bản đồ workflow của `task_transportor`. Chi tiết mỗi workflow nằm trong folder [workflows/](workflows/README.md).

## Workflow hiện tại

1. [Backlog manual pull](workflows/backlog-manual-pull.md)
2. [Backlog project pull](workflows/backlog-project-pull.md)
3. [Backlog scheduled pull](workflows/backlog-scheduled-pull.md)
4. [Translation review](workflows/translation-review.md)
5. [Issue Editor canonical edit](workflows/issue-editor-canonical-edit.md)
6. [Jira dry-run](workflows/jira-dry-run.md)
7. [CIS to Jira sync](workflows/cis-to-jira-sync.md)

## Nguyên tắc chung

- Inbound không tạo đường tắt `System -> System`.
- Manual pull, project pull, scheduled pull và webhook cùng source phải dùng chung normalizer khi có thể.
- Dry-run là cổng an toàn trước outbound thật.
- Cross-module write phải đi qua owner API.
- Mỗi workflow có side effect quan trọng phải có journal hoặc audit rõ.
