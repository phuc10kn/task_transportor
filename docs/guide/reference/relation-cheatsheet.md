# Relation Cheatsheet

## Rule ngắn

```text
Relation Type = từ/nghĩa
Valid Triple  = ai nối ai
```

Canonical:

```text
docs/meta/02-relation-types/
docs/meta/03-rules/
```

## Validate một edge

```text
1. Relation type có tồn tại không?
2. Source entity type hợp lệ không?
3. Target entity type hợp lệ không?
4. Direction đúng không?
5. Triple có trong 03-rules không?
```

## Direction

Một fact nên có một canonical direction.

Không mirror hai chiều trừ khi có relation type cặp được định nghĩa rõ.

## Graph thưa

Mặc định cardinality là `0..n`. Không ép tạo relation cho mọi instance.

## Khi thiếu relation

Dùng `NOTE-OPEN` hoặc backlog. Không tự bịa relation.

