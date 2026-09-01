import { getFullname } from "@/src/components/core/users/getFullname"
import { normalizeSearchterm } from "@/src/components/core/utils/normalizeSearchterm"
import { isAdmin } from "@/src/components/shared/app/users/utils/isAdmin"
import { useCurrentUser } from "@/src/components/user/useCurrentUser"
import { getFilenameFromS3 } from "@/src/shared/uploads/url"
import type { UploadTableUpload } from "./uploadTypes"
import { useUploadFilters } from "./useUploadFilters"

export const useFilteredUploads = (uploads: UploadTableUpload[]) => {
  const { filter } = useUploadFilters()
  const includeCreatedBy = isAdmin(useCurrentUser())

  if (!filter?.searchterm) return uploads

  const cleanedSearchterm = normalizeSearchterm(filter.searchterm)
  if (!cleanedSearchterm) return uploads

  return uploads.filter((upload) => {
    const filename = getFilenameFromS3(upload.externalUrl).toLowerCase()
    const createdByName =
      includeCreatedBy && upload.createdBy
        ? (getFullname(upload.createdBy)?.toLowerCase() ?? "")
        : ""

    return (
      upload.title.toLowerCase().includes(cleanedSearchterm) ||
      upload.summary?.toLowerCase().includes(cleanedSearchterm) ||
      filename.includes(cleanedSearchterm) ||
      createdByName.includes(cleanedSearchterm) ||
      upload.tags.some((tag) => tag.title.toLowerCase().includes(cleanedSearchterm)) ||
      upload.source?.toLowerCase().includes(cleanedSearchterm)
    )
  })
}
