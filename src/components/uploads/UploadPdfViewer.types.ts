import type { ReactNode } from "react"

type UploadPdfViewerLayout = "normal" | "fullscreen"

type UploadPdfViewerToolbar = {
  start?: ReactNode
  zoom?: boolean
  rotation?: boolean
  download?: boolean
}

type UploadPdfViewerInitial = {
  page?: number
  zoom?: number
}

export type UploadPdfViewerProps = {
  fileUrl: string
  layout?: UploadPdfViewerLayout
  toolbar?: UploadPdfViewerToolbar
  initial?: UploadPdfViewerInitial
  fit?: boolean
}
