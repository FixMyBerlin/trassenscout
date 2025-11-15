export const UPLOAD_SIZES = {
  table: {
    iconSize: "size-6" as const,
    iconPx: 24,
    containerHeight: "h-6",
  },
  grid: {
    iconSize: "size-40" as const,
    iconPx: 160,
    containerHeight: "h-40",
  },
} as const

export type UploadSize = keyof typeof UPLOAD_SIZES
