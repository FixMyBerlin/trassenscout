# Better Upload — client hooks

`@better-upload/client` hooks. Wire any file input: `<input onChange>`, button + picker, or optional [dropzone-ui.md](dropzone-ui.md).

## useUploadFiles (multiple files)

Primary hook for **multi-file** uploads with batch progress.

```tsx
import { useUploadFiles } from "@better-upload/client"
import type { FileUploadInfo } from "@better-upload/client"

const uploader = useUploadFiles({
  route: "upload", // key in router.routes
  api: `/api/${projectSlug}/upload`, // omit if default /api/upload
  onError: (error) => {
    const msg = error instanceof Error ? error.message : String(error)
    setUploadError(translateServerError(msg))
  },
  onUploadFail: () => {
    // optional — per-file errors shown in progress UI
  },
  onUploadComplete: async ({ files }: { files: FileUploadInfo<"complete">[] }) => {
    // Phase 2: persist each completed upload as a DB row (server fn)
    for (const file of files) {
      await createUploadRecord(file) // app helper: wraps the persist server fn (trassenscout: `src/components/uploads/useUploadRecordCreation.ts`)
    }
  },
})

// Destructure for UI
const { upload, control, isPending, progresses } = uploader
// control = { upload, isPending, progresses } for dropzone components
```

## FileUploadInfo after complete

```ts
file.name
file.size
file.type
file.objectInfo.key // S3 key — store as externalUrl or resolve via `getS3Url(key)` (app helper, trassenscout: `src/shared/uploads/url.ts`; tilda-geo: `s3VirtualHostedUrl({ bucket, key })` in `app/src/server/s3VirtualHostedUrl.server.ts`)
file.progress // 0–1 during upload
```

Build DB payload from completed file (`createUploadFn` is an app server fn; trassenscout: `src/server/uploads/uploads.functions.ts`, called through `useMutation` in `createUploadRecord`):

```ts
await createUploadFn({
  data: {
    title: file.name,
    externalUrl: getS3Url(file.objectInfo.key),
    mimeType: file.type || null,
    fileSize: file.size || null,
    projectSlug,
    // relations...
  },
})
```

## Events summary

| Callback                  | When                                               |
| ------------------------- | -------------------------------------------------- |
| `onBeforeUpload` (client) | Transform/rename files before request              |
| `onUploadBegin`           | After server returns presigned URLs, before S3 PUT |
| `onUploadProgress`        | Per-file progress updates                          |
| `onUploadComplete`        | At least one file succeeded                        |
| `onUploadFail`            | At least one file failed                           |
| `onError`                 | Critical failure; zero files uploaded              |
| `onUploadSettle`          | Always after batch finishes                        |

## Metadata

```ts
upload(files, { metadata: { surveyResponseId, surveySessionId } })
```

Read on server as `clientMetadata` in `onBeforeUpload`. It is a client hint only — validate it there with Zod ([server-router.md](server-router.md)).

## useUploadFile (single file)

For button + single file picker. Use `useUploadFile` with `UploadHookControl<false>`.

## TanStack Query integration

Bytes go through `useUploadFiles`; the DB row is `useMutation({ mutationFn: createUploadFn })` inside `onUploadComplete` (wrapped as `createUploadRecord(file)`, see above). `uploadFiles()` / `uploadFile()` inside `useMutation` only when there is no `UploadHookControl` UI — otherwise prefer `useUploadFiles`.

## Helpers

```ts
import { formatBytes } from "@better-upload/client/helpers"
formatBytes(file.size) // "1.5 MB"
```

Route/API mismatch and error callbacks: [troubleshooting.md](troubleshooting.md).
