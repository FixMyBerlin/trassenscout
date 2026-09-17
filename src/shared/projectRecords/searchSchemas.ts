import { z } from "zod"
import { jsonSearchParam } from "@/src/shared/routing/jsonSearchParam"

const projectRecordFilterSchema = z.object({
  searchterm: z.string(),
})

export type ProjectRecordFilter = z.infer<typeof projectRecordFilterSchema>

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
