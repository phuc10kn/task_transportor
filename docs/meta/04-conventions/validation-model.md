# Validation Model

Nguồn: [meta/README.md](../README.md#validation-model).

## Structural Validation

```text
Layer → Concern → Entity Type → Entity Instance
```

Entity Instance không được nằm trực tiếp dưới Layer.

## Schema Validation

```text
File có đúng schema trong docs/meta/00-schemas/?
Entity type có khai báo structure extends nếu cần section đặc thù?
Instance có đủ frontmatter và body section bắt buộc?
```

## Semantic Validation

```text
Entity đúng meaning của Entity Type?
Entity đúng Concern?
Overlap với type khác?
```

## Relation Validation

```text
Relation Type tồn tại trong 02-relation-types/?
Relation slot tồn tại trong entity type relations_template?
Source Type hợp lệ?
Target Type hợp lệ?
Direction đúng?
Triple có trong 03-rules/?
Target instance tồn tại nếu slot được điền?
```

## Trace Validation

### Query ngược

- Trace ngược bắt buộc dùng derived inverse (search/tooling/index), không bắt buộc inverse canonical cho mục tiêu đọc ngược.
- Chỉ khi cần truy vấn first-class riêng mới cân nhắc inverse semantic độc lập.

Khi cần kiểm tra A có trace tới B không, dùng workflow:

```text
1. Xác định ID, entity type và layer của A và B.
2. Xác định hướng cần trace: xuôi, ngược hoặc cả hai.
3. Tra valid hops trong 03-rules/.
4. Walk qua frontmatter `relations`, body `## Relations` và repository search bằng ID.
5. Validate từng hop bằng Relation Validation.
6. Kết luận: có path, accepted gap, rejected relation hoặc invalid relation.
```

Mục đích trace có thể là:

| Mục đích | Câu hỏi |
| --- | --- |
| Impact | Đổi A thì B có bị ảnh hưởng không? |
| Coverage | B có được justify từ A không? |
| Consistency | Path có hợp lệ theo meta không? |

Không coi trace thiếu là lỗi nếu relation slot có cardinality `0..n` và entity chưa cần relation đó.

## Reference Validation

```text
Entity ID tồn tại?
Theory ID tồn tại?
Decision ID tồn tại?
```

## Convention Validation

```text
ID format, folder naming, file naming, metadata, status vocabulary
```
