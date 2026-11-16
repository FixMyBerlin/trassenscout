import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"

/**
 * The project filter belongs to the dashboard and the Aktivität und Aufgaben pages, not to one
 * tab. A `<Link>` drops the search unless the route retains it, which is exactly how this broke
 * once: switching tabs silently showed every project again.
 */
test.describe("Dashboard project filter", () => {
  test.use({ storageState: authFile("editor") })
  test.use({ allowedConsoleErrors: pageNoise })

  test("survives a tab switch", async ({ page }) => {
    await page.goto(`/dashboard/activity?projectSlug=${seedProjects.richProject}`)
    await expect(page.getByRole("button", { name: "User-Menü" })).toBeVisible({ timeout: 30_000 })

    await page.getByRole("link", { name: /^Aufgaben/ }).click()

    await expect(page).toHaveURL(
      new RegExp(`/dashboard/assignments\\?.*projectSlug=${seedProjects.richProject}`),
    )
  })

  test("is preselected by the project routes", async ({ page }) => {
    await page.goto(`/${seedProjects.richProject}/assignments?status=all`)

    await expect(page).toHaveURL(
      new RegExp(`/dashboard/assignments\\?.*projectSlug=${seedProjects.richProject}`),
    )
    await expect(page).toHaveURL(/status=all/)

    await page.goto(`/${seedProjects.richProject}/activity?months=3`)

    await expect(page).toHaveURL(
      new RegExp(`/dashboard/activity\\?.*projectSlug=${seedProjects.richProject}`),
    )
    await expect(page).toHaveURL(/months=3/)
  })

  test("is preselected by the activity link of a project", async ({ page }) => {
    await page.goto(`/${seedProjects.richProject}`)
    await expect(page.getByRole("button", { name: "User-Menü" })).toBeVisible({ timeout: 30_000 })

    await page.getByRole("link", { name: "Aktivität und Aufgaben" }).click()

    // The seed project shows no log entries to editors, so the link opens Aufgaben.
    await expect(page).toHaveURL(
      new RegExp(`/dashboard/assignments\\?.*projectSlug=${seedProjects.richProject}`),
    )
  })

  test("clears from the header and stays cleared", async ({ page }) => {
    await page.goto(`/dashboard?projectSlug=${seedProjects.richProject}`)
    await expect(page.getByRole("button", { name: "User-Menü" })).toBeVisible({ timeout: 30_000 })

    await page.getByRole("button", { name: "Filter zurücksetzen" }).click()

    await expect(page).not.toHaveURL(/projectSlug/)
  })
})
