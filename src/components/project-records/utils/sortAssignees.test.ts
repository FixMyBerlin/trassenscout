import { describe, expect, test } from "vitest"
import { getAssigneeItems, sortAssignees } from "./sortAssignees"

// In the A-Z order the server returns.
const users = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
const sortedIds = (ranking: Parameters<typeof sortAssignees>[1]) =>
  sortAssignees(users, ranking).map(({ id }) => id)

describe("sortAssignees", () => {
  test("puts the most assigned first, then the PA lead, then the rest A-Z", () => {
    expect(sortedIds({ leadIds: [4], assignmentCounts: { 2: 1, 3: 5 } })).toEqual([3, 2, 4, 1])
  })

  test("ranks a lead with assignments by their count", () => {
    expect(sortedIds({ leadIds: [1], assignmentCounts: { 1: 1, 2: 9 } })).toEqual([2, 1, 3, 4])
    expect(sortedIds({ leadIds: [3], assignmentCounts: { 2: 1, 3: 9 } })).toEqual([3, 2, 1, 4])
  })

  test("puts a lead ahead of someone with the same count", () => {
    expect(sortedIds({ leadIds: [3], assignmentCounts: { 2: 2, 3: 2 } })).toEqual([3, 2, 1, 4])
  })

  test("sorts the leads of several PAs by their assignments", () => {
    expect(sortedIds({ leadIds: [1, 4], assignmentCounts: { 2: 3, 4: 2 } })).toEqual([2, 4, 1, 3])
  })

  test("keeps A-Z between people with the same count", () => {
    expect(sortedIds({ leadIds: [], assignmentCounts: { 3: 2, 2: 2 } })).toEqual([2, 3, 1, 4])
  })

  test("keeps A-Z when there is nothing to rank by", () => {
    expect(sortedIds({ leadIds: [], assignmentCounts: {} })).toEqual([1, 2, 3, 4])
    expect(sortedIds(undefined)).toEqual([1, 2, 3, 4])
  })

  test("ignores a lead or assignee who is no longer in the list", () => {
    expect(sortedIds({ leadIds: [9], assignmentCounts: { 9: 7 } })).toEqual([1, 2, 3, 4])
  })

  test("leaves the list it was given untouched", () => {
    sortAssignees(users, { leadIds: [4], assignmentCounts: {} })

    expect(users.map(({ id }) => id)).toEqual([1, 2, 3, 4])
  })
})

describe("getAssigneeItems", () => {
  const heading = "Systemvorschläge"
  const people = users.map(({ id }) => ({ id, email: `${id}@example.com` }))
  const rows = (ranking: Parameters<typeof getAssigneeItems>[1]) =>
    getAssigneeItems(people, ranking).map(({ value, group }) => [value, group])

  test("groups everyone with assignments and the lead below (Keine Auswahl)", () => {
    expect(rows({ leadIds: [4], assignmentCounts: { 3: 5 } })).toEqual([
      ["", undefined],
      ["3", heading],
      ["4", heading],
      ["1", undefined],
      ["2", undefined],
    ])
  })

  test("groups a lead without assignments", () => {
    expect(rows({ leadIds: [2], assignmentCounts: {} })[1]).toEqual(["2", heading])
  })

  test("groups nobody when there is nothing to rank by", () => {
    const noGroup = [
      ["", undefined],
      ["1", undefined],
      ["2", undefined],
      ["3", undefined],
      ["4", undefined],
    ]

    expect(rows({ leadIds: [], assignmentCounts: {} })).toEqual(noGroup)
    expect(rows(undefined)).toEqual(noGroup)
  })

  test("groups nobody when the only ranked person is no longer in the list", () => {
    expect(rows({ leadIds: [9], assignmentCounts: { 9: 7 } }).map(([, group]) => group)).toEqual(
      Array(5).fill(undefined),
    )
  })
})
