import { describe, expect, test } from "vitest"
import { emptyEvaluationsPageConfig, parseEvaluationsPageConfig } from "./evaluationsPageConfig"

describe("parseEvaluationsPageConfig", () => {
  test("keeps the sections that parse and drops only the broken ones", () => {
    const config = parseEvaluationsPageConfig({
      version: 1,
      sections: [
        { id: "a", chart: "fundingByYear", markdown: "Text A" },
        "not a section",
        { chart: "", markdown: "no id" },
        { id: "c", chart: "", markdown: "Text C" },
      ],
    })

    expect(config.sections).toEqual([
      { id: "a", chart: "fundingByYear", markdown: "Text A" },
      { id: "c", chart: "", markdown: "Text C" },
    ])
  })

  test("keeps the prose when a chart type is retired", () => {
    const config = parseEvaluationsPageConfig({
      version: 1,
      sections: [{ id: "a", chart: "financialOverview", markdown: "Erläuterung zur Finanzierung" }],
    })

    expect(config.sections).toEqual([
      { id: "a", chart: "", markdown: "Erläuterung zur Finanzierung" },
    ])
  })

  test("reads sections written by a future config version", () => {
    const config = parseEvaluationsPageConfig({
      version: 2,
      sections: [{ id: "a", chart: "", markdown: "Text A" }],
    })

    expect(config).toEqual({
      version: 1,
      sections: [{ id: "a", chart: "", markdown: "Text A" }],
    })
  })

  test("falls back to an empty config only when there are no readable sections", () => {
    expect(parseEvaluationsPageConfig(null)).toEqual(emptyEvaluationsPageConfig())
    expect(parseEvaluationsPageConfig("Legacy markdown")).toEqual(emptyEvaluationsPageConfig())
    expect(parseEvaluationsPageConfig({})).toEqual(emptyEvaluationsPageConfig())
  })
})
