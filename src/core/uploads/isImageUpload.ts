type ImageUploadLike = {
  mimeType?: string | null
  externalUrl?: string | null
}

const IMAGE_EXTENSIONS = new Set([
  "svg",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "avif",
  "tif",
  "tiff",
  "heic",
  "heif",
])

export const isImageMimeType = (mimeType: string | null | undefined) => {
  return mimeType?.startsWith("image/") ?? false
}

export const isImageExternalUrl = (externalUrl: string | null | undefined) => {
  if (!externalUrl) return false

  try {
    const pathname = new URL(externalUrl, "http://localhost").pathname
    const filename = decodeURIComponent(pathname.split("/").pop() || "")
    const extension = filename.split(".").pop()?.toLowerCase()
    return extension ? IMAGE_EXTENSIONS.has(extension) : false
  } catch {
    return false
  }
}

export const isImageUpload = (upload: ImageUploadLike) => {
  return isImageMimeType(upload.mimeType) || isImageExternalUrl(upload.externalUrl)
}
