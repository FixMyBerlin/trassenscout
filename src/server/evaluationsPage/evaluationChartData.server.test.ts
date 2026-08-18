import { describe, expect, test } from "vitest"
import { buildEvaluationChartData } from "./evaluationChartData.server"

type EvaluationMeasureInput = Parameters<typeof buildEvaluationChartData>[0][number]

type MeasureOverrides = Partial<Omit<EvaluationMeasureInput, "subsection">> & {
  /** Merged into the default subsection so a new selected field doesn't break every call site. */
  subsection?: Partial<EvaluationMeasureInput["subsection"]>
}

type ChartData = ReturnType<typeof buildEvaluationChartData>

/** `EvaluationChartData` holds the whole dataset union, so narrow before reading deadlines. */
function deadlinesOf(data: ChartData) {
  const dataset = data.deadlinesOverview
  return dataset?.kind === "deadlines" ? dataset.deadlines : []
}

function measure({ subsection, ...overrides }: MeasureOverrides): EvaluationMeasureInput {
  return {
    slug: "measure",
    costEstimate: null,
    estimatedConstructionDateString: null,
    estimatedCompletionDate: null,
    SubsubsectionStatus: null,
    SubsubsectionInfrastructureTypes: [],
    ...overrides,
    subsection: {
      slug: "pa1",
      estimatedCompletionDateString: null,
      operator: null,
      ...subsection,
    },
  }
}

describe("buildEvaluationChartData", () => {
  test("aggregates costs by year and municipality", () => {
    const data = buildEvaluationChartData(
      [
        measure({
          costEstimate: 100,
          estimatedConstructionDateString: "2027",
          subsection: { estimatedCompletionDateString: null, operator: { title: "Kommune A" } },
        }),
        measure({
          costEstimate: 50,
          estimatedConstructionDateString: "2027",
          subsection: { estimatedCompletionDateString: null, operator: { title: "Kommune B" } },
        }),
        measure({
          costEstimate: 25,
          estimatedConstructionDateString: "2028",
          subsection: { estimatedCompletionDateString: null, operator: { title: "Kommune A" } },
        }),
      ],
      ["fundingByYear", "fundingByMunicipality"],
    )

    expect(data.fundingByYear?.rows).toEqual([
      { label: "2027", value: 150 },
      { label: "2028", value: 25 },
    ])
    expect(data.fundingByMunicipality?.rows).toEqual([
      { label: "Kommune A", value: 125 },
      { label: "Kommune B", value: 50 },
    ])
  })

  test("counts funding objects, statuses, and deadline states", () => {
    const data = buildEvaluationChartData(
      [
        measure({
          slug: "a",
          estimatedConstructionDateString: "2027",
          estimatedCompletionDate: new Date("2027-01-01T00:00:00.000Z"),
          SubsubsectionStatus: { slug: "done", title: "umgesetzt" },
          SubsubsectionInfrastructureTypes: [{ title: "Haltestelle" }],
        }),
        measure({
          slug: "b",
          estimatedConstructionDateString: "2027",
          estimatedCompletionDate: new Date("2026-01-01T00:00:00.000Z"),
          SubsubsectionStatus: { slug: "planning", title: "in Planung" },
          SubsubsectionInfrastructureTypes: [{ title: "Haltestelle" }, { title: "Zuwegung" }],
        }),
      ],
      ["measuresByFundingObject", "measuresByStatusAndYear", "deadlinesOverview"],
      new Date("2026-08-12T00:00:00.000Z"),
    )

    expect(data.measuresByFundingObject?.rows).toEqual([
      { label: "Haltestelle", value: 2 },
      { label: "Zuwegung", value: 1 },
    ])
    expect(data.measuresByStatusAndYear?.rows).toEqual([
      {
        label: "2027",
        values: {
          done: 1,
          planning: 1,
        },
      },
    ])
    expect(data.deadlinesOverview?.rows).toEqual([
      { label: "Überfällig", value: 1, status: "overdue" },
      { label: "Anstehend", value: 1, status: "upcoming" },
    ])
  })

  test("reads the year from the subsection's JJJJ-MM and legacy quarter formats", () => {
    const data = buildEvaluationChartData(
      [
        measure({
          costEstimate: 100,
          subsection: { estimatedCompletionDateString: "2026-03", operator: null },
        }),
        measure({
          costEstimate: 40,
          subsection: { estimatedCompletionDateString: "1-2027", operator: null },
        }),
      ],
      ["fundingByYear"],
    )

    expect(data.fundingByYear?.rows).toEqual([
      { label: "2026", value: 100 },
      { label: "2027", value: 40 },
    ])
  })

  test("distinguishes measures that share a slug across Planungsabschnitte", () => {
    const data = buildEvaluationChartData(
      [
        measure({
          slug: "1.1",
          estimatedCompletionDate: new Date("2027-12-31T00:00:00.000Z"),
          subsection: { slug: "pa1" },
        }),
        measure({
          slug: "1.1",
          estimatedCompletionDate: new Date("2027-12-31T00:00:00.000Z"),
          subsection: { slug: "pa2" },
        }),
      ],
      ["deadlinesOverview"],
      new Date("2026-08-18T00:00:00.000Z"),
    )

    expect(deadlinesOf(data)).toEqual([
      {
        label: "1.1",
        subsectionLabel: "pa1",
        dueDate: "2027-12-31T00:00:00.000Z",
        status: "upcoming",
      },
      {
        label: "1.1",
        subsectionLabel: "pa2",
        dueDate: "2027-12-31T00:00:00.000Z",
        status: "upcoming",
      },
    ])
  })

  test("a deadline due today is not overdue", () => {
    const data = buildEvaluationChartData(
      [
        measure({ slug: "today", estimatedCompletionDate: new Date("2026-08-18T00:00:00.000Z") }),
        measure({ slug: "past", estimatedCompletionDate: new Date("2026-08-17T00:00:00.000Z") }),
      ],
      ["deadlinesOverview"],
      new Date("2026-08-18T14:30:00.000Z"),
    )

    expect(data.deadlinesOverview?.rows).toEqual([
      { label: "Überfällig", value: 1, status: "overdue" },
      { label: "Anstehend", value: 1, status: "upcoming" },
    ])
  })

  test("uses the Berlin calendar day, not the UTC one", () => {
    const data = buildEvaluationChartData(
      [measure({ estimatedCompletionDate: new Date("2026-08-18T00:00:00.000Z") })],
      ["deadlinesOverview"],
      // 00:30 on 19 August in Berlin — still 18 August in UTC
      new Date("2026-08-18T22:30:00.000Z"),
    )

    expect(data.deadlinesOverview?.rows).toEqual([
      { label: "Überfällig", value: 1, status: "overdue" },
    ])
  })

  test("computes only the requested charts", () => {
    const data = buildEvaluationChartData(
      [measure({ costEstimate: 100, estimatedConstructionDateString: "2027" })],
      ["fundingByYear"],
    )

    expect(Object.keys(data)).toEqual(["fundingByYear"])
    expect(data.fundingByYear?.rows).toEqual([{ label: "2027", value: 100 }])
  })
})
