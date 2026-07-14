# Planner Viết Plan Tốt

> Bắt buộc đọc và tuân thủ [structure-rules.md](./structure-rules.md) trước khi tạo hoặc sửa plan.

## Mục đích

Prompt này dùng để tạo hoặc chỉnh plan trước khi sửa docs, code hoặc cấu trúc knowledge.

Nó chỉ lo lập plan. Không dùng để:

- điều phối nhiều lượt;
- chọn current phase;
- thực thi phase.

Nếu current phase đã rõ và chỉ cần làm thật, dùng [executor.md](./executor.md).

Nếu plan đã có nhưng cần chọn phase, resume hoặc blocked handling, dùng [coordinator.md](./coordinator.md).

## Thông báo bắt buộc trước khi lập hoặc sửa plan

Sau khi đọc đủ context để xác định cần planner nhưng trước khi sửa bất kỳ file nào, phải in một dòng trong `commentary`:

```text
Đang dùng planner.md — plan <plan-path> — lý do: plan chưa đủ rõ hoặc cần tạo/sửa contract.
```

Không được dùng dòng này để ngầm xác nhận executor hoặc current phase đã mở.

## Khi nên dùng

Dùng file này khi:

- task có nhiều phase;
- task có nhiều file hoặc nhiều layer;
- task có nguy cơ vượt scope;
- task cần checklist nghiệm thu rõ;
- task cần người khác có thể tiếp tục mà không phải tự đoán.

Không dùng file này khi:

- task quá nhỏ và sửa an toàn trong một nhịp;
- user chỉ cần trả lời ngắn;
- current phase đã rõ và chỉ còn việc triển khai.

## Hợp đồng đầu ra của plan

Root `README.md` của plan phải có các section sau:

- `## Mục tiêu`
- `## Phạm vi`
- `## Baseline hiện tại`
- `## Source of truth`
- `## Phase triển khai`
- `## Điều phối`
- `## Checklist nghiệm thu tổng`
- `## Điều kiện hoàn thành`

Với mỗi phase, bắt buộc có:

- phase id ổn định;
- mục tiêu phase;
- việc cần làm;
- target files/artifacts;
- điều kiện mở phase;
- checklist nghiệm thu;
- `Kết quả thực hiện`.

`Phase id` là định danh ổn định để handoff, blocked note và resume trỏ về cùng một phase dù tiêu đề phase được chỉnh lại.

`Target files/artifacts` là danh sách file, folder, section hoặc artifact mà phase được phép sửa hoặc verify. Nếu phase chỉ review/verify và không sửa file, ghi rõ `verify-only`.

Mỗi phase phải dùng cùng một shape để dễ điều phối:

```text
# <phase id> - <phase title>

## Mục tiêu
- <mục tiêu phase>

## Artifact mục tiêu
- <path hoặc artifact>

## Điều kiện mở phase
- <điều kiện>

## Công việc
- <việc cần làm>

## Checklist nghiệm thu
- [ ] <item đo được>

## Kết quả thực hiện
```

`Kết quả thực hiện` là vị trí canonical để log execution note của phase. Dùng đúng các format sau:

- `No-change: <path> - <lý do ngắn>`
- `Fix tối thiểu: <path> - <phạm vi ngắn>`
- `In-progress: <phase id> - <đã xong> | Next: <việc tiếp theo>`

`02-coordination.md > ## Quy ước điều phối` là vị trí canonical cho điều phối nhiều lượt. Bên trong phải có:

- `### Handoff hiện tại`
- `### Trạng thái blocked`
- `### Accepted gaps`
- `### Quy tắc resume`

Deferred work ghi trong `00-overview.md` hoặc `02-coordination.md > ### Accepted gaps`; không tạo file riêng và không trộn vào acceptance phase hiện tại.

Cây file/folder phải đúng tuyệt đối theo `structure-rules.md`: một overview file, một coordination file và mỗi phase là một file trực tiếp trong `01-phases/`.

## Prompt mẫu

