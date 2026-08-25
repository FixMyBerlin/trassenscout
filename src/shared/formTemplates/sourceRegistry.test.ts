import { describe, expect, it } from "vitest"
import { FormTemplateFormSchema } from "./schemas"
import { formatSourceValue, formFieldSourcesForType, getFormFieldSource } from "./sourceRegistry"

const context = {
  project: { slug: "rs23", subTitle: "Radschnellweg 23" },
  subsubsection: {
    slug: "ma-3",
    subTitle: "Knotenpunkt Nord",
    description: null,
    lengthM: 1250.5,
    costEstimate: 125000,
    planningCosts: null,
    constructionCosts: null,
    landAcquisitionCosts: null,
    ownFunds: null,
    estimatedCompletionDate: new Date(2026, 7, 20),
    subsectionSlug: "poly-3",
  },
  acquisitionArea: null,
}

describe("formFieldSourcesForType", () => {
  it("offers Maßnahme sources only where a Maßnahme exists", () => {
    const measure = formFieldSourcesForType("SUBSUBSECTION").map((s) => s.key)
    const area = formFieldSourcesForType("ACQUISITIONAREA").map((s) => s.key)
    expect(measure).toContain("subsubsection.costEstimate")
    expect(area).not.toContain("subsubsection.costEstimate")
    expect(area).toContain("acquisitionArea.parcel")
  })

  it("offers project sources in both scopes", () => {
    for (const type of ["SUBSUBSECTION", "ACQUISITIONAREA"] as const) {
      expect(formFieldSourcesForType(type).map((s) => s.key)).toContain("project.title")
    }
  })
})

describe("source resolution", () => {
  it("falls back to the slug when a title is missing", () => {
    const source = getFormFieldSource("subsubsection.title")!
    expect(
      source.resolve({ ...context, subsubsection: { ...context.subsubsection, subTitle: null } }),
    ).toBe("ma-3")
  })

  it("returns nothing when the scope's entity is absent", () => {
    const source = getFormFieldSource("subsubsection.costEstimate")!
    expect(source.resolve({ ...context, subsubsection: null })).toBeUndefined()
  })

  it("returns undefined for an unknown key", () => {
    expect(getFormFieldSource("nope.nope")).toBeUndefined()
    expect(getFormFieldSource(undefined)).toBeUndefined()
  })
})

describe("formatSourceValue", () => {
  it("formats currency and numbers German-style without a symbol", () => {
    expect(formatSourceValue(125000, "currency")).toBe("125.000")
    expect(formatSourceValue(1250.5, "number")).toBe("1.250,5")
  })

  it("formats dates German-style", () => {
    expect(formatSourceValue(new Date(2026, 7, 20), "date")).toBe("20.08.2026")
  })

  it("renders missing values as an empty string so the field stays blank", () => {
    for (const empty of [null, undefined, ""]) {
      expect(formatSourceValue(empty, "text")).toBe("")
      expect(formatSourceValue(empty, "currency")).toBe("")
    }
  })

  it("does not invent a number from unparsable text", () => {
    expect(formatSourceValue("k. A.", "currency")).toBe("")
  })
})

describe("source scoping is enforced on save", () => {
  it("rejects a Maßnahme source on a Verhandlungsfläche template", () => {
    const result = FormTemplateFormSchema.safeParse({
      title: "Verzicht",
      slug: "verzicht",
      type: "ACQUISITIONAREA",
      bodyMarkdown: "Kosten: {{kosten}}",
      fields: [
        { name: "kosten", label: "Kosten", type: "number", source: "subsubsection.costEstimate" },
      ],
      projectIds: [1],
    })
    expect(result.success).toBe(false)
  })

  it("accepts a source that belongs to the template's type", () => {
    const result = FormTemplateFormSchema.safeParse({
      title: "Verzicht",
      slug: "verzicht",
      type: "ACQUISITIONAREA",
      bodyMarkdown: "Flurstück: {{flur}}",
      fields: [
        { name: "flur", label: "Flurstück", type: "text", source: "acquisitionArea.parcel" },
      ],
      projectIds: [1],
    })
    expect(result.success).toBe(true)
  })

  it("accepts a field with no source at all", () => {
    const result = FormTemplateFormSchema.safeParse({
      title: "Antrag",
      slug: "antrag",
      type: "SUBSUBSECTION",
      bodyMarkdown: "Frei: {{frei}}",
      fields: [{ name: "frei", label: "Frei", type: "text" }],
      projectIds: [1],
    })
    expect(result.success).toBe(true)
  })
})
