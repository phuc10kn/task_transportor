# Agent Skill Installation

Folder này là nguồn nội bộ để dùng skill/checklist cho Codex, Cursor hoặc agent runner khác khi cần.

Các agent không mặc định tự discover skill từ `docs/AGENT_SKILLS`. Cần trỏ thủ công, copy thủ công hoặc cấu hình runner theo cơ chế của từng tool.

## Dùng Với Codex

Trong repo này, Codex nên đọc trực tiếp file skill/checklist liên quan trong `docs/AGENT_SKILLS` sau khi đã đọc [Luồng vận hành chuẩn](../../guide/README.md#luồng-vận-hành-chuẩn).

Không cần copy folder nếu Codex đang làm việc trong repo.

## Cài Thủ Công Cho Cursor/Agent Khác

Copy từng folder skill cần dùng sang nơi tool đó đọc skill cá nhân.

Skill folders chính:

```text
doc-navigate/
doc-create-entity/
meta-validate/
theory-find/
theory-review/
theory-challenge/
theory-refine/
theory-impact/
```

Nếu copy skill ra ngoài repo, copy thêm:

```text
guides/
reference/
```

Các link trong skill giả định structure này còn cùng cấp với folder skill.

## Lưu Ý

- Không copy `docs/guide` vào skill; skill phải trỏ về guide trong repo.
- Nếu guide đổi, review lại skill đã copy.
- Skill không chứa canonical schema/rule riêng.
