export const UPLOAD_SIZES = {
  table: {
    iconSize: "size-12" as const,
    iconPx: 48,
    containerWidth: "w-12",
    containerHeight: "h-12",
  },
  grid: {
    iconSize: "size-32" as const,
    iconPx: 128,
    containerWidth: "w-32",
    containerHeight: "h-32",
  },
  detail: {
    iconSize: "size-44" as const,
    iconPx: 176,
    containerWidth: "w-44",
    containerHeight: "h-44",
  },
} as const

export type UploadSize = keyof typeof UPLOAD_SIZES
