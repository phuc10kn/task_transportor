# Relation Types

## Tách nguồn tri thức

Doc này chỉ đóng vai trò meta summary cho relation vocabulary:
- canonical direction theo `relation-model.md`;
- mô tả file-level `relation type` tại cấp definition;
- không thay thế logic reverse/query, logic đó ở guide/`relation-model.md`;
- valid triple vẫn do `03-rules` làm.

Vocabulary cho relations giữa entities. Mỗi Relation Type = một file `.md`, phân nhóm theo folder để dễ tìm.

Schema canonical cho mỗi file relation type definition nằm ở:

```text
docs/meta/00-schemas/relation-type-definition.md
```

```text
Source --relation--> Target
```

Relation Type định nghĩa:

```text
từ được dùng
meaning
canonical direction
inverse nếu có
anti-pattern
```

Relation Type không tự quyết định entity type nào được nối với entity type nào. Combination hợp lệ nằm ở [03-rules/](../03-rules/).

## Cấu trúc

```text
02-relation-types/
├── 00-context/       relations chủ yếu trong context layer
├── 01-business/      relations chủ yếu trong business layer
├── 02-product/       relations chủ yếu trong product layer
├── 03-interface/     relations chủ yếu trong interface layer
├── 04-domain/        relations chủ yếu trong domain layer
├── 05-architecture/  relations chủ yếu trong architecture layer
├── cross-layer/      relations nối entities giữa các layer
├── shared/           relations generic, dùng ở nhiều layer
└── structural/       reserved structural relations nếu được promote lại
```

## Quy tắc phân nhóm

| Folder | Khi nào |
|--------|---------|
| `00-context` … `05-architecture` | Relation chủ yếu phục vụ một layer |
| `cross-layer` | Relation nối entities thuộc layer khác nhau |
| `shared` | Relation generic hoặc reusable (`constrains`, `governs`, …) dùng ở ≥2 layer hoặc app variant |
| `structural` | Relation cấu trúc hệ thống, hiện chưa có active relation type |

Folder là grouping/discovery aid, không phải valid-usage rule.

Một relation trong folder layer vẫn chỉ hợp lệ khi triple tương ứng có trong `03-rules/`. Một relation trong `shared/` hoặc `cross-layer/` cũng không được dùng tự do nếu chưa có valid triple.

## Index theo nhóm

### 00-context

| Relation | File |
|----------|------|
| `has_scope` | [00-context/has_scope.md](00-context/has_scope.md) |
| `hosts` | [00-context/hosts.md](00-context/hosts.md) |

### 01-business

| Relation | File |
|----------|------|
| `addresses` | [01-business/addresses.md](01-business/addresses.md) |
| `composes` | [01-business/composes.md](01-business/composes.md) |
| `generates` | [01-business/generates.md](01-business/generates.md) |
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
| `includes` | [02-product/includes.md](02-product/includes.md) |
| `satisfied_by` | [02-product/satisfied_by.md](02-product/satisfied_by.md) |
| `specifies` | [02-product/specifies.md](02-product/specifies.md) |
| `uses` | [02-product/uses.md](02-product/uses.md) |
| `verified_by` | [02-product/verified_by.md](02-product/verified_by.md) |

### 03-interface

| Relation | File |
|----------|------|
| `composed_of` | [03-interface/composed_of.md](03-interface/composed_of.md) |
| `connects` | [03-interface/connects.md](03-interface/connects.md) |
| `contained_in` | [03-interface/contained_in.md](03-interface/contained_in.md) |
| `displayed_on` | [03-interface/displayed_on.md](03-interface/displayed_on.md) |
| `follows` | [03-interface/follows.md](03-interface/follows.md) |
| `for_audience` | [03-interface/for_audience.md](03-interface/for_audience.md) |
| `occurs_on` | [03-interface/occurs_on.md](03-interface/occurs_on.md) |
| `submits_via` | [03-interface/submits_via.md](03-interface/submits_via.md) |
| `transitions_to` | [03-interface/transitions_to.md](03-interface/transitions_to.md) |
| `traverses` | [03-interface/traverses.md](03-interface/traverses.md) |
| `triggered_by` | [03-interface/triggered_by.md](03-interface/triggered_by.md) |
| `undertakes` | [03-interface/undertakes.md](03-interface/undertakes.md) |
| `used_in` | [03-interface/used_in.md](03-interface/used_in.md) |

