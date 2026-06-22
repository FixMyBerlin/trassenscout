import { authFile } from "@/tests/_fixtures/auth"
import { expect, test } from "@/tests/_fixtures/test"

const adminPages = [
  {
    path: "/admin",
    title: /Dashboard/,
    visibleText: "Neues Projekt",
  },
  {
    path: "/admin/projects",
    title: /Projekte/,
    visibleText: "rs23",
  },
  {
    path: "/admin/memberships",
    title: /Nutzer & Mitgliedschaften/,
    visibleText: "Nutzer & Mitgliedschaften",
  },
  {
    path: "/admin/surveys",
    title: /Beteiligungen/,
    visibleText: "rs23-1",
  },
  {
    path: "/admin/logEntries",
    title: /LogEntries/,
    visibleText: "Maximal 250 Maßnahmen.",
  },
] as const

test.describe("Admin smoke", () => {
  test.describe.configure({ mode: "serial" })
  test.use({ storageState: authFile("admin") })

  for (const adminPage of adminPages) {
    test(`renders ${adminPage.path}`, async ({ page }) => {
      await page.goto(adminPage.path)

      await expect(page).toHaveTitle(adminPage.title)
      await expect(page.getByText(adminPage.visibleText, { exact: true }).first()).toBeVisible({
        timeout: 30_000,
      })
    })
  }
})
