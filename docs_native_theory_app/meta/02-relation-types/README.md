# Relation Types

Vocabulary cho relations giữa entities. Mỗi Relation Type = một file `.md`, **phân nhóm theo folder**.

```text
Source --relation--> Target
```

Tổng cộng **70** relation types.

## Cấu trúc

```text
02-relation-types/
├── 00-context/       relations chủ yếu trong context layer
├── 01-business/      relations chủ yếu trong business layer
├── 02-product/       relations chủ yếu trong product layer
├── 03-ui/            relations chủ yếu trong ui layer
├── 04-domain/        relations chủ yếu trong domain layer
├── cross-layer/      relations nối entities giữa các layer
├── shared/           relations generic, dùng ở nhiều layer
└── structural/       depends_on, supersedes (architecture, decisions)
```

## Quy tắc phân nhóm

| Folder | Khi nào |
|--------|---------|
| `00-context` … `04-domain` | Relation chỉ xuất hiện trong một layer |
| `cross-layer` | Relation nối entities thuộc layer khác nhau |
| `shared` | Relation generic (`applies_to`, `constrains`, …) dùng ở ≥2 layer |
| `structural` | Relation cấu trúc hệ thống, reserved cho layers 05+ |

## Index theo nhóm


### 00-context

| Relation | File |
|----------|------|
| `has_scope` | [00-context/has_scope.md](00-context/has_scope.md) |
| `hosts` | [00-context/hosts.md](00-context/hosts.md) |
| `integrates_with_context` | [00-context/integrates_with_context.md](00-context/integrates_with_context.md) |
| `runs_in` | [00-context/runs_in.md](00-context/runs_in.md) |

### 01-business

| Relation | File |
|----------|------|
| `addresses` | [01-business/addresses.md](01-business/addresses.md) |
| `affected_by` | [01-business/affected_by.md](01-business/affected_by.md) |
| `composes` | [01-business/composes.md](01-business/composes.md) |
| `generates` | [01-business/generates.md](01-business/generates.md) |
| `governed_by` | [01-business/governed_by.md](01-business/governed_by.md) |
| `input_to` | [01-business/input_to.md](01-business/input_to.md) |
| `measured_by` | [01-business/measured_by.md](01-business/measured_by.md) |
| `measures` | [01-business/measures.md](01-business/measures.md) |
| `motivates` | [01-business/motivates.md](01-business/motivates.md) |
| `part_of` | [01-business/part_of.md](01-business/part_of.md) |
| `participates_in` | [01-business/participates_in.md](01-business/participates_in.md) |
| `validates` | [01-business/validates.md](01-business/validates.md) |

### 02-product

| Relation | File |
|----------|------|
| `accepts` | [02-product/accepts.md](02-product/accepts.md) |
| `delivered_by` | [02-product/delivered_by.md](02-product/delivered_by.md) |
| `implemented_by` | [02-product/implemented_by.md](02-product/implemented_by.md) |
| `included_in` | [02-product/included_in.md](02-product/included_in.md) |
| `includes` | [02-product/includes.md](02-product/includes.md) |
| `satisfied_by` | [02-product/satisfied_by.md](02-product/satisfied_by.md) |
| `specifies` | [02-product/specifies.md](02-product/specifies.md) |
| `uses` | [02-product/uses.md](02-product/uses.md) |
| `verified_by` | [02-product/verified_by.md](02-product/verified_by.md) |

### 03-ui

