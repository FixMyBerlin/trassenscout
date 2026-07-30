import { getFullname } from "@/src/components/core/users/getFullname"
import { getFilenameFromS3 } from "@/src/shared/uploads/url"
import type { UploadTableUpload } from "./uploadTypes"
import { useUploadFilters } from "./useUploadFilters"

const normalizeSearchterm = (searchterm: string) =>
  searchterm.trim().toLowerCase().replace(/#/g, "").trim()

export const useFilteredUploads = (uploads: UploadTableUpload[]) => {
  const { filter } = useUploadFilters()

  if (!filter?.searchterm) return uploads

  const cleanedSearchterm = normalizeSearchterm(filter.searchterm)
  if (!cleanedSearchterm) return uploads

  return uploads.filter((upload) => {
    const filename = getFilenameFromS3(upload.externalUrl).toLowerCase()
    const createdByName = upload.createdBy
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
