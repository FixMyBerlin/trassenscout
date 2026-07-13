import { z } from "zod"

type PageSearchSchemaOptions = {
  defaultPage?: number
  defaultPageSize?: number
  maxPageSize?: number
}

export const createPageSearchSchema = (opts?: PageSearchSchemaOptions) => {
  const defaultPage = opts?.defaultPage ?? 1
  const defaultPageSize = opts?.defaultPageSize ?? 25
  const maxPageSize = opts?.maxPageSize ?? 250

  return z.object({
    page: z.coerce.number().int().min(1).catch(defaultPage).default(defaultPage),
    pageSize: z.coerce
      .number()
      .int()
      .min(1)
      .max(maxPageSize)
      .catch(defaultPageSize)
      .default(defaultPageSize),
  })
}
