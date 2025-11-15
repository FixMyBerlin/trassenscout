import { z } from "zod"

export const SlugSchema = z
  .string()
  .min(1, { message: "Pflichtfeld. Mindestens 1 Zeichen." })
  .regex(/^[a-z0-9-._]*$/, {
    message: "Pflichtfeld. Erlaubte Zeichen a-z, 0-9, - (Minus), . (Punkt), _ (Unterstrich)",
  })

export const NameSchema = z.string().min(5, { message: "Pflichtfeld. Mindestens 5 Zeichen." })

// We want number fields to allow an explicit NULL for cases when they are not used but also a zero when the value is actually zero.
// At the same time, we want zod to automatically format numbers that are strings (which they all are when submitted) as number.
// This custom Schema solves this. One gotcha is, that the if-clause need to take both the client and server validation into account.
export const InputNumberOrNullSchema = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
  z.number().nullable(),
)
export const InputNumberSchema = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
  z.number({ invalid_type_error: "Pflichtfeld" }),
)

/**
 * Schema for an array of numbers, coercing strings to numbers and filtering out invalid values.
 * Useful for form values that might be strings (from HTML inputs) or numbers.
 */
export const NumberArraySchema = z
  .array(z.coerce.number())
  .transform((arr) => arr.filter((n) => !isNaN(n)))
  .catch([])
