import { z } from "zod"
import { jsonSearchParam } from "@/src/shared/routing/jsonSearchParam"
import { sanitizeInternalReturnPath } from "@/src/shared/routing/sanitizeReturnTo"
import { searchtermTagFilterSchema } from "@/src/shared/tags/tagFilter"

const uploadFilterSchema = searchtermTagFilterSchema

export type UploadFilter = z.infer<typeof uploadFilterSchema>

function parseUploadFilterParam(value: string | undefined) {
  if (!value) return undefined
  try {
    return uploadFilterSchema.parse(JSON.parse(value))
  } catch {
    return undefined
  }
}

export const uploadsSearchSchema = z.object({
  filter: jsonSearchParam(uploadFilterSchema, parseUploadFilterParam),
})

export type UploadsSearch = z.infer<typeof uploadsSearchSchema>

export const uploadReturnSearchSchema = z.object({
  returnTo: z
    .string()
    .optional()
    .transform((value) => sanitizeInternalReturnPath(value))
    .catch(undefined),
})

export const projectUploadModalViewSchema = z.enum(["detail", "edit"])

export const projectUploadModalSearchSchema = z
  .object({
    modalUploadId: z.coerce.number().int().positive().optional(),
    modalUploadView: projectUploadModalViewSchema.optional(),
  })
  .transform((search) => {
    if (search.modalUploadId && search.modalUploadView) {
      return search
    }

    return {
      modalUploadId: undefined,
      modalUploadView: undefined,
    }
  })

export function clearProjectUploadModalSearch<TSearch extends Record<string, unknown>>(
  search: TSearch,
) {
  return {
    ...search,
    modalUploadId: undefined,
    modalUploadView: undefined,
  }
}
