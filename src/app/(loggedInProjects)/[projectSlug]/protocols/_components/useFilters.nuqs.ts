import { parseAsJson, useQueryState } from "nuqs"
import { z } from "zod"

export const filterSchema = z.object({
  searchterm: z.string(),
})

export type FilterSchema = z.infer<typeof filterSchema>

export const useFilters = () => {
  const [filter, setFilter] = useQueryState("filter", parseAsJson(filterSchema.parse))
  return { filter, setFilter }
}
