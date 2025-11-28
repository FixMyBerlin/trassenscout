import { getFileIcon } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileIcon"
import { getFileTypeLabel } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileType"
import { SpinnerIcon } from "@/src/core/components/Spinner"
import { errorMessageTranslations } from "@/src/core/components/forms/errorMessageTranslations"
import type { FileUploadInfo, UploadHookControl, UploadStatus } from "@better-upload/client"
import { formatBytes } from "@better-upload/client/helpers"
import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/20/solid"
import { useEffect, useId, useMemo, useRef, useState } from "react"
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
  /** Error message to display */
  error?: string | null
  /** Callback to dismiss the error */
  onErrorDismiss?: () => void
}

export function UploadDropzoneProgress({
  control: { upload, isPending, progresses },
  id: _id,
  accept,
  metadata,
  description,
  uploadOverride,
  fillContainer = false,
  error,
  onErrorDismiss,
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
  const completionTimesRef = useRef<Map<string, number>>(new Map())
  const [isProcessingFiles, setIsProcessingFiles] = useState(false)
  const selectedFilesCountRef = useRef<number>(0)
  const [dismissedFiles, setDismissedFiles] = useState<Set<string>>(new Set())

  // Warn user when closing tab during upload (same logic as spinner)
  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      if (isPending || isProcessingFiles) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", beforeUnload)
    return () => {
      window.removeEventListener("beforeunload", beforeUnload)
    }
  }, [isPending, isProcessingFiles])

  // Track when items complete
  useEffect(() => {
    progresses.forEach((progress) => {
      if (
        progress.status === "complete" &&
        !completionTimesRef.current.has(progress.objectInfo.key)
      ) {
        completionTimesRef.current.set(progress.objectInfo.key, Date.now())
      }
    })
  }, [progresses])

  // Track when files are selected but not yet in progresses (processing phase)
  // Clear spinner when files appear in progresses or when an error occurs
  useEffect(() => {
    if (isProcessingFiles && (progresses.length > 0 || error)) {
      setIsProcessingFiles(false)
      selectedFilesCountRef.current = 0
    }
  }, [progresses, isProcessingFiles, error])

  // Filter out items that completed more than 5.5 seconds ago (after animation completes)
  // Failed files are never auto-hidden - they must be manually dismissed
  const visibleProgresses = useMemo(() => {
    const now = Date.now()
    const ANIMATION_DURATION_MS = 5500 // 5s animation + 0.5s buffer

    return progresses.filter((progress) => {
      // Don't show dismissed files
      if (dismissedFiles.has(progress.objectInfo.key)) return false

      // Failed files are always shown (until manually dismissed)
      if (progress.status === "failed") return true

      // Files that are still uploading are always shown
      if (progress.status !== "complete") return true

      // Completed files are shown for a limited time
      const completionTime = completionTimesRef.current.get(progress.objectInfo.key)
      if (!completionTime) return true
      return now - completionTime < ANIMATION_DURATION_MS
    })
  }, [progresses, dismissedFiles])

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop: async (files) => {
      if (files.length > 0) {
        // Clear any previous errors when new files are selected
        if (onErrorDismiss) {
          onErrorDismiss()
        }
        setIsProcessingFiles(true)
        selectedFilesCountRef.current = files.length

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

  const inputProps = getInputProps()
  const originalOnChange = inputProps.onChange

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setIsProcessingFiles(true)
      selectedFilesCountRef.current = files.length
    }
    if (originalOnChange) {
      originalOnChange(event)
    }
  }

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
            {...inputProps}
            type="file"
            multiple
            id={_id || id}
            accept={accept}
            disabled={isPending}
            onChange={handleFileChange}
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

        {isProcessingFiles && !isDragActive && (
          <div className="pointer-events-none absolute inset-0 rounded-lg">
            <div className="flex size-full flex-col items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm">
              <div className="my-2">
                <SpinnerIcon size="5" />
              </div>
              <p className="mt-3 text-sm font-semibold">Verarbeitung...</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          <p className="grow">{error}</p>
          {onErrorDismiss && (
            <button
              type="button"
              onClick={onErrorDismiss}
              className="shrink-0 rounded p-1 hover:bg-red-100"
              aria-label="Fehler schließen"
            >
              <XMarkIcon className="size-4" />
            </button>
          )}
        </div>
      )}

      <div className="grid gap-2">
        {visibleProgresses.map((progress: FileUploadInfo<UploadStatus>) => (
          <FileUploadItem
            key={progress.objectInfo.key}
            progress={progress}
            translations={translations}
            onDismiss={
              progress.status === "failed"
                ? () => setDismissedFiles((prev) => new Set(prev).add(progress.objectInfo.key))
                : undefined
            }
          />
        ))}
      </div>
    </div>
  )
}

type FileUploadItemProps = {
  progress: FileUploadInfo<UploadStatus>
  translations: NonNullable<UploadDropzoneProgressProps["translations"]>
  onDismiss?: () => void
}

function FileUploadItem({ progress, translations, onDismiss }: FileUploadItemProps) {
  const FileIcon = getFileIcon(progress.type)
  const fileTypeLabel = getFileTypeLabel(progress.type)
  const isComplete = progress.status === "complete"
  const isFailed = progress.status === "failed"
  // Extract error message from progress if available and translate it
  const rawErrorMessage =
    isFailed && "error" in progress && progress.error
      ? progress.error instanceof Error
        ? progress.error.message
        : String(progress.error)
      : null
  const errorMessage = rawErrorMessage
    ? errorMessageTranslations[rawErrorMessage] || rawErrorMessage
    : null

  return (
    <div
      className={twMerge(
        "flex items-center gap-2 overflow-hidden rounded-lg border border-gray-300 p-3",
        isFailed ? "border-red-500 bg-red-50" : "bg-white",
        isComplete && !isFailed && "animate-fade-out-collapse",
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
          {progress.progress < 1 && !isFailed ? (
            <Progress className="h-1.5" value={progress.progress * 100} />
          ) : isFailed ? (
            <div className="flex items-center gap-2">
              <p className="text-xs text-red-500">{errorMessage || translations.failed}</p>
            </div>
          ) : (
            <p className="text-xs text-gray-500">{translations.completed}</p>
          )}
        </div>
      </div>

      {isFailed && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-1 hover:bg-red-100"
          aria-label="Fehler verbergen"
        >
          <XMarkIcon className="size-4 text-red-600" />
        </button>
      )}
    </div>
  )
}
