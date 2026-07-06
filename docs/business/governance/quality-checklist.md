# Quality Checklist

## Checklist cho từng file business

- File có nói rõ mục tiêu hoặc câu hỏi mà nó trả lời không.
- File có dùng ngôn ngữ business thay vì trượt sang chi tiết code không.
- File có nêu actor, outcome hoặc object vận hành đủ rõ để người mới đọc hiểu không.
- File có liên kết sang workflow, rule, state hoặc use case liên quan không.
- File có phân biệt điều gì là bắt buộc, điều gì là khuyến nghị, điều gì là ví dụ không.
- File có còn khớp với hành vi hiện tại của repo không.

## Checklist cho pull request ảnh hưởng business

- Có use case nào thay đổi mà chưa được cập nhật không.
- Có workflow nào đổi bước nhưng chưa sửa không.
- Có rule chặn hoặc retry nào đổi mà chưa phản ánh không.
- Có trạng thái mới hoặc nghĩa trạng thái mới chưa được ghi không.
- Có ví dụ thực tế nào cần thêm để người review hiểu thay đổi không.

## Dấu hiệu bộ docs đang thiếu chi tiết

- Người đọc biết tên file nhưng vẫn không biết phải làm gì tiếp theo.
- Workflow có các bước nhưng không có điều kiện vào hoặc điều kiện kết thúc.
- Rule có câu khẳng định nhưng không nói khi nào áp dụng.
- Entity chỉ mô tả định nghĩa mà không nói vận hành quan tâm gì.
- Use case nói quá ít nên không phân biệt được với workflow hoặc feature list.
