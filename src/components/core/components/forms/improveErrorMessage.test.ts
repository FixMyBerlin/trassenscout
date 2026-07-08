import { describe, expect, test, vi } from "vitest"
import { parseUniqueConstraintError } from "./errorMessageTranslations"
import { improveErrorMessage } from "./improveErrorMessage"

vi.spyOn(console, "error").mockImplementation(() => {})

const devModeUniqueConstraintMessage = `
Invalid \`db.subsubsection.update()\` invocation in
/Users/dev/trassenscout/src/server/subsubsections/subsubsections.server.ts:219:27

  216   await endpointAuth.admin(headers)
  217 }
  218
→ 219 return db.subsubsection.update(
Unique constraint failed on the fields: (\`"subsectionId"\`, \`slug\`)`

describe("parseUniqueConstraintError", () => {
  test("parses model, operation, and normalized fields from a dev-mode message", () => {
    expect(parseUniqueConstraintError(devModeUniqueConstraintMessage)).toEqual({
      model: "subsubsection",
      operation: "update",
      fields: ["subsectionId", "slug"],
    })
  })

  test("parses a production-style message without source location", () => {
    const message =
      "Invalid `prisma.subsection.create()` invocation:\n\nUnique constraint failed on the fields: (`projectId`,`slug`)"
    expect(parseUniqueConstraintError(message)).toEqual({
      model: "subsection",
      operation: "create",
      fields: ["projectId", "slug"],
    })
  })

  test("returns null for unrelated errors", () => {
    expect(parseUniqueConstraintError("Not authorized")).toBeNull()
  })
})

describe("improveErrorMessage", () => {
  test("maps a unique-constraint error to a translated field error", () => {
    const result = improveErrorMessage(new Error(devModeUniqueConstraintMessage), "FORM_ERROR", [
      "slug",
    ])
    expect(result).toEqual({
      slug: "Dieses Kürzel ist bereits vergeben. Ein Kürzel darf nur einmalig pro Planungsabschnitt zugewiesen werden.",
    })
  })

  test("falls back to a form-level error when no watched field is affected", () => {
    const result = improveErrorMessage(new Error(devModeUniqueConstraintMessage), "FORM_ERROR", [
      "email",
    ])
    expect(result).toEqual({
      FORM_ERROR:
        "Dieses Kürzel ist bereits vergeben. Ein Kürzel darf nur einmalig pro Planungsabschnitt zugewiesen werden.",
    })
  })

  test("uses a generic message for unknown unique constraints", () => {
    const message =
      "Invalid `db.someModel.update()` invocation in /app/x.ts:1:1\nUnique constraint failed on the fields: (`someField`)"
    const result = improveErrorMessage(new Error(message), "FORM_ERROR", ["someField"])
    expect(result).toEqual({
      someField: "Dieser Wert ist bereits vergeben und darf nur einmal verwendet werden.",
    })
  })

  test("passes unrelated errors through unchanged", () => {
    const error = new Error("Something else")
    expect(improveErrorMessage(error, "FORM_ERROR", ["slug"])).toEqual({ FORM_ERROR: error })
  })
})
