import type { ProjectRecordFilter } from "@/src/shared/projectRecords/searchSchemas"

const createFilterUrl = (baseUrl: string, filters: Partial<ProjectRecordFilter>, hash?: string) => {
  const filterParams = new URLSearchParams()
  filterParams.set("filter", JSON.stringify(filters))
  const hashFragment = hash ? `#${hash}` : ""
  return `${baseUrl}?${filterParams.toString()}${hashFragment}`
}

export const createProjectRecordFilterUrl = (
  projectSlug: string,
  filters: Partial<ProjectRecordFilter>,
) => {
  return createFilterUrl(`/${projectSlug}/project-records`, filters, "filter")
}
