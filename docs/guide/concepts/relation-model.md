# Relation Model

## Query ngược (Reverse Query)

Truy vấn ngược được ưu tiên theo hướng derived-first:
- repository search;
- derived inverse;
- index/tooling khi cần reverse query thường xuyên.

Không tạo inverse canonical chỉ để đọc ngược.

Chỉ tạo inverse riêng khi inverse có semantic độc lập và có nhu cầu query first-class.

## Bản chất bắt buộc

```text
Relation Type
    = nguồn + meaning

Valid Triple
    = Source Entity Type + Relation Type + Target Entity Type

Relation Slot
    = entity type cho phép instance dùng relation đó theo slot nào

Entity Relation
    = entity instance điền target instance vào slot đã có phép
```

Canonical homes theo loại knowledge:

```text
Relation Type      -> docs/meta/02-relation-types/
Valid Triple       -> docs/meta/03-rules/
Relation Slot      -> docs/meta/01-entity-types/**/relations_template
Entity Relation    -> frontmatter relations trong docs/app/**/<entity-instance>/README.md
```

README body và prose relation chỉ giải thích ngữ cảnh cho người đọc; chúng không phải canonical home của relation instance.

## Relation Type

Relation Type định nghĩa:

- name;
- meaning;
- canonical direction;
- inverse nếu có;
- anti-pattern;
- examples/non-examples.

Nó không tự quyết định cách dùng relation giữa entity nào.

## Valid Triple

Valid Triple quy định relation nào được phép giữa source và target.

Ví dụ:

```text
BusinessRequirement --derived_from--> Problem
```

Chỉ hợp lệ khi triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## Relation Slot

Relation Slot nằm trong `relations_template` của entity type.

Slot định nghĩa:

- slot name;
- relation type;
- target entity type;
- requirement_mode;
- cardinality.

`requirement_mode` có hai mode:
- `allowed_when_known`
- `required_at_creation`.

Entity instance chỉ ghi relation nếu slot hợp lệ theo `relations_template`; nếu thiếu slot thì reject relation.

Target entity type phải là entity type thật. Không dùng pseudo target như `entities`, `layers/entities`, `_any Entity_` hoặc `_layer / entity_`.

Broad premise như Assumption/ContextConstraint không tự tạo outbound relation tới mọi entity.
Nếu cần trace impact canonical, entity type nguồn phải có slot và valid triple rõ ràng tới Assumption/ContextConstraint.

## Entity Relation

Entity Relation là relation thực của một entity instance.

Relation canonical phải ghi trong YAML frontmatter field `relations` ở đầu file entity README theo slot:

```yaml
relations:
  governed_by:
    - BRULE-001
```

Body `## Relations` chỉ giải thích ngữ cảnh cho người đọc.

## Direction

Mỗi fact nên có một canonical direction.

Không mirror cùng lúc một fact ở hai README để có hai chiều đọc.

Canonical direction chọn theo nơi fact gốc được quản trị và chiều semantic chủ động, rõ nhất:

- owner -> owned
- container -> member
- cause/source -> impacted target
- rule/constraint -> governed target
- concrete delivery/UI flow -> abstract capability/behavior khi dùng `implements`
- flow -> participant

Không tạo inverse canonical để đọc ngược.

`implements` là ngoại lệ có chủ đích với heuristic requirement/specification: source là đơn vị cụ thể quản trị fact hiện thực hóa, target là capability hoặc behavior trừu tượng. Vì vậy dùng:

```text
Feature --implements--> Capability
UserFlow --implements--> UseCase
```

Các fact theo chiều abstract → concrete phải dùng predicate diễn đạt đúng semantic riêng, ví dụ `specifies`, `accepts` hoặc `verified_by`; không đảo chiều `implements`.

Chỉ tạo inverse riêng khi inverse có semantic độc lập và có nhu cầu query first-class.

Trace ngược mặc định bằng:

- repository search;
- derived inverse;
- tooling.

## Graph thừa

Valid triple + relation slot cho phép tồn tại edge, không buộc mỗi instance phải có edge nếu mode là `allowed_when_known`.

Không lặp relation chỉ để có chuỗi flow.

## Khi chưa có relation slot phù hợp

Reject relation. Không ghi relation nghịch.
Muốn thêm relation mới phải cập nhật entity type `relations_template`, relation type và valid triple trước.
