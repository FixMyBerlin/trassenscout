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
 * A record can link several Maßnahmen; the first wins, since a form has one set of fields.
 * Fields without a source, or with no data behind it, come back absent and stay empty.
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

  const subsubsection = record.subsubsections[0] ?? record.subsubsection
  const acquisitionArea = record.acquisitionAreas[0] ?? record.acquisitionArea

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
