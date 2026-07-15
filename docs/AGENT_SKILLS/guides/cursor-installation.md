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
admin-ui-nextjs/
```

Nếu copy skill ra ngoài repo, copy thêm:

```text
guides/
reference/
```

Các link trong skill giả định structure này còn cùng cấp với folder skill.

## Bộ skill cho Admin UI Next.js

`admin-ui-nextjs` là skill điều phối riêng của repo và đọc trực tiếp tại `docs/AGENT_SKILLS/admin-ui-nextjs/SKILL.md`.

Với Codex, cài thêm bộ skill hỗ trợ sau vào `$CODEX_HOME/skills`:

- `ui-design`: design direction và implementation UI trực tiếp trong code.
- `playwright`: acceptance flow có thể lặp lại.
- `playwright-interactive`: kiểm tra và điều tra UI tương tác.
- `screenshot`: bằng chứng hình ảnh hoặc inspiration có mục tiêu.

Các revision đã review khi chốt bộ skill:

- `hursh-shah/codex-design-skill`: `796166cdbe27b9aac6e069d1825b8c9d3b0b1582`.
- `openai/skills`: `49f948faa9258a0c61caceaf225e179651397431`.

Cài đúng revision đã review bằng PowerShell:

```powershell
$repoSkill = (Resolve-Path 'docs\AGENT_SKILLS\admin-ui-nextjs').Path
$codexSkills = Join-Path $HOME '.codex\skills'
$skillLink = Join-Path $codexSkills 'admin-ui-nextjs'
New-Item -ItemType Directory -Force -Path $codexSkills | Out-Null
if (-not (Test-Path $skillLink)) {
    New-Item -ItemType Junction -Path $skillLink -Target $repoSkill | Out-Null
}

$installer = Join-Path $HOME '.codex\skills\.system\skill-installer\scripts\install-skill-from-github.py'
python $installer --repo hursh-shah/codex-design-skill --ref 796166cdbe27b9aac6e069d1825b8c9d3b0b1582 --path ui-design
python $installer --repo openai/skills --ref 49f948faa9258a0c61caceaf225e179651397431 --path skills/.curated/playwright skills/.curated/playwright-interactive skills/.curated/screenshot
```

Chỉ nâng revision sau khi đọc lại `SKILL.md`, resource liên quan và kiểm tra script đi kèm. Sau khi cài hoặc nâng skill cá nhân, restart Codex để session mới discover skill.

## Lưu Ý

- Không copy `docs/guide` vào skill; skill phải trỏ về guide trong repo.
- Nếu guide đổi, review lại skill đã copy.
- Skill không chứa canonical schema/rule riêng.
