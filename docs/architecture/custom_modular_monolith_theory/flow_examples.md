# Flow Examples

File này chỉ giữ ví dụ generic cho các loại flow thường gặp.

## Inbound ingest

```text
Source controller
  -> SourceApi
    -> source use case
      -> external client
      -> normalizer
      -> enqueue job hoặc ghi owner state qua owner API
```

## Human review flow

```text
Review controller
  -> ReviewApi
    -> collect context
    -> create draft
    -> review or approve
    -> apply reviewed result qua owner API nếu cần
```

## Canonical edit

```text
Owner controller
  -> OwnerApi
    -> update canonical branch
    -> write revision
    -> write audit
```

## Outbound dry-run

```text
Target controller
  -> TargetApi
    -> read snapshot
    -> validate config and rules
    -> build payload preview
```

## Outbound sync thật

```text
worker or use case
  -> validate freshness
  -> external client
  -> write owner state qua owner API
  -> write job journal
```

## Webhook

```text
route
  -> verify
  -> store raw event
  -> enqueue job
  -> return fast
```

Flow thật của từng repo phải được ghi ở guide kiến trúc của repo đó.
