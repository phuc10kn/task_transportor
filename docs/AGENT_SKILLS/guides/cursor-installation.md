# Cursor Installation

Folder này là nguồn nội bộ để copy skill sang Cursor khi cần.

Cursor không tự discover skill từ `docs/AGENT_SKILLS`.

## Cài Thủ Công

Copy từng folder skill cần dùng sang nơi Cursor đọc skill cá nhân.

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
