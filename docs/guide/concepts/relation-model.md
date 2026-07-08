# Relation Model

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

Canonical homes:

```text
docs/meta/02-relation-types/
docs/meta/03-rules/
docs/meta/01-entity-types/
docs/app/**/<entity-instance>/README.md
```

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
