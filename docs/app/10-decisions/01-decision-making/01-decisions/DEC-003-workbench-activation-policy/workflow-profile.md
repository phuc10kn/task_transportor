# Workflow Profile — Workbench Binding

Supporting artifact của [DEC-003](README.md). Không phải activation authority.

```yaml
workflow_profile:
  app_truth_root: docs/app
  meta_contract_root: docs/meta
  temporary_knowledge_policy: docs/app/10-decisions/01-decision-making/01-decisions/DEC-003-workbench-activation-policy/README.md
  workbench:
    active: true
    workspace: docs/workbench/cis/
    policy_root: docs/workbench/cis/policy.md
    template: docs/workbench/cis/templates/work-item.md
    registry: docs/workbench/cis/items/README.md
    owner_role: repo maintainer
  required_reviewers:
    workbench_lifecycle: repo maintainer
    app_truth: product/app owner
    meta_contract: doc-system/meta owner
    theory: theory owner
  test_commands:
    workbench_structural: npm run verify:workbench
    docs_navigation: npm run verify:docs
```

`workbench.active` chỉ mirror trạng thái DEC-003 `accepted` và chưa bị superseded. Nếu profile mâu thuẫn với decision, decision thắng.
