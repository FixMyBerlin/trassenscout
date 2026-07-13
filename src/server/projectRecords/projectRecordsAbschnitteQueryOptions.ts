import { queryOptions } from "@tanstack/react-query"
import {
  getProjectRecordsByAcquisitionAreaFn,
  getProjectRecordsBySubsubsectionFn,
} from "./projectRecords.functions"

export function projectRecordsBySubsubsectionQueryOptions(input: {
  projectSlug: string
  subsubsectionId: number
}) {
  return queryOptions({
    queryKey: ["projectRecordsBySubsubsection", input],
    queryFn: () => getProjectRecordsBySubsubsectionFn({ data: input }),
  })
}

export function projectRecordsByAcquisitionAreaQueryOptions(input: {
  projectSlug: string
  acquisitionAreaId: number
}) {
  return queryOptions({
    queryKey: ["projectRecordsByAcquisitionArea", input],
    queryFn: () => getProjectRecordsByAcquisitionAreaFn({ data: input }),
  })
}
