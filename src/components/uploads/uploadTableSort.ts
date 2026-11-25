import type { SortValues } from "@/src/shared/tableSort/sortRows"
import type { UploadTableSortColumn } from "@/src/shared/uploads/searchSchemas"
import { getFilenameFromS3 } from "@/src/shared/uploads/url"
import type { UploadTableUpload } from "./uploadTypes"

export type UploadSortRow = Pick<UploadTableUpload, "externalUrl" | "createdAt">

export const uploadSortValues: SortValues<UploadSortRow, UploadTableSortColumn> = {
  title: (upload) => getFilenameFromS3(upload.externalUrl),
  createdAt: (upload) => upload.createdAt,
}
