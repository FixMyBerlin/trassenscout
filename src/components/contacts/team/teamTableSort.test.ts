import { describe, expect, test } from "vitest"
import { sortRows } from "@/src/shared/tableSort/sortRows"
import { type TeamSortRow, teamSortValues } from "./teamTableSort"

const member = (id: number, values: Partial<TeamSortRow> = {}): TeamSortRow & { id: number } => ({
  id,
  firstName: `Vorname${id}`,
  lastName: `Nachname${id}`,
  institution: null,
  role: "USER",
  currentMembershipRole: "VIEWER",
  isProjectLead: false,
  ...values,
})

const ids = (rows: { id: number }[]) => rows.map((row) => row.id)

describe("teamSortValues", () => {
  test.each(["asc", "desc"] as const)(
    "Rechte sorts by the shown label, Projektleitung after the plain role (%s)",
    (direction) => {
      const rows = [
        member(1, { currentMembershipRole: "VIEWER" }),
        member(2, { currentMembershipRole: "EDITOR", isProjectLead: true }),
        member(3, { currentMembershipRole: "EDITOR", role: "ADMIN" }),
        member(4, { currentMembershipRole: "EDITOR" }),
      ]
      expect(ids(sortRows(rows, teamSortValues, { column: "role", direction }))).toEqual(
        direction === "asc" ? [3, 4, 2, 1] : [1, 2, 4, 3],
      )
    },
  )

  test("Name sorts by the shown name, members without a name last", () => {
    const rows = [
      member(1, { firstName: "Zoe", lastName: "Adler" }),
      member(2, { firstName: "", lastName: "" }),
      member(3, { firstName: "anna", lastName: "Zander" }),
    ]
    expect(ids(sortRows(rows, teamSortValues, { column: "name", direction: "asc" }))).toEqual([
      3, 1, 2,
    ])
  })
})