```text
Bạn đang làm việc trong repo này.

Nhiệm vụ:
<mô tả task>

Hãy đọc context liên quan trước, sau đó viết hoặc cập nhật plan tại:
<target-plan-directory>

Yêu cầu bắt buộc:

1. Chỉ tạo hoặc sửa file plan. Chưa triển khai thay đổi thật.
2. Phải rà docs/file liên quan trước khi viết plan.
3. Viết plan bằng tiếng Việt có dấu.
4. Tách rõ:
   - mục tiêu;
   - trong scope;
   - ngoài scope;
   - baseline hiện tại;
   - source of truth;
   - phase triển khai;
   - deferred work;
   - rủi ro và trigger phải dừng.
5. Mọi phase đều phải có:
   - phase id ổn định;
   - mục tiêu phase;
   - việc cần làm;
   - target files/artifacts;
   - điều kiện mở phase;
   - checklist nghiệm thu;
   - mục `Kết quả thực hiện`.
6. `02-coordination.md` phải có `## Quy ước điều phối` với đúng các mục:
   - `### Handoff hiện tại`
   - `### Trạng thái blocked`
   - `### Accepted gaps`
   - `### Quy tắc resume`
7. Checklist nghiệm thu phải đo được bằng file, path, section hoặc artifact cụ thể.
8. Nếu có nhiều source of truth, phải tách rõ vai trò từng nguồn.
9. Nếu có deferred work, phải ghi riêng và không trộn vào acceptance phase hiện tại.
10. Không dùng wording mơ hồ ở chỗ cần chốt như:
   - "hoặc";
   - "có thể";
   - "nếu thích".
11. Tuân thủ cây bắt buộc trong `structure-rules.md`; không tạo folder overview/coordination hoặc folder con cho phase.
12. Nếu phát hiện plan chưa thể viết sắc do thiếu context, nêu findings trước rồi mới sửa plan.

Kỳ vọng chất lượng:

- phase không chồng ownership;
- không có scope creep âm thầm;
- execution team không phải tự đoán nơi log kết quả;
- coordination team không phải tự đoán current phase hoặc chỗ ghi handoff;
- source of truth, summary và routing note được tách rõ.

Đầu ra mong muốn:

- cập nhật plan package tại `<target-plan-directory>`;
- trả lời ngắn:
  - file đã tạo/cập nhật;
  - plan đã đủ triển khai chưa;
  - còn open risk nào chưa.
```

## Checklist tự review

Sau khi viết hoặc sửa plan, bắt buộc chạy checklist này.

Nếu item nào fail nhưng có thể sửa trong scope, phải sửa plan và review lại trong cùng lượt.

Chỉ được kết thúc khi:

- toàn bộ checklist pass; hoặc
- có blocker thật được ghi rõ trong plan và phản hồi cuối.

Không được tự bịa source of truth, dependency hoặc acceptance để ép checklist pass.

- [ ] Plan có đủ các section bắt buộc.
- [ ] Mỗi phase có phase id ổn định.
- [ ] Mỗi phase có đủ mục tiêu, việc làm, target files/artifacts, điều kiện mở, checklist và `Kết quả thực hiện`.
- [ ] Cây plan đúng `structure-rules.md`.
- [ ] `02-coordination.md > ## Quy ước điều phối` có đúng 4 mục canonical.
- [ ] Acceptance đo được bằng artifact cụ thể.
- [ ] Source of truth đã tách rõ vai trò.
- [ ] Deferred work không lẫn vào acceptance hiện tại.
- [ ] Ngoài scope đã được chốt rõ.
- [ ] Không còn wording mơ hồ ở chỗ cần quyết định.

## Anti-patterns

Không viết plan theo các kiểu sau:

- phase lặp ý của nhau;
- acceptance không tick được;
- current phase chỉ hiểu bằng ngữ cảnh ngầm;
- handoff note không có chỗ ở cố định;
- blocked note không có format;
- dùng plan để lén mở rộng scope;
- trộn deferred work vào điều kiện pass hiện tại.

## Prompt liên quan

- Điều phối plan: [coordinator.md](./coordinator.md)
- Thực thi phase: [executor.md](./executor.md)

## Mẫu phản hồi cuối

```text
Đã cập nhật plan tại <path>.

Plan đã/chưa đủ để triển khai.

Open risk còn lại:
- ...
```
