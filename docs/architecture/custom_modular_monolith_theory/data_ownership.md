# Data Ownership

File này mô tả cách document data ownership theo kiểu generic.

## Quy tắc chính

```text
Module owner được ghi state business của aggregate mình sở hữu.
Module khác muốn ghi phải gọi public API của owner.
Read chéo chỉ giữ khi có tier và allowlist rõ.
```

## Cách document trong một repo

Mỗi repo nên có một bảng kiểu:

| Bảng / aggregate | Module owner write | Consumer read được chấp nhận | Ghi chú |
| --- | --- | --- | --- |
| `<aggregate_a>` | `<OwnerA>` | `<Consumer/Tier>` | `<reason>` |
| `<aggregate_b>` | `<OwnerB>` | `<Consumer/Tier>` | `<reason>` |

## Cross-module write

Cross-module write mặc định bị cấm.

Nếu cần hợp lệ:

1. Xác định owner thật.
2. Thêm hoặc dùng owner API.
3. Không để consumer write trực tiếp.

## Read exception hợp lệ

Read exception chỉ hợp lệ khi:

- read-only;
- có tier rõ;
- có allowlist rõ;
- không copy business rule của owner;
- có thể thay bằng owner API hoặc read model khi cần strict hơn.

## Ghi chú

Allowlist cụ thể của từng repo không nên sống ở file generic này. Nó phải nằm trong architecture guide của repo đó.
