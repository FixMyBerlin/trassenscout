import { afterEach, describe, expect, test, vi } from "vitest"
import { getDatabaseUrl, resetDatabaseUrlWarningsForTests } from "./database-url.server"

const databaseEnv = {
  DATABASE_HOST: "db",
  DATABASE_USER: "postgres",
  DATABASE_PASSWORD: "password",
}

function setDatabaseEnv(overrides: Partial<typeof databaseEnv> = {}) {
  const env = { ...databaseEnv, ...overrides }
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value)
  }
}

describe("getDatabaseUrl", () => {
  afterEach(() => {
    resetDatabaseUrlWarningsForTests()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  test("throws when DATABASE_HOST is unset", () => {
    vi.unstubAllEnvs()
    vi.stubEnv("DATABASE_HOST", "")
    vi.stubEnv("DATABASE_USER", "postgres")
    vi.stubEnv("DATABASE_PASSWORD", "password")
    expect(() => getDatabaseUrl()).toThrow("DATABASE_HOST")
  })

  test("builds a postgresql URL on port 5432", () => {
    setDatabaseEnv()
    expect(getDatabaseUrl()).toBe("postgresql://postgres:password@db:5432/dbmaster")
  })

  test("percent-encodes URL-unsafe password characters", () => {
    setDatabaseEnv({ DATABASE_PASSWORD: "p@ss:word" })
    expect(getDatabaseUrl()).toBe("postgresql://postgres:p%40ss%3Aword@db:5432/dbmaster")
  })

  test("warns once when password needs URL encoding", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    setDatabaseEnv({ DATABASE_PASSWORD: "p@ss" })

    getDatabaseUrl()
    getDatabaseUrl()

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toContain("DATABASE_PASSWORD")
  })

  test("does not warn for URL-safe passwords", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    setDatabaseEnv()

    getDatabaseUrl()

    expect(warn).not.toHaveBeenCalled()
  })
})
