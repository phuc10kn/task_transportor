---
name: theory-refine
description: Proposes changes to Project Theory in docs/theories/ based on challenges, decisions, or new reasoning. Outputs a theory patch draft with affected IDs and impacted docs — proposal only, not canonical mutation.
---

# theory-refine

Đề xuất thay đổi Theory — output là **proposal**, không phải canonical edit.

## Input

```text
resolved Challenge hoặc Decision chỉ định đổi Theory
theory ID(s) cần refine
reasoning / evidence đã thu thập
```

## Workflow

```text
Task Progress:
- [ ] Xác nhận có Decision hoặc explicit human request — không refine tự phát
- [ ] Đọc README.md + theory.md + governance.md của theory liên quan
- [ ] Đọc Challenge / Decision record trong governance.md
- [ ] Đọc relevant project context (app docs bị ảnh hưởng)
- [ ] Draft proposed patch cho theory.md (và README/agent.md nếu cần)
- [ ] Liệt kê affected Theory IDs và docs — gợi ý theory-impact
- [ ] Trả output — human applies và commit
```

## Đọc gì

```text
docs/theories/<slug>/README.md
docs/theories/<slug>/theory.md
docs/theories/<slug>/governance.md
docs/theories/<slug>/agent.md (nếu patch ảnh hưởng short rules)
relevant docs/app/ entities
```

## Output template

```markdown
## theory-refine proposal

### Trigger
[DEC-XXX | Challenge CH-XXX | human request]

### Theories affected
| ID | Path | Change type |
|----|------|-------------|
| TH-XXX-NN | docs/theories/<slug>/ | position / boundary / principle / ... |

### Proposed patch — theory.md
```diff
[unified diff hoặc section replacement]
```

### Proposed patch — agent.md (nếu cần)
```diff
[short rules / checklist updates]
```

### Reasoning
[tại sao thay đổi, trade-offs]

### Affected project docs (preview)
[danh sách — chạy theory-impact đầy đủ sau khi patch applied]

### Governance update needed
[Decision record / close Challenge — section trong governance.md]

### Next steps
1. Human review proposal
2. Apply patch + update governance.md
3. Run theory-impact
4. Git commit
```

## Ràng buộc

```text
Agent output = proposal
Git commit sau human approval = canonical change
```

- Không tự apply patch
- Cập nhật `agent.md` khi short rules thay đổi
- Ghi Decision trong governance.md giải thích **why**

## Anti-patterns

```text
refine Theory không có Decision/Challenge context
copy external article vào theory.md
bỏ qua theory-impact sau khi đổi stable ID hoặc position
```

## Thêm

- theory-impact: [../theory-impact/SKILL.md](../theory-impact/SKILL.md)
- Mandatory rules: [../guides/mandatory-rules.md](../guides/mandatory-rules.md)
