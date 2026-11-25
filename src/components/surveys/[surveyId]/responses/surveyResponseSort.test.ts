import { describe, expect, test } from "vitest"
import { SURVEY_RESPONSE_DEFAULT_SORT } from "@/src/shared/survey-responses/searchSchemas"
import { sortRows } from "@/src/shared/tableSort/sortRows"
import { surveyResponseSortValues } from "./surveyResponseSort"

const sortValues = surveyResponseSortValues([
  { value: "PENDING", label: "Ausstehend" },
  { value: "DOCUMENTS_MISSING", label: "Unterlagen nachzureichen" },
  { value: "ACCEPTED", label: "Eingabe freigegeben" },
])

const ids = (rows: { id: number }[]) => rows.map((row) => row.id)

describe("surveyResponseSortValues", () => {
  test.each(["asc", "desc"] as const)(
    "Status sorts by the shown label, a status without a label last (%s)",
    (direction) => {
      const rows = [
        { id: 1, status: "DOCUMENTS_MISSING" },
        { id: 2, status: "REJECTED_HOUSEHOLD_RESERVATION" },
        { id: 3, status: "ACCEPTED" },
        { id: 4, status: null },
        { id: 5, status: "PENDING" },
      ]
      expect(ids(sortRows(rows, sortValues, { column: "status", direction }))).toEqual(
        direction === "asc" ? [5, 3, 1, 2, 4] : [1, 3, 5, 2, 4],
      )
    },
  )

  test("ID ↓ is the default and sorts numerically", () => {
    const rows = [
      { id: 9, status: null },
      { id: 10, status: null },
      { id: 2, status: null },
    ]
    expect(ids(sortRows(rows, sortValues, SURVEY_RESPONSE_DEFAULT_SORT))).toEqual([10, 9, 2])
  })
})
