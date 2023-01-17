import { Prisma } from "db"
import { z } from "zod"

export const SlugSchema = z
  .string()
  .regex(/^[a-z0-9_-]*$/, { message: "Pflichtfeld. Erlaube Zeichen a-z, 0-9, -, _." })

export const NameSchema = z.string().min(5, { message: "Pflichtfeld. Mindestens 5 Zeichen." })

// Thanks to https://github.com/chrishoermann/zod-prisma-types#field-validators
export const JsonValue: z.ZodType<Prisma.JsonValue> = z
  .union([
    z.string(),
    z.number(),
    z.boolean(),
    z.lazy(() => z.array(JsonValue)),
    z.lazy(() => z.record(JsonValue)),
  ])
  .nullable()
