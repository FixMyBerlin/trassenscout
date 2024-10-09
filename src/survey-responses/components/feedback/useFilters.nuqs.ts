import { parseAsJson, useQueryState } from "nuqs"
import { z } from "zod"
import { useDefaultFilterValues } from "./useDefaultFilterValues"

export const filterSchema = z
  .object({
    status: z.array(z.string()),
    operator: z.string(),
    hasnotes: z.enum(["true", "false", "ALL"]),
    haslocation: z.enum(["true", "false", "ALL"]),
    categories: z.array(z.string()),
    topics: z.array(z.string()),
    searchterm: z.string(),
  })
  .passthrough() // Allow additional key-value pairs (additional filters)

export type FilterSchema = z.infer<typeof filterSchema>

export const useFilters = () => {
  const filterDefault = useDefaultFilterValues()
  return useQueryState(
    "filter",
    parseAsJson(filterSchema.parse).withDefault({
      ...filterDefault,
    }),
  )
}
