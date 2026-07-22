import { describe, expect, test } from "vitest"
import { formatInviteProjectRoles, formatInviteProjects } from "./formatInviteProjects"

describe("formatInviteProjects", () => {
  test("falls back to the project slug title when the subtitle is blank", () => {
    expect(formatInviteProjects([{ slug: "frm1", subTitle: "" }])).toBe("FRM1")
    expect(formatInviteProjects([{ slug: "frm1", subTitle: "   " }])).toBe("FRM1")
  })

  test("formats project role lists with the same blank subtitle fallback", () => {
    expect(formatInviteProjectRoles([{ role: "VIEWER", slug: "frm1", subTitle: "" }])).toBe(
      "FRM1 (Leserechte)",
    )
  })
})
