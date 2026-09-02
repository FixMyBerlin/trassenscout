import { describe, expect, it } from "vitest"
import {
  convertBlanksToPlaceholders,
  parseFieldDefinitions,
  resolveFormTemplateFields,
  sanitizeFieldsForSave,
} from "./fieldSchemas"

describe("parseFieldDefinitions", () => {
  it("returns an empty list for anything that does not parse", () => {
    expect(parseFieldDefinitions(null)).toEqual([])
    expect(parseFieldDefinitions("nope")).toEqual([])
    expect(parseFieldDefinitions([{ name: "ort" }])).toEqual([])
  })

  it("keeps valid definitions", () => {
    const definitions = [{ name: "ort", label: "Ort", type: "text" as const }]
    expect(parseFieldDefinitions(definitions)).toEqual(definitions)
  })
})

describe("resolveFormTemplateFields", () => {
  it("derives one field per placeholder, in document order", () => {
    const fields = resolveFormTemplateFields("# {{titel}}\n\nOrt: {{ort}}", [])
    expect(fields.map((field) => field.name)).toEqual(["titel", "ort"])
  })

  it("falls back to the placeholder name and text input without metadata", () => {
    expect(resolveFormTemplateFields("{{gesamtkosten}}", [])).toEqual([
      { name: "gesamtkosten", label: "gesamtkosten", type: "text" },
    ])
  })

  it("applies stored label and type", () => {
    const stored = [{ name: "gesamtkosten", label: "Gesamtkosten in Euro", type: "number" }]
    expect(resolveFormTemplateFields("{{gesamtkosten}}", stored)).toEqual([
      { name: "gesamtkosten", label: "Gesamtkosten in Euro", type: "number" },
    ])
  })

  it("ignores metadata for placeholders the markdown no longer contains", () => {
    const stored = [{ name: "entfernt", label: "Entfernt", type: "text" }]
    expect(resolveFormTemplateFields("{{ort}}", stored)).toEqual([
      { name: "ort", label: "ort", type: "text" },
    ])
  })

  it("lists a repeated placeholder once", () => {
    expect(resolveFormTemplateFields("{{ort}} … {{ort}}", [])).toHaveLength(1)
  })

  it("handles an empty document", () => {
    expect(resolveFormTemplateFields("", [])).toEqual([])
    expect(resolveFormTemplateFields(null, [])).toEqual([])
  })
})

describe("sanitizeFieldsForSave", () => {
  it("drops metadata whose placeholder is gone", () => {
    const definitions = [
      { name: "ort", label: "Ort", type: "text" as const },
      { name: "alt", label: "Alt", type: "text" as const },
    ]
    expect(sanitizeFieldsForSave("{{ort}}", definitions)).toEqual([definitions[0]])
  })
})

describe("convertBlanksToPlaceholders", () => {
  it("replaces escaped and plain underscore blanks with numbered placeholders", () => {
    expect(convertBlanksToPlaceholders("\\_\\_\\_\\_\\_ und _______")).toBe(
      "{{feld_1}} und {{feld_2}}",
    )
  })

  it("leaves text without blanks unchanged", () => {
    expect(convertBlanksToPlaceholders("# Antrag\n\nKein Feld hier.")).toBe(
      "# Antrag\n\nKein Feld hier.",
    )
  })

  it("keeps existing placeholders and avoids reusing their names", () => {
    expect(convertBlanksToPlaceholders("{{feld_1}} ____")).toBe("{{feld_1}} {{feld_2}}")
  })

  it("ignores short underscore runs used as emphasis", () => {
    expect(convertBlanksToPlaceholders("a_b und ___")).toBe("a_b und ___")
  })

  it("produces fields that resolve in document order", () => {
    const markdown = convertBlanksToPlaceholders("Ort: ____\n\nDatum: ____")
    expect(resolveFormTemplateFields(markdown, []).map((field) => field.name)).toEqual([
      "feld_1",
      "feld_2",
    ])
  })
})

describe("field names match the placeholder syntax", () => {
  it("keeps metadata for an uppercase placeholder", () => {
    const stored = [{ name: "Ort", label: "Ort der Maßnahme", type: "text" }]
    expect(resolveFormTemplateFields("{{Ort}}", stored)).toEqual([
      { name: "Ort", label: "Ort der Maßnahme", type: "text" },
    ])
  })

  it("does not let one invalid name discard the whole metadata array", () => {
    const stored = [
      { name: "Ort", label: "Ort der Maßnahme", type: "text" },
      { name: "kosten", label: "Gesamtkosten", type: "number" },
    ]
    expect(parseFieldDefinitions(stored)).toHaveLength(2)
  })

  it("still rejects a name the placeholder parser would never produce", () => {
    expect(parseFieldDefinitions([{ name: "mit-strich", label: "X", type: "text" }])).toEqual([])
  })
})
