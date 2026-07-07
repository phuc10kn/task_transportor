# Relation Model

## Hai tầng bắt buộc

```text
Relation Type
    = từ và meaning

Valid Triple
    = Source Entity Type + Relation Type + Target Entity Type
```

Canonical homes:

```text
docs/meta/02-relation-types/
docs/meta/03-rules/
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

## Direction

Mỗi fact nên có một canonical direction.

Không mirror cùng một fact ở hai README chỉ để có hai chiều đọc.

Trace ngược bằng:

- repository search;
- derived inverse;
- relation cặp đã được định nghĩa rõ.

## Graph thưa

Valid triple cho phép edge tồn tại, không bắt mọi instance phải có edge.

Không lấp relation chỉ để có chuỗi đẹp.

## Khi chưa có relation phù hợp

Dùng:

```text
Related Entities
Possible Trace Direction
NOTE-OPEN
Open Relation Question
```

Không tự bịa relation mới trong app docs.

