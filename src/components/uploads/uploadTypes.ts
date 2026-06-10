import type { getUploadFn } from "@/src/server/uploads/uploads.functions"

export type UploadWithRelations = Awaited<ReturnType<typeof getUploadFn>>

export type UploadEditLink = {
  to:
    | "/$projectSlug/uploads/$uploadId/edit"
    | "/$projectSlug/surveys/$surveyId/responses/$surveyResponseId/uploads/$uploadId/edit"
  params: Record<string, string>
  search?: Record<string, string | undefined>
}

export type DeletedUploadMarker = { __deleted: true }

export function isDeletedUploadMarker(value: unknown): value is DeletedUploadMarker {
  return typeof value === "object" && value !== null && "__deleted" in value
}
