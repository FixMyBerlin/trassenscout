import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import { getGeolocatedUploadsFn } from "./uploads.functions"
import type { GetGeolocatedUploadsSchema } from "./uploads.inputSchemas"

export type GetGeolocatedUploadsInput = z.infer<typeof GetGeolocatedUploadsSchema>

export function geolocatedUploadsQueryOptions(input: GetGeolocatedUploadsInput) {
  return queryOptions({
    queryKey: ["geolocatedUploads", input],
    queryFn: () => getGeolocatedUploadsFn({ data: input }),
  })
}
