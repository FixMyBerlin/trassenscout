import { describe, expect, test } from "vitest"
import {
  ANONYMOUS_AUTHOR_PLACEHOLDER,
  FORMER_MEMBER_ADMIN_SUFFIX,
  FORMER_MEMBER_PLACEHOLDER,
  formerMemberFk,
  redactAuthorUserId,
  redactCommentAuthor,
  serializeProjectAuthor,
  serializeProjectUser,
} from "./redactFormerProjectMemberUser.server"

const memberUserIds = new Set([1, 2])
const sessionUserId = 99

describe("serializeProjectUser", () => {
  test("keeps current members unchanged without email", () => {
    const user = { id: 1, firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" }
    const result = serializeProjectUser(user, {
      memberUserIds,
      isAdmin: false,
      sessionUserId,
    })
    expect(result).toEqual({ id: 1, firstName: "Ada", lastName: "Lovelace" })
  })

  test("omits id for former members and uses placeholder for non-admins", () => {
    const user = { id: 9, firstName: "Former", lastName: "Member", email: "former@example.com" }
    const result = serializeProjectUser(user, {
      memberUserIds,
      isAdmin: false,
      sessionUserId,
    })
    expect(result).toEqual({
      firstName: FORMER_MEMBER_PLACEHOLDER,
      lastName: "",
    })
    expect(result).not.toHaveProperty("id")
  })

  test("omits id for former members and suffixes lastName for admins", () => {
    const user = { id: 9, firstName: "Former", lastName: "Member" }
    const result = serializeProjectUser(user, {
      memberUserIds,
      isAdmin: true,
      sessionUserId,
    })
    expect(result).toEqual({
      firstName: "Former",
      lastName: `Member${FORMER_MEMBER_ADMIN_SUFFIX}`,
    })
    expect(result).not.toHaveProperty("id")
  })

  test("returns session user untouched without self-redaction suffix", () => {
    const user = {
      id: sessionUserId,
      firstName: "Global",
      lastName: "Admin",
      email: "admin@example.com",
    }
    const result = serializeProjectUser(user, {
      memberUserIds,
      isAdmin: true,
      sessionUserId,
    })
    expect(result).toEqual({ id: sessionUserId, firstName: "Global", lastName: "Admin" })
  })
})

describe("serializeProjectAuthor", () => {
  test("keeps current members unchanged for admins", () => {
    const user = { id: 1, firstName: "Ada", lastName: "Lovelace" }
    const result = serializeProjectAuthor(user, {
      memberUserIds,
      isAdmin: true,
      sessionUserId,
    })
    expect(result).toEqual({ id: 1, firstName: "Ada", lastName: "Lovelace" })
  })

  test("uses anonymous placeholder for current members when viewer is not admin", () => {
    const user = { id: 1, firstName: "Ada", lastName: "Lovelace" }
    const result = serializeProjectAuthor(user, {
      memberUserIds,
      isAdmin: false,
      sessionUserId,
    })
    expect(result).toEqual({
      firstName: ANONYMOUS_AUTHOR_PLACEHOLDER,
      lastName: "",
    })
    expect(result).not.toHaveProperty("id")
  })

  test("uses former-member placeholder for non-admins", () => {
    const user = { id: 9, firstName: "Former", lastName: "Member" }
    const result = serializeProjectAuthor(user, {
      memberUserIds,
      isAdmin: false,
      sessionUserId,
    })
    expect(result).toEqual({
      firstName: FORMER_MEMBER_PLACEHOLDER,
      lastName: "",
    })
    expect(result).not.toHaveProperty("id")
  })
})

describe("formerMemberFk", () => {
  const context = { memberUserIds, isAdmin: false, sessionUserId }

  test("keeps current member and session user ids", () => {
    expect(formerMemberFk(1, context)).toBe(1)
    expect(formerMemberFk(sessionUserId, context)).toBe(sessionUserId)
  })

  test("nulls former member ids and passes through null", () => {
    expect(formerMemberFk(9, context)).toBeNull()
    expect(formerMemberFk(null, context)).toBeNull()
  })
})

describe("redactAuthorUserId", () => {
  test("returns null for non-admins even for current members", () => {
    const context = { memberUserIds, isAdmin: false, sessionUserId }
    expect(redactAuthorUserId(1, context)).toBeNull()
    expect(redactAuthorUserId(sessionUserId, context)).toBeNull()
  })

  test("keeps current member ids for admins", () => {
    const context = { memberUserIds, isAdmin: true, sessionUserId }
    expect(redactAuthorUserId(1, context)).toBe(1)
    expect(redactAuthorUserId(9, context)).toBeNull()
  })
})

describe("redactCommentAuthor", () => {
  const author = { id: 1, firstName: "Ada", lastName: "Lovelace" }

  test("keeps author names and userId for all users", () => {
    const result = redactCommentAuthor(
      { id: 10, body: "Hi", userId: 1, author },
      { memberUserIds, isAdmin: false, sessionUserId: 99 },
    )

    expect(result.userId).toBe(1)
    expect(result.isOwnComment).toBe(false)
    expect(result.author).toEqual({ id: 1, firstName: "Ada", lastName: "Lovelace" })
  })

  test("marks own comments and keeps userId", () => {
    const result = redactCommentAuthor(
      {
        id: 11,
        body: "Mine",
        userId: sessionUserId,
        author: { id: sessionUserId, firstName: "Me", lastName: "User" },
      },
      { memberUserIds, isAdmin: false, sessionUserId },
    )

    expect(result.userId).toBe(sessionUserId)
    expect(result.isOwnComment).toBe(true)
    expect(result.author).toEqual({ id: sessionUserId, firstName: "Me", lastName: "User" })
  })

  test("uses former-member placeholder for non-admins", () => {
    const result = redactCommentAuthor(
      {
        id: 13,
        body: "Old",
        userId: 9,
        author: { id: 9, firstName: "Former", lastName: "Member" },
      },
      { memberUserIds, isAdmin: false, sessionUserId },
    )

    expect(result.userId).toBeNull()
    expect(result.author).toEqual({
      firstName: FORMER_MEMBER_PLACEHOLDER,
      lastName: "",
    })
  })

  test("keeps userId for admins", () => {
    const result = redactCommentAuthor(
      { id: 12, body: "Admin view", userId: 1, author },
      { memberUserIds, isAdmin: true, sessionUserId },
    )

    expect(result.userId).toBe(1)
    expect(result.isOwnComment).toBe(false)
    expect(result.author).toEqual({ id: 1, firstName: "Ada", lastName: "Lovelace" })
  })
})
