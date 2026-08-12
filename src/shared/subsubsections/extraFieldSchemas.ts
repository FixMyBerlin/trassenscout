import { z } from "zod"
import { SlugSchema } from "@/src/components/core/utils/schema-shared"

const EXTRA_FIELD_VALUE_MAX_LENGTH = 10_000

export const SubsubsectionExtraFieldDefinitionSchema = z.object({
  name: SlugSchema,
  label: z.string().min(1, { error: "Pflichtfeld." }),
  order: z.number().int().nonnegative(),
})

export type SubsubsectionExtraFieldDefinition = z.infer<
  typeof SubsubsectionExtraFieldDefinitionSchema
>

export const SubsubsectionExtraFieldDefinitionsSchema = z
  .array(SubsubsectionExtraFieldDefinitionSchema)
  .superRefine((definitions, ctx) => {
    const names = new Set<string>()
    for (const [index, definition] of definitions.entries()) {
      if (names.has(definition.name)) {
        ctx.addIssue({
          code: "custom",
          message: `Der Feldname „${definition.name}" ist mehrfach vergeben.`,
          path: [index, "name"],
        })
      }
      names.add(definition.name)
    }
  })

export const SubsubsectionExtraFieldsValuesSchema = z.record(
  z.string(),
  z.string().max(EXTRA_FIELD_VALUE_MAX_LENGTH),
)

type SubsubsectionExtraFieldsValues = z.infer<typeof SubsubsectionExtraFieldsValuesSchema>

export function parseDefinitions(json: unknown) {
  const result = SubsubsectionExtraFieldDefinitionsSchema.safeParse(json)
  if (!result.success) return []
  return sortByOrder(result.data)
}

export function parseExtraFields(json: unknown) {
  const result = SubsubsectionExtraFieldsValuesSchema.safeParse(json)
  if (!result.success) return {}

  return Object.fromEntries(Object.entries(result.data).filter(([, value]) => value.length > 0))
}

export function sortByOrder<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order)
}

export function sanitizeExtraFieldsForSave(
  values: Record<string, string | undefined> | undefined,
  definitions: SubsubsectionExtraFieldDefinition[],
) {
  if (!values) return {}

  const allowedNames = new Set(definitions.map((definition) => definition.name))
  const sanitized: SubsubsectionExtraFieldsValues = {}

  for (const [key, value] of Object.entries(values)) {
    if (!allowedNames.has(key) || value === undefined) continue
    const trimmed = value.trim()
    if (!trimmed) continue
    sanitized[key] = trimmed
  }

  return sanitized
}

export function getRemovedDefinitionNames(
  previous: SubsubsectionExtraFieldDefinition[],
  next: SubsubsectionExtraFieldDefinition[],
) {
  const nextNames = new Set(next.map((definition) => definition.name))
  return previous.map((definition) => definition.name).filter((name) => !nextNames.has(name))
}
