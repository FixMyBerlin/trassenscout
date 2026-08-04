import { z } from "zod"

export const jsonSearchParam = <T extends z.ZodTypeAny>(
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
