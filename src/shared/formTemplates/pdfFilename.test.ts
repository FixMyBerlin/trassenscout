import { describe, expect, it } from "vitest"
import { buildFormPdfFilename } from "./pdfFilename"

const date = new Date(2026, 7, 20)

describe("buildFormPdfFilename", () => {
  it("joins form, project, context and date", () => {
    expect(
      buildFormPdfFilename({ formSlug: "antrag", projectSlug: "rs23", context: "ma-3", date }),
    ).toBe("antrag_rs23_ma-3_2026-08-20.pdf")
  })

  it("keeps a single-digit month and day zero-padded", () => {
    expect(
      buildFormPdfFilename({
        formSlug: "antrag",
        projectSlug: "rs23",
        context: null,
        date: new Date(2026, 0, 5),
      }),
    ).toBe("antrag_rs23_2026-01-05.pdf")
  })

  it("transliterates umlauts and drops unsafe characters", () => {
    expect(
      buildFormPdfFilename({
        formSlug: "Verwendungsnachweis",
        projectSlug: "RS 23/Süd",
        context: "Maßnahme #3",
        date,
      }),
    ).toBe("verwendungsnachweis_rs-23-sued_massnahme-3_2026-08-20.pdf")
  })

  it("omits the context when there is none", () => {
    expect(buildFormPdfFilename({ formSlug: "verzicht", projectSlug: "rs23", date })).toBe(
      "verzicht_rs23_2026-08-20.pdf",
    )
  })

  it("never emits leading or doubled separators", () => {
    const name = buildFormPdfFilename({
      formSlug: "---antrag---",
      projectSlug: "rs23",
      context: "!!!",
      date,
    })
    expect(name).toBe("antrag_rs23_2026-08-20.pdf")
  })
})
