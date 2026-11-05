import { describe, expect, test } from "vitest"
import { sortAssignees } from "./sortAssignees"

// In the A-Z order the server returns.
const users = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
const sortedIds = (ranking: Parameters<typeof sortAssignees>[1]) =>
  sortAssignees(users, ranking).map(({ id }) => id)

describe("sortAssignees", () => {
  test("puts the PA lead first, then the most assigned, then the rest A-Z", () => {
    expect(sortedIds({ leadIds: [4], assignmentCounts: { 2: 1, 3: 5 } })).toEqual([4, 3, 2, 1])
  })

  test("keeps a lead on top even with fewer assignments than others", () => {
    expect(sortedIds({ leadIds: [1], assignmentCounts: { 1: 1, 2: 9 } })).toEqual([1, 2, 3, 4])
  })

  test("sorts the leads of several PAs by their assignments", () => {
    expect(sortedIds({ leadIds: [1, 4], assignmentCounts: { 4: 2 } })).toEqual([4, 1, 2, 3])
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
