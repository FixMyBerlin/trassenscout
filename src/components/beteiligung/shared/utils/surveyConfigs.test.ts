import { describe, expect, test } from "vitest"
import {
  allowedSurveySlugs,
  isSurveyLegacy,
} from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"

// Sanity checks for every survey config. These catch the mistakes that TypeScript can not
// (e.g. a condition pointing to a field that does not exist). See surveys/AGENTS.md.

const parts = ["part1", "part2", "part3"] as const

describe.each(allowedSurveySlugs)("survey config %s", (slug) => {
  const partConfigs = parts
    .map((part) => ({ part, config: getConfigBySurveySlug(slug, part) }))
    .filter(({ config }) => config !== null)

  test("has at least one part", () => {
    expect(partConfigs.length).toBeGreaterThan(0)
  })

  test.each(partConfigs)("$part: field names are unique", ({ config }) => {
    const names = config!.pages.flatMap((page) => page.fields.map((field) => field.name))
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index)
    expect(duplicates).toEqual([])
  })

  test.each(partConfigs)("$part: page ids are unique", ({ config }) => {
    const ids = config!.pages.map((page) => page.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test.each(partConfigs)("$part: conditions reference existing fields", ({ config }) => {
    const fields = config!.pages.flatMap((page) => page.fields)
    const names = new Set(fields.map((field) => field.name))
    const missing = fields
      .map((field) => ("condition" in field ? field.condition?.fieldName : undefined))
      .filter((fieldName) => fieldName !== undefined && !names.has(fieldName))
    expect(missing).toEqual([])
  })

  test("email fields reference existing form fields", () => {
    // Added by the server when the email is built, not by a form field.
    const serverFieldNames = ["surveyUrl", "referenceId"]
    const formFieldNames = new Set(
      partConfigs.flatMap(({ config }) =>
        config!.pages.flatMap((page) =>
          page.fields.filter((field) => field.componentType === "form").map((field) => field.name),
        ),
      ),
    )
    const emailFields = [
      ...(getConfigBySurveySlug(slug, "email")?.fields ?? []),
      ...(getConfigBySurveySlug(slug, "adminEmail")?.fields ?? []),
    ]
    const missing = emailFields.filter(
      (name) => !formFieldNames.has(name) && !serverFieldNames.includes(name),
    )
    expect(missing).toEqual([])
  })
})

describe.each(allowedSurveySlugs.filter((slug) => !isSurveyLegacy(slug)))(
  "survey config %s part2",
  (slug) => {
    // The admin response views read part2 answers by these field names.
    test("has a feedbackText field when part2 exists", () => {
      const part2 = getConfigBySurveySlug(slug, "part2")
      if (!part2) return
      const names = part2.pages.flatMap((page) => page.fields.map((field) => field.name))
      expect(names).toContain("feedbackText")
    })
  },
)
