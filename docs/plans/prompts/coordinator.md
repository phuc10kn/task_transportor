# Coordinator Điều Phối Plan

## Mục đích

Prompt này dùng để điều phối một plan đã có qua nhiều phase hoặc nhiều lượt làm việc.

Nó chỉ lo:

- chọn current phase;
- kiểm tra dependency;
- quyết định phase nào được mở;
- ghi handoff note;
- ghi blocked note;
- quyết định nên quay về `planner.md` hay chuyển sang `executor.md`.

Nó không dùng để:

- viết plan từ đầu;
- tick checklist phase;
- đánh dấu phase pass thay cho thực thi;
- triển khai sâu một phase.

## Quan hệ với 2 file còn lại

- `planner.md`: tạo hoặc sửa plan.
- `coordinator.md`: điều phối plan đã có.
- `executor.md`: thực thi current phase đã được mở rõ.

Luồng chuẩn:

```text
plan chưa có hoặc chưa đủ rõ
    -> planner.md

plan đã có nhưng cần chọn phase, resume, blocked handling
    -> coordinator.md

current phase đã rõ và đủ điều kiện mở
    -> executor.md
```

## Khi nên dùng

Dùng file này khi:

- plan có từ 2 phase trở lên;
- task bị cắt thành nhiều lượt;
- cần resume sau lượt cũ;
- cần biết phase nào chưa được mở;
- cần xử lý blocked hoặc accepted gap;
- cần bàn giao rõ cho lượt sau.

Không dùng file này khi:

- task chỉ có một phase nhỏ;
- current phase đã rõ và chỉ còn việc làm thật;
- plan còn mơ hồ đến mức phải sửa lại cấu trúc plan trước.

## Quy tắc điều phối

### 1. Đọc và xác định trạng thái

Trước khi kết luận current phase, phải đọc:

- toàn bộ plan;
- `Kết quả thực hiện` của các phase liên quan;
- `## Quy ước điều phối`;
- phase id và target files/artifacts của phase liên quan.

Phải xác định rõ:

- phase đã xong;
- current phase;
- phase đang blocked nếu có;
- phase chưa được mở vì dependency.

### 2. Chọn current phase

Mặc định chọn phase đầu tiên thỏa cả 2 điều kiện:

- phase trước nó đã pass acceptance;
- phase đó còn item chưa hoàn tất hoặc còn `In-progress`.

Không được mở phase sau nếu:

- phase trước chưa pass;
- phase trước còn blocker;
- phase trước chưa có kết luận đủ để resume hoặc đóng phase.

### 3. Handoff và blocked note

Điều phối chỉ được ghi vào đúng các vị trí canonical sau:

- `## Quy ước điều phối > ### Handoff hiện tại`
- `## Quy ước điều phối > ### Trạng thái blocked`
- `## Quy ước điều phối > ### Accepted gaps`

`Handoff hiện tại` là snapshot hiện tại, không phải lịch sử. Mỗi lần điều phối phải thay note cũ bằng note mới còn hiệu lực.

`Trạng thái blocked` là snapshot xử lý blocker hiện tại. Nó chỉ được chứa một trong hai trạng thái:

- `Blocked: <phase id> - <blocker ngắn>`
- `Resolved: <phase id> - <lý do ngắn>`

Nếu không còn blocker liên quan đến current phase, để section này là `None`.

Format handoff:

```text
Current phase: <phase id> - <phase title>
Done: <1-3 ý>
Next: <1-3 ý>
Prompt tiếp theo: planner.md | executor.md
```

Format blocked:

```text
Blocked: <phase id> - <blocker ngắn>
Impact: <ảnh hưởng>
Next action: <bước gỡ blocker>
```

### 4. Không được tick checklist

`coordinator.md` tuyệt đối không:

- tick checklist phase;
- đánh dấu phase pass;
- ghi `No-change` hoặc `Fix tối thiểu` thay cho thực thi.

