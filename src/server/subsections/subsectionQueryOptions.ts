import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import { getSubsectionBySlugFn } from "./subsections.functions"
import type { GetSubsectionBySlugSchema } from "./subsections.inputSchemas"

export function subsectionBySlugQueryOptions(input: z.infer<typeof GetSubsectionBySlugSchema>) {
  return queryOptions({
    queryKey: ["subsectionBySlug", input],
    queryFn: () => getSubsectionBySlugFn({ data: input }),
  })
}
