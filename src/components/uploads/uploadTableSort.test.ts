import { describe, expect, test } from "vitest"
import { sortRows } from "@/src/shared/tableSort/sortRows"
import { UPLOAD_TABLE_DEFAULT_SORT } from "@/src/shared/uploads/searchSchemas"
import { type UploadSortRow, uploadSortValues } from "./uploadTableSort"

const s3Url = (fileName: string) =>
  `https://trassenscout.s3.eu-central-1.amazonaws.com/upload-production/0a1b/${fileName}`

const upload = (
  id: number,
  values: Partial<UploadSortRow> & { title?: string } = {},
): UploadSortRow & { id: number; title: string } => ({
  id,
  title: values.title ?? `Dokument ${id}`,
  externalUrl: values.externalUrl ?? s3Url(`dokument-${id}.pdf`),
  createdAt: values.createdAt ?? new Date("2026-01-01T10:00:00Z"),
})

const ids = (rows: { id: number }[]) => rows.map((row) => row.id)

describe("uploadSortValues", () => {
  test("Titel sorts by the shown file name, not the stored title", () => {
    const rows = [
      upload(1, { title: "Bericht.pdf", externalUrl: s3Url("Bericht.pdf") }),
      upload(2, { title: "Übersichtsplan.pdf", externalUrl: s3Url("-bersichtsplan.pdf") }),
    ]
    expect(ids(sortRows(rows, uploadSortValues, { column: "title", direction: "asc" }))).toEqual([
      2, 1,
    ])
  })

  test.each(["asc", "desc"] as const)("a link without a file name sorts last (%s)", (direction) => {
    const rows = [
      upload(1, { externalUrl: "https://www.landkreis-ludwigsburg.de/radverkehr/" }),
      upload(2, { externalUrl: s3Url("Anlage.pdf") }),
      upload(3, { externalUrl: s3Url("Zeichnung.pdf") }),
    ]
    expect(ids(sortRows(rows, uploadSortValues, { column: "title", direction }))).toEqual(
      direction === "asc" ? [2, 3, 1] : [3, 2, 1],
    )
  })

  test("Hochgeladen ↓ is the default, newest first", () => {
    const rows = [
      upload(1, { createdAt: new Date("2026-02-01T08:00:00Z") }),
      upload(2, { createdAt: new Date("2026-05-01T08:00:00Z") }),
      upload(3, { createdAt: new Date("2026-03-01T08:00:00Z") }),
    ]
    expect(ids(sortRows(rows, uploadSortValues, UPLOAD_TABLE_DEFAULT_SORT))).toEqual([2, 3, 1])
  })
})
