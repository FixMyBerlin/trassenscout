import { TZDate } from "@date-fns/tz"
import { format } from "date-fns"
import type { Prisma } from "@/src/prisma/generated/browser"
import db from "@/src/server/db.server"
import type {
  EvaluationChartData,
  EvaluationChartDataset,
  EvaluationChartType,
  EvaluationDeadlineDatum,
  EvaluationDeadlineSummaryDatum,
  EvaluationGroupedChartDatum,
  EvaluationGroupedChartSeries,
} from "@/src/shared/evaluations/evaluationsPageConfig"

const NO_ASSIGNMENT_LABEL = "Ohne Zuordnung"
const NO_FUNDING_OBJECT_LABEL = "Ohne Fördergegenstand"
const NO_STATUS_LABEL = "Ohne Status"
const NO_YEAR_LABEL = "Ohne Jahr"

const collator = new Intl.Collator("de-DE", { numeric: true, sensitivity: "base" })

const evaluationMeasureSelect = {
  slug: true,
  costEstimate: true,
  estimatedConstructionDateString: true,
  estimatedCompletionDate: true,
  subsection: {
    select: {
      slug: true,
      estimatedCompletionDateString: true,
      operator: { select: { title: true } },
    },
  },
  SubsubsectionStatus: { select: { slug: true, title: true } },
  SubsubsectionInfrastructureTypes: { select: { title: true } },
} satisfies Prisma.SubsubsectionSelect

type EvaluationMeasure = Prisma.SubsubsectionGetPayload<{
  select: typeof evaluationMeasureSelect
}>

function asAmount(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

function addToMap(map: Map<string, number>, key: string, value = 1) {
  map.set(key, (map.get(key) ?? 0) + value)
}

function sortedBarRows(map: Map<string, number>) {
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .filter((row) => row.value !== 0)
    .sort((a, b) => collator.compare(a.label, b.label))
}

function getMeasureYear(measure: EvaluationMeasure) {
  const explicitYear =
    measure.estimatedConstructionDateString || measure.subsection.estimatedCompletionDateString
  const year = explicitYear?.match(/\d{4}/)?.[0]
  if (year) return year

  const completionYear = measure.estimatedCompletionDate?.getFullYear()
  return completionYear ? String(completionYear) : null
}

function fundingByYear(measures: EvaluationMeasure[]): EvaluationChartDataset {
  const values = new Map<string, number>()

  for (const measure of measures) {
    const year = getMeasureYear(measure)
    const amount = asAmount(measure.costEstimate)
    if (!year || amount === 0) continue
    addToMap(values, year, amount)
  }

  return { kind: "bar", unit: "eur", rows: sortedBarRows(values) }
}

function fundingByMunicipality(measures: EvaluationMeasure[]): EvaluationChartDataset {
  const values = new Map<string, number>()

  for (const measure of measures) {
    const label = measure.subsection.operator?.title || NO_ASSIGNMENT_LABEL
    const amount = asAmount(measure.costEstimate)
    if (amount === 0) continue
    addToMap(values, label, amount)
  }

  return { kind: "bar", unit: "eur", rows: sortedBarRows(values) }
}

function measuresByFundingObject(measures: EvaluationMeasure[]): EvaluationChartDataset {
  const values = new Map<string, number>()

  for (const measure of measures) {
    const fundingObjects = measure.SubsubsectionInfrastructureTypes
    if (fundingObjects.length === 0) {
      addToMap(values, NO_FUNDING_OBJECT_LABEL)
      continue
    }

    for (const fundingObject of fundingObjects) {
      addToMap(values, fundingObject.title)
    }
  }

  return { kind: "bar", unit: "count", rows: sortedBarRows(values) }
}

function measuresByStatusAndYear(measures: EvaluationMeasure[]): EvaluationChartDataset {
  const seriesMap = new Map<string, EvaluationGroupedChartSeries>()
  const valuesByYear = new Map<string, Record<string, number>>()

  for (const measure of measures) {
    const year = getMeasureYear(measure) ?? NO_YEAR_LABEL
    const statusKey = measure.SubsubsectionStatus?.slug || "without-status"
    const statusLabel = measure.SubsubsectionStatus?.title || NO_STATUS_LABEL

    seriesMap.set(statusKey, { key: statusKey, label: statusLabel })
    const yearValues = valuesByYear.get(year) ?? {}
    yearValues[statusKey] = (yearValues[statusKey] ?? 0) + 1
    valuesByYear.set(year, yearValues)
  }

  const series = Array.from(seriesMap.values()).sort((a, b) => collator.compare(a.label, b.label))
  const rows: EvaluationGroupedChartDatum[] = Array.from(valuesByYear.entries())
    .map(([label, values]) => ({
      label,
      values: Object.fromEntries(series.map((item) => [item.key, values[item.key] ?? 0])),
    }))
    .sort((a, b) => {
      if (a.label === NO_YEAR_LABEL) return 1
      if (b.label === NO_YEAR_LABEL) return -1
      return collator.compare(a.label, b.label)
    })

  return { kind: "groupedBar", series, rows }
}

function dayKey(date: Date) {
  return format(new TZDate(date, "Europe/Berlin"), "yyyy-MM-dd")
}

function deadlinesOverview(measures: EvaluationMeasure[], today: Date): EvaluationChartDataset {
  const deadlines: EvaluationDeadlineDatum[] = []
  const todayKey = dayKey(today)
  let overdueCount = 0

  for (const measure of measures) {
    const dueDate = measure.estimatedCompletionDate
    if (!dueDate) continue

    const overdue = dayKey(dueDate) < todayKey
    if (overdue) overdueCount++
    deadlines.push({
      label: measure.slug,
      subsectionLabel: measure.subsection.slug,
      dueDate: dueDate.toISOString(),
      status: overdue ? "overdue" : "upcoming",
    })
  }

  deadlines.sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  const rows: EvaluationDeadlineSummaryDatum[] = [
    { label: "Überfällig", value: overdueCount, status: "overdue" },
    { label: "Anstehend", value: deadlines.length - overdueCount, status: "upcoming" },
  ]

  return {
    kind: "deadlines",
    rows: rows.filter((row) => row.value !== 0),
    deadlines,
  }
}

const chartBuilders: Record<
  EvaluationChartType,
  (measures: EvaluationMeasure[], today: Date) => EvaluationChartDataset
> = {
  fundingByYear,
  fundingByMunicipality,
  measuresByFundingObject,
  measuresByStatusAndYear,
  deadlinesOverview,
}

export function buildEvaluationChartData(
  measures: EvaluationMeasure[],
  charts: EvaluationChartType[],
  today = new Date(),
): EvaluationChartData {
  const data: EvaluationChartData = {}
  for (const chart of charts) {
    data[chart] = chartBuilders[chart](measures, today)
  }
  return data
}

export async function getEvaluationChartData(
  projectSlug: string,
  charts: EvaluationChartType[],
): Promise<EvaluationChartData> {
  if (charts.length === 0) return {}

  const measures = await db.subsubsection.findMany({
    where: { subsection: { project: { slug: projectSlug } } },
    select: evaluationMeasureSelect,
  })

  return buildEvaluationChartData(measures, charts)
}
