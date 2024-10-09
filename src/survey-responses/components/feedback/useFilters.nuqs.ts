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
  // Allow additional key-value pairs (additional filters) as optionally specified by TBackendConfig['additionalFilters']
  // Note: We could try to improve the type safety for those properties with dynamic zod types
  //       But those are not straight forward. Some good reading is…
  //       - https://dev.to/yanagisawahidetoshi/dynamically-modifying-validation-schemas-in-zod-a-typescript-and-react-hook-form-example-3ho0
  //       - https://github.com/colinhacks/zod/discussions/3287#discussioncomment-8631944
  //       - https://stackoverflow.com/questions/75984188/zod-how-to-dynamically-generate-a-schema
  .passthrough()

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
