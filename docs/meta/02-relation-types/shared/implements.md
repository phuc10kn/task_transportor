# implements

| Field | Value |
|-------|-------|
| **name** | `implements` |
| **canonical direction** | Source --implements--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source (concrete delivery hoặc UI flow) hiện thực hóa Target (abstract capability hoặc product behavior).

## allowed semantic

Chỉ dùng khi Source là đơn vị cụ thể hơn Target và cần khai báo Target nào đang được hiện thực.

Không dùng chiều ngược canonical từ abstract về concrete; reverse query dùng search/derived inverse.

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

## examples

```text
Feature --implements--> Capability
UserFlow --implements--> UseCase
```

## non-examples

```text
Capability --implements--> Feature   (sai canonical direction)
Capability --delivered_by--> Feature (không dùng: dual/mirror của Feature --implements--> Capability)
UseCase --implemented_by--> Feature  (không dùng: không phải inverse sạch của implements)
Reverse trace từ Capability/UseCase chỉ để đọc ngược, không tạo relation canonical riêng.
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.
Không tạo inverse canonical (`delivered_by`, `implemented_by`) chỉ để query từ abstract sang concrete.
Không mirror cùng một fact realization ở hai README.

## valid usage (from entity types)

```text
Feature --implements--> Capability
UserFlow --implements--> UseCase
```
