import type { FileUploadInfo, UploadHookControl, UploadStatus } from "@better-upload/client"
import { formatBytes } from "@better-upload/client/helpers"
import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/20/solid"
import { useEffect, useId, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { twMerge } from "tailwind-merge"
import { translateServerError } from "@/src/components/core/components/forms/errorMessageTranslations"
import { beginModalCloseBlock } from "@/src/components/core/components/Modal/modalCloseGuard"
import { SpinnerIcon } from "@/src/components/core/components/Spinner"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { SurveyUploadMetadata } from "@/src/components/uploads/UploadDropzoneBase"
import { FileTypeIcon } from "@/src/components/uploads/utils/FileTypeIcon"
import { getFileTypeLabel } from "@/src/components/uploads/utils/getFileType"
import { Progress } from "./UploadProgress"
import "./upload-progress-animations.css"

type Props = {
  control: UploadHookControl<true>
  id?: string
  accept?: string
  surveyMeta?: SurveyUploadMetadata
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
  surveyMeta,
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
}: Props) {
  const id = useId()
  const ANIMATION_DURATION_MS = 5500 // 5s animation + 0.5s buffer
  const [awaitingProgress, setAwaitingProgress] = useState(false)
  const [completionTimes, setCompletionTimes] = useState<Record<string, number>>({})
  const [now, setNow] = useState(0)
  const [dismissedFiles, setDismissedFiles] = useState<Set<string>>(new Set())
  const endCloseBlockRef = useRef<null | (() => void)>(null)
  const isProcessingFiles = awaitingProgress && progresses.length === 0 && !error

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

  useEffect(
    function trackCompletedUploadVisibility() {
      const intervalId = window.setInterval(() => {
        const currentTime = Date.now()
        setCompletionTimes((previousTimes) => {
          let nextTimes = previousTimes
          for (const progress of progresses) {
            if (progress.status === "complete" && !(progress.objectInfo.key in previousTimes)) {
              if (nextTimes === previousTimes) {
                nextTimes = { ...previousTimes }
              }
              nextTimes[progress.objectInfo.key] = currentTime
            }
          }
          return nextTimes
        })
        setNow(currentTime)
      }, 250)

      return function stopTrackingCompletedUploadVisibility() {
        window.clearInterval(intervalId)
      }
    },
    [progresses],
  )

  useEffect(() => {
    const isActive = isPending || isProcessingFiles
    if (isActive && !endCloseBlockRef.current) {
      endCloseBlockRef.current = beginModalCloseBlock()
    }
    if (!isActive && endCloseBlockRef.current) {
      endCloseBlockRef.current()
      endCloseBlockRef.current = null
    }
  }, [isPending, isProcessingFiles])

  useEffect(() => {
    return () => {
      endCloseBlockRef.current?.()
      endCloseBlockRef.current = null
    }
  }, [])

  // Filter out items that completed more than 5.5 seconds ago (after animation completes)
  // Failed files are never auto-hidden - they must be manually dismissed
  const visibleProgresses = progresses.filter((progress) => {
    if (dismissedFiles.has(progress.objectInfo.key)) return false
    if (progress.status === "failed") return true
    if (progress.status !== "complete") return true

    const completionTime = completionTimes[progress.objectInfo.key]
    if (!completionTime) return true
    return now - completionTime < ANIMATION_DURATION_MS
  })

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop: async (files) => {
      if (files.length > 0) {
        // Clear any previous errors when new files are selected
        if (onErrorDismiss) {
          onErrorDismiss()
        }
        setAwaitingProgress(true)

        if (uploadOverride) {
          uploadOverride(files, { metadata: surveyMeta })
        } else {
          upload(files, { metadata: surveyMeta })
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
      setAwaitingProgress(true)
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
                  {description?.fileTypes && `${translations.accepted} ${description.fileTypes}`}
                  {description?.maxFiles && (
                    <>
                      {description?.fileTypes ? ". " : ""}
                      Max. {description.maxFiles}{" "}
                      {description.maxFiles !== 1 ? translations.files : translations.file}.
                    </>
                  )}
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
  translations: NonNullable<Props["translations"]>
  onDismiss?: () => void
}

function FileUploadItem({ progress, translations, onDismiss }: FileUploadItemProps) {
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
  const errorMessage = rawErrorMessage ? translateServerError(rawErrorMessage) : null

  return (
    <div
      className={twMerge(
        "flex items-center gap-2 overflow-hidden rounded-lg border border-gray-300 p-3",
        isFailed ? "border-red-500 bg-red-50" : "bg-white",
        isComplete && !isFailed && "animate-fade-out-collapse",
      )}
    >
      <span className="size-14 shrink-0 overflow-hidden rounded-md">
        <Tooltip content={fileTypeLabel}>
          <FileTypeIcon mimeType={progress.type} className="size-14 text-gray-500" />
        </Tooltip>
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
