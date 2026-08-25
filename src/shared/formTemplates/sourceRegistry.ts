import { format } from "date-fns"
import { de } from "date-fns/locale"
import type { FormTemplateTypeEnum } from "@/src/prisma/generated/browser"

/**
 * Each source resolves against a plain context the server assembles, so the registry stays
 * free of database access and the admin UI can import it for the labels alone.
 */
export type FormFieldSourceContext = {
  project: { slug: string; subTitle: string | null }
  subsubsection: {
    slug: string
    subTitle: string | null
    description: string | null
    lengthM: number | null
    costEstimate: number | null
    planningCosts: number | null
    constructionCosts: number | null
    landAcquisitionCosts: number | null
    ownFunds: number | null
    estimatedCompletionDate: Date | null
    subsectionSlug: string
  } | null
  acquisitionArea: { id: number; alkisParcelId: string; subsubsectionSlug: string } | null
}

type SourceValue = string | number | Date | null | undefined

type FormFieldSourceFormat = "text" | "number" | "currency" | "date"

type FormFieldSource = {
  key: string
  label: string
  scopes: FormTemplateTypeEnum[]
  format: FormFieldSourceFormat
  resolve: (context: FormFieldSourceContext) => SourceValue
}

const BOTH: FormTemplateTypeEnum[] = ["SUBSUBSECTION", "ACQUISITIONAREA"]
const MEASURE: FormTemplateTypeEnum[] = ["SUBSUBSECTION"]
const AREA: FormTemplateTypeEnum[] = ["ACQUISITIONAREA"]

const formFieldSources: FormFieldSource[] = [
  {
    key: "project.title",
    label: "Projekt – Titel",
    scopes: BOTH,
    format: "text",
    resolve: ({ project }) => project.subTitle ?? project.slug,
  },
  {
    key: "subsubsection.title",
    label: "Maßnahme – Bezeichnung",
    scopes: MEASURE,
    format: "text",
    resolve: ({ subsubsection }) => subsubsection?.subTitle ?? subsubsection?.slug,
  },
  {
    key: "subsubsection.description",
    label: "Maßnahme – Anmerkungen",
    scopes: MEASURE,
    format: "text",
    resolve: ({ subsubsection }) => subsubsection?.description,
  },
  {
    key: "subsubsection.subsection",
    label: "Maßnahme – Planungsabschnitt",
    scopes: MEASURE,
    format: "text",
    resolve: ({ subsubsection }) => subsubsection?.subsectionSlug,
  },
  {
    key: "subsubsection.lengthM",
    label: "Maßnahme – Länge (m)",
    scopes: MEASURE,
    format: "number",
    resolve: ({ subsubsection }) => subsubsection?.lengthM,
  },
  {
    key: "subsubsection.costEstimate",
    label: "Maßnahme – Gesamtkosten",
    scopes: MEASURE,
    format: "currency",
    resolve: ({ subsubsection }) => subsubsection?.costEstimate,
  },
  {
    key: "subsubsection.planningCosts",
    label: "Maßnahme – Planungskosten",
    scopes: MEASURE,
    format: "currency",
    resolve: ({ subsubsection }) => subsubsection?.planningCosts,
  },
  {
    key: "subsubsection.constructionCosts",
    label: "Maßnahme – Baukosten",
    scopes: MEASURE,
    format: "currency",
    resolve: ({ subsubsection }) => subsubsection?.constructionCosts,
  },
  {
    key: "subsubsection.landAcquisitionCosts",
    label: "Maßnahme – Grunderwerbskosten",
    scopes: MEASURE,
    format: "currency",
    resolve: ({ subsubsection }) => subsubsection?.landAcquisitionCosts,
  },
  {
    key: "subsubsection.ownFunds",
    label: "Maßnahme – Eigenmittel",
    scopes: MEASURE,
    format: "currency",
    resolve: ({ subsubsection }) => subsubsection?.ownFunds,
  },
  {
    key: "subsubsection.estimatedCompletionDate",
    label: "Maßnahme – Geplante Fertigstellung",
    scopes: MEASURE,
    format: "date",
    resolve: ({ subsubsection }) => subsubsection?.estimatedCompletionDate,
  },
  {
    key: "acquisitionArea.parcel",
    label: "Verhandlungsfläche – Flurstücknummer",
    scopes: AREA,
    format: "text",
    resolve: ({ acquisitionArea }) => acquisitionArea?.alkisParcelId,
  },
  {
    key: "acquisitionArea.id",
    label: "Verhandlungsfläche – ID",
    scopes: AREA,
    format: "text",
    resolve: ({ acquisitionArea }) => acquisitionArea?.id,
  },
  {
    key: "acquisitionArea.subsubsection",
    label: "Verhandlungsfläche – Maßnahme",
    scopes: AREA,
    format: "text",
    resolve: ({ acquisitionArea }) => acquisitionArea?.subsubsectionSlug,
  },
]

export const getFormFieldSource = (key: string | undefined) =>
  key ? formFieldSources.find((source) => source.key === key) : undefined

export const formFieldSourcesForType = (type: FormTemplateTypeEnum) =>
  formFieldSources.filter((source) => source.scopes.includes(type))

const numberFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 })

/** No currency symbol: the document usually prints its own €. */
export function formatSourceValue(value: SourceValue, sourceFormat: FormFieldSourceFormat) {
  if (value === null || value === undefined || value === "") return ""
  if (sourceFormat === "date") {
    const date = value instanceof Date ? value : new Date(String(value))
    // `P` + de matches how the rest of the app renders dates.
    return Number.isNaN(date.getTime()) ? "" : format(date, "P", { locale: de })
  }
  if (sourceFormat === "currency" || sourceFormat === "number") {
    const numeric = typeof value === "number" ? value : Number(value)
    return Number.isFinite(numeric) ? numberFormat.format(numeric) : ""
  }
  return String(value)
}
