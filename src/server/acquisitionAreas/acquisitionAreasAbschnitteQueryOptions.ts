import { queryOptions } from "@tanstack/react-query"
import {
  getAcquisitionAreasBySubsubsectionFn,
  getAcquisitionAreasWithProjectRecordCountBySubsubsectionFn,
} from "./acquisitionAreas.functions"

export function acquisitionAreasBySubsubsectionQueryOptions(input: {
  projectSlug: string
  subsubsectionId: number
}) {
  return queryOptions({
    queryKey: ["acquisitionAreasBySubsubsection", input],
    queryFn: () => getAcquisitionAreasBySubsubsectionFn({ data: input }),
  })
}

export function acquisitionAreasWithProjectRecordCountQueryOptions(input: {
  projectSlug: string
  subsubsectionId: number
}) {
  return queryOptions({
    queryKey: ["acquisitionAreasWithProjectRecordCount", input],
    queryFn: () => getAcquisitionAreasWithProjectRecordCountBySubsubsectionFn({ data: input }),
  })
}
