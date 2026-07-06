# Product Model

## Mô hình trung tâm

Hệ thống đi theo mô hình:

```text
System -> CIS -> System
```

## Ý nghĩa business

- Dữ liệu không đi trực tiếp từ hệ thống A sang hệ thống B.
- Mọi dữ liệu phải vào CIS trước để được chuẩn hóa và kiểm soát.
- Quyết định publish ra hệ thống đích chỉ xảy ra sau khi dữ liệu đã đủ điều kiện.

## Chuỗi giá trị nghiệp vụ

Theo góc nhìn business, mô hình này tạo ra chuỗi giá trị:

1. `Nhận dữ liệu` từ source.
2. `Giữ dữ liệu trong CIS` như một trạng thái vận hành có kiểm soát.
3. `Review và chuẩn hóa` trước khi publish.
4. `Publish có điều kiện` sang target.
5. `Theo dõi và phục hồi` nếu có lỗi hoặc conflict.

## Vai trò của CIS

Theo góc nhìn business, CIS là:

- nơi giữ issue theo ngữ cảnh vận hành;
- nơi lưu bản dịch, mapping, anomaly, job state và audit;
- nơi đội vận hành ra quyết định trước khi sync ra ngoài.

## Điều CIS không nên bị hiểu sai thành

- không chỉ là cache tạm;
- không chỉ là nơi gom log kỹ thuật;
- không chỉ là bước trung chuyển trước khi đẩy thẳng sang Jira;
- không phải nơi mọi dữ liệu được tự động xem là đúng mà không cần review.

## Quyết định business cốt lõi

- `source snapshot` và `canonical data` là hai lớp khác nhau.
- `dry-run` là bước ra quyết định, không phải chỉ là preview đẹp cho UI.
- `anomaly` là tín hiệu vận hành, không phải log phụ.
- `retry` là một hành động có chủ đích, không phải luôn luôn an toàn để bấm lại.
