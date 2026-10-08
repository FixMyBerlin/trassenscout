import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import { getExternalShareFn } from "./externalShare.functions"
import type { GetExternalShareSchema } from "./externalShare.inputSchemas"

export function externalShareQueryOptions(input: z.infer<typeof GetExternalShareSchema>) {
  return queryOptions({
    queryKey: ["externalShare", input.projectSlug],
    queryFn: () => getExternalShareFn({ data: input }),
  })
}
