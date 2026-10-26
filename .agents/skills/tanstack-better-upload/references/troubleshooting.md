# Troubleshooting

## Two-phase upload

1. **Bytes to S3** — Better Upload (`useUploadFiles` → presigned PUT)
2. **App record** — `createServerFn` in `onUploadComplete`; never before S3 completes, never skipped when the app tracks uploads in Postgres.

## Anti-patterns

- `uploadFiles()` + TanStack Query **instead of** `useUploadFiles` when you need built-in progress UI
- S3 keys or auth enforced only on the client
- Swallowing `createUploadRecord` (app helper wrapping `createUploadFn`) errors (orphan S3 objects)
- Importing `*.server.ts` from route files without handler-only usage (see `tanstack-start-conventions`)
- `putObject` helper for **browser** uploads — use router + presigned URLs (`putObject` is fine for small **server-side** buffer puts)
- `fetch` to S3 from dropzone — use `upload()` only

## Error handling

| Event                                   | Use for                                                       |
| --------------------------------------- | ------------------------------------------------------------- |
| `onError`                               | Pre-S3 failures (network, too many files, auth) — show banner |
| `onUploadFail`                          | Some files failed after S3 attempt — optional global handler  |
| Per-file `progress.error`               | Individual file failures in progress list                     |
| `onBeforeUpload` throw / `RejectUpload` | Server-side rejection with message to client                  |

Prefer `RejectUpload('message')` for rejections — why and which envelope the client parses: [server-router.md](server-router.md). `onError` example: [client-hooks.md](client-hooks.md).

## Route / API mismatch

| Symptom                                    | Check                                                                                      |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| 404 on POST                                | Client `api` matches TanStack route path                                                   |
| Unknown route                              | Client `route` string matches `routes: { upload: ... }` key                                |
| CORS on PUT                                | S3 bucket CORS, not app CORS                                                               |
| Auth 401/403                               | Handler runs before `handleRequest`; cookies on same-origin POST                           |
| Dev 404 on `<img src="/api/...">`; prod OK | Add `forwardApiRequestsPastViteAssetMiddleware` — [serving-uploads.md](serving-uploads.md) |

## accept / fileTypes

Client `accept` on `<input>` is a UX hint mirroring server `fileTypes`. The server validates in `onBeforeUpload`; keep both in sync.

## Multipart

`multipart: true` on route for files **> 5GB** (optional below 5GB). Empty (0-byte) files fail with multipart enabled. Client unchanged — [server-router.md](server-router.md).
