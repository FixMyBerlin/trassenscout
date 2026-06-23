import { z } from "zod"

const projectRecordFilterSchema = z.object({
  searchterm: z.string(),
})

export type ProjectRecordFilter = z.infer<typeof projectRecordFilterSchema>

const projectRecordInitialFormValuesSchema = z.object({
  subsubsectionId: z.number().optional(),
})

export type ProjectRecordInitialFormValues = z.infer<typeof projectRecordInitialFormValuesSchema>

function parseProjectRecordFilterParam(value: string | undefined) {
  if (!value) return undefined
  try {
    return projectRecordFilterSchema.parse(JSON.parse(value))
  } catch {
    return undefined
  }
}

export function serializeProjectRecordFilterParam(filter: ProjectRecordFilter | undefined) {
  if (!filter) return undefined
  return JSON.stringify(filter)
}

function parseProjectRecordInitialFormValuesParam(value: string | undefined) {
  if (!value) return undefined
  try {
    return projectRecordInitialFormValuesSchema.parse(JSON.parse(value))
  } catch {
    return undefined
  }
}

function serializeProjectRecordInitialFormValuesParam(
  values: ProjectRecordInitialFormValues | null | undefined,
) {
  if (!values) return undefined
  return JSON.stringify(values)
}

const jsonSearchParam = <T extends z.ZodTypeAny>(
  schema: T,
  parseString: (value: string | undefined) => z.infer<T> | undefined,
) =>
  z
    .union([z.string(), schema])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined
      if (typeof value === "string") return parseString(value)
      return schema.parse(value)
    })

export const projectRecordsSearchSchema = z.object({
  filter: jsonSearchParam(projectRecordFilterSchema, parseProjectRecordFilterParam),
  initialValues: jsonSearchParam(
    projectRecordInitialFormValuesSchema,
    parseProjectRecordInitialFormValuesParam,
  ),
})

export type ProjectRecordsSearch = z.infer<typeof projectRecordsSearchSchema>

export const projectRecordModalViewSchema = z.enum(["detail", "edit"])

export const projectRecordModalSearchSchema = z
  .object({
    modalProjectRecordId: z.coerce.number().int().positive().optional(),
    modalProjectRecordView: projectRecordModalViewSchema.optional(),
  })
  .transform((search) => {
    if (search.modalProjectRecordId && search.modalProjectRecordView) {
      return search
    }

    return {
      modalProjectRecordId: undefined,
      modalProjectRecordView: undefined,
    }
  })

export type ProjectRecordModalSearch = z.infer<typeof projectRecordModalSearchSchema>

export function clearProjectRecordModalSearch<
  TSearch extends {
    modalProjectRecordId?: number | undefined
    modalProjectRecordView?: "detail" | "edit" | undefined
  },
>(search: TSearch) {
  return {
    ...search,
    modalProjectRecordId: undefined,
    modalProjectRecordView: undefined,
  }
}

export function projectRecordsSearchToRaw(
  search: Pick<ProjectRecordsSearch, "filter" | "initialValues">,
) {
  return {
    filter: search.filter ? serializeProjectRecordFilterParam(search.filter) : undefined,
    initialValues: search.initialValues
      ? serializeProjectRecordInitialFormValuesParam(search.initialValues)
      : undefined,
  }
}
