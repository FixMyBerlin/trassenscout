import { describe, expect, test } from "vitest"
import { type UploadLinks, uploadDeletionConfirmMessage } from "./uploadDeletionConfirmMessage"

const question = "Möchten Sie das Dokument »plan.pdf« wirklich unwiderruflich löschen?"

const noLinks: UploadLinks = {
  projectRecords: [],
  subsubsections: [],
  acquisitionAreas: [],
  surveyResponse: null,
}

const record = (id: number) => ({ id, title: `Eintrag ${id}` })

describe("uploadDeletionConfirmMessage", () => {
  test("asks the plain question when the links could not be loaded", () => {
    expect(uploadDeletionConfirmMessage("plan.pdf", null)).toBe(question)
  })

  test("asks the plain question when the document is linked to one place only", () => {
    const links = { ...noLinks, projectRecords: [record(1)] }
    expect(uploadDeletionConfirmMessage("plan.pdf", links)).toBe(question)
  })

  test("names every place once the document is linked to more than one", () => {
    const links: UploadLinks = {
      projectRecords: [record(1)],
      subsubsections: [{ slug: "die02", subsection: { slug: "abschnitt-1" } }],
      acquisitionAreas: [
        {
          id: 12,
          parcel: { alkisParcelId: "0815" },
          subsubsection: { slug: "die02", subsection: { slug: "abschnitt-1" } },
        },
      ],
      surveyResponse: { id: 7 },
    }

    expect(uploadDeletionConfirmMessage("plan.pdf", links)).toBe(
      [
        question,
        "",
        "Es ist an mehreren Stellen verknüpft und wird überall entfernt:",
        "– Protokolleintrag: Eintrag 1",
        "– Maßnahme: DIE02",
        "– Verhandlungsfläche: 12 - Flurstücknr. 0815 (DIE02)",
        "– Beteiligung: Eingabe mit der ID 7",
      ].join("\n"),
    )
  })

  test("counts what does not fit instead of growing the dialog", () => {
    const links = { ...noLinks, projectRecords: [1, 2, 3, 4, 5, 6, 7, 8].map(record) }
    const lines = uploadDeletionConfirmMessage("plan.pdf", links).split("\n")

    expect(lines.filter((line) => line.startsWith("– Protokolleintrag"))).toHaveLength(6)
    expect(lines.at(-1)).toBe("– und 2 weitere")
  })
})
