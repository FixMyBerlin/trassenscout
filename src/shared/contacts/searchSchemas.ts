import { z } from "zod"

export const contactModalViewSchema = z.enum(["detail", "edit", "new"])

export const contactModalSearchSchema = z
  .object({
    modalContactId: z.coerce.number().int().positive().optional(),
    modalContactView: contactModalViewSchema.optional(),
  })
  .transform((search) => {
    if (search.modalContactView === "new") {
      return {
        modalContactId: undefined,
        modalContactView: "new" as const,
      }
    }

    if (search.modalContactId && search.modalContactView) {
      return search
    }

    return {
      modalContactId: undefined,
      modalContactView: undefined,
    }
  })

export function clearContactModalSearch<TSearch extends Record<string, unknown>>(search: TSearch) {
  return {
    ...search,
    modalContactId: undefined,
    modalContactView: undefined,
  }
}