| Relation | File |
|----------|------|
| `composed_of` | [03-ui/composed_of.md](03-ui/composed_of.md) |
| `connects` | [03-ui/connects.md](03-ui/connects.md) |
| `contained_in` | [03-ui/contained_in.md](03-ui/contained_in.md) |
| `displayed_on` | [03-ui/displayed_on.md](03-ui/displayed_on.md) |
| `follows` | [03-ui/follows.md](03-ui/follows.md) |
| `for_audience` | [03-ui/for_audience.md](03-ui/for_audience.md) |
| `governs` | [03-ui/governs.md](03-ui/governs.md) |
| `occurs_on` | [03-ui/occurs_on.md](03-ui/occurs_on.md) |
| `submits_via` | [03-ui/submits_via.md](03-ui/submits_via.md) |
| `transitions_to` | [03-ui/transitions_to.md](03-ui/transitions_to.md) |
| `traverses` | [03-ui/traverses.md](03-ui/traverses.md) |
| `triggered_by` | [03-ui/triggered_by.md](03-ui/triggered_by.md) |
| `undertakes` | [03-ui/undertakes.md](03-ui/undertakes.md) |
| `used_in` | [03-ui/used_in.md](03-ui/used_in.md) |

### 04-domain

| Relation | File |
|----------|------|
| `applied_by` | [04-domain/applied_by.md](04-domain/applied_by.md) |
| `constrained_by` | [04-domain/constrained_by.md](04-domain/constrained_by.md) |
| `describes` | [04-domain/describes.md](04-domain/describes.md) |
| `emits` | [04-domain/emits.md](04-domain/emits.md) |
| `enforces` | [04-domain/enforces.md](04-domain/enforces.md) |
| `marks_transition` | [04-domain/marks_transition.md](04-domain/marks_transition.md) |
| `member_of` | [04-domain/member_of.md](04-domain/member_of.md) |
| `models` | [04-domain/models.md](04-domain/models.md) |
| `operates_on` | [04-domain/operates_on.md](04-domain/operates_on.md) |
| `raised_by` | [04-domain/raised_by.md](04-domain/raised_by.md) |
| `used_by` | [04-domain/used_by.md](04-domain/used_by.md) |

### cross-layer

| Relation | File |
|----------|------|
| `aligns_with` | [cross-layer/aligns_with.md](cross-layer/aligns_with.md) |
| `derived_from` | [cross-layer/derived_from.md](cross-layer/derived_from.md) |
| `exposed_via` | [cross-layer/exposed_via.md](cross-layer/exposed_via.md) |
| `informs` | [cross-layer/informs.md](cross-layer/informs.md) |
| `leads_to` | [cross-layer/leads_to.md](cross-layer/leads_to.md) |
| `maps_from` | [cross-layer/maps_from.md](cross-layer/maps_from.md) |
| `may_map_to` | [cross-layer/may_map_to.md](cross-layer/may_map_to.md) |
| `may_refine_to` | [cross-layer/may_refine_to.md](cross-layer/may_refine_to.md) |
| `refined_from` | [cross-layer/refined_from.md](cross-layer/refined_from.md) |
| `refined_in` | [cross-layer/refined_in.md](cross-layer/refined_in.md) |
| `related_term` | [cross-layer/related_term.md](cross-layer/related_term.md) |
| `specializes` | [cross-layer/specializes.md](cross-layer/specializes.md) |

### shared

| Relation | File |
|----------|------|
| `affects` | [shared/affects.md](shared/affects.md) |
| `applies_to` | [shared/applies_to.md](shared/applies_to.md) |
| `constrains` | [shared/constrains.md](shared/constrains.md) |
| `contains` | [shared/contains.md](shared/contains.md) |
| `implements` | [shared/implements.md](shared/implements.md) |
| `supports` | [shared/supports.md](shared/supports.md) |

### structural

| Relation | File |
|----------|------|
| `depends_on` | [structural/depends_on.md](structural/depends_on.md) |
| `supersedes` | [structural/supersedes.md](structural/supersedes.md) |

## Schema mỗi file

```text
name, canonical direction, inverse
meaning, allowed semantic
examples, non-examples, anti-patterns
valid usage (triples từ entity types)
```

## Direction rule

Một canonical direction. Inverse có thể derive — không ghi cả hai chiều tùy ý trong app docs.

## Không tạo relation tùy ý

Chỉ dùng relation đã định nghĩa tại đây. Trước khi chốt: dùng `Related Entities` + `Open Relation Question`.

Valid combinations: [03-rules/](../03-rules/)
