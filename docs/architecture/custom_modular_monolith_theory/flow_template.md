# Flow Template

Khi thiết kế một flow mới, có thể mô tả theo template này:

## Tên flow

```text
<SourceSystem> -> <CanonicalStore> -> <TargetSystem>
```

## Trigger

- Route, job hoặc event nào kích hoạt?

## Boundary đúng

```text
<OwnerController>
  -> <OwnerApi>
    -> <UseCase>
      -> <Client/Normalizer/Repository>
      -> <OtherOwnerApi nếu cần>
```

## Owner state

| State / aggregate | Owner |
| --- | --- |
| `<aggregate_1>` | `<OwnerA>` |
| `<aggregate_2>` | `<OwnerB>` |

## Quy tắc

- Có cần normalizer không?
- Có cần job hoặc journal không?
- Có cần dry-run hoặc pre-check không?
- Có cross-module read exception nào không?
- Có external call nào cần retry policy không?

## Sai cần tránh

- Controller gọi tắt external API rồi tự ghi DB
- Consumer write state của owner khác
- Tạo route compatibility nhưng nhét business logic mới vào wrapper
