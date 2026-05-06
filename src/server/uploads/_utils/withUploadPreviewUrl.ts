import { isImageUpload } from "@/src/core/uploads/isImageUpload"
import { getPresignedUploadUrl } from "@/src/server/uploads/_utils/getPresignedUploadUrl"

type UploadLike = {
  mimeType?: string | null
  externalUrl: string
}

export const withUploadPreviewUrl = async <T extends UploadLike>(upload: T) => {
  if (!isImageUpload(upload)) {
    return upload
  }

  return {
    ...upload,
    previewImageUrl: await getPresignedUploadUrl(upload.externalUrl),
  }
}