Checklist chỉ được cập nhật trong `executor.md` sau khi đã làm thật hoặc verify thật.

### 5. Khi nào quay về planner.md

Phải quay về `planner.md` nếu:

- plan thiếu section bắt buộc;
- phase thiếu phase id ổn định;
- phase thiếu target files/artifacts;
- phase thiếu `Kết quả thực hiện`;
- thiếu `## Quy ước điều phối` hoặc sai vị trí canonical;
- dependency chưa chốt;
- acceptance còn mơ hồ;
- source of truth chưa tách vai rõ.

### 6. Accepted gap

Chỉ dùng `accepted gap` khi:

- plan hoặc source of truth đã cho phép thiếu phần đó;
- phần thiếu không làm sai current phase;
- gap được ghi tại `## Quy ước điều phối > ### Accepted gaps`.

`Kết quả thực hiện` chỉ được nhắc lại hoặc link tới accepted gap, không phải vị trí canonical của gap.

Không dùng `accepted gap` để né blocker thật hoặc hợp thức hóa scope creep.

### 7. Khi nào chuyển sang executor.md

Chỉ chuyển sang `executor.md` khi:

- current phase đã rõ;
- dependency đã pass;
- target files/artifacts của phase đã xác định;
- không còn blocker điều phối;
- plan đủ cấu trúc để execution log và handoff không bị thất lạc.

## Prompt mẫu

```text
Bạn sẽ điều phối plan tại:
<plan-file>

Task hiện tại:
<mô tả task hoặc trạng thái>

Yêu cầu bắt buộc:

1. Đọc toàn bộ plan trước khi kết luận current phase.
2. Không triển khai sâu phase.
3. Xác định:
   - phase đã xong;
   - current phase;
   - phase blocked;
   - phase chưa được mở.
4. Kiểm tra dependency: phase sau chỉ mở khi phase trước đã pass acceptance thật.
5. Chỉ được ghi handoff note hoặc blocked note vào đúng vị trí canonical.
6. Handoff hiện tại phải overwrite snapshot cũ.
7. Accepted gap chỉ ghi vào `### Accepted gaps`.
8. Không tick checklist và không đánh dấu pass thay cho thực thi.
9. Nếu plan thiếu cấu trúc để điều phối an toàn, nêu findings và quay về `planner.md`.
10. Nếu current phase đã rõ, kết luận prompt tiếp theo là `executor.md`.
11. Nếu current phase chưa rõ, kết luận prompt tiếp theo là `planner.md`.

Đầu ra mong muốn:

- kết luận current phase;
- trạng thái phase trước/sau;
- handoff hoặc blocked note ngắn;
- prompt tiếp theo nên dùng.
```

## Checklist tự review điều phối

- [ ] Current phase được chọn theo dependency thật.
- [ ] Không mở phase sau khi phase trước chưa pass.
- [ ] Phase được chọn bằng phase id ổn định.
- [ ] Chỉ dùng vị trí canonical cho handoff, blocked note và accepted gap.
- [ ] Handoff hiện tại đã được overwrite bằng snapshot còn hiệu lực.
- [ ] Không tick checklist thay cho thực thi.
- [ ] Đã chốt đúng prompt tiếp theo: `planner.md` hoặc `executor.md`.

## Anti-patterns

Không điều phối theo các kiểu sau:

- thấy phase sau dễ hơn nên nhảy sang trước;
- blocked nhưng âm thầm mở rộng scope để đi tiếp;
- current phase chưa rõ mà vẫn gọi `executor.md`;
- dùng điều phối để tick checklist;
- ghi handoff rải rác nhiều chỗ.

## Mẫu báo cáo cuối

```text
Đã điều phối plan tại <plan-file>.

Current phase:
- ...

Trạng thái:
- Done: ...
- Blocked: ...
- Chưa mở: ...

Handoff:
- ...

Prompt tiếp theo:
- planner.md | executor.md
```
