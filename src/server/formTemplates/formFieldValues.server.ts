import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { resolveFormTemplateFields } from "@/src/shared/formTemplates/fieldSchemas"
import { FormFieldValuesSchema } from "@/src/shared/formTemplates/schemas"
import type { FormFieldSourceContext } from "@/src/shared/formTemplates/sourceRegistry"
import { formatSourceValue, getFormFieldSource } from "@/src/shared/formTemplates/sourceRegistry"

const subsubsectionSelect = {
  slug: true,
  subTitle: true,
  description: true,
  lengthM: true,
  costEstimate: true,
  planningCosts: true,
  constructionCosts: true,
  landAcquisitionCosts: true,
  ownFunds: true,
  estimatedCompletionDate: true,
  subsection: { select: { slug: true } },
} as const

const acquisitionAreaSelect = {
  id: true,
  parcel: { select: { alkisParcelId: true } },
  subsubsection: { select: { slug: true } },
} as const

const recordInclude = {
  project: { select: { slug: true, subTitle: true } },
  // Older singular links too: such a record still shows the form button.
  subsubsection: { select: subsubsectionSelect },
  acquisitionArea: { select: acquisitionAreaSelect },
  subsubsections: {
    select: {
      slug: true,
      subTitle: true,
      description: true,
      lengthM: true,
      costEstimate: true,
      planningCosts: true,
      constructionCosts: true,
      landAcquisitionCosts: true,
      ownFunds: true,
      estimatedCompletionDate: true,
      subsection: { select: { slug: true } },
    },
  },
  acquisitionAreas: {
    select: {
      id: true,
      parcel: { select: { alkisParcelId: true } },
      subsubsection: { select: { slug: true } },
    },
  },
} as const

/**
 * A form has one set of fields, so it is only prefilled from a single link. Several Maßnahmen —
 * or several Verhandlungsflächen — leave those fields empty rather than silently picking one.
 * Fields without a source, or with no data behind it, stay empty too.
 */
export async function getFormFieldValues(
  headers: Headers,
  input: z.infer<typeof FormFieldValuesSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  const [record, formTemplate] = await Promise.all([
    db.projectRecord.findFirstOrThrow({
      where: { id: input.projectRecordId, project: { slug: input.projectSlug } },
      include: recordInclude,
    }),
    db.formTemplate.findFirstOrThrow({
      where: { id: input.formTemplateId, projects: { some: { slug: input.projectSlug } } },
      select: { bodyMarkdown: true, fields: true },
    }),
  ])

  const onlyOne = <T>(many: T[], legacySingle: T | null) => {
    const all = many.length > 0 ? many : legacySingle ? [legacySingle] : []
    return all.length === 1 ? all[0]! : null
  }

  const subsubsection = onlyOne(record.subsubsections, record.subsubsection)
  const acquisitionArea = onlyOne(record.acquisitionAreas, record.acquisitionArea)

  const context: FormFieldSourceContext = {
    project: record.project,
    subsubsection: subsubsection
      ? { ...subsubsection, subsectionSlug: subsubsection.subsection.slug }
      : null,
    acquisitionArea: acquisitionArea
      ? {
          id: acquisitionArea.id,
          alkisParcelId: acquisitionArea.parcel.alkisParcelId,
          subsubsectionSlug: acquisitionArea.subsubsection.slug,
        }
      : null,
  }

  const values: Record<string, string> = {}
  for (const field of resolveFormTemplateFields(formTemplate.bodyMarkdown, formTemplate.fields)) {
    const source = getFormFieldSource(field.source)
    if (!source) continue

    const value = formatSourceValue(source.resolve(context), source.format)
    if (value) values[field.name] = value
  }

  return values
}
