# Better Upload — S3 client & helpers

## Default rule

**Do not** use `@aws-sdk/client-s3`, `S3Client` or `PutObjectCommand` for routine S3 work (only for a confirmed helper gap, see [below](#when-raw-aws-sdk-is-justified)). Use Better Upload end-to-end:

| Layer             | Package                                             | Use for                                                         |
| ----------------- | --------------------------------------------------- | --------------------------------------------------------------- |
| Client factory    | `@better-upload/server/clients` (`aws()`, etc.)     | Single configured instance for router + helpers                 |
| Browser uploads   | `@better-upload/server` (`Router`, `handleRequest`) | Presigned client PUT — not helpers, not raw SDK                 |
| Server object ops | `@better-upload/server/helpers`                     | `getObject`, `deleteObject`, `presignGetObject`, `putObject`, … |

FMC pattern: one `getConfiguredS3Client()` in `s3Client.server.ts` — return `aws({ ... })` — shared by the upload router and all helper calls.

## Client factory

```ts
import { aws } from "@better-upload/server/clients"

export function getConfiguredS3Client() {
  return aws({
    accessKeyId: process.env.S3_UPLOAD_KEY,
    secretAccessKey: process.env.S3_UPLOAD_SECRET,
    region: S3_REGION,
  })
}
```

Also available: `cloudflare`, `backblaze`, `minio`, `custom`, etc. See [helpers-server](https://better-upload.com/docs/helpers-server.mdx).

## Router vs helpers

| Use case                                                       | API                                                                                                                                                                                      |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browser / dropzone uploads                                     | `Router` + `handleRequest` + presigned URLs                                                                                                                                              |
| Server-side buffer/file put (email attachment, sync overwrite) | `putObject` helper + `getConfiguredS3Client()`                                                                                                                                           |
| Download / stream                                              | `getObject`, `getObjectBlob`, `getObjectStream` — inline `<img>` of private uploads usually via GET API route + proxy, not `presignGetObject` ([serving-uploads.md](serving-uploads.md)) |
| Delete on record removal                                       | `deleteObject`, `deleteObjects`                                                                                                                                                          |
| Signed download link                                           | `presignGetObject`                                                                                                                                                                       |
| Metadata only                                                  | `headObject`                                                                                                                                                                             |

## Common helpers

```ts
import { getObject, deleteObject, presignGetObject, putObject } from "@better-upload/server/helpers"

const s3 = getConfiguredS3Client()

const object = await getObject(s3, { bucket: S3_BUCKET, key })

await deleteObject(s3, { bucket: S3_BUCKET, key })

const url = await presignGetObject(s3, {
  bucket: S3_BUCKET,
  key,
  expiresIn: 3600,
})

await putObject(s3, {
  bucket: S3_BUCKET,
  key,
  body: buffer,
  contentType: "application/pdf",
  metadata: { source: "emailAttachment" },
})
```

## Trassenscout (reference app)

**Better Upload path (the norm):**

- Upload router / `handleRequest` → `getConfiguredS3Client()`
- Serve, fetch PDF, delete → `getObject` / `deleteObject` + `getConfiguredS3Client()`

**Not used in Trassenscout despite comments:** Range/partial reads via `GetObjectCommand` (the documented reason for a separate `getAwsSdkS3Client()`).

**Not direct client usage:** `S3ServiceException` in `summarizeUpload.server.ts` — error typing only.

## When raw AWS SDK is justified

Add `@aws-sdk/client-s3` and a separate `getAwsSdkS3Client()` only when Better Upload helpers lack the operation (e.g. Range header on GetObject, command options helpers do not expose). Document the reason next to the factory. Try `putObject` / `getObject` / other helpers first.

## Object keys and URLs

- Keys come from `generateObjectInfo` in `onBeforeUpload` (browser uploads) or shared key helpers (server puts)
- Store key or full URL in DB via an app URL helper (trassenscout: `getS3Url(key)` in `src/shared/uploads/url.ts`; tilda-geo: `s3VirtualHostedUrl` in `app/src/server/s3VirtualHostedUrl.server.ts`)

## Multipart

`multipart: true` / `partSize` are route options — [server-router.md](server-router.md); 0-byte gotcha in [troubleshooting.md](troubleshooting.md). Package version pin: [first-time-setup.md](first-time-setup.md).
