# Relation Cheatsheet

## Rule ngắn

```text
Relation Type = từ/nghĩa
Valid Triple  = ai nối ai
Relation Slot = entity type cho phép instance điền relation ở slot nào
```

Canonical:

```text
docs/meta/02-relation-types/
docs/meta/03-rules/
docs/meta/01-entity-types/
```

## Validate một edge

```text
1. Slot có trong entity type relations_template không?
2. Relation type của slot có tồn tại không?
3. Source entity type hợp lệ không?
4. Target entity type khớp slot không?
5. Direction đúng không?
6. Triple có trong 03-rules không?
7. Target instance có tồn tại không?
```

## Direction

Một fact nên có một canonical direction.

Không mirror hai chiều trừ khi có relation type cặp được định nghĩa rõ.

## Graph thưa

Mặc định cardinality là `0..n`. Không ép tạo relation cho mọi instance nếu slot không required.

## Khi thiếu relation

Không ghi relation vào entity instance nếu thiếu slot, relation type hoặc valid triple.

Muốn thêm relation mới, cập nhật entity type `relations_template`, relation type và valid triple trước. Không dùng `docs/workbench/` khi workbench chưa được kích hoạt.
