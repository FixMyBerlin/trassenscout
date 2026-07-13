import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import { getSubsubsectionBySlugFn } from "./subsubsections.functions"
import type { GetSubsubsectionBySlugSchema } from "./subsubsections.inputSchemas"

export function subsubsectionBySlugQueryOptions(
  input: z.infer<typeof GetSubsubsectionBySlugSchema>,
) {
  return queryOptions({
    queryKey: ["subsubsectionBySlug", input],
    queryFn: () => getSubsubsectionBySlugFn({ data: input }),
  })
}
