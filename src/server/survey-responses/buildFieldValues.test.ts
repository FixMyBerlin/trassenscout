import { describe, expect, test } from "vitest"
import { buildFieldValues } from "./publicSurveyResponses.server"

const field = (name: string, component: string) => ({ name, component, props: {} }) as never

const build = (args: { data: Record<string, unknown>; fields: string[]; part2Fields: unknown[] }) =>
  buildFieldValues({
    ...args,
    part2Fields: args.part2Fields as never,
    searchParams: null,
    surveySlug: "ohv-haltestellenfoerderung" as never,
  })

/**
 * Map fields hold `{ lat, lng }`. `String(value)` handed the mailer "[object Object]", which it
 * could not parse, so the confirmation mail printed that instead of a link to the spot.
 */
describe("buildFieldValues map fields", () => {
  test.each(["SwitchableMap", "SurveySimpleMapWithLegend"])(
    "renders %s coordinates as a link to the spot",
    (component) => {
      const result = build({
        data: { location: { lat: 52.845123, lng: 13.241567 } },
        fields: ["location"],
        part2Fields: [field("location", component)],
      })

      expect(result.location).toBe(
        "[52.845123, 13.241567](https://www.openstreetmap.org/?mlat=52.845123&mlon=13.241567&zoom=16)",
      )
    },
  )

  // Surveys name their map field differently — "location" in OHV, "23" in rs8 — so detection has
  // to key off the component, not the name.
  test("works for a map field that is not called location", () => {
    const result = build({
      data: { "23": { lat: 52.5, lng: 13.4 } },
      fields: ["23"],
      part2Fields: [field("23", "SurveySimpleMapWithLegend")],
    })

    expect(result["23"]).toContain("mlat=52.5&mlon=13.4")
  })

  test("treats a zero coordinate as a real position", () => {
    const result = build({
      data: { location: { lat: 0, lng: 13.4 } },
      fields: ["location"],
      part2Fields: [field("location", "SwitchableMap")],
    })

    expect(result.location).toContain("mlat=0")
  })

  test.each([
    ["no spot picked on the map", null],
    ["a value that is not a coordinate pair", { lat: "52.8", lng: 13.2 }],
  ])("leaves %s empty, so the mailer says keine Angabe", (_name, location) => {
    const result = build({
      data: { location },
      fields: ["location"],
      part2Fields: [field("location", "SwitchableMap")],
    })

    expect(result.location).toBe("")
  })

  test("leaves non-map fields alone", () => {
    const result = build({
      data: { hsName: "Liebenberg, Fichten", costs: "" },
      fields: ["hsName", "costs"],
      part2Fields: [field("hsName", "SurveyTextfield"), field("costs", "SurveyTextfield")],
    })

    expect(result.hsName).toBe("Liebenberg, Fichten")
    expect(result.costs).toBe("")
  })
})
