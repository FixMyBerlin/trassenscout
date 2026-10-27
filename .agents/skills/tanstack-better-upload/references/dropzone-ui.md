# react-dropzone UI (optional add-on)

**Scope:** FMC drag-and-drop **multi-file** UX on top of Better Upload. Not part of Better Upload itself.

Add **react-dropzone** (`bun add react-dropzone`) only when the product needs batch drag-and-drop (`multipleFiles`, progress list); single-file, plain-input and paste flows skip it.

Better Upload exposes the `UploadHookControl` contract; it does not ship a dropzone. Better Upload's [shadcn UploadDropzone](https://better-upload.com/docs/components/upload-dropzone) is built on react-dropzone — FMC apps use a custom styled variant with the same wiring.

## Core wiring

```tsx
import { useId } from "react"
import { useDropzone } from "react-dropzone"
import type { UploadHookControl } from "@better-upload/client"

function UploadDropzoneProgress({
  control: { upload, isPending, progresses },
  accept,
  metadata,
  uploadOverride,
}: {
  control: UploadHookControl<true>
  accept?: string
  metadata?: Record<string, unknown>
  uploadOverride?: (...args: Parameters<UploadHookControl<true>["upload"]>) => void
}) {
  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop: async (files) => {
      if (files.length > 0) {
        if (uploadOverride) {
          uploadOverride(files, { metadata })
        } else {
          upload(files, { metadata })
        }
      }
      if (inputRef.current) inputRef.current.value = "" // lets the same file be re-selected
    },
    noClick: true,
  })

  const inputProps = getInputProps()
  const inputId = useId()

  return (
    <label {...getRootProps()} htmlFor={inputId}>
      <input
        {...inputProps}
        id={inputId}
        type="file"
        multiple
        accept={accept}
        disabled={isPending}
      />
      {/* drag overlay when isDragActive */}
      {/* progress list from progresses */}
    </label>
  )
}
```

`noClick: true`: the root handles drag-and-drop only; click-to-select goes through the visible `<label htmlFor={inputId}>` + input (avoids a double file dialog). `accept` is a client hint mirroring server `fileTypes` ([troubleshooting.md](troubleshooting.md)).

## Progress UI

Render `progresses` from `UploadHookControl`:

```tsx
progresses.map((progress) => <FileUploadItem key={progress.objectInfo.key} progress={progress} />)
```

Per-file states: uploading (`progress < 1`), `complete`, `failed` (check `progress.error`).

Use `formatBytes` from `@better-upload/client/helpers`.

## Extended UX (FMC patterns)

On top of the shadcn template: `beforeunload` guard and modal close guard while `isPending`, auto-hide completed rows, manual dismiss for failed rows, spinner overlay when `isPending && progresses.length === 0`, server messages through shared `translateServerError`.

## Component stack

```text
UploadDropzone (domain: API path, createUploadRecord app helper, relations)
  └─ UploadDropzoneBase (useUploadFiles, onUploadComplete → DB)
       └─ UploadDropzoneProgress (react-dropzone + progress list)
            └─ wrapped by UploadDropzoneContainer (layout)
```

Domain wrappers: `SurveyUploadDropzone`, `SupportUploadDropzone` — same base, different `api` + server fn.

## shadcn vs custom

| Approach                                        | When                                                       |
| ----------------------------------------------- | ---------------------------------------------------------- |
| `npx shadcn add @better-upload/upload-dropzone` | Greenfield, shadcn/Tailwind v4 tokens                      |
| Custom `UploadDropzoneProgress`                 | Existing design system (Heroicons, FMC forms, German copy) |

Either way: pass `control` from `useUploadFiles`, do not call S3 from dropzone directly.

## Paste uploads

A paste handler feeds the same `control.upload`: `onPasteCapture` → collect `clipboardData` files → `upload(files, { metadata })`.

Dropzone anti-patterns: [troubleshooting.md](troubleshooting.md).
