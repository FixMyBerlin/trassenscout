import { afterEach, describe, expect, test, vi } from "vitest"
import { projectProtocolMailboxAddress } from "./projectProtocolMailboxAddress.server"

describe("projectProtocolMailboxAddress", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  test.each([
    ["staging-protokoll@trassenscout.de", "staging-protokoll+rs8@trassenscout.de"],
    ["protokoll+inbox@trassenscout.de", "protokoll+rs8@trassenscout.de"],
  ])("builds the project subaddress from IMAP_USER %s", (imapUser, expected) => {
    vi.stubEnv("IMAP_USER", imapUser)
    expect(projectProtocolMailboxAddress("rs8")).toBe(expected)
  })

  test.each(["", "protokoll"])("warns and returns null when IMAP_USER is %j", (imapUser) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.stubEnv("IMAP_USER", imapUser)
    expect(projectProtocolMailboxAddress("rs8")).toBeNull()
    expect(warn).toHaveBeenCalledTimes(1)
  })
})
