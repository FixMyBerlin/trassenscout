import { authFile, seedUsers } from "@/tests/_fixtures/auth"
import { pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { getTestDb } from "@/tests/_utils/testDb"

// Seeded for the editor in rs23 (prisma/seeds/subsubsectionBookmarks.ts).
const bookmarkedSubTitle = "Subsubsection with 1 LineString (separate)"

test.describe("Dashboard Meine Maßnahmen", () => {
  test.use({ allowedConsoleErrors: pageNoise })

  test.describe("as editor with a bookmark", () => {
    test.use({ storageState: authFile("editor") })

    test("the navigation icon leads to the list with the bookmarked Maßnahme", async ({ page }) => {
      await page.goto("/dashboard")
      await expect(page.getByRole("button", { name: "User-Menü" })).toBeVisible({ timeout: 30_000 })

      await page.getByRole("link", { name: "Meine Maßnahmen", exact: true }).click()

      await expect(page).toHaveURL(/\/dashboard\/bookmarks/)
      await expect(page.getByRole("heading", { name: "Meine Maßnahmen" })).toBeVisible({
        timeout: 15_000,
      })
      await expect(page.getByRole("row", { name: bookmarkedSubTitle })).toBeVisible()
    })
  })

  test.describe("as viewer without bookmarks", () => {
    test.use({ storageState: authFile("viewer") })

    // Other specs can assign the viewer a Protokoll with a Maßnahme, which bookmarks it.
    test.beforeEach(async () => {
      const db = await getTestDb()
      await db.subsubsectionBookmark.deleteMany({ where: { user: { email: seedUsers.viewer } } })
    })

    test("shows the empty state", async ({ page }) => {
      await page.goto("/dashboard/bookmarks")

      await expect(
        page.getByText("Sie haben noch keine Maßnahmen mit einem Lesezeichen versehen."),
      ).toBeVisible({ timeout: 30_000 })
    })
  })
})
