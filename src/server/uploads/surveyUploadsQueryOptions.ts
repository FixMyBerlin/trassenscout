import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import { getUploadsMetaPublicFn } from "./uploads.functions"
import type { GetUploadsMetaPublicSchema } from "./uploads.inputSchemas"

export type GetUploadsMetaPublicInput = z.infer<typeof GetUploadsMetaPublicSchema>

export function surveyUploadsMetaQueryOptions(input: GetUploadsMetaPublicInput) {
  return queryOptions({
    queryKey: ["surveyUploadsMeta", input],
    queryFn: () => getUploadsMetaPublicFn({ data: input }),
  })
}
