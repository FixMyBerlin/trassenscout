export const UPLOAD_SIZES = {
  table: {
    iconSize: "size-12" as const,
    iconPx: 48,
    containerHeight: "h-12",
  },
  grid: {
    iconSize: "size-32" as const,
    iconPx: 128,
    containerHeight: "h-32",
  },
} as const

export type UploadSize = keyof typeof UPLOAD_SIZES
