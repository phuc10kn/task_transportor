# Note Types

Khi thiếu thông tin, agent **không** fix bừa, không tự chốt, không fill gap bằng assumption ẩn.

Dùng note type phù hợp trong entity hoặc section tương ứng.

---

## NOTE-OPEN

Thông tin chưa có, cần người hoặc process bổ sung.

```markdown
> **NOTE-OPEN**: ID prefix cho entity type này chưa được Meta chốt.
```

---

## NOTE-CANDIDATE

Đề xuất chưa được canonical hóa.

```markdown
> **NOTE-CANDIDATE**: Entity type `DomainEvent` có thể cần thêm vào Meta — chưa chốt.
```

Candidate **không** được coi là canonical.

---

## NOTE-CONFLICT

Hai nguồn knowledge mâu thuẫn nhau.

```markdown
> **NOTE-CONFLICT**: MOD-002 nói state owned locally; TH-MOD-05 yêu cầu single owner.
```

---

## NOTE-EVIDENCE

Thiếu evidence hoặc cần trích dẫn nguồn.

```markdown
> **NOTE-EVIDENCE**: Cần link tới incident INC-003 để chứng minh rule này.
```

---

## NOTE-DECISION

Cần Decision trước khi chốt knowledge.

```markdown
> **NOTE-DECISION**: Placement của aggregate boundary cần DEC mới.
```

---

## NOTE-THEORY

Cần xem xét hoặc reference Theory trước khi chốt.

```markdown
> **NOTE-THEORY**: Rule này có thể vi phạm TH-MOD-03 — cần theory-review.
```

---

## Khi nào dùng

| Tình huống | Note type |
|------------|-----------|
| Thiếu thông tin | NOTE-OPEN |
| Đề xuất chưa chốt | NOTE-CANDIDATE |
| Mâu thuẫn giữa docs | NOTE-CONFLICT |
| Thiếu nguồn chứng minh | NOTE-EVIDENCE |
| Cần quyết định project | NOTE-DECISION |
| Liên quan Theory chưa rõ | NOTE-THEORY |
