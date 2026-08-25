import { z } from "zod"
import { extractPlaceholders } from "@/src/shared/templates/placeholders"

/**
 * Fields are derived from the markdown: every `{{platzhalter}}` is one input, in document
 * order. The stored JSON only adds metadata, so the two cannot drift apart.
 */
export const formTemplateFieldTypes = ["text", "textarea", "number", "date"] as const

export type FormTemplateFieldType = (typeof formTemplateFieldTypes)[number]

/** Labels describe the layout, because that is all the type controls — see `fieldWidth`. */
export const formTemplateFieldTypeLabels: Record<FormTemplateFieldType, string> = {
  text: "Text – einzeilig",
  textarea: "Text – mehrzeilig",
  number: "Zahl – schmales Feld",
  date: "Datum – schmales Feld",
}

/** Must accept exactly what `extractPlaceholders` recognises, uppercase included. */
const FormTemplateFieldNameSchema = z.string().regex(/^[a-zA-Z0-9_]+$/, {
  error: "Erlaubte Zeichen: a-z, A-Z, 0-9 und _ (Unterstrich).",
})

const FormTemplateFieldDefinitionSchema = z.object({
  name: FormTemplateFieldNameSchema,
  label: z.string().min(1, { error: "Pflichtfeld." }),
  type: z.enum(formTemplateFieldTypes),
  /** Key from the source registry. */
  source: z.string().optional(),
})

export type FormTemplateFieldDefinition = z.infer<typeof FormTemplateFieldDefinitionSchema>

export const FormTemplateFieldDefinitionsSchema = z.array(FormTemplateFieldDefinitionSchema)

export type ResolvedFormTemplateField = FormTemplateFieldDefinition

export function parseFieldDefinitions(json: unknown) {
  const result = FormTemplateFieldDefinitionsSchema.safeParse(json)
  return result.success ? result.data : []
}

export function resolveFormTemplateFields(
  bodyMarkdown: string | null | undefined,
  fieldsJson: unknown,
): ResolvedFormTemplateField[] {
  const stored = new Map(parseFieldDefinitions(fieldsJson).map((field) => [field.name, field]))

  return extractPlaceholders(bodyMarkdown).map((name) => ({
    name,
    label: stored.get(name)?.label || name,
    type: stored.get(name)?.type || "text",
    source: stored.get(name)?.source,
  }))
}

export function sanitizeFieldsForSave(
  bodyMarkdown: string | null | undefined,
  definitions: FormTemplateFieldDefinition[],
) {
  const used = new Set(extractPlaceholders(bodyMarkdown))
  return definitions.filter((definition) => used.has(definition.name))
}

/** Word exports arrive with underscores where the fields belong. */
export function convertBlanksToPlaceholders(markdown: string, prefix = "feld") {
  const taken = new Set(extractPlaceholders(markdown))
  let counter = 0

  const nextName = () => {
    let name: string
    do {
      counter += 1
      name = `${prefix}_${counter}`
    } while (taken.has(name))
    taken.add(name)
    return name
  }

  return markdown.replace(/(?:\\?_){4,}/g, () => `{{${nextName()}}}`)
}
