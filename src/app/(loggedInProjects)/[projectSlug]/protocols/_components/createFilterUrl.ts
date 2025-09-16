import { FilterSchema } from "./useFilters.nuqs"

export const createFilterUrl = (baseUrl: string, filters: Partial<FilterSchema>, hash?: string) => {
  const filterParams = new URLSearchParams()
  filterParams.set("filter", JSON.stringify(filters))
  const hashFragment = hash ? `#${hash}` : ""
  return `${baseUrl}?${filterParams.toString()}${hashFragment}`
}

export const createProtocolFilterUrl = (projectSlug: string, filters: Partial<FilterSchema>) => {
  return createFilterUrl(`/${projectSlug}/protocols`, filters, "filter")
}
