import { getFullnameWithInstitution } from "@/src/components/core/users/getFullname"
import { normalizeSearchterm } from "@/src/components/core/utils/normalizeSearchterm"
import { matchesTagFilter } from "@/src/components/tags/tagFilterOptions"
import { getFilenameFromS3 } from "@/src/shared/uploads/url"
import type { UploadTableUpload } from "./uploadTypes"
import { useUploadFilters } from "./useUploadFilters"

export const useFilteredUploads = (uploads: UploadTableUpload[]) => {
  const { filter } = useUploadFilters()
  const cleanedSearchterm = normalizeSearchterm(filter?.searchterm ?? "")
  const tag = filter?.tag

  if (!cleanedSearchterm && !tag) return uploads

  return uploads.filter((upload) => {
    if (!matchesTagFilter(upload, tag)) return false
    if (!cleanedSearchterm) return true

    const filename = getFilenameFromS3(upload.externalUrl).toLowerCase()
    const createdByName = upload.createdBy
      ? (getFullnameWithInstitution(upload.createdBy)?.toLowerCase() ?? "")
      : ""

    return (
      upload.title.toLowerCase().includes(cleanedSearchterm) ||
      upload.summary?.toLowerCase().includes(cleanedSearchterm) ||
      filename.includes(cleanedSearchterm) ||
      createdByName.includes(cleanedSearchterm) ||
      upload.source?.toLowerCase().includes(cleanedSearchterm)
    )
  })
}
