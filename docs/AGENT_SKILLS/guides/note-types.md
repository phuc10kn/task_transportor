# Note Types

Khi thiếu thông tin, agent không fix bừa và không fill gap bằng assumption ẩn.

## NOTE-OPEN

Thông tin chưa có hoặc cần người/process bổ sung.

```md
> **NOTE-OPEN**: Chưa xác định canonical home cho nội dung này.
```

## NOTE-CANDIDATE

Đề xuất chưa được canonical hóa.

```md
> **NOTE-CANDIDATE**: Entity type `DomainEvent` chưa được chốt trong `docs/meta`.
```

Candidate không được coi là canonical.

## NOTE-CONFLICT

Hai nguồn knowledge mâu thuẫn.

```md
> **NOTE-CONFLICT**: Product scope và decision hiện tại mô tả khác nhau.
```

## NOTE-EVIDENCE

Thiếu evidence hoặc cần dẫn nguồn.

```md
> **NOTE-EVIDENCE**: Cần link incident hoặc metric để chứng minh rule này.
```

## NOTE-DECISION

Cần decision trước khi chốt knowledge.

```md
> **NOTE-DECISION**: Cần decision trước khi đổi boundary module.
```

## NOTE-THEORY

Cần xem xét theory trước khi chốt.

```md
> **NOTE-THEORY**: Rule này cần review với theory modular architecture.
```

## Khi Nào Dùng

| Tình huống | Note |
| --- | --- |
| Thiếu thông tin | `NOTE-OPEN` |
| Đề xuất chưa chốt | `NOTE-CANDIDATE` |
| Mâu thuẫn | `NOTE-CONFLICT` |
| Thiếu evidence | `NOTE-EVIDENCE` |
| Cần quyết định | `NOTE-DECISION` |
| Cần review theory | `NOTE-THEORY` |
