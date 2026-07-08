# Relation Model

## Query ngược (Reverse Query)

Truy vấn ngược được khuyến nghị thực hiện theo hướng derived-first:
- repository search;
- derived inverse;
- index/tooling khi cần reverse query thường xuyên.

Không tạo inverse canonical chỉ để đọc ngược.

Chỉ tạo inverse riêng khi inverse có semantic độc lập và có nhu cầu query first-class.

## Bốn tầng bắt buộc

```text
Relation Type
    = từ và meaning

Valid Triple
    = Source Entity Type + Relation Type + Target Entity Type

Relation Slot
    = entity type cho phép instance dùng relation đó theo slot nào

Entity Relation
    = entity instance điền target instance vào slot đã có
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

Nó không tự quyết định được dùng giữa entity nào.

## Valid Triple

Valid Triple mới quyết định relation được dùng giữa hai entity type nào.

Ví dụ:

```text
Problem --leads_to--> BusinessRequirement
```

Chỉ hợp lệ nếu triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## Relation Slot

Relation Slot nằm trong `relations_template` của entity type.

Slot định nghĩa:

- slot name;
- relation type;
- target entity type;
- required;
- cardinality.

Valid triple cho phép edge ở mức type, nhưng entity instance chỉ được ghi relation khi entity type của nó có slot tương ứng.

Không có slot thì reject relation.

Target entity type phải là entity type thật. Không dùng pseudo target như `entities`, `layers/entities`, `_any Entity_` hoặc `_layer / entity_`.

Broad premise như Assumption hoặc ContextConstraint không tự tạo outbound relation tới mọi entity. Khi một entity thật sự bị ảnh hưởng, entity type của entity đó phải có slot cụ thể tới Assumption/ContextConstraint và valid triple cụ thể. Nếu chưa có slot/triple, ghi bằng field hoặc section mô tả trong premise, không ghi relation canonical.

## Entity Relation

Entity Relation là relation thật của một entity instance.

Relation canonical phải ghi trong YAML frontmatter field `relations` ở đầu file entity README, theo slot:

```yaml
relations:
  governed_by:
    - BRULE-001
```

Body `## Relations` chỉ giải thích ngữ cảnh cho người đọc.

## Direction

Mỗi fact nên có một canonical direction.

Không mirror cùng một fact ở hai README chỉ để có hai chiều đọc.

Canonical direction được chọn theo nơi fact gốc được quản trị và theo chiều semantic chủ động, rõ nhất.

Ưu tiên:

- owner -> owned
- container -> member
- cause/source -> impacted target
- rule/constraint -> governed target
- abstract requirement/spec -> concrete realization/evidence
- flow -> participant

Không tạo inverse canonical chỉ để đọc ngược. Trace ngược mặc định dùng derived inverse qua search hoặc tooling.

Chỉ giữ inverse như relation riêng khi inverse có semantic độc lập và có nhu cầu query first-class.

Trace ngược bằng:

- repository search;
- derived inverse;
- relation cặp đã được định nghĩa rõ.

## Graph thưa

Valid triple và relation slot cho phép edge tồn tại, không bắt mọi instance phải có edge nếu slot không required.

Không lấp relation chỉ để có chuỗi đẹp.

## Khi chưa có relation slot phù hợp

Reject relation. Không ghi relation nghi ngờ vào entity instance.

Muốn thêm relation mới phải cập nhật entity type `relations_template`, relation type và valid triple trước.
