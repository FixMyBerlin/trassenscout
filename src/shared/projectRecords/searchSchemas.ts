import { z } from "zod"
import { jsonSearchParam } from "@/src/shared/routing/jsonSearchParam"

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
    .enum(["all", "byMe", "toMe"])
    .default(PROJECT_RECORD_FILTER_DEFAULTS.direction)
    .catch(PROJECT_RECORD_FILTER_DEFAULTS.direction),
})

export type ProjectRecordFilter = z.infer<typeof projectRecordFilterSchema>

/** Drops default fields so a cleared filter is absent from the URL. */
export function projectRecordFilterSearchValue(
  filter: Partial<ProjectRecordFilter> | undefined,
): Partial<ProjectRecordFilter> | undefined {
  if (!filter) return undefined

  const next: Partial<ProjectRecordFilter> = {}
  if (filter.searchterm) next.searchterm = filter.searchterm
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
})

export type ProjectRecordsSearch = z.infer<typeof projectRecordsSearchSchema>

export const projectRecordModalViewSchema = z.enum(["detail", "edit"])

/** `modalProjectSlug` is only written by links from outside a project. */
export const projectRecordModalSearchShape = {
  modalProjectRecordId: z.coerce.number().int().positive().optional(),
  modalProjectRecordView: projectRecordModalViewSchema.optional(),
  modalProjectSlug: z.string().optional(),
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
