import { queryOptions } from "@tanstack/react-query"
import { getSupportDocumentFn, getSupportDocumentsFn } from "./supportDocuments.functions"

export function supportDocumentsQueryOptions() {
  return queryOptions({
    queryKey: ["supportDocuments"],
    queryFn: () => getSupportDocumentsFn({ data: {} }),
  })
}

export function supportDocumentQueryOptions(id: number) {
  return queryOptions({
    queryKey: ["supportDocument", id],
    queryFn: () => getSupportDocumentFn({ data: { id } }),
  })
}
