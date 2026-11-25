import { z } from "zod"
import { ASSIGNMENT_DIRECTIONS } from "@/src/shared/projectRecords/assignmentDirection"
import { jsonSearchParam } from "@/src/shared/routing/jsonSearchParam"
import { type TableSort, tableSortSearchSchema } from "@/src/shared/tableSort/tableSort"
import { searchtermTagFilterSearchValue, tagFilterSchema } from "@/src/shared/tags/tagFilter"

export const PROJECT_RECORD_TABLE_SORT_COLUMNS = ["date", "title", "assignedTo"] as const

export type ProjectRecordTableSortColumn = (typeof PROJECT_RECORD_TABLE_SORT_COLUMNS)[number]

export const PROJECT_RECORD_TABLE_DEFAULT_SORT: TableSort<ProjectRecordTableSortColumn> = {
  column: "date",
  direction: "desc",
}

export const PROJECT_RECORD_FILTER_DEFAULTS = {
  searchterm: "",
  status: "all",
  direction: "all",
} as const

const projectRecordFilterSchema = z.object({
  searchterm: z.string().default(PROJECT_RECORD_FILTER_DEFAULTS.searchterm),
  status: z
    .enum(["all", "PENDING", "COMPLETED"])
    .default(PROJECT_RECORD_FILTER_DEFAULTS.status)
    .catch(PROJECT_RECORD_FILTER_DEFAULTS.status),
  direction: z
    .enum(ASSIGNMENT_DIRECTIONS)
    .default(PROJECT_RECORD_FILTER_DEFAULTS.direction)
    .catch(PROJECT_RECORD_FILTER_DEFAULTS.direction),
  tag: tagFilterSchema,
})

export type ProjectRecordFilter = z.infer<typeof projectRecordFilterSchema>

/** Drops default fields so a cleared filter is absent from the URL. */
export function projectRecordFilterSearchValue(
  filter: Partial<ProjectRecordFilter> | undefined,
): Partial<ProjectRecordFilter> | undefined {
  if (!filter) return undefined

  const next: Partial<ProjectRecordFilter> = { ...searchtermTagFilterSearchValue(filter) }
  if (filter.status && filter.status !== PROJECT_RECORD_FILTER_DEFAULTS.status) {
    next.status = filter.status
  }
  if (filter.direction && filter.direction !== PROJECT_RECORD_FILTER_DEFAULTS.direction) {
    next.direction = filter.direction
  }

  return Object.keys(next).length === 0 ? undefined : next
}

const projectRecordInitialFormValuesSchema = z.object({
  subsubsectionId: z.number().optional(),
})

function parseProjectRecordFilterParam(value: string | undefined) {
  if (!value) return undefined
  try {
    return projectRecordFilterSchema.parse(JSON.parse(value))
  } catch {
    return undefined
  }
}

function parseProjectRecordInitialFormValuesParam(value: string | undefined) {
  if (!value) return undefined
  try {
    return projectRecordInitialFormValuesSchema.parse(JSON.parse(value))
  } catch {
    return undefined
  }
}

export const projectRecordsSearchSchema = z.object({
  filter: jsonSearchParam(projectRecordFilterSchema, parseProjectRecordFilterParam),
  initialValues: jsonSearchParam(
    projectRecordInitialFormValuesSchema,
    parseProjectRecordInitialFormValuesParam,
  ),
  mcpDraft: z.union([z.literal(true), z.literal("true")]).optional(),
  ref: z.string().min(1).optional(),
  sort: tableSortSearchSchema(PROJECT_RECORD_TABLE_SORT_COLUMNS),
})

export type ProjectRecordsSearch = z.infer<typeof projectRecordsSearchSchema>

export const projectRecordModalViewSchema = z.enum(["detail", "edit"])

/** `modalProjectSlug` is only written by links from outside a project. */
export const projectRecordModalSearchShape = {
  modalProjectRecordId: z.coerce.number().int().positive().optional().catch(undefined),
  modalProjectRecordView: projectRecordModalViewSchema.optional().catch(undefined),
  modalProjectSlug: z.string().optional().catch(undefined),
}

export const projectRecordModalSearchSchema = z
  .object(projectRecordModalSearchShape)
  .transform((search) => {
    if (search.modalProjectRecordId && search.modalProjectRecordView) {
      return search
    }

    return {
      modalProjectRecordId: undefined,
      modalProjectRecordView: undefined,
      modalProjectSlug: undefined,
    }
  })

export function clearProjectRecordModalSearch<TSearch extends Record<string, unknown>>(
  search: TSearch,
) {
  return {
    ...search,
    modalProjectRecordId: undefined,
    modalProjectRecordView: undefined,
    modalProjectSlug: undefined,
  }
}
