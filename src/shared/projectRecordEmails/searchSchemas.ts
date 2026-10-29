import { z } from "zod"

// A Posteingang mail opens in the project modal host, like an entry.
export const projectRecordEmailModalSearchSchema = z.object({
  modalProjectRecordEmailId: z.coerce.number().int().positive().optional().catch(undefined),
})

export function clearProjectRecordEmailModalSearch<TSearch extends Record<string, unknown>>(
  search: TSearch,
) {
  return {
    ...search,
    modalProjectRecordEmailId: undefined,
  }
}
