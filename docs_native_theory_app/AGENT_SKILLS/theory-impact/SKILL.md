---
name: theory-impact
description: Finds project documentation files affected when a Theory stable ID changes. Searches docs/ for TH-* references using repository grep. Use after theory-refine, theory ID rename, or position changes requiring app doc review.
---

# theory-impact

Tìm project docs nào có thể bị ảnh hưởng khi Theory thay đổi.

Không cần graph database — stable IDs + repository search đủ cho bản Lite.

## Input

```text
theory stable ID(s): TH-XXX-NN
optional: mô tả thay đổi (position, boundary, principle)
```

## Workflow

```text
Task Progress:
- [ ] Nhận theory ID(s) đã hoặc sẽ thay đổi
- [ ] Search toàn bộ docs/ theo ID
- [ ] Search theory_basis / decision_basis trong frontmatter
- [ ] Phân loại files theo layer
- [ ] Đánh giá mức review cần thiết
- [ ] Trả output theo template
```

## Search commands

```bash
# Tìm stable ID
rg "TH-MOD-05" docs/

# Tìm trong frontmatter
rg "theory_basis" docs/ -l
rg "TH-MOD-05" docs/app/ docs/meta/
```

Mở rộng pattern nếu ID prefix khác (TH-DOM-*, TH-QLT-*, ...).

## Output template

```markdown
## theory-impact result

### Theory changed
- ID: TH-XXX-NN
- Change summary: [mô tả ngắn]

### Direct references
| Path | Context | Review priority |
|------|---------|-----------------|
| docs/app/05-architecture/.../MOD-001/README.md | theory_basis | high |

### Indirect / derived rules
| Path | Reason |
|------|--------|
| docs/app/07-implementation/.../README.md | rule derived from TH-XXX-NN |

### By layer
- 01-business: [count + paths]
- 05-architecture: [...]
- 06-technical: [...]
- 10-decisions: [...]

### Rules requiring review
- [rule hoặc section cần human xem lại]

### No action needed
- [files reference ID nhưng không bị ảnh hưởng bởi change type]
```

## Phân loại review priority

```text
high   — theory_basis trực tiếp + derived rule phụ thuộc position đổi
medium — mention trong prose, cần verify vẫn đúng
low    — historical reference trong Decision đã superseded
```

## Ràng buộc

- Chỉ liệt kê — không tự sửa app docs
- Sau impact review, human hoặc doc-create-entity skill áp dụng thay đổi
- Search cả `docs/app/`, `docs/meta/` (nếu meta reference theory), `docs/theories/` (cross-refs)

## Anti-patterns

```text
chỉ search một layer
bỏ qua theory_basis trong YAML frontmatter
giả định không có reference vì không thấy trong prose
```

## Thêm

- Chạy sau theory-refine: [../theory-refine/SKILL.md](../theory-refine/SKILL.md)
- Layer routing: [../reference/layer-routing.md](../reference/layer-routing.md)
