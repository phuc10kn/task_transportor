# affects

| Field | Value |
|-------|-------|
| **name** | `affects` |
| **canonical direction** | Source --affects--> Target |
| **inverse** | `none` |
| **inverse kind** | `none` |

## meaning

Source gây tác động business trực tiếp, quan sát được lên Target.

`affects` chỉ dùng khi Target thực sự chịu ảnh hưởng từ Source theo outcome business như chậm tiến độ, tăng chi phí, tăng rủi ro, giảm chất lượng công việc hoặc tăng tải xử lý.

Relation này không dùng cho trường hợp Target chỉ quan tâm, theo dõi, sở hữu quyết định hoặc có liên quan chung chung tới Source.

## allowed semantic

Chỉ dùng khi combination có trong [03-rules/](../../03-rules/).

Khi tạo relation này, entity phải mô tả được biểu hiện impact cụ thể trong body hoặc field liên quan.

## examples

```text
Problem --affects--> Stakeholder
```

## non-examples

```text
Target --affects--> Source   (sai direction nếu inverse được định nghĩa)
Free-text relation không qua Relation Type canonical
```

## anti-patterns

Không dùng relation này nếu chưa có valid triple trong 03-rules/.
Không dùng `affects` như relation cứu hỏa cho mọi liên hệ mơ hồ.
Không dùng khi chưa chỉ ra được impact business cụ thể lên Target.
Không dùng cho stakeholder chỉ là owner, reviewer, observer hoặc decision maker nếu họ không phải bên chịu tác động trực tiếp.
Không dùng `affects` với pseudo target như `entities`, `_any Entity_` hoặc target rộng không phải entity type canonical.

## note on intent split

`affects` hiện là relation impact tổng quát đã được chấp nhận tạm thời để giữ vocabulary gọn.

Nếu sau này graph cần query sắc hơn theo từng kiểu tác động, cần tách intent thành relation riêng thay vì tiếp tục nhồi vào `affects`, ví dụ:

- `blocks` khi Source chặn Target thực hiện công việc
- `burdens` khi Source làm tăng tải xử lý cho Target
- `harms` khi Source gây thiệt hại rõ lên Target
- `concerns` khi Target chỉ là bên liên quan chứ chưa chịu tác động trực tiếp

Khi một intent riêng đã đủ ổn định và có nhu cầu query rõ, ưu tiên promote relation mới thay vì mở rộng nghĩa của `affects`.

## valid usage (from entity types)

```text
Problem --affects--> Stakeholder
```
