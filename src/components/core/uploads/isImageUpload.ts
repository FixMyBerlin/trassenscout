type ImageUploadLike = {
  mimeType?: string | null
  externalUrl?: string | null
}

/** Raster image extensions allowed for upload (SVG excluded — see getFileType). */
export const IMAGE_EXTENSIONS = new Set([
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

const getExternalFileExtension = (externalUrl: string | null | undefined) => {
  if (!externalUrl) return null

  try {
    const pathname = new URL(externalUrl, "http://localhost").pathname
    const filename = decodeURIComponent(pathname.split("/").pop() || "")
    return filename.split(".").pop()?.toLowerCase() ?? null
  } catch {
    return null
  }
}

export const isImageMimeType = (mimeType: string | null | undefined) => {
  return mimeType?.startsWith("image/") ?? false
}

const isImageExternalUrl = (externalUrl: string | null | undefined) => {
  const extension = getExternalFileExtension(externalUrl)
  return extension ? IMAGE_EXTENSIONS.has(extension) : false
}

export const isImageUpload = (upload: ImageUploadLike) => {
  return isImageMimeType(upload.mimeType) || isImageExternalUrl(upload.externalUrl)
}
