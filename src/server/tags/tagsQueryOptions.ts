import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import { getTagsByProjectFn, getTagsWithUsageCountFn } from "./tags.functions"
import type { GetTagsSchema } from "./tags.inputSchemas"

export function tagsQueryOptions(input: z.infer<typeof GetTagsSchema>) {
  return queryOptions({
    queryKey: ["tags", input],
    queryFn: () => getTagsByProjectFn({ data: input }),
  })
}

export function tagsWithUsageCountQueryOptions(input: z.infer<typeof GetTagsSchema>) {
  return queryOptions({
    queryKey: ["tags", "withUsageCount", input],
    queryFn: () => getTagsWithUsageCountFn({ data: input }),
  })
}
