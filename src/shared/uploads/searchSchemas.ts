import { z } from "zod"
import { sanitizeInternalReturnPath } from "@/src/shared/routing/sanitizeReturnTo"

export const uploadEditSearchSchema = z.object({
  returnTo: z
    .string()
    .optional()
    .transform((value) => sanitizeInternalReturnPath(value)),
  returnProjectRecordId: z.string().optional(),
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

export type ProjectUploadModalSearch = z.infer<typeof projectUploadModalSearchSchema>

export function clearProjectUploadModalSearch<
  TSearch extends {
    modalUploadId?: number | undefined
    modalUploadView?: "detail" | "edit" | undefined
  },
>(search: TSearch) {
  return {
    ...search,
    modalUploadId: undefined,
    modalUploadView: undefined,
  }
}
