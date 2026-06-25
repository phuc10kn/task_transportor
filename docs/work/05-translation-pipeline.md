# Translation Pipeline — AI Translate + Review

## Vị trí trong luồng tổng thể

```
Backlog issue → ingest → translation_queue.insert(ai_draft) → review → approved → sync lên Jira
                        ↑                                      ↓
                   AI (đọc source + wiki)              rejected → AI sửa lại
```

---

## Khi nào AI translate?

| Tình huống | Auto-translate? | Ghi chú |
|-----------|----------------|---------|
| Issue mới từ Backlog (tiếng Nhật) | ✅ Có | Nếu project.auto_translate = true |
| Comment mới từ Backlog (tiếng Nhật) | ✅ Có | |
| Dev comment từ Jira cần về Backlog | ✅ Có (nếu confidence cao) | Việt → Nhật, có thể cần review |
| Issue content thay đổi | ❌ Không | Giữ bản dịch cũ, chỉ notify |
| Issue đã có bản dịch cũ | ❌ Không | Không tự động dịch lại |

---

## AI translation context

Khi dịch, AI được cung cấp:

**1. Config context** từ project:
```
- sourceRoots paths
- wikiRoots paths  
- instructionFiles content
```

**2. Wiki vocabulary** (từ project instruction):
```
予約       → reservation
クーポン    → coupon
施設/ホテル → facility/hotel
管理画面   → CMS admin
プッシュ通知 → push notification
```

**3. Source code context**: Nếu cần, AI đọc file source liên quan để hiểu business logic.

**4. Previous translations**: Các bản dịch trước đó của cùng project để giữ consistency:
```
query translation_queue WHERE project_id = ? AND review_status = 'approved'
ORDER BY created_at DESC LIMIT 20
```

**5. Mapping rules**:
```
query mapping_rules WHERE project_id = ?
```

---

## Output: Translation queue entry

```json
{
  "id": 789,
  "issue_id": "uuid-xxx",
  "comment_id": null,
  "target_type": "issue",
  "target_lang": "vi",
  "ai_draft": "Bản dịch tiếng Việt...",
  "reviewed_text": null,
  "review_status": "ai_draft",
  "ai_model": "claude-4-sonnet",
  "ai_confidence": 0.85,
  "ai_prompt_version": "v2",
  "created_at": "2026-06-23T10:00:00"
}
```

---

## Review flow

```
translation_queue.review_status = 'ai_draft'
              │
         User review (UI hoặc chat)
              │
       ┌──────┴──────┐
       ▼              ▼
   Approved        Rejected/Edited
       │              │
       │         User sửa text
       │         review_status = 'edited'
       │              │
       ▼              ▼
   reviewed_text = ai_draft    reviewed_text = user_edit
   issues.status = 'approved'  issues.status = 'approved'
       │                          │
       └──────────┬───────────────┘
                  ▼
          Sync lên Jira
          
   Ghi sync_journal:
     action = 'translate_review' | 'translate_reject'
     Nếu edited: lưu cả old + new text để học
```

---

## Learning từ review history

Khi user sửa bản dịch của AI, CIS ghi nhận:

```json
{
  "original_ja": "クーポン再計算は予約確認画面で必須です。",
  "ai_draft_vi": "Tính toán lại coupon là bắt buộc trên màn hình xác nhận đặt phòng.",
  "user_edit_vi": "Việc tính toán lại coupon phải thực hiện tại màn hình xác nhận đặt phòng.",
  "diff": ["Tính toán lại → Việc tính toán lại", "là bắt buộc trên → phải thực hiện tại"]
}
```

Các pattern này được dùng để:
- Cải thiện AI prompt (few-shot examples)
- Cập nhật vocabulary list (nếu user sửa thuật ngữ nhiều lần)
- Điều chỉnh confidence scoring

---

## Translation quality metrics

| Metric | Cách đo | Mục tiêu |
|--------|---------|----------|
| AI draft rate | % issue có ai_draft ≠ NULL | > 90% |
| Review rate | % issue được review | 100% (bắt buộc) |
| Approval rate | % ai_draft được approve không sửa | > 80% |
| Edit distance | Khoảng cách giữa ai_draft và reviewed_text | Giảm dần theo thời gian |
| Review time | Thời gian từ ai_draft → review | < 24h |

---

## Xử lý đặc biệt

### Confidence thấp

```
ai_confidence < 0.6:
  → Ưu tiên hiển thị trong review queue
  → Warning trong UI: "AI không tự tin về bản dịch này"
```

### Comment ngắn

```
Comment chỉ 1-2 từ cảm thán: "了解しました", "修正しました"
  → AI tự động translate, không cần review
  → translation_queue.review_status = 'approved' (auto)
```

### Comment chứa code snippet

```
Comment có code block:
  → AI giữ nguyên code, chỉ translate text xung quanh
  → Code block đánh dấu rõ trong bản dịch
```

### Nhiều bản dịch pending

```
Queue quá 20 item:
  → Trigger scheduled job: batch review
  → Hoặc cảnh báo admin
```
