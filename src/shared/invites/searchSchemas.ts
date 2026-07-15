import { z } from "zod"

export const inviteModalViewSchema = z.enum(["new"])

export const inviteModalSearchSchema = z
  .object({
    modalInviteView: inviteModalViewSchema.optional(),
  })
  .transform((search) => {
    if (search.modalInviteView) {
      return search
    }

    return {
      modalInviteView: undefined,
    }
  })

export function clearInviteModalSearch<TSearch extends Record<string, unknown>>(search: TSearch) {
  return {
    ...search,
    modalInviteView: undefined,
  }
}
