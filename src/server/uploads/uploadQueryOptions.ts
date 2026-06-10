import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import { getUploadFn } from "./uploads.functions"
import type { GetUploadSchema } from "./uploads.inputSchemas"

export type GetUploadInput = z.infer<typeof GetUploadSchema>

export function uploadQueryOptions(input: GetUploadInput) {
  return queryOptions({
    queryKey: ["upload", input],
    queryFn: () => getUploadFn({ data: input }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })
}
