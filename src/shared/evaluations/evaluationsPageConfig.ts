import { z } from "zod"

const evaluationChartTypeValues = [
  "fundingByYear",
  "fundingByMunicipality",
  "measuresByFundingObject",
  "measuresByStatusAndYear",
  "deadlinesOverview",
] as const

const EvaluationChartTypeSchema = z.enum(evaluationChartTypeValues)

export type EvaluationChartType = z.infer<typeof EvaluationChartTypeSchema>

export const evaluationChartLabels: Record<EvaluationChartType, string> = {
  fundingByYear: "Kostenschätzung nach Förderjahr",
  fundingByMunicipality: "Kostenschätzung nach Kommune",
  measuresByFundingObject: "Anzahl Maßnahmen nach Fördergegenstand",
  measuresByStatusAndYear: "Maßnahmen nach Status und Kalenderjahr",
  deadlinesOverview: "Fristenübersicht",
}

export const evaluationChartDescriptions: Record<EvaluationChartType, string> = {
  fundingByYear: "Aggregierte Kostenschätzung pro geplantem Förder- oder Baujahr.",
  fundingByMunicipality: "Aggregierte Kostenschätzung pro Kommune oder zugeordnetem Träger.",
  measuresByFundingObject: "Anzahl der Maßnahmen je Fördergegenstand.",
  measuresByStatusAndYear: "Anzahl der Maßnahmen nach Status und Jahr.",
  deadlinesOverview: "Übersicht strukturierter Fristen und überfälliger Vorgänge.",
}

/** Editorial hedges about the data model — copy, not computed data, so they stay out of the payload. */
export const evaluationChartNotes: Partial<Record<EvaluationChartType, string>> = {
  fundingByYear: "Die Auswertung nutzt aktuell das geplante Baujahr der Maßnahme als Förderjahr.",
  fundingByMunicipality:
    "Die Auswertung nutzt die Kommune oder den Träger, die am Planungsabschnitt hinterlegt sind.",
  deadlinesOverview:
    "Die Fristenübersicht nutzt aktuell die geplante Fertigstellung der Maßnahmen.",
}

export const evaluationChartTableHeaders: Record<
  EvaluationChartType,
  { label: string; value: string }
> = {
  fundingByYear: { label: "Förderjahr", value: "Kostenschätzung" },
  fundingByMunicipality: { label: "Kommune", value: "Kostenschätzung" },
  measuresByFundingObject: { label: "Fördergegenstand", value: "Anzahl Maßnahmen" },
  measuresByStatusAndYear: { label: "Jahr", value: "Anzahl Maßnahmen" },
  deadlinesOverview: { label: "Fristenstatus", value: "Anzahl Fristen" },
}

/**
 * Columns for an ordered time axis (years read left to right), bars for long category
 * names (Kommunen, Fördergegenstände) that need horizontal room to stay unclipped.
 */
export const evaluationChartOrientation: Record<EvaluationChartType, "columns" | "bars"> = {
  fundingByYear: "columns",
  measuresByStatusAndYear: "columns",
  fundingByMunicipality: "bars",
  measuresByFundingObject: "bars",
  deadlinesOverview: "bars",
}

export const textOnlyChartLabel = "Nur Text (kein Diagramm)"

export const evaluationChartOptions: [EvaluationChartType | "", string][] = [
  ["", textOnlyChartLabel],
  ...evaluationChartTypeValues.map(
    (value) => [value, evaluationChartLabels[value]] satisfies [EvaluationChartType, string],
  ),
]

const EvaluationsPageSectionSchema = z.object({
  id: z.string().min(1),
  chart: EvaluationChartTypeSchema.or(z.literal("")).catch(""),
  markdown: z.string().default(""),
})

export const EvaluationsPageConfigSchema = z.object({
  version: z.literal(1),
  sections: z.array(EvaluationsPageSectionSchema),
})

export type EvaluationsPageSection = z.infer<typeof EvaluationsPageSectionSchema>
export type EvaluationsPageConfig = z.infer<typeof EvaluationsPageConfigSchema>

export type EvaluationBarChartDatum = {
  label: string
  value: number
}

export type EvaluationGroupedChartSeries = {
  key: string
  label: string
}

export type EvaluationGroupedChartDatum = {
  label: string
  values: Record<string, number>
}

type EvaluationDeadlineStatus = "overdue" | "upcoming"

export type EvaluationDeadlineDatum = {
  label: string
  subsectionLabel: string
  dueDate: string
  status: EvaluationDeadlineStatus
}

export type EvaluationDeadlineSummaryDatum = EvaluationBarChartDatum & {
  status: EvaluationDeadlineStatus
}

/** Only bar rows are formatted by unit; the other kinds are always counts. */
export type EvaluationChartUnit = "eur" | "count"

export type EvaluationChartDataset =
  | {
      kind: "bar"
      unit: EvaluationChartUnit
      rows: EvaluationBarChartDatum[]
    }
  | {
      kind: "groupedBar"
      series: EvaluationGroupedChartSeries[]
      rows: EvaluationGroupedChartDatum[]
    }
  | {
      kind: "deadlines"
      rows: EvaluationDeadlineSummaryDatum[]
      deadlines: EvaluationDeadlineDatum[]
    }

/** Only the chart types a page actually references are computed and shipped. */
export type EvaluationChartData = Partial<Record<EvaluationChartType, EvaluationChartDataset>>

/**
 * A factory, not a shared constant: callers receive this as their own config and a single
 * in-place mutation would otherwise leak across every request in the same server process.
 */
export function emptyEvaluationsPageConfig(): EvaluationsPageConfig {
  return { version: 1, sections: [] }
}

/**
 * Drops only the sections that fail to parse, never the whole page: the admin form writes back
 * whatever it reads, so a total fallback would let one unknown chart type overwrite real content.
 */
export function parseEvaluationsPageConfig(config: unknown): EvaluationsPageConfig {
  const stored = z.object({ sections: z.array(z.unknown()) }).safeParse(config)
  if (!stored.success) return emptyEvaluationsPageConfig()

  return {
    version: 1,
    sections: stored.data.sections.flatMap(
      (section) => EvaluationsPageSectionSchema.safeParse(section).data ?? [],
    ),
  }
}
