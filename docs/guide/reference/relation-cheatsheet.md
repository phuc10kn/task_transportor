# Relation Cheatsheet

## Rule ngắn

```text
Relation Type = from/meaning
Valid Triple  = ai nói ai
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
2. Relation type của slot tồn tại không?
3. Source entity type hợp lệ không?
4. Target entity type khớp slot không?
5. Direction đúng không?
6. Triple có trong 03-rules không?
7. Target instance có tồn tại không?
8. Nếu `requirement_mode = required_at_creation` mà target chưa tồn tại thì target missing là hard failure của identity.
```

## Direction

Mỗi fact nên có một canonical direction.

Không mirror hai chiều nếu chưa có inverse canonical riêng.

## Graph thừa

Mặc định cardinality là `0..n`.
Không ép relation cho mỗi instance nếu slot là `allowed_when_known` và relation chưa có.
Nếu `required_at_creation`, thiếu relation khi tạo source là lỗi thiếu dữ kiện.
