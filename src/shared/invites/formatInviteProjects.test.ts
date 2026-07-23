import { describe, expect, test } from "vitest"
import { formatInviteProjectRoles, formatInviteProjects } from "./formatInviteProjects"

describe("formatInviteProjects", () => {
  test("formats project names from the slug", () => {
    expect(formatInviteProjects([{ slug: "frm1", subTitle: "" }])).toBe("FRM1")
    expect(formatInviteProjects([{ slug: "frm1", subTitle: "   " }])).toBe("FRM1")
    expect(formatInviteProjects([{ slug: "ohv", subTitle: "Haltestellenförderung OHV" }])).toBe(
      "OHV",
    )
  })

  test("formats project role lists from the slug", () => {
    expect(
      formatInviteProjectRoles([
        { role: "VIEWER", slug: "frm1", subTitle: "Steinhagen - Bielefeld" },
      ]),
    ).toBe("FRM1 (Leserechte)")
  })
})
