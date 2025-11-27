import { getFileIcon } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileIcon"
import { getFileTypeLabel } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileType"
import type { FileUploadInfo, UploadHookControl, UploadStatus } from "@better-upload/client"
import { formatBytes } from "@better-upload/client/helpers"
import { ArrowUpTrayIcon } from "@heroicons/react/20/solid"
import { useId } from "react"
import { useDropzone } from "react-dropzone"
import { twMerge } from "tailwind-merge"
import { Progress } from "./UploadProgress"

type UploadDropzoneProgressProps = {
  control: UploadHookControl<true>
  id?: string
  accept?: string
  metadata?: Record<string, unknown>
  description?:
    | {
        fileTypes?: string
        maxFileSize?: string
        maxFiles?: number
      }
    | string
  uploadOverride?: (...args: Parameters<UploadHookControl<true>["upload"]>) => void
  translations?: {
    dragAndDrop?: string
    dropFiles?: string
    failed?: string
    completed?: string
    youCanUpload?: string
    upTo?: string
    eachUpTo?: string
    accepted?: string
    file?: string
    files?: string
  }
  /** When true, the dropzone will fill its container instead of using min-w-72 */
  fillContainer?: boolean
  // Add any additional props you need.
}

export function UploadDropzoneProgress({
  control: { upload, isPending, progresses },
  id: _id,
  accept,
  metadata,
  description,
  uploadOverride,
  fillContainer = false,
  translations = {
    dragAndDrop: "Drag and drop files here",
    dropFiles: "Drop files here",
    failed: "Failed",
    completed: "Completed",
    youCanUpload: "You can upload",
    upTo: "Up to",
    eachUpTo: "Each up to",
    accepted: "Accepted",
    file: "file",
    files: "files",
  },
}: UploadDropzoneProgressProps) {
  const id = useId()

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop: (files) => {
      if (files.length > 0) {
        if (uploadOverride) {
          uploadOverride(files, { metadata })
        } else {
          upload(files, { metadata })
        }
      }
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    },
    noClick: true,
  })

  return (
    <div className={twMerge("flex flex-col gap-3 text-gray-900", fillContainer ? "h-full" : "")}>
      <div
        className={twMerge(
          "relative rounded-lg border border-dashed border-gray-300 transition-colors",
          fillContainer ? "h-full" : "",
          isDragActive ? "border-blue-500" : "",
        )}
      >
        <label
          {...getRootProps()}
          className={twMerge(
            "flex w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-white px-2 py-6 transition-colors",
            fillContainer ? "h-full" : "min-w-72",
            isPending ? "cursor-not-allowed text-gray-500" : "hover:bg-blue-50",
            isDragActive ? "opacity-0" : "",
          )}
          htmlFor={_id || id}
        >
          <div className="my-2">
            <ArrowUpTrayIcon className="size-6" />
          </div>

          <div className="mt-3 space-y-1 text-center">
            <p className="text-sm font-semibold">{translations.dragAndDrop}</p>

            <p className="max-w-64 text-xs text-gray-500">
              {typeof description === "string" ? (
                description
              ) : (
                <>
                  {description?.maxFiles &&
                    `${translations.youCanUpload} ${description.maxFiles} ${description.maxFiles !== 1 ? translations.files : translations.file}.`}{" "}
                  {description?.maxFileSize &&
                    `${description.maxFiles !== 1 ? translations.eachUpTo : translations.upTo} ${description.maxFileSize}.`}{" "}
                  {description?.fileTypes && `${translations.accepted} ${description.fileTypes}.`}
                </>
              )}
            </p>
          </div>

          <input
            {...getInputProps()}
            type="file"
            multiple
            id={_id || id}
            accept={accept}
            disabled={isPending}
          />
        </label>

        {isDragActive && (
          <div className="pointer-events-none absolute inset-0 rounded-lg">
            <div className="flex size-full flex-col items-center justify-center rounded-lg bg-blue-50">
              <div className="my-2">
                <ArrowUpTrayIcon className="size-6" />
              </div>

              <p className="mt-3 text-sm font-semibold">{translations.dropFiles}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-2">
        {progresses.map((progress: FileUploadInfo<UploadStatus>) => (
          <FileUploadItem
            key={progress.objectInfo.key}
            progress={progress}
            translations={translations}
          />
        ))}
      </div>
    </div>
  )
}

function FileUploadItem({
  progress,
  translations,
}: {
  progress: FileUploadInfo<UploadStatus>
  translations: NonNullable<UploadDropzoneProgressProps["translations"]>
}) {
  const FileIcon = getFileIcon(progress.type)
  const fileTypeLabel = getFileTypeLabel(progress.type)
  const isComplete = progress.status === "complete"

  return (
    <div
      className={twMerge(
        "flex items-center gap-2 overflow-hidden rounded-lg border border-gray-300 p-3",
        progress.status === "failed" ? "border-red-500 bg-red-50" : "bg-white",
        isComplete && "animate-fade-out-collapse",
      )}
    >
      <span className="size-14 shrink-0 overflow-hidden rounded-md">
        <FileIcon className="size-14 text-gray-500" title={fileTypeLabel || undefined} />
      </span>

      <div className="grid grow gap-1">
        <div className="flex items-center gap-0.5">
          <p className="max-w-40 truncate text-sm font-medium">{progress.name}</p>
          <span className="text-gray-500">·</span>
          <p className="text-xs text-gray-500">{formatBytes(progress.size)}</p>
        </div>

        <div className="flex h-4 items-center">
          {progress.progress < 1 && progress.status !== "failed" ? (
            <Progress className="h-1.5" value={progress.progress * 100} />
          ) : progress.status === "failed" ? (
            <p className="text-xs text-red-500">{translations.failed}</p>
          ) : (
            <p className="text-xs text-gray-500">{translations.completed}</p>
          )}
        </div>
      </div>
    </div>
  )
}