### 04-domain

| Relation | File |
|----------|------|
| `applied_by` | [04-domain/applied_by.md](04-domain/applied_by.md) |
| `describes` | [04-domain/describes.md](04-domain/describes.md) |
| `emits` | [04-domain/emits.md](04-domain/emits.md) |
| `enforces` | [04-domain/enforces.md](04-domain/enforces.md) |
| `marks_transition` | [04-domain/marks_transition.md](04-domain/marks_transition.md) |
| `member_of` | [04-domain/member_of.md](04-domain/member_of.md) |
| `models` | [04-domain/models.md](04-domain/models.md) |
| `operates_on` | [04-domain/operates_on.md](04-domain/operates_on.md) |
| `raised_by` | [04-domain/raised_by.md](04-domain/raised_by.md) |
| `used_by` | [04-domain/used_by.md](04-domain/used_by.md) |

### 05-architecture

| Relation | File |
|----------|------|
| `involves` | [05-architecture/involves.md](05-architecture/involves.md) |
| `moves` | [05-architecture/moves.md](05-architecture/moves.md) |
| `owns` | [05-architecture/owns.md](05-architecture/owns.md) |
| `shared_via` | [05-architecture/shared_via.md](05-architecture/shared_via.md) |

### cross-layer

| Relation | File |
|----------|------|
| `derived_from` | [cross-layer/derived_from.md](cross-layer/derived_from.md) |
| `exposed_via` | [cross-layer/exposed_via.md](cross-layer/exposed_via.md) |
| `maps_from` | [cross-layer/maps_from.md](cross-layer/maps_from.md) |
| `refined_from` | [cross-layer/refined_from.md](cross-layer/refined_from.md) |
| `specializes` | [cross-layer/specializes.md](cross-layer/specializes.md) |

### shared

| Relation | File |
|----------|------|
| `affects` | [shared/affects.md](shared/affects.md) |
| `constrains` | [shared/constrains.md](shared/constrains.md) |
| `contains` | [shared/contains.md](shared/contains.md) |
| `deploys_to` | [shared/deploys_to.md](shared/deploys_to.md) |
| `governed_by` | [shared/governed_by.md](shared/governed_by.md) |
| `governs` | [shared/governs.md](shared/governs.md) |
| `implements` | [shared/implements.md](shared/implements.md) |
| `plans_capacity_for` | [shared/plans_capacity_for.md](shared/plans_capacity_for.md) |

### structural

Hiện chưa có relation type active trong nhóm này.

## Schema mỗi file

```text
name, canonical direction, inverse, inverse kind
meaning, allowed semantic
examples, non-examples, anti-patterns
valid usage (triples từ entity types)
```

Không tạo field/section ngoài schema nếu chưa cập nhật `docs/meta/00-schemas/`.

## Direction routing

File này chỉ tóm tắt relation vocabulary và index theo folder.

Source of truth cho canonical direction, inverse và reverse query là:

```text
docs/guide/concepts/relation-model.md
```

Schema field bắt buộc của từng relation type nằm ở:

```text
docs/meta/00-schemas/relation-type-definition.md
```

Không thêm inverse canonical chỉ để đọc ngược. Khi cần trace ngược, dùng derived inverse theo guide.

## Không tạo relation tùy ý

Chỉ dùng relation đã định nghĩa tại đây.

Entity instance chỉ được ghi relation khi entity type có slot tương ứng trong `relations_template` và valid triple đã tồn tại. Nếu thiếu slot hoặc valid triple, reject relation ở entity instance.

Valid combinations: [03-rules/](../03-rules/)
