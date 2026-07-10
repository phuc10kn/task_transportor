# implements

| Field | Value |
|-------|-------|
| **name** | `implements` |
| **canonical direction** | Source --implements--> Target |
| **inverse** | `none` |
| **inverse kind** | `derived` |

## meaning

Source là artifact product/UI cụ thể hiện thực hóa Target là intent product trừu tượng (capability hoặc behavior).

## allowed semantic

Chỉ dùng cho product/UI realization khi Source là đơn vị cụ thể hơn Target và cần khai báo Target nào đang được hiện thực.

Không dùng cho technical/implementation conformance, kể cả khi source trông cụ thể hơn target. Chỉ ghi một relation kỹ thuật khác khi relation type và valid triple canonical diễn đạt đúng fact đó.

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
IntegrationAdapter --implements--> PublicContract (sai scope: technical/implementation conformance)
Reverse trace từ Capability/UseCase chỉ để đọc ngược, không tạo relation canonical riêng.
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.
Không dùng relation này cho technical/implementation conformance.
Không tạo inverse canonical (`delivered_by`, `implemented_by`) chỉ để query từ abstract sang concrete.
Không mirror cùng một fact realization ở hai README.

## valid usage (from entity types)

```text
Feature --implements--> Capability
UserFlow --implements--> UseCase
```
