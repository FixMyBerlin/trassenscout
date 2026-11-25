import { describe, expect, test } from "vitest"
import { PROJECT_RECORD_TABLE_DEFAULT_SORT } from "@/src/shared/projectRecords/searchSchemas"
import { sortRows } from "@/src/shared/tableSort/sortRows"
import { type ProjectRecordSortRow, projectRecordSortValues } from "./projectRecordTableSort"

const record = (
  id: number,
  values: Partial<ProjectRecordSortRow> = {},
): ProjectRecordSortRow & { id: number } => ({
  id,
  title: values.title ?? `Eintrag ${id}`,
  date: values.date ?? null,
  assignedTo: values.assignedTo ?? null,
})

const user = (id: string, firstName: string, lastName: string) => ({
  id,
  firstName,
  lastName,
  institution: null,
})

const ids = (rows: { id: number }[]) => rows.map((row) => row.id)

describe("projectRecordSortValues", () => {
  test("Datum ↓ keeps entries without a date last", () => {
    const rows = [
      record(1, { date: new Date("2026-03-01") }),
      record(2),
      record(3, { date: new Date("2026-09-01") }),
    ]
    expect(ids(sortRows(rows, projectRecordSortValues, PROJECT_RECORD_TABLE_DEFAULT_SORT))).toEqual(
      [3, 1, 2],
    )
  })

  test.each(["asc", "desc"] as const)(
    "Zugewiesen sorts by the shown short name, unassigned last (%s)",
    (direction) => {
      // Shown as A.Zander, A.Müller and B.Adler
      const rows = [
        record(1, { assignedTo: user("u1", "Anna", "Zander") }),
        record(2),
        record(3, { assignedTo: user("u3", "Axel", "Müller") }),
        record(4, { assignedTo: user("u4", "berta", "Adler") }),
      ]
      expect(
        ids(sortRows(rows, projectRecordSortValues, { column: "assignedTo", direction })),
      ).toEqual(direction === "asc" ? [3, 1, 4, 2] : [4, 1, 3, 2])
    },
  )
})
